import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ciDir = dirname(fileURLToPath(import.meta.url));
const quiffDir = dirname(ciDir);
const [runId, runDirectory, progressUrl] = process.argv.slice(2);

if (!runId || !runDirectory) {
  process.stderr.write('Usage: node notify-slack.mjs <run-id> <run-directory>\n');
  process.exit(2);
}

function loadLocalWebhook() {
  if (process.env.SLACK_WEBHOOK_URL) return process.env.SLACK_WEBHOOK_URL;
  return readFile(join(quiffDir, '.env.local'), 'utf8').then((contents) => {
    const entry = contents.match(/^\s*SLACK_WEBHOOK_URL\s*=\s*(.*?)\s*$/m);
    return entry?.[1]?.replace(/^(['"])(.*)\1$/, '$2') ?? '';
  }).catch(() => '');
}

async function postProgress(slackNotification) {
  if (!progressUrl) return;
  try {
    await fetch(`${progressUrl}/update`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slackNotification }),
      signal: AbortSignal.timeout(2000)
    });
  } catch {
    // A dashboard update must not prevent a Slack notification attempt.
  }
}

function slackLink(url, label) {
  if (!url || !/^https:\/\//.test(url)) return label;
  return `<${url}|${label.replaceAll('|', '')}>`;
}

const webhookUrl = await loadLocalWebhook();
if (!webhookUrl) {
  await postProgress({ status: 'skipped', message: 'Not sent: SLACK_WEBHOOK_URL is not configured.', notified: false });
  process.stdout.write('Slack notification skipped: SLACK_WEBHOOK_URL is not configured.\n');
  process.exit(0);
}
if (!/^https:\/\/hooks\.slack\.com\/services\//.test(webhookUrl)) {
  await postProgress({ status: 'skipped', message: 'Not sent: SLACK_WEBHOOK_URL is not a valid Slack webhook.', notified: false });
  process.stderr.write('Slack notification skipped: SLACK_WEBHOOK_URL is not a Slack incoming webhook URL.\n');
  process.exit(0);
}

const runDir = join(quiffDir, '.testmuai', 'attribution-runs', runId);
let input = null;
let result = null;
try { input = JSON.parse(await readFile(join(runDir, 'failure-input.json'), 'utf8')); } catch {}
try { result = JSON.parse(await readFile(join(runDir, 'attribution-result.json'), 'utf8')); } catch {}

let mapping;
try {
  mapping = JSON.parse(await readFile(join(quiffDir, 'context', 'team', 'slack-identities.json'), 'utf8'));
} catch (error) {
  await postProgress({ status: 'failed', message: 'Could not load Slack identity mappings; notification was not sent.', notified: false });
  process.stderr.write(`Slack identity mappings could not be loaded: ${error.message}\n`);
  process.exit(1);
}
const attribution = result?.status === 'attributed' ? result.attribution : null;
const githubLogin = attribution?.person?.github_login;
const slackId = githubLogin ? mapping.github_to_slack_id?.[githubLogin] : null;
const testedSha = input?.pipeline?.tested_commit_sha;
const repositoryUrl = input?.repository?.url?.replace(/\.git$/, '');
const commitUrl = testedSha && repositoryUrl ? `${repositoryUrl}/commit/${testedSha}` : null;
const commitSha = attribution?.change?.commit_sha;
const commitLink = commitSha && repositoryUrl ? `${repositoryUrl}/commit/${commitSha}` : null;
const pullRequest = attribution?.pull_request;
const ticket = attribution?.ticket;

const lines = [`:red_circle: *Build failed* — Kane tests failed on branch \`${input?.pipeline?.branch ?? 'unknown'}\`.`];
if (attribution) {
  const who = slackId ? `<@${slackId}>` : attribution.person.name;
  const login = githubLogin ? ` (GitHub: ${githubLogin})` : '';
  lines.push(`*Likely responsible for the regression:* ${who}${login} · ${result.confidence} confidence.`);
  lines.push(`*Ticket:* ${slackLink(ticket.reference, `${ticket.id} — ${ticket.title}`)}`);
  lines.push(`*PR:* ${slackLink(pullRequest.url, `#${pullRequest.number} — ${pullRequest.title}`)}`);
  if (commitLink) lines.push(`*Likely introducing commit:* ${slackLink(commitLink, commitSha.slice(0, 12))}`);
  else if (commitUrl) lines.push(`*Tested commit:* ${slackLink(commitUrl, testedSha.slice(0, 12))}`);
  if (!slackId && githubLogin) lines.push(`No Slack member ID is mapped for \`${githubLogin}\`; add it to \`quiff/context/team/slack-identities.json\` to enable tagging.`);
} else {
  lines.push('*Responsible person:* undetermined; Codex attribution was unavailable or inconclusive.');
  if (commitUrl) lines.push(`*Tested commit:* ${slackLink(commitUrl, testedSha.slice(0, 12))}`);
}
lines.push(`Run: \`${runId}\``);

await postProgress({
  status: 'sending',
  message: attribution
    ? `Sending the failure report to Slack for ${attribution.person.name}.`
    : 'Sending the failure report to Slack; no responsible person has been identified.',
  person: attribution?.person?.name ?? null,
  notified: false
});

try {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text: lines.join('\n') }),
    signal: AbortSignal.timeout(10000)
  });
  const responseText = await response.text();
  if (!response.ok || responseText !== 'ok') throw new Error(`Slack returned HTTP ${response.status}.`);
  await postProgress({
    status: 'sent',
    message: attribution
      ? slackId
        ? `${attribution.person.name} was tagged in the Slack channel.`
        : `Failure report was posted to Slack; ${attribution.person.name} was not tagged because no Slack member ID is mapped.`
      : 'Failure report was posted to Slack; no responsible person was identified.',
    person: attribution?.person?.name ?? null,
    notified: Boolean(attribution && slackId),
    tagged: Boolean(attribution && slackId)
  });
  process.stdout.write(`Slack failure notification sent for run ${runId}.\n`);
} catch (error) {
  await postProgress({ status: 'failed', message: `Slack notification failed: ${error.message}`, notified: false });
  process.stderr.write(`Slack notification failed: ${error.message}\n`);
  process.exitCode = 1;
}
