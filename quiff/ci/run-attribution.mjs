import { spawn } from 'node:child_process';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const ciDir = dirname(fileURLToPath(import.meta.url));
const quiffDir = dirname(ciDir);
const rootDir = dirname(quiffDir);
const [runId, runDirectory, progressUrl] = process.argv.slice(2);

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(2);
}

if (!runId || !runDirectory) fail('Usage: node run-attribution.mjs <run-id> <run-directory> [progress-url]');

const absoluteRunDirectory = resolve(runDirectory);
if (!absoluteRunDirectory.startsWith(`${resolve(join(quiffDir, '.testmuai'))}${sep}`)) {
  fail('Run directory must be inside quiff/.testmuai.');
}

const inputPath = join(absoluteRunDirectory, 'failure-input.json');
const input = JSON.parse(await readFile(inputPath, 'utf8'));
if (input.schema_version !== '1.0' || input.run_id !== runId || input.failure?.source !== 'kane') {
  fail('Failure input is missing required version, run ID, or Kane source.');
}
if (!/^[0-9a-fA-F]{40}$/.test(input.pipeline?.tested_commit_sha ?? '') || !input.pipeline?.branch || typeof input.pipeline?.working_tree_clean !== 'boolean') {
  fail('Failure input must identify the tested commit, branch, and checkout cleanliness.');
}

const logPath = resolve(absoluteRunDirectory, input.failure.log_artifact);
if (!logPath.startsWith(`${absoluteRunDirectory}${sep}`)) fail('Kane log artifact path must remain inside the run directory.');
const logInfo = await stat(logPath);
if (!logInfo.isFile()) fail('Kane log artifact must be a file.');

const systemInstructions = await readFile(join(ciDir, 'agent', 'system-instructions.md'), 'utf8');
const outputSchema = join(ciDir, 'contracts', 'attribution-result.schema.json');
const rawOutputPath = join(absoluteRunDirectory, 'codex-response.json');
const prompt = `${systemInstructions}\n\nInvestigate this run now. Read the failure input at ${inputPath}, then read the Kane log it references. Return only the structured JSON result.`;
const args = [
  'exec', '--json', '--ephemeral', '--sandbox', 'read-only',
  '--output-schema', outputSchema,
  '--output-last-message', rawOutputPath,
  '-C', rootDir,
  prompt
];

function postProgress(payload) {
  if (!progressUrl) return Promise.resolve();
  return fetch(`${progressUrl}/update`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(2000)
  }).catch(() => {});
}

const investigationStartedPath = join(absoluteRunDirectory, 'codex-investigation-started');
const investigationSteps = [];
let progressQueue = Promise.resolve();
let investigationStarted = false;
const phases = {
  failure: 'Review Kane failure evidence',
  tickets: 'Search matching tickets and PRs',
  changes: 'Trace related commits and code changes',
  assessment: 'Assess evidence and validate attribution'
};

function startPhase(id) {
  const existing = investigationSteps.find((phase) => phase.id === id);
  if (existing) return progressQueue;
  for (const phase of investigationSteps) {
    if (phase.status === 'running') phase.status = 'complete';
  }
  investigationSteps.push({ id, label: phases[id], status: 'running' });
  const snapshot = investigationSteps.map((phase) => ({ ...phase }));
  progressQueue = progressQueue.then(() => postProgress({
    status: 'running', step: 4, title: 'Investigate failure',
    message: 'Quiff is investigating what caused the failure and who may be responsible.',
    completedSteps: [1, 3], failedSteps: [2], investigationSteps: snapshot
  }));
  return progressQueue;
}

async function beginInvestigation() {
  if (investigationStarted) return;
  investigationStarted = true;
  await writeFile(investigationStartedPath, `${new Date().toISOString()}\n`, { mode: 0o600 });
  await postProgress({
    status: 'running', step: 4, title: 'Investigate failure',
    message: 'Codex is checking the failure evidence and looking for its likely cause.',
    completedSteps: [1, 3], failedSteps: [2]
  });
  await startPhase('failure');
}

await postProgress({
  status: 'running', step: 3, title: 'Launch Quiff-Ai',
  message: 'Quiff is preparing the failure report and starting Codex.',
  completedSteps: [1], failedSteps: [2]
});

async function handleCodexEvent(event) {
  if (event?.type !== 'item.started') return;
  const item = event.item ?? {};
  const tool = item.tool ?? item.name ?? item.tool_name ?? '';
  const command = Array.isArray(item.command) ? item.command.join(' ') : (item.command ?? '');
  if (['mcp_tool_call', 'command_execution', 'local_shell_call'].includes(item.type)) await beginInvestigation();
  if (item.type === 'mcp_tool_call') {
    if (['search_issues', 'search_pull_requests'].includes(tool)) await startPhase('tickets');
    else if (['get_pull_request', 'get_pull_request_files', 'get_pull_request_commits', 'compare_commits', 'get_pull_requests_for_commit'].includes(tool)) await startPhase('changes');
  } else if (item.type === 'command_execution' || item.type === 'local_shell_call') {
    if (/quiff\/tickets|tickets\/TICKET-/i.test(command)) await startPhase('tickets');
    else if (/git\s+(show|log|diff)|pull_request|commit/i.test(command)) await startPhase('changes');
  }
}

const child = spawn('codex', args, { cwd: rootDir, stdio: ['ignore', 'pipe', 'inherit'] });
const exitPromise = new Promise((resolveExit) => {
  child.once('error', (error) => {
    process.stderr.write(`Could not start Codex CLI: ${error.message}\n`);
    resolveExit(127);
  });
  child.once('exit', (code, signal) => resolveExit(code ?? (signal ? 1 : 0)));
});
const eventLines = createInterface({ input: child.stdout, crlfDelay: Infinity });
for await (const line of eventLines) {
  try { await handleCodexEvent(JSON.parse(line)); } catch { /* Ignore non-JSON CLI output. */ }
}
await progressQueue;
const exitCode = await exitPromise;

if (exitCode !== 0) {
  const failedStep = investigationStarted ? 4 : 3;
  await postProgress({
    status: 'running', step: failedStep, title: 'Attribution unavailable',
    message: 'Codex could not complete the investigation. The Kane failure remains available in the run artifacts.',
    completedSteps: investigationStarted ? [1, 3] : [1], failedSteps: [2, failedStep],
    analysisError: `Codex exited with code ${exitCode}.`
  });
  process.exit(exitCode);
}

if (!investigationStarted) {
  await postProgress({
    status: 'running', step: 3, title: 'Attribution unavailable',
    message: 'Codex did not inspect the failure evidence, so Quiff cannot make a source-backed attribution.',
    completedSteps: [1], failedSteps: [2, 3],
    analysisError: 'Codex completed without starting an evidence inspection.'
  });
  fail('Codex completed without inspecting failure evidence.');
}
await startPhase('assessment');

let result;
try {
  result = JSON.parse(await readFile(rawOutputPath, 'utf8'));
} catch {
  await postProgress({
    status: 'running', step: 4, title: 'Attribution unavailable',
    message: 'Codex returned a result that could not be parsed as JSON.',
    analysisError: 'Codex response was not valid JSON.'
  });
  fail('Codex output was not valid JSON.');
}

const attributed = result.status === 'attributed';
const commonValid = result.schema_version === '1.0' && result.run_id === runId &&
  typeof result.summary === 'string' && Array.isArray(result.evidence) &&
  Array.isArray(result.alternatives) && Array.isArray(result.gaps);
const attributionValid = attributed && ['high', 'medium', 'low'].includes(result.confidence) &&
  typeof result.attribution?.person?.name === 'string' &&
  typeof result.attribution?.ticket?.id === 'string' &&
  typeof result.attribution?.ticket?.title === 'string' &&
  typeof result.attribution?.ticket?.reference === 'string' &&
  Number.isInteger(result.attribution?.pull_request?.number) &&
  typeof result.attribution?.pull_request?.url === 'string' &&
  (result.attribution?.change?.commit_sha === null || /^[0-9a-fA-F]{40}$/.test(result.attribution?.change?.commit_sha ?? '')) &&
  Array.isArray(result.attribution?.change?.files) && result.evidence.length > 0;
const inconclusiveValid = result.status === 'inconclusive' && result.confidence === 'none' && result.attribution === null;
if (!commonValid || !(attributionValid || inconclusiveValid)) {
  await postProgress({
    status: 'running', step: 4, title: 'Attribution unavailable',
    message: 'Codex returned a result that did not match Quiff’s attribution contract.',
    analysisError: 'Codex output failed contract validation.'
  });
  fail('Codex output did not satisfy the attribution result contract.');
}

const finalResultPath = join(absoluteRunDirectory, 'attribution-result.json');
await writeFile(finalResultPath, `${JSON.stringify(result, null, 2)}\n`, { mode: 0o600 });
for (const phase of investigationSteps) phase.status = 'complete';
const person = attributed ? result.attribution.person.name : null;
const message = attributed
  ? `Likely change by ${person}; ticket ${result.attribution.ticket.id}, PR #${result.attribution.pull_request.number}.`
  : 'The evidence does not support naming a likely bug introducer.';
await postProgress({
  status: 'running', step: 4, title: 'Attribution ready', message,
  finding: result, analysisError: null, investigationSteps,
  completedSteps: [1, 3, 4], failedSteps: [2]
});
process.stdout.write(`\n${message}\nResult saved to ${finalResultPath}\n`);
