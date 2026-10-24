# TICKET-008: Require at least 8 characters in login fields on the backend

**Team:** Backend
**Type:** Validation
**Status:** done

## Description

The login endpoint independently checks that username and password each contain at least 8 characters. If either is shorter, return a simple error and skip credential matching.

## Acceptance criteria

- [ ] Server checks both lengths even for direct requests
- [ ] either value shorter than 8 returns a simple error
- [ ] exactly 8 passes the length check.

## Source trail

- Related pull request: TBD
- Related commit: TBD
