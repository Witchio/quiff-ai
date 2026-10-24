# TICKET-007: Require at least 8 characters in signup fields on the frontend

**Team:** Frontend
**Type:** Validation
**Status:** done

## Description

Before sending a signup request, check that both username and password contain at least 8 characters. If either is shorter, show an error and do not submit.

## Acceptance criteria

- [ ] Username and password each require at least 8 characters.
- [ ] Short values show clear field-associated errors and prevent the request.
- [ ] Values of exactly 8 characters pass their length checks.

## Source trail

- Related pull request: TBD
- Related commit: TBD
