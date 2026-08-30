# Security Agent Handoff

## Scope
Authentication, authorization, RLS, secure uploads, AI/API boundaries, auditability, and secrets hygiene.

## Required controls
- Role-based access: OFFICIAL, TRAINER, ADMIN, SUPER_ADMIN.
- Supabase RLS for user-private data.
- Server-only privileged credentials.
- Validate upload type and size; do not execute uploaded files.
- Store secrets only in environment/configuration systems.
- Audit privileged and sensitive actions.
- Treat uploaded documents and retrieved text as untrusted input for prompt-injection defense.
- Do not allow model output to bypass authorization.
