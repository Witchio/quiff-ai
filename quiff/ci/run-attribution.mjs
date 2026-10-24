import { spawn } from 'node:child_process';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
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
  'exec', '--ephemeral', '--sandbox', 'read-only',
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

await postProgress({
  status: 'running', step: 6, title: 'Investigate the failure',
  message: 'Codex is comparing the Kane failure with tickets, PRs, and code changes.'
});

const exitCode = await new Promise((resolveExit) => {
  const child = spawn('codex', args, { cwd: rootDir, stdio: ['ignore', 'inherit', 'inherit'] });
  child.once('error', (error) => {
    process.stderr.write(`Could not start Codex CLI: ${error.message}\n`);
    resolveExit(127);
  });
  child.once('exit', (code, signal) => resolveExit(code ?? (signal ? 1 : 0)));
});

if (exitCode !== 0) {
  await postProgress({
    status: 'running', step: 6, title: 'Attribution unavailable',
    message: 'Codex could not complete the investigation. The Kane failure remains available in the run artifacts.',
    analysisError: `Codex exited with code ${exitCode}.`
  });
  process.exit(exitCode);
}

let result;
try {
  result = JSON.parse(await readFile(rawOutputPath, 'utf8'));
} catch {
  await postProgress({
    status: 'running', step: 6, title: 'Attribution unavailable',
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
    status: 'running', step: 6, title: 'Attribution unavailable',
    message: 'Codex returned a result that did not match Quiff’s attribution contract.',
    analysisError: 'Codex output failed contract validation.'
  });
  fail('Codex output did not satisfy the attribution result contract.');
}

const finalResultPath = join(absoluteRunDirectory, 'attribution-result.json');
await writeFile(finalResultPath, `${JSON.stringify(result, null, 2)}\n`, { mode: 0o600 });
const person = attributed ? result.attribution.person.name : null;
const message = attributed
  ? `Likely change by ${person}; ticket ${result.attribution.ticket.id}, PR #${result.attribution.pull_request.number}.`
  : 'The evidence does not support naming a likely bug introducer.';
await postProgress({
  status: 'running', step: 7, title: 'Attribution ready', message,
  finding: result, analysisError: null
});
process.stdout.write(`\n${message}\nResult saved to ${finalResultPath}\n`);
