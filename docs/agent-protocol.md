# StatSkill AI — Multi-Agent Engineering Protocol

## Purpose
This repository uses specialized agents with Git branches and pull requests as the shared coordination mechanism.

## Rules
1. `main` is production-ready and must not receive direct feature commits.
2. Every implementation task uses an `agent/*` branch.
3. Agents must read the latest merged contracts before implementing dependent work.
4. Every PR must document files changed, tests run, decisions, dependencies, and blockers.
5. User-facing strings must use the i18n contract (`en`, `hi`, `te`).
6. Database access follows the Supabase/RLS security contract.
7. External government services are accessed only through adapter interfaces.
8. AI features must remain source-grounded where applicable and expose validation/evaluation hooks.
9. QA owns cross-agent integration verification before production promotion.
10. DevOps owns CI/CD and deployment checks; production deployment happens only after QA acceptance.

## Handoff format
Each agent report should contain:
- Status
- Completed work
- Files changed
- Tests/checks
- Decisions
- Dependencies
- Blockers
- Next agent / handoff

## Branch flow
`main` → `agent/<scope>` → PR → review/checks → merge.

For dependent work, branch from the latest `main` after the prerequisite PR is merged. Avoid long-lived branches and avoid parallel edits to the same files.
