# Project overview

## What this project does

The app presents a signup form for a username, email address, password, and password confirmation. The browser and server validate the submitted values. A successful request receives an acknowledgment, but no account is created or stored.

## Current scope

- Signup form with username, email, password, and password confirmation.
- Minimum length of 8 characters for username and password, checked in both the browser and server.
- Email format and matching password confirmation checks.
- Accessible field-level errors, server errors, loading state, and submission acknowledgment.
- No account database, session, cookie, or persistent signup data.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js and submit valid signup details to see the acknowledgment state.

## Important limitation

This is a signup form demo, not an account system. Submissions are not persisted, and the app does not create accounts, sessions, or cookies. It is not suitable for production signup or account access.

## Source map

- `app/(signup)/page.tsx` — signup form and success/error UI.
- `app/(signup)/api/signup/route.ts` — server-side signup payload validation; the public URL is `/api/signup`.
- `app/layout.tsx` — root document and metadata.
- `app/globals.css` — page styling.
