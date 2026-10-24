# Quiff product vision

## Rough description

The company builds a login/signup product. Quiff is a developer tool the team is building on top of that product and its engineering workflow, initially to help engineers diagnose release-time CI/CD failures. It analyzes a failed Kane CLI run, searches repository-local mock Markdown tickets for the source ticket, follows it to the linked PR and commit, and uses OpenAI to identify relevant context. It sends a Slack notification with the failure and source trail, helping the team find which ticket and code change need attention.

## Product direction

Build Quiff incrementally, one block at a time. Keep this document as the high-level product intent; capture each block's detailed behavior and acceptance criteria in its own PRD before implementation.

## Core flow

1. A Kane CLI run fails during release-time CI/CD.
2. Quiff analyzes the failed run.
3. Quiff searches repository-local mock Markdown tickets to find the source ticket.
4. Quiff follows references from the ticket to the related pull request and commit.
5. OpenAI helps identify the relevant context for the failure.
6. Quiff sends a Slack notification with the failure details and source trail.
7. The engineer uses the notification to locate the ticket and code change that need attention.

## Intended outcome

Reduce the time an engineer spends connecting a release-time CI/CD failure to the ticket, pull request, and commit that may need investigation.

## Initial constraints and assumptions

- The company team builds and maintains the login/signup product.
- Quiff is an additional developer tool built by that same team, using their product and engineering context.
- The current repository contains a minimal login page demo; it does not yet implement the full login/signup product or the Quiff workflow described above.
- Tickets are initially mock Markdown files local to the repository.
- Kane CLI runs are the initial source of failure data.
- Slack is the initial notification destination.
- OpenAI is used to identify relevant context from the gathered failure and source trail.

These describe the current direction, not a commitment to specific implementation details. Refine them in block-level PRDs as the project develops.
