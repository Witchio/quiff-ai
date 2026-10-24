# TICKET-008: Require at least 10 characters in signup fields on the backend

**Team:** Backend
**Type:** Validation
**Assignee:** witchio
**Status:** todo

## Description

The signup endpoint independently checks that both username and password contain at least 10 characters. If either is shorter, return a simple error and skip signup acknowledgment.

## Acceptance criteria

- [ ] The server checks both lengths even when the browser is bypassed.
- [ ] Either value shorter than 10 returns a simple field-specific error.
- [ ] Values of exactly 10 characters pass the length checks.

## Source trail

- Related pull request: TBD
- Related commit: TBD
