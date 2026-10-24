# Quiff CI/CD check

Quiff is the Kane-based CI/CD check for the signup app. Its check definitions, tickets, team context, and pipeline files live under this directory.

## Isolation boundary

- The signup app owns the root `app/`, `context/`, and root `package.json`.
- Kane tests and their run state live in `quiff/.testmuai/`.
- Mock work tickets and company roster context used by the check live in `quiff/tickets/` and `quiff/context/team/`.
- Quiff product context and local pipeline files live in `quiff/context/` and `quiff/ci/`.
- The pipeline builds the signup app as its test target, then runs Kane from the `quiff/` working directory. The app package does not define or invoke Kane commands.

## Run the check

With Docker and an authenticated `kane-cli` installation available, run from the repository root:

```bash
npm --prefix quiff run test:kane
npm --prefix quiff run pipeline:local
```

The local pipeline builds the signup app image, starts it on port 3000, waits for it to respond, runs saved Kane tests, and removes its temporary container. It opens a browser dashboard to show each stage.

When Kane fails, the pipeline saves a redacted, size-limited failure log and run metadata under `quiff/.testmuai/attribution-runs/`, then starts Codex CLI in a read-only sandbox. Codex reads the local ticket/team context and uses the read-only `quiff-github` MCP server to inspect GitHub issues, PRs, commits, and diffs. The attribution result is saved beside the failure input and shown in the dashboard. The last passing SHA from a clean checkout is tracked locally per branch in `quiff/.testmuai/pipeline-state.json` to narrow the change range. Notifications are not sent.

The local attribution path requires the Codex CLI, GitHub CLI, and the configured `quiff-github` MCP server. The MCP launcher reads its fine-grained GitHub token from the macOS login keychain. If Codex attribution fails, the pipeline still exits with the original Kane test failure code.

## Test the Slack webhook

Set `SLACK_WEBHOOK_URL` in the ignored `quiff/.env.local` file, then send a test message with:

```bash
npm --prefix quiff run test:slack
```

The script prints no webhook value. Rotate any URL that has been shared, and only put the replacement in the local env file.
