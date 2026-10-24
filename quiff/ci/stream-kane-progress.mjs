import { readdir, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { createInterface } from 'node:readline';

const progressUrl = process.argv[2];
const definitions = new Map();
let testCases = [];

async function loadDefinitions(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await loadDefinitions(path);
    } else if (entry.isFile() && entry.name.endsWith('_test.md')) {
      try {
        const content = await readFile(path, 'utf8');
        const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim();
        definitions.set(entry.name, heading || entry.name.replace(/_test\.md$/, '').replaceAll('-', ' '));
      } catch {
        // Keep the filename fallback for an unreadable definition.
      }
    }
  }
}

await loadDefinitions(join(process.cwd(), '.testmuai', 'tests'));

async function publish() {
  try {
    await fetch(new URL('/update', progressUrl), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ testCases }),
      signal: AbortSignal.timeout(2000),
    });
  } catch {
    // A closed dashboard must not interrupt the test run.
  }
}

const lines = createInterface({ input: process.stdin, crlfDelay: Infinity });
for await (const line of lines) {
  process.stdout.write(`${line}\n`);
  let event;
  try {
    event = JSON.parse(line);
  } catch {
    continue;
  }

  if (event.type === 'testrun_plan' && Array.isArray(event.members)) {
    testCases = event.members.map((member) => ({
      path: member.path,
      name: member.name || member.title || definitions.get(basename(member.path)) || basename(member.path),
      status: member.failure ? 'broken' : 'pending',
    }));
    await publish();
  } else if (
    event.type === 'testrun_member_start' ||
    event.type === 'testrun_authored_member_start' ||
    event.type === 'testrun_member_end' ||
    event.type === 'testrun_authored_member_end'
  ) {
    const samePath = (left, right) => left === right || left.endsWith(`/${right}`) || right.endsWith(`/${left}`);
    testCases = testCases.map((test) => {
      if (!samePath(test.path, event.path || '')) return test;
      if (event.type.endsWith('_start')) return { ...test, status: 'running', startedAt: test.startedAt ?? Date.now(), endedAt: null };
      const status = ['passed', 'failed', 'skipped'].includes(event.status) ? event.status : 'broken';
      return { ...test, status, endedAt: Date.now(), duration_s: event.duration_s, failure: event.failure };
    });
    await publish();
  } else if (event.type === 'testrun_done') {
    testCases = testCases.map((test) => test.status === 'pending'
      ? { ...test, status: 'skipped' }
      : test.status === 'running' ? { ...test, status: 'broken' } : test);
    await publish();
  }
}
