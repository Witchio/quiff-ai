#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import readline from 'node:readline';

const execFileAsync = promisify(execFile);
const PROTOCOL_VERSION = '2024-11-05';
const MAX_SEARCH_RESULTS = 10;
const [TARGET_OWNER, TARGET_REPO] = (process.env.QUIFF_GITHUB_REPOSITORY || 'Witchio/quiff-ai').split('/');
const TOOLS = [
  {
    name: 'search_pull_requests',
    description: 'Search pull requests in one GitHub repository. Read-only.',
    inputSchema: {
      type: 'object', additionalProperties: false,
      required: ['query'],
      properties: {
        query: { type: 'string', minLength: 1, maxLength: 180, description: 'Terms to search in PR title/body.' },
        limit: { type: 'integer', minimum: 1, maximum: MAX_SEARCH_RESULTS, default: 5 }
      }
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
  },
  {
    name: 'search_issues',
    description: 'Search GitHub issues in one repository, useful when tickets are tracked as issues. Read-only.',
    inputSchema: {
      type: 'object', additionalProperties: false,
      required: ['query'],
      properties: {
        query: { type: 'string', minLength: 1, maxLength: 180 },
        limit: { type: 'integer', minimum: 1, maximum: MAX_SEARCH_RESULTS, default: 5 }
      }
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
  },
  {
    name: 'get_pull_request',
    description: 'Read a pull request summary, author, linked branch, merge commit, and description. Read-only.',
    inputSchema: {
      type: 'object', additionalProperties: false, required: ['number'],
      properties: { number: { type: 'integer', minimum: 1 } }
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
  },
  {
    name: 'get_pull_request_files',
    description: 'Read changed file names and bounded diff patches for a pull request (up to 30 files). Read-only.',
    inputSchema: {
      type: 'object', additionalProperties: false, required: ['number'],
      properties: { number: { type: 'integer', minimum: 1 } }
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
  },
  {
    name: 'get_pull_request_commits',
    description: 'Read commits and commit authors for a pull request (up to 100 commits). Read-only.',
    inputSchema: {
      type: 'object', additionalProperties: false, required: ['number'],
      properties: { number: { type: 'integer', minimum: 1 } }
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
  },
  {
    name: 'compare_commits',
    description: 'Compare a last-passing base commit with the tested QA commit and list commits in the range. Read-only.',
    inputSchema: {
      type: 'object', additionalProperties: false,
      required: ['base_sha', 'head_sha'],
      properties: {
        base_sha: { type: 'string', pattern: '^[0-9a-fA-F]{40}$' },
        head_sha: { type: 'string', pattern: '^[0-9a-fA-F]{40}$' }
      }
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
  },
  {
    name: 'get_pull_requests_for_commit',
    description: 'Find pull requests associated with a commit. Read-only.',
    inputSchema: {
      type: 'object', additionalProperties: false, required: ['sha'],
      properties: { sha: { type: 'string', pattern: '^[0-9a-fA-F]{40}$' } }
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true }
  }
];

function validateTargetRepository() {
  if (!TARGET_OWNER || !TARGET_REPO || !/^[A-Za-z0-9_.-]{1,100}$/.test(TARGET_OWNER) || !/^[A-Za-z0-9_.-]{1,100}$/.test(TARGET_REPO)) {
    throw new Error('QUIFF_GITHUB_REPOSITORY must be owner/repository.');
  }
}

function validateNumber(number) {
  if (!Number.isInteger(number) || number < 1) throw new Error('number must be a positive integer.');
}

async function github(endpoint) {
  const { stdout } = await execFileAsync('gh', ['api', '--method', 'GET', endpoint], {
    timeout: 30000,
    maxBuffer: 5 * 1024 * 1024,
    env: process.env
  });
  return JSON.parse(stdout);
}

function shortText(value, limit = 8000) {
  if (typeof value !== 'string') return '';
  return value.length > limit ? `${value.slice(0, limit)}\n[truncated]` : value;
}

function mapIssue(issue) {
  return {
    number: issue.number,
    title: issue.title,
    state: issue.state,
    url: issue.html_url,
    body: shortText(issue.body, 5000),
    author: issue.user?.login ?? null,
    assignees: (issue.assignees ?? []).map((person) => person.login)
  };
}

async function callTool(name, args) {
  validateTargetRepository();
  const prefix = `repos/${TARGET_OWNER}/${TARGET_REPO}`;

  switch (name) {
    case 'search_pull_requests': {
      if (typeof args.query !== 'string' || !args.query.trim() || args.query.length > 180) throw new Error('query must contain 1 to 180 characters.');
      const limit = Math.min(Math.max(Number(args.limit) || 5, 1), MAX_SEARCH_RESULTS);
      const q = `repo:${TARGET_OWNER}/${TARGET_REPO} is:pr ${args.query.trim()}`;
      const result = await github(`search/issues?q=${encodeURIComponent(q)}&per_page=${limit}`);
      const items = result.items.filter((item) => item.repository_url?.endsWith(`/repos/${TARGET_OWNER}/${TARGET_REPO}`));
      return { total_count: items.length, items: items.map(mapIssue) };
    }
    case 'search_issues': {
      if (typeof args.query !== 'string' || !args.query.trim() || args.query.length > 180) throw new Error('query must contain 1 to 180 characters.');
      const limit = Math.min(Math.max(Number(args.limit) || 5, 1), MAX_SEARCH_RESULTS);
      const q = `repo:${TARGET_OWNER}/${TARGET_REPO} is:issue ${args.query.trim()}`;
      const result = await github(`search/issues?q=${encodeURIComponent(q)}&per_page=${limit}`);
      const items = result.items.filter((item) => item.repository_url?.endsWith(`/repos/${TARGET_OWNER}/${TARGET_REPO}`));
      return { total_count: items.length, items: items.map(mapIssue) };
    }
    case 'get_pull_request': {
      validateNumber(args.number);
      const pr = await github(`${prefix}/pulls/${args.number}`);
      return {
        number: pr.number, title: pr.title, state: pr.state, url: pr.html_url,
        body: shortText(pr.body), author: pr.user?.login ?? null,
        created_at: pr.created_at, merged_at: pr.merged_at,
        base_branch: pr.base?.ref, head_branch: pr.head?.ref,
        merge_commit_sha: pr.merge_commit_sha, changed_files: pr.changed_files,
        additions: pr.additions, deletions: pr.deletions
      };
    }
    case 'get_pull_request_files': {
      validateNumber(args.number);
      const files = await github(`${prefix}/pulls/${args.number}/files?per_page=30`);
      return files.slice(0, 30).map((file) => ({
        filename: file.filename, status: file.status, additions: file.additions,
        deletions: file.deletions, patch: shortText(file.patch, 4000)
      }));
    }
    case 'get_pull_request_commits': {
      validateNumber(args.number);
      const commits = await github(`${prefix}/pulls/${args.number}/commits?per_page=100`);
      return commits.slice(0, 100).map((item) => ({
        sha: item.sha, message: shortText(item.commit?.message, 1000),
        author_name: item.commit?.author?.name ?? null,
        author_login: item.author?.login ?? null,
        url: item.html_url
      }));
    }
    case 'compare_commits': {
      if (!/^[0-9a-fA-F]{40}$/.test(args.base_sha) || !/^[0-9a-fA-F]{40}$/.test(args.head_sha)) throw new Error('base_sha and head_sha must be full Git SHAs.');
      const result = await github(`${prefix}/compare/${args.base_sha}...${args.head_sha}`);
      return {
        status: result.status, ahead_by: result.ahead_by, behind_by: result.behind_by,
        base_commit_sha: args.base_sha,
        head_commit_sha: args.head_sha,
        commits: (result.commits ?? []).slice(0, 250).map((item) => ({
          sha: item.sha, message: shortText(item.commit?.message, 1000),
          author_name: item.commit?.author?.name ?? null,
          author_login: item.author?.login ?? null, url: item.html_url
        })),
        commits_truncated: (result.commits ?? []).length > 250
      };
    }
    case 'get_pull_requests_for_commit': {
      if (!/^[0-9a-fA-F]{40}$/.test(args.sha)) throw new Error('sha must be a full Git SHA.');
      const result = await github(`${prefix}/commits/${args.sha}/pulls`);
      return result.slice(0, 10).map((pr) => ({
        number: pr.number, title: pr.title, state: pr.state, url: pr.html_url,
        author: pr.user?.login ?? null, merged_at: pr.merged_at,
        base_branch: pr.base?.ref, merge_commit_sha: pr.merge_commit_sha
      }));
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

async function handle(message) {
  if (message.method === 'initialize') {
    send({
      jsonrpc: '2.0', id: message.id,
      result: {
        protocolVersion: message.params?.protocolVersion ?? PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'quiff-github-readonly', version: '1.0.0' }
      }
    });
    return;
  }
  if (message.method === 'ping') {
    send({ jsonrpc: '2.0', id: message.id, result: {} });
    return;
  }
  if (message.method === 'tools/list') {
    send({ jsonrpc: '2.0', id: message.id, result: { tools: TOOLS } });
    return;
  }
  if (message.method === 'tools/call') {
    try {
      const result = await callTool(message.params?.name, message.params?.arguments ?? {});
      send({ jsonrpc: '2.0', id: message.id, result: { content: [{ type: 'text', text: JSON.stringify(result) }], isError: false } });
    } catch (error) {
      send({ jsonrpc: '2.0', id: message.id, result: { content: [{ type: 'text', text: error.message }], isError: true } });
    }
    return;
  }
  if (message.id !== undefined) {
    send({ jsonrpc: '2.0', id: message.id, error: { code: -32601, message: `Method not found: ${message.method}` } });
  }
}

const input = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
input.on('line', (line) => {
  try {
    const message = JSON.parse(line);
    void handle(message).catch((error) => process.stderr.write(`${error.stack ?? error}\n`));
  } catch (error) {
    process.stderr.write(`Invalid MCP message: ${error.message}\n`);
  }
});
