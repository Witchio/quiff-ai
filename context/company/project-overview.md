# Project overview

## What this project does

The login/signup app currently has a small Next.js login demo that validates a fixed demo credential pair on the server and displays either a success screen or an error message.

## Current scope

- Username and password form.
- Server-side check for username `admin` and password `admin`.
- Success state after valid credentials.
- Inline error state after invalid credentials or a failed request.
- No account database, session, cookie, or persistent authentication.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js. Use `admin` for both fields to see the success state.

## Important limitation

The fixed credentials are demonstration-only. This app is not suitable for protecting real data or production access. There is no session creation, access control, rate limiting, or user management.

## Source map

- `app/(login)/page.tsx` — login form and success/error UI.
- `app/(login)/api/login/route.ts` — server-side credential validation endpoint; the public URL is `/api/login`.
- `app/layout.tsx` — root document and metadata.
- `app/globals.css` — page styling.
