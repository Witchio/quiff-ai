# Quiff local GitHub MCP

This stdio MCP server exposes a small read-only GitHub surface for the Quiff bug-attribution investigation. It is pinned to `Witchio/quiff-ai` by default (override with `QUIFF_GITHUB_REPOSITORY=owner/repo` when launching it), reads its dedicated token from the macOS login keychain through `launch.sh`, passes it to the local `gh` CLI as `GH_TOKEN`, and makes only `GET` requests. Repository selection is not exposed as a model tool argument.

## Tools

- `search_pull_requests`: find candidate PRs in a selected repository.
- `search_issues`: find tickets when the repository uses GitHub Issues.
- `get_pull_request`: read PR metadata, author, branches, and merge SHA.
- `get_pull_request_files`: read changed paths and bounded patch excerpts.
- `get_pull_request_commits`: read PR commits and their GitHub authors.
- `compare_commits`: enumerate changes between a known passing SHA and the tested SHA.
- `get_pull_requests_for_commit`: map an in-range commit to its PR.

The server does not expose write operations, arbitrary API URLs, or arbitrary shell commands. It requires `gh` to be installed and the fine-grained token to have access to the target repository. Keep local team and ticket markdown in the repository; Codex can read those from its workspace without an MCP tool.

## Local check

Run `bash quiff/ci/github-mcp/launch.sh` as a Codex stdio MCP process. The launcher reads the `quiff-github-mcp` generic password for account `quiff-ai` from Keychain, then replaces its own process with the MCP server. The process speaks JSON-RPC over stdin/stdout; diagnostics go to stderr. The server is not added to the app Docker image.
