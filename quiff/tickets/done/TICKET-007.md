# TICKET-007: Require at least 8 characters in login fields on the frontend

**Team:** Frontend
**Type:** Validation
**Status:** done

## Description

Before sending a login request, check that both username and password contain at least 8 characters. If either is shorter, show an error and do not submit.

## Acceptance criteria

- [ ] Both fields need at least 8 characters
- [ ] shorter values show a clear associated error and prevent the request
- [ ] exactly 8 characters pass this check.

## Source trail

- Related pull request: TBD
- Related commit: TBD
