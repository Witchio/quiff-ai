# Mock tickets

This directory contains 50 fictional work tickets across product, engineering, customer, go-to-market, and company operations. These are planning data only; creating these files does not implement the work.

## Ticket index

- [001 — Add a dedicated signup screen](TICKET-001.md) (Feature)
- [002 — Add password visibility control](TICKET-002.md) (Enhancement)
- [003 — Send an email verification link](TICKET-003.md) (Feature)
- [004 — Build the password reset flow](TICKET-004.md) (Feature)
- [005 — Expire inactive sessions](TICKET-005.md) (Enhancement)
- [006 — Make sign-in fully keyboard accessible](TICKET-006.md) (Improvement)
- [007 — Require at least 8 characters in login fields on the frontend](TICKET-007.md) (Validation)
- [008 — Require at least 8 characters in login fields on the backend](TICKET-008.md) (Validation)
- [009 — Limit repeated failed sign-in attempts](TICKET-009.md) (Improvement)
- [010 — Add structured sign-in error logging](TICKET-010.md) (Maintenance)
- [011 — Review the login and signup visual identity](TICKET-011.md) (Review)
- [012 — Rewrite signup email copy](TICKET-012.md) (Content)
- [013 — Write a new-user onboarding guide](TICKET-013.md) (Documentation)
- [014 — Interview users about account creation friction](TICKET-014.md) (Research)
- [015 — Create sign-in support response macros](TICKET-015.md) (Operations)
- [016 — Prepare a product demo script](TICKET-016.md) (Enablement)
- [017 — Update product landing page copy](TICKET-017.md) (Content)
- [018 — Review the privacy policy for account data](TICKET-018.md) (Review)
- [019 — Inventory account data retention periods](TICKET-019.md) (Audit)
- [020 — Prepare a monthly hosting cost report](TICKET-020.md) (Reporting)
- [021 — Create an engineering interview rubric](TICKET-021.md) (Hiring)
- [022 — Source candidates for a frontend engineer role](TICKET-022.md) (Hiring)
- [023 — Document backup internet access for the office](TICKET-023.md) (Continuity)
- [024 — Audit color contrast across authentication screens](TICKET-024.md) (Audit)
- [025 — Improve authentication layouts on small screens](TICKET-025.md) (Enhancement)
- [026 — Support password managers and browser autofill](TICKET-026.md) (Compatibility)
- [027 — Add an account deletion request flow](TICKET-027.md) (Feature)
- [028 — Allow users to request an account data export](TICKET-028.md) (Feature)
- [029 — Create an authentication release checklist](TICKET-029.md) (Process)
- [030 — Investigate flaky authentication checks in CI](TICKET-030.md) (Reliability)
- [031 — Run a database backup restore exercise](TICKET-031.md) (Operations)
- [032 — Create an authentication service health dashboard](TICKET-032.md) (Monitoring)
- [033 — Run an account access incident tabletop](TICKET-033.md) (Preparedness)
- [034 — Review and update third-party dependencies](TICKET-034.md) (Maintenance)
- [035 — Create a threat model for account access](TICKET-035.md) (Assessment)
- [036 — Check authentication flows across supported browsers](TICKET-036.md) (Compatibility)
- [037 — Prepare authentication screens for localization](TICKET-037.md) (Planning)
- [038 — Review terms of service for account access](TICKET-038.md) (Review)
- [039 — Review authentication flows with screen readers](TICKET-039.md) (Audit)
- [040 — Publish an account access FAQ](TICKET-040.md) (Documentation)
- [041 — Track customer activation after signup](TICKET-041.md) (Analysis)
- [042 — Improve handoff from sales to customer success](TICKET-042.md) (Process)
- [043 — Plan an onboarding email series](TICKET-043.md) (Campaign)
- [044 — Create reusable authentication form components](TICKET-044.md) (System)
- [045 — Review analytics consent for account journeys](TICKET-045.md) (Review)
- [046 — Document the authentication API for internal consumers](TICKET-046.md) (Documentation)
- [047 — Test a shorter signup flow](TICKET-047.md) (Experiment)
- [048 — Run a usability test of the signup journey](TICKET-048.md) (Usability)
- [049 — Review renewal costs for identity vendors](TICKET-049.md) (Vendor Management)
- [050 — Inventory shared office equipment](TICKET-050.md) (Inventory)

## The two length-validation tickets

- [TICKET-007](TICKET-007.md) covers the frontend: both username and password need at least 8 characters; shorter input shows an error and prevents submission.
- [TICKET-008](TICKET-008.md) covers the backend: independently check both values and return a simple error if either is shorter than 8 characters.

These are the only two tickets for the requested character-length validation. The current demo credentials (`admin` / `admin`) are shorter than 8 characters, so implementation will require a separate decision about the demo fixture.
