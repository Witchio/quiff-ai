# Mock tickets

This directory contains 50 fictional work tickets across product, engineering, customer, go-to-market, and company operations. These are planning data only; creating these files does not implement the work.

## Ticket index

- [001 — Add a dedicated signup screen](done/TICKET-001.md) (Feature) — **done**
- [002 — Add password visibility control](done/TICKET-002.md) (Enhancement) — **done**
- [003 — Send an email verification link](todo/TICKET-003.md) (Feature) — **todo**
- [004 — Build the password reset flow](todo/TICKET-004.md) (Feature) — **todo**
- [005 — Expire inactive sessions](done/TICKET-005.md) (Enhancement) — **done**
- [006 — Make sign-in fully keyboard accessible](todo/TICKET-006.md) (Improvement) — **todo**
- [007 — Require at least 8 characters in login fields on the frontend](done/TICKET-007.md) (Validation) — **done**
- [008 — Require at least 8 characters in login fields on the backend](done/TICKET-008.md) (Validation) — **done**
- [009 — Limit repeated failed sign-in attempts](todo/TICKET-009.md) (Improvement) — **todo**
- [010 — Add structured sign-in error logging](todo/TICKET-010.md) (Maintenance) — **todo**
- [011 — Review the login and signup visual identity](done/TICKET-011.md) (Review) — **done**
- [012 — Rewrite signup email copy](done/TICKET-012.md) (Content) — **done**
- [013 — Write a new-user onboarding guide](todo/TICKET-013.md) (Documentation) — **todo**
- [014 — Interview users about account creation friction](done/TICKET-014.md) (Research) — **done**
- [015 — Create sign-in support response macros](todo/TICKET-015.md) (Operations) — **todo**
- [016 — Prepare a product demo script](todo/TICKET-016.md) (Enablement) — **todo**
- [017 — Update product landing page copy](todo/TICKET-017.md) (Content) — **todo**
- [018 — Review the privacy policy for account data](todo/TICKET-018.md) (Review) — **todo**
- [019 — Inventory account data retention periods](todo/TICKET-019.md) (Audit) — **todo**
- [020 — Prepare a monthly hosting cost report](done/TICKET-020.md) (Reporting) — **done**
- [021 — Create an engineering interview rubric](todo/TICKET-021.md) (Hiring) — **todo**
- [022 — Source candidates for a frontend engineer role](todo/TICKET-022.md) (Hiring) — **todo**
- [023 — Document backup internet access for the office](todo/TICKET-023.md) (Continuity) — **todo**
- [024 — Audit color contrast across authentication screens](done/TICKET-024.md) (Audit) — **done**
- [025 — Improve authentication layouts on small screens](done/TICKET-025.md) (Enhancement) — **done**
- [026 — Support password managers and browser autofill](todo/TICKET-026.md) (Compatibility) — **todo**
- [027 — Add an account deletion request flow](todo/TICKET-027.md) (Feature) — **todo**
- [028 — Allow users to request an account data export](done/TICKET-028.md) (Feature) — **done**
- [029 — Create an authentication release checklist](todo/TICKET-029.md) (Process) — **todo**
- [030 — Investigate flaky authentication checks in CI](done/TICKET-030.md) (Reliability) — **done**
- [031 — Run a database backup restore exercise](todo/TICKET-031.md) (Operations) — **todo**
- [032 — Create an authentication service health dashboard](todo/TICKET-032.md) (Monitoring) — **todo**
- [033 — Run an account access incident tabletop](done/TICKET-033.md) (Preparedness) — **done**
- [034 — Review and update third-party dependencies](todo/TICKET-034.md) (Maintenance) — **todo**
- [035 — Create a threat model for account access](todo/TICKET-035.md) (Assessment) — **todo**
- [036 — Check authentication flows across supported browsers](todo/TICKET-036.md) (Compatibility) — **todo**
- [037 — Prepare authentication screens for localization](done/TICKET-037.md) (Planning) — **done**
- [038 — Review terms of service for account access](done/TICKET-038.md) (Review) — **done**
- [039 — Review authentication flows with screen readers](todo/TICKET-039.md) (Audit) — **todo**
- [040 — Publish an account access FAQ](todo/TICKET-040.md) (Documentation) — **todo**
- [041 — Track customer activation after signup](done/TICKET-041.md) (Analysis) — **done**
- [042 — Improve handoff from sales to customer success](done/TICKET-042.md) (Process) — **done**
- [043 — Plan an onboarding email series](done/TICKET-043.md) (Campaign) — **done**
- [044 — Create reusable authentication form components](done/TICKET-044.md) (System) — **done**
- [045 — Review analytics consent for account journeys](done/TICKET-045.md) (Review) — **done**
- [046 — Document the authentication API for internal consumers](done/TICKET-046.md) (Documentation) — **done**
- [047 — Test a shorter signup flow](done/TICKET-047.md) (Experiment) — **done**
- [048 — Run a usability test of the signup journey](todo/TICKET-048.md) (Usability) — **todo**
- [049 — Review renewal costs for identity vendors](todo/TICKET-049.md) (Vendor Management) — **todo**
- [050 — Inventory shared office equipment](done/TICKET-050.md) (Inventory) — **done**

## The two length-validation tickets

- [TICKET-007](done/TICKET-007.md) (**done**) covers the frontend: both username and password need at least 8 characters; shorter input shows an error and prevents submission.
- [TICKET-008](done/TICKET-008.md) (**done**) covers the backend: independently check both values and return a simple error if either is shorter than 8 characters.

These are the only two tickets for the requested character-length validation. Tickets are filed in `done/` or `todo/` according to their current status. The current demo credentials (`admin` / `admin`) are shorter than 8 characters, so implementation will require a separate decision about the demo fixture.
