# QA Agent Handoff

## Scope
Automated and manual validation of the complete learner and administrator journeys.

## Required coverage
- unit tests for competency and skill-gap scoring
- integration tests for API/database/adapter boundaries
- E2E: language selection → login → profile → assessment → gaps → recommendations → learning → quiz → result
- admin analytics access controls
- English/Hindi/Telugu rendering and fallback behavior
- keyboard/accessibility smoke checks
- AI output schema, grounding/source references, and malformed-output handling
- degraded mode when AI/external adapters are unavailable

## Release gate
QA must report pass/fail and blockers before DevOps promotes a build to production.
