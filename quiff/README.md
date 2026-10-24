# Quiff code area

Quiff is a developer tool and is separate from the login/signup app.

## Boundary

- Login/signup routes and UI live in `app/(login)/`.
- Quiff-specific implementation belongs in this top-level `quiff/` area. If Quiff later needs Next.js pages or API routes, put those in a dedicated `app/(quiff)/` route group and keep Quiff domain logic here.
- Do not put Quiff behavior in login/signup components, routes, or services. Shared code should be extracted to an explicitly named shared module only when both products need it.

## Current status

This directory currently contains documentation only. No Quiff runtime code has been implemented.
