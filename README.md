# Quiff and signup demo

This repository contains a small Next.js signup demo and **Quiff**, a local CI check that runs browser tests against the app. When a test fails, Quiff asks Codex to investigate the failure using local ticket and team context plus read-only GitHub data, then can send a Slack alert naming the likely responsible person.

## How the repository works

- The app lives at the repository root. It validates username, email, password, and password confirmation in the browser and again on the server. A valid request is acknowledged but no account or data is stored.
- Quiff's Kane tests, pipeline scripts, mock tickets, and team context live under [`quiff/`](quiff/README.md). The local pipeline starts the app on port 3000, runs Kane, and stops the app when finished.
- If Kane fails, Quiff captures run evidence and starts Codex CLI to investigate. Codex can inspect GitHub through a read-only `quiff-github` MCP server. The pipeline still reports the Kane failure if Codex cannot complete its investigation.
- If configured, Quiff sends a failure notification to Slack. It tags a person only when their GitHub login is mapped to their Slack member ID.

## Run the signup app

Install Node.js and npm, then run from the repository root:

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js. See [`context/`](context/README.md) for the app requirements and design.

## Run Quiff locally

The local pipeline expects macOS, Node.js/npm, Git, `curl`, `lsof`, GitHub CLI (`gh`), Codex CLI, and an authenticated Kane CLI installation. From the repository root:

```bash
npm install
npm --prefix quiff run pipeline:local
```

The pipeline opens a local progress dashboard, starts the signup app on port 3000, runs saved Kane tests, and investigates failures. Docker is not needed for this local workflow. To run only the saved Kane tests against an already running app, use `npm --prefix quiff run test:kane`.

GitHub investigation additionally requires the `quiff-github` stdio MCP server configured in Codex, GitHub CLI, and a fine-grained GitHub token with read access to the repository. The current launcher reads the token from the macOS login Keychain (service `quiff-github-mcp`, account `quiff-ai`). See [`quiff/ci/github-mcp/README.md`](quiff/ci/github-mcp/README.md) for details.

Slack is optional. Put an incoming webhook URL in the ignored `quiff/.env.local` file as `SLACK_WEBHOOK_URL=...`. Update [`quiff/context/team/slack-identities.json`](quiff/context/team/slack-identities.json) with exact GitHub login to Slack member ID mappings to enable tags.

## Set Quiff up for another app or environment

1. **Bring in the Quiff workflow.** Place the `quiff/` directory in your app repository, or adapt the scripts to point to your app. The current pipeline assumes the app is at the repository root, starts it with `npm run dev -- --hostname 127.0.0.1 --port 3000`, and checks `http://127.0.0.1:3000/`. Change those commands, readiness URL, and Kane tests under `quiff/.testmuai/` to match your app.
2. **Install and authenticate the tools.** Set up Node.js/npm, Git, Kane CLI, Codex CLI, and GitHub CLI. The current failure attribution launcher is macOS-specific because it reads a token from Keychain; for another operating system, update `quiff/ci/github-mcp/launch.sh` to read the credential from that environment's secret store and configure Codex to launch the MCP server.
3. **Connect your GitHub repository.** Set `QUIFF_GITHUB_REPOSITORY=owner/repo` in the MCP server's environment. Give the fine-grained token read access to that repository and store it where the launcher expects it. Make sure the Codex MCP configuration points to `quiff/ci/github-mcp/launch.sh` in the new checkout.
4. **Adapt project context.** Replace the example tickets and team roster in `quiff/tickets/` and `quiff/context/team/` with your own issue/PR references, ownership details, and team roles. Codex uses this context to connect failure evidence to relevant work.
5. **Connect Slack if wanted.** Create an incoming webhook for the destination channel and set `SLACK_WEBHOOK_URL` in `quiff/.env.local`. Map each responsible person's exact GitHub login to their Slack member ID in `quiff/context/team/slack-identities.json`. Notifications work without mappings, but people will not be tagged.
6. **Run the pipeline.** From the repository root, run `npm --prefix quiff run pipeline:local`. Resolve any missing prerequisites it reports. A passing run updates the local last-passing commit baseline; a failing run saves investigation artifacts under `quiff/.testmuai/attribution-runs/`.

The current workflow is a local macOS pipeline, not a hosted GitHub Actions workflow. Moving it to CI requires adapting the app startup, credential provisioning, Codex/MCP availability, and notification setup for that runner.
