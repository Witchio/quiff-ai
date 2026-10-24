# Login/signup app and Quiff

This repository contains two separate product areas:

- The login/signup app, with a minimal login demo currently implemented in `app/(login)/`.
- Quiff, a separate developer tool whose implementation belongs in `quiff/` (currently only its boundary notes are present).

The login demo includes frontend form handling and server-side credential validation.

## Run locally

```bash
npm install
npm run dev
```

Use `admin` for both username and password. This demo creates no session and stores no account data. The hard-coded credentials are intended for local demonstration only.

Project context, architecture notes, and PRDs live in [`context/`](context/README.md). See [`quiff/README.md`](quiff/README.md) for the code boundary between the two products.
