import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ciDir = dirname(fileURLToPath(import.meta.url));
const quiffDir = dirname(ciDir);
const statePath = join(quiffDir, '.testmuai', 'pipeline-state.json');
const MAX_LOG_BYTES = 100_000;
const [runId, runDirectory, sourceLog, exitCodeText, branch, testedSha, startedAt, repositoryName, repositoryUrl, workingTreeCleanText] = process.argv.slice(2);

if (!runId || !runDirectory || !sourceLog || !branch || !/^[0-9a-fA-F]{40}$/.test(testedSha ?? '') || !startedAt || !repositoryName) {
  process.stderr.write('Invalid arguments while creating the failure input artifact.\n');
  process.exit(2);
}
if (!['true', 'false'].includes(workingTreeCleanText)) {
  process.stderr.write('working_tree_clean must be true or false.\n');
  process.exit(2);
}
const exitCode = Number(exitCodeText);
if (!Number.isInteger(exitCode) || exitCode < 1) {
  process.stderr.write('Failure exit code must be a positive integer.\n');
  process.exit(2);
}

const artifactRoot = resolve(join(quiffDir, '.testmuai', 'attribution-runs'));
const absoluteRunDirectory = resolve(runDirectory);
if (!absoluteRunDirectory.startsWith(`${artifactRoot}${sep}`)) {
  process.stderr.write('Run directory must be inside quiff/.testmuai/attribution-runs.\n');
  process.exit(2);
}
await mkdir(absoluteRunDirectory, { recursive: true, mode: 0o700 });

const originalSize = (await stat(sourceLog)).size;
let log = await readFile(sourceLog, 'utf8');
log = log
  .replace(/(authorization\s*:\s*bearer\s+)[^\s"']+/gi, '$1[REDACTED]')
  .replace(/\b(?:github_pat_|gh[pousr]_)[A-Za-z0-9_]+/g, '[REDACTED_GITHUB_TOKEN]')
  .replace(/(\b(?:password|passwd|token|secret|api[_-]?key)\b\s*[:=]\s*["']?)[^\s"'`,;]+/gi, '$1[REDACTED]');

let logTruncated = false;
const logBuffer = Buffer.from(log, 'utf8');
if (logBuffer.length > MAX_LOG_BYTES) {
  log = `[Earlier output omitted; showing the final ${MAX_LOG_BYTES} bytes of ${originalSize} bytes.]\n${logBuffer.subarray(-MAX_LOG_BYTES).toString('utf8')}`;
  logTruncated = true;
}
const logArtifact = join(absoluteRunDirectory, 'kane.log');
await writeFile(logArtifact, log, { mode: 0o600 });

let state = null;
try {
  state = JSON.parse(await readFile(statePath, 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const storedLastPassingSha = state?.last_passing_by_branch?.[branch]?.commit_sha;
const lastPassingSha = /^[0-9a-fA-F]{40}$/.test(storedLastPassingSha ?? '') ? storedLastPassingSha : null;
const input = {
  schema_version: '1.0',
  run_id: runId,
  repository: { name: repositoryName, url: repositoryUrl || null },
  pipeline: {
    branch,
    tested_commit_sha: testedSha,
    working_tree_clean: workingTreeCleanText === 'true',
    ...(lastPassingSha && lastPassingSha !== testedSha ? { last_passing_commit_sha: lastPassingSha } : {}),
    started_at: startedAt
  },
  failure: {
    source: 'kane',
    exit_code: exitCode,
    captured_at: new Date().toISOString(),
    summary: null,
    log_artifact: 'kane.log',
    log_truncated: logTruncated
  }
};
await writeFile(join(absoluteRunDirectory, 'failure-input.json'), `${JSON.stringify(input, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(`Failure artifacts saved under ${absoluteRunDirectory}\n`);
