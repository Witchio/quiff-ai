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

Project context is separated by product: [`context/company/`](context/company/README.md) covers the login/signup app and its team, while [`context/quiff/`](context/quiff/README.md) covers the developer tool. Login/signup code lives in `app/(login)/`; Quiff code belongs in `quiff/`.

## Run Kane tests

With `kane-cli` installed and authenticated, run all saved Kane tests headlessly from the project root:

```bash
npm run test:kane
```
