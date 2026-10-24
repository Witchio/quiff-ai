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

The local pipeline builds the signup app image, starts it on port 3000, waits for it to respond, runs saved Kane tests, and removes its temporary container.
