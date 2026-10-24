# PRD: Signup form demo

- **Status:** Implemented as a non-persistent demo
- **Owner:** Project
- **Last updated:** 2026-10-24

## Summary

Replace the fixed-credential sign-in demo with a polished signup form. Validate submissions in both the browser and server, acknowledge valid submissions, and clearly explain that this demo does not create or store accounts.

## Problem

The current app only demonstrates sign-in using hard-coded credentials. The selected product flow is account signup; visitors need a signup form and the server must reject invalid submissions without relying on browser-only checks.

## Goals

- Collect a username, email address, password, and password confirmation.
- Require a minimum of 8 characters for both username and password.
- Enforce the length rules in the browser and independently on the server.
- Show clear, accessible errors and a responsive signup experience.
- Acknowledge valid requests without pretending an account was created.

## Non-goals

- Login or fixed demo credentials.
- Persisting accounts or signup data in a database.
- Creating sessions, cookies, or authenticated access.
- Email verification, password reset, or account management.

## User stories

- As a visitor, I can enter a username, email address, password, and password confirmation to submit signup details.
- As a visitor, I see an inline error if the username or password has fewer than 8 characters.
- As a visitor, I see an error if my email address is malformed or the passwords do not match.
- As a visitor, I receive a clear acknowledgment when the server accepts my details and understand that this demo does not save an account.

## Requirements

1. The page presents a signup form with required username, email, password, and confirm-password fields.
2. Username length is measured after trimming surrounding whitespace and must be from 8 through 64 characters.
3. Password length is measured without trimming and must be from 8 through 128 characters.
4. The browser checks required fields, email format, password confirmation, and both minimum lengths before submitting. If username or password is under 8 characters, show a field-associated message and do not send the request.
5. The form submits a JSON `POST` request to `/api/signup`.
6. The server independently checks payload types, required values, email format, matching passwords, and the same username and password length bounds. A direct request that bypasses the browser receives a simple `400` error for invalid input.
7. A valid request receives a `202` acknowledgment. The server does not persist the payload or create an account.
8. The interface shows loading feedback, announces errors accessibly, and presents a success acknowledgment that explicitly says no account was created or saved.
9. Password fields have show/hide controls. The layout adapts to mobile and desktop viewports and supports keyboard navigation and visible focus.
10. The UI, API, and documentation contain no fixed demo username or password.

## UX notes

Use a responsive split layout with a calm green welcome panel and a focused form panel. Show the 8-character minimum under username and password. Associate errors with their fields and use a form-level alert for server or network errors. The acknowledgment should say that details were accepted for the demo request but not stored.

## Success criteria

- Username and password values below 8 characters show field errors and do not submit.
- Exactly 8 characters passes each minimum-length check.
- Direct API requests with either value below 8 receive a `400` response with a simple field-specific message.
- Validly shaped data receives `202` and the non-persistent acknowledgment.
- No account, session, cookie, or signup payload is stored.
- No dummy credentials or sign-in flow remain in the app.

## Dependencies and constraints

- Next.js App Router and its Route Handler support.
- No account database or persistence layer is configured.
- This is a signup form demo, not a production account creation system.

## Open questions

- None for the current demo scope.
