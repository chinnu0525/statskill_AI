# Database Agent Handoff

## Scope
Supabase PostgreSQL schema for the StatSkill AI MVP.

## Required entities
- profiles / roles
- competency_domains / competencies
- user_competencies / skill_gaps
- courses / course_competencies / course_localizations
- learning_paths / enrollments
- assessments / questions / attempts / answers
- documents / document_chunks
- recommendations
- external_catalog_items
- audit_events

## Constraints
- User-facing language uses locale codes `en`, `hi`, `te`.
- RLS must prevent users from reading/writing other users' private records.
- Public catalogue records may be readable; writes require elevated role.
- AI-generated records must retain source/document references where applicable.
- Do not hard-code iGOT or NSSTA assumptions into core catalogue tables.

## Handoff
Frontend and backend should consume typed service contracts rather than query tables directly from arbitrary UI components.
