# TICKET-007: Require at least 10 characters in signup fields on the frontend

**Team:** Frontend
**Type:** Validation
**Assignee:** witchio
**Status:** todo

## Description

Before sending a signup request, check that both username and password contain at least 10 characters. If either is shorter, show an error and do not submit.

## Acceptance criteria

- [ ] Username and password each require at least 10 characters.
- [ ] Values shorter than 10 show clear field-associated errors and prevent the request.
- [ ] Values of exactly 10 characters pass their length checks.

## Source trail

- Related pull request: https://github.com/Witchio/quiff-ai/pull/2
- Related commit: TBD
