# AI Gateway Agent Report

## Status
AI workspace implementation is merged. JWT-only Supabase hardening is implemented on `agent/jwt-hardening` and pending CI + CodeRabbit review before merge. Live AI Gateway authorization/runtime verification remains after that.

## Completed work
- Added server-only Vercel AI Gateway adapter with structured JSON output and grounded source rules.
- Added authenticated `/api/ai/generate-quiz` and `/api/ai/tutor` routes.
- Added idempotent generation IDs and private generation ledger metadata.
- Added private generated-quiz persistence and source citation metadata.
- Added multilingual English/Hindi/Telugu AI workspace UI.
- Reused the existing secure assessment runner/scorer for generated quizzes.
- Added automatic AI material refresh after document ingestion.
- Added missing foreign-key indexes identified by the Supabase performance advisor.
- Replaced the Vercel-side Supabase service-role client with a request-scoped publishable-key client carrying the learner JWT.
- Moved AI generation writes to owner-scoped `SECURITY INVOKER` RPCs backed by RLS.
- Made generated-quiz persistence and generation completion transactional under the caller's JWT.
- Added retry support for previously failed generation IDs without allowing cross-user reuse.

## Security checks
- AI Gateway credentials remain server-only.
- No Supabase service-role/secret key is required by the Next.js runtime.
- Browser sends only the signed-in Supabase access token to application routes.
- Next.js validates the token with `auth.getUser()` and uses it as the Supabase request identity.
- Database reads/writes are constrained by RLS and `auth.uid()` instead of a bypass-RLS client.
- Uploaded source chunks are treated as untrusted data and are selected only through owner-scoped RLS/search paths.
- Generated question source IDs are validated before persistence and again inside Postgres.
- Correct answers remain non-readable to browser clients; authenticated insert is allowed only for questions inside the caller's private AI-generated assessment transaction.
- Generated assessments are owner-private and do not update official competency scores by default.
- Tutor can explicitly abstain when evidence is insufficient.
- Supabase security advisor: zero lints after the JWT/RLS migration.

## Live database migrations
- `20260830143300_add_private_ai_generation_ledger`
- `20260830143618_bind_generated_assessments_to_generation_ledger`
- `20260830145320_add_missing_foreign_key_indexes`
- `20260830154000_harden_ai_review_findings`
- `20260830155848_harden_ai_with_user_jwt_rpcs` (remote validation version; repository marker is intentionally inert)
- `20260830160126_enforce_ai_jwt_rls_boundary`

## Runtime dependencies still required
- `NEXT_PUBLIC_SUPABASE_URL`.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- `AI_GATEWAY_MODEL` in `creator/model` format.
- Either Vercel OIDC (`VERCEL_OIDC_TOKEN`) or `AI_GATEWAY_API_KEY` for live AI calls.

## Release gates
1. Production dependency audit.
2. TypeScript typecheck.
3. Next.js production build.
4. CodeRabbit review and fix/re-review cycle for JWT hardening.
5. Live AI Gateway smoke test after authorization.
6. QA/E2E.
7. Vercel preview and production promotion.

## Blockers
No Supabase secret is required. The remaining external dependency is live Vercel AI Gateway authorization/configuration before end-to-end AI smoke testing and deployment.
