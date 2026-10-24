import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const quiffDir = dirname(fileURLToPath(import.meta.url));
const statePath = join(quiffDir, '..', '.testmuai', 'pipeline-state.json');
const [branch, commitSha] = process.argv.slice(2);

if (!branch || !/^[0-9a-fA-F]{40}$/.test(commitSha ?? '')) {
  process.stderr.write('Usage: node record-passing-commit.mjs <branch> <full-commit-sha>\n');
  process.exit(2);
}

let state = { schema_version: 1, last_passing_by_branch: {} };
try {
  state = JSON.parse(await readFile(statePath, 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

if (!state.last_passing_by_branch || typeof state.last_passing_by_branch !== 'object') {
  state.last_passing_by_branch = {};
}
state.schema_version = 1;
state.last_passing_by_branch[branch] = {
  commit_sha: commitSha,
  recorded_at: new Date().toISOString()
};

await mkdir(dirname(statePath), { recursive: true, mode: 0o700 });
const temporaryPath = `${statePath}.${process.pid}.tmp`;
await writeFile(temporaryPath, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
await rename(temporaryPath, statePath);
