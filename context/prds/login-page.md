# PRD: Minimal login page

- **Status:** Shipped
- **Owner:** Project
- **Last updated:** 2026-10-24

## Summary

Provide a minimal sign-in demo with a clear success state for the correct credentials and an error state for incorrect credentials. Keep the browser UI separate from the server-side credential check.

## Problem

The project needs a small, runnable example of a login flow in Next.js that demonstrates a frontend/backend boundary without requiring a database or session system.

## Goals

- Provide a simple, accessible username and password form.
- Validate credentials on the server through a Next.js endpoint.
- Show a success page when the credentials are correct.
- Explain the failure when credentials are incorrect.

## Non-goals

- Creating or persisting sessions or cookies.
- User registration, password recovery, or account management.
- Database integration or production-grade authentication.

## User stories

- As a visitor, I can enter my username and password to try the demo login.
- As a visitor with valid demo credentials, I see that I signed in successfully.
- As a visitor with invalid credentials, I see an error and can try again.

## Requirements

1. The login screen contains required username and password fields.
2. Submitting the form sends the credentials to the server route `/api/login`.
3. The server accepts only username `admin` with password `admin`.
4. Valid credentials show a success state identifying the signed-in username.
5. Invalid credentials show an inline error and leave the form available for retry.
6. The interface exposes errors accessibly and indicates when a submission is in progress.
7. The application does not create a session or store credentials.

## UX notes

The experience uses a centered, compact sign-in card that adapts to narrow screens. Inputs have labels and focus styles. Errors use an alert role. A sign-out control returns the visitor to the form; it does not invalidate a server session because none exists.

## Success criteria

- `admin` / `admin` displays the success state.
- Any other credential pair displays an error.
- Malformed requests receive a client error response from the endpoint.
- Credentials are checked in server-side code, not embedded as client-side validation logic.

## Dependencies and constraints

- Next.js App Router and its Route Handler support.
- Credentials are fixed in code for this demo and must not be treated as production authentication.

## Open questions

- None for the current demo scope.
