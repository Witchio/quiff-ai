# Signup architecture

## Stack

- Next.js App Router
- React client component for interactive form state
- TypeScript
- Next.js Route Handler for server-side validation

## Signup request flow

1. The browser collects a username, email, password, and password confirmation in `app/(signup)/page.tsx`.
2. The frontend checks required values, email format, password confirmation, and the 8-character username and password minimum before sending a JSON `POST` request to `/api/signup`.
3. `app/(signup)/api/signup/route.ts` independently validates the payload, including the same 8-character minimum for username and password.
4. Valid payloads receive a `202` acknowledgment. Invalid or malformed requests receive a `400` response with a simple message.
5. The frontend renders the submission acknowledgment or an accessible inline error based on the response.

## Boundaries

- Signup UI code lives in the Next.js `(signup)` route group.
- Server-side signup validation belongs in the route handler and is independent of browser checks.
- The client owns presentation and transient loading/error/success state.
- The route acknowledges valid data but does not create an account, session, or persistent record.

## Current limitations

The app has no database or account store. Signup requests are not persisted, and the acknowledgment must not be treated as account creation.

## Source map

- `app/(signup)/page.tsx` — signup form and success/error UI.
- `app/(signup)/api/signup/route.ts` — server-side signup validation endpoint.
- `app/layout.tsx` and `app/globals.css` — shared Next.js document and styling.
