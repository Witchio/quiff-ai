# Signup work tickets

This directory contains 50 fictional tickets for the signup app and company work. Each ticket is planning data; marking a ticket done records its board status and does not claim that every described task is implemented.

Current board: 28 todo, 22 done. Tickets are stored in folders matching their status.

## Todo

- [004 — Resend a signup verification email](todo/TICKET-004.md) (Feature) — **Assignee: Samira Patel**
- [006 — Make the signup form fully keyboard accessible](todo/TICKET-006.md) (Improvement) — **Assignee: Alex Morgan**
- [007 — Require at least 10 characters in signup fields on the frontend](todo/TICKET-007.md) (Validation) — **Assignee: witchio**
- [008 — Require at least 10 characters in signup fields on the backend](todo/TICKET-008.md) (Validation) — **Assignee: witchio**
- [010 — Add structured signup error logging](todo/TICKET-010.md) (Maintenance) — **Assignee: Samira Patel**
- [012 — Rewrite signup email copy](todo/TICKET-012.md) (Content) — **Assignee: Oliver Grant**
- [013 — Write a new-user onboarding guide](todo/TICKET-013.md) (Documentation) — **Assignee: Ethan Cole**
- [014 — Interview users about account creation friction](todo/TICKET-014.md) (Research) — **Assignee: Priya Shah**
- [019 — Inventory account data retention periods](todo/TICKET-019.md) (Audit) — **Assignee: Chloe Nguyen**
- [021 — Create an engineering interview rubric](todo/TICKET-021.md) (Hiring) — **Assignee: Hannah Brooks**
- [023 — Document backup internet access for the office](todo/TICKET-023.md) (Continuity) — **Assignee: Lucy Bennett**
- [024 — Audit color contrast across the signup screen](todo/TICKET-024.md) (Audit) — **Assignee: Priya Shah**
- [025 — Improve the signup layout on small screens](todo/TICKET-025.md) (Enhancement) — **Assignee: Alex Morgan**
- [027 — Add a privacy acknowledgment to signup](todo/TICKET-027.md) (Feature) — **Assignee: Peter Novak**
- [029 — Create a signup release checklist](todo/TICKET-029.md) (Process) — **Assignee: Noah Brooks**
- [030 — Investigate flaky signup checks in CI](todo/TICKET-030.md) (Reliability) — **Assignee: Marcus Reed**
- [031 — Test signup email delivery recovery](todo/TICKET-031.md) (Operations) — **Assignee: Noah Brooks**
- [033 — Run a signup availability incident tabletop](todo/TICKET-033.md) (Preparedness) — **Assignee: Ben Wallace**
- [037 — Prepare the signup form for localization](todo/TICKET-037.md) (Planning) — **Assignee: Priya Shah**
- [038 — Review terms acceptance during signup](todo/TICKET-038.md) (Review) — **Assignee: Peter Novak**
- [039 — Review the signup flow with screen readers](todo/TICKET-039.md) (Audit) — **Assignee: Priya Shah**
- [041 — Track customer activation after signup](todo/TICKET-041.md) (Analysis) — **Assignee: Chloe Nguyen**
- [043 — Plan an onboarding email series](todo/TICKET-043.md) (Campaign) — **Assignee: Oliver Grant**
- [045 — Review analytics consent for signup](todo/TICKET-045.md) (Review) — **Assignee: Chloe Nguyen**
- [046 — Document the signup API for internal consumers](todo/TICKET-046.md) (Documentation) — **Assignee: Samira Patel**
- [048 — Run a usability test of the signup journey](todo/TICKET-048.md) (Usability) — **Assignee: Priya Shah**
- [049 — Review renewal costs for email verification vendors](todo/TICKET-049.md) (Vendor Management) — **Assignee: Aisha Johnson**
- [050 — Inventory shared office equipment](todo/TICKET-050.md) (Inventory) — **Assignee: Lucy Bennett**

## Done

- [001 — Create the signup form and request acknowledgment](done/TICKET-001.md) (Feature) — **Assignee: Jordan Kim**
- [002 — Add password visibility control](done/TICKET-002.md) (Enhancement) — **Assignee: Alex Morgan**
- [003 — Send a signup verification email](done/TICKET-003.md) (Feature) — **Assignee: Samira Patel**
- [005 — Expire unused signup verification links](done/TICKET-005.md) (Enhancement) — **Assignee: Samira Patel**
- [009 — Limit repeated signup submissions](done/TICKET-009.md) (Improvement) — **Assignee: Grace Okafor**
- [011 — Review the signup visual identity](done/TICKET-011.md) (Review) — **Assignee: Oliver Grant**
- [015 — Create signup support response macros](done/TICKET-015.md) (Operations) — **Assignee: Ethan Cole**
- [016 — Prepare a signup walkthrough for sales](done/TICKET-016.md) (Enablement) — **Assignee: Sofia Rivera**
- [017 — Update product landing page copy](done/TICKET-017.md) (Content) — **Assignee: Oliver Grant**
- [018 — Review the privacy policy for account data](done/TICKET-018.md) (Review) — **Assignee: Peter Novak**
- [020 — Prepare a monthly hosting cost report](done/TICKET-020.md) (Reporting) — **Assignee: Aisha Johnson**
- [022 — Source candidates for a frontend engineer role](done/TICKET-022.md) (Hiring) — **Assignee: Daniel Foster**
- [026 — Support password managers and browser autofill](done/TICKET-026.md) (Compatibility) — **Assignee: Alex Morgan**
- [028 — Collect optional marketing consent separately](done/TICKET-028.md) (Feature) — **Assignee: Peter Novak**
- [032 — Create a signup service health dashboard](done/TICKET-032.md) (Monitoring) — **Assignee: Ben Wallace**
- [034 — Review and update third-party dependencies](done/TICKET-034.md) (Maintenance) — **Assignee: Noah Brooks**
- [035 — Create a threat model for signup](done/TICKET-035.md) (Assessment) — **Assignee: Grace Okafor**
- [036 — Check signup across supported browsers](done/TICKET-036.md) (Compatibility) — **Assignee: Marcus Reed**
- [040 — Publish a signup FAQ](done/TICKET-040.md) (Documentation) — **Assignee: Ethan Cole**
- [042 — Improve handoff from sales to customer success](done/TICKET-042.md) (Process) — **Assignee: Sofia Rivera**
- [044 — Create reusable signup form components](done/TICKET-044.md) (System) — **Assignee: Alex Morgan**
- [047 — Test a shorter signup flow](done/TICKET-047.md) (Experiment) — **Assignee: Leo Martinez**

## Planned signup length requirements

- [TICKET-007](todo/TICKET-007.md) requires the frontend to block signup when username or password has fewer than 10 characters.
- [TICKET-008](todo/TICKET-008.md) requires the backend to independently reject either value below 10 characters.

These tickets track a planned change; the app currently enforces an 8-character minimum.
