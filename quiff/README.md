# Quiff CI/CD check

Quiff is the Kane-based CI/CD check for the signup app. Its check definitions, tickets, team context, and pipeline files live under this directory.

## Isolation boundary

- The signup app owns the root `app/`, `context/`, and root `package.json`.
- Kane tests and their run state live in `quiff/.testmuai/`.
- Mock work tickets and company roster context used by the check live in `quiff/tickets/` and `quiff/context/team/`.
- Quiff product context and local pipeline files live in `quiff/context/` and `quiff/ci/`.
- The pipeline starts the signup app with `npm run dev`, then runs Kane from the `quiff/` working directory. The app package does not define or invoke Kane commands.

## Run the check

With Node.js, npm, and an authenticated `kane-cli` installation available, run from the repository root:

```bash
npm --prefix quiff run test:kane
npm --prefix quiff run pipeline:local
```

The local pipeline starts the signup app with `npm run dev` on port 3000, waits for it to respond, runs saved Kane tests in parallel (two workers), and stops the development server. Its dashboard shows “Starting app” and each Kane test, then “Launch Quiff-Ai” and the evidence investigation on failure. It shows steps only once they start, live elapsed time for each test, step, and full run, source-backed investigation details, and a final summary of the likely cause and Slack notification status. This skips Docker image building and container startup for a faster local check.

When Kane fails, the pipeline saves a redacted, size-limited failure log and run metadata under `quiff/.testmuai/attribution-runs/`, then starts Codex CLI in a read-only sandbox. Codex reads the local ticket/team context and uses the read-only `quiff-github` MCP server to inspect GitHub issues, PRs, commits, and diffs. The attribution result is saved beside the failure input and shown in the dashboard. The last passing SHA from a clean checkout is tracked locally per branch in `quiff/.testmuai/pipeline-state.json` to narrow the change range. If `SLACK_WEBHOOK_URL` is configured, Kane failures post the attribution, ticket, PR, and available commit to the webhook's channel. Developers are tagged only when their GitHub login has an explicit Slack member ID mapping in `quiff/context/team/slack-identities.json`; inconclusive attribution produces an untagged failure notification.

The local attribution path requires the Codex CLI, GitHub CLI, and the configured `quiff-github` MCP server. The MCP launcher reads its fine-grained GitHub token from the macOS login keychain. If Codex attribution fails, the pipeline still exits with the original Kane test failure code.

