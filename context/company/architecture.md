# Architecture

## Stack

- Next.js App Router
- React client component for interactive form state
- TypeScript
- Next.js Route Handler for server-side validation

## Request flow

1. The browser collects a username and password in `app/(login)/page.tsx`.
2. On submit, the frontend sends a JSON `POST` request to `/api/login`.
3. `app/(login)/api/login/route.ts` parses the request and checks the credentials on the server. The `(login)` route group is omitted from the public URL, so the endpoint remains `/api/login`.
4. The route returns a success response for `admin` / `admin`, a `401` response for incorrect credentials, or a `400` response for malformed JSON.
5. The frontend renders the success screen or an accessible inline error based on the response.

## Boundaries

- Login/signup app code lives in the Next.js `(login)` route group.
- Credential validation belongs in the route handler, not in the client bundle.
- The client owns presentation and transient loading/error/success state.
- The route does not create a session or persist any data, as required for this demo.

## Current limitations

Credentials are hard-coded in the server route for demonstration. The app does not provide production authentication. If the project grows beyond a demo, replace this mechanism with an established identity provider or a properly designed authentication service, add session handling, and avoid committing secrets.

## Source map

- `app/(login)/page.tsx` — login form and success/error UI.
- `app/(login)/api/login/route.ts` — server-side demo credential validation endpoint.
- `app/layout.tsx` and `app/globals.css` — shared Next.js document and styling.
