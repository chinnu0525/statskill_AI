# AI Contract Agent Handoff

TASK: Freeze provider-independent grounded AI contracts and transactional persistence rules.

STATUS: READY FOR CI

FILES CHANGED:
- `src/domain/ai.ts`
- `supabase/migrations/20260830142627_add_question_grounding_metadata.sql`
- `supabase/migrations/20260830142721_add_generated_assessment_persistence_rpc.sql`
- `docs/AI.md`

DECISIONS:
- The AI provider is untrusted and cannot authorize access, persist answer keys directly from the browser, or update official competency scores.
- Generated MCQs require A/B/C/D options, explanations, topics, difficulty, and source chunk citations.
- Tutor responses support explicit abstention when evidence is insufficient.
- Generated assessments default to `competency_id = null` so unreviewed AI content does not alter official competency records.
- Correct answers are persisted only inside the service-role-only transaction RPC.

DEPENDENCIES:
- Owner-scoped document retrieval.
- Private AI-generated assessment boundary.
- Supabase service role on the future server adapter.

TEST RESULT:
- Live grounding metadata and persistence migrations applied successfully.
- Supabase security advisor reports zero lints after both changes.
- GitHub CI required before merge.

BLOCKERS:
- Actual generation requires Vercel AI Gateway authentication and a configured current model.
- Final deployment requires a successful CodeRabbit review.

NEXT AGENT: Vercel AI Gateway adapter / AI UI / QA.
