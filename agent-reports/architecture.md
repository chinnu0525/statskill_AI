# Architecture Agent Report

## Status
In progress — baseline architecture contract published.

## Handoffs
- Database Agent: implement schema around the service boundaries in `docs/architecture.md`.
- i18n Agent: define locale resource structure for `en`, `hi`, `te` and persistence strategy.
- Frontend Agent: consume localization keys and service APIs; do not hard-code user-facing strings.
- AI Agent: keep RAG and assessment generation behind service boundaries.
- Integration Agent: implement iGOT/NSSTA adapter interfaces rather than coupling UI to external APIs.

## Guardrail
No production code is introduced on this branch. Architecture changes should be merged before dependent implementation branches are created from main.
