# Generated Assessment Boundary Handoff

TASK: Prepare the assessment model for private AI-generated quizzes without weakening curated assessment access.

STATUS: READY FOR CI

FILES CHANGED:
- `supabase/migrations/20260830141950_add_private_generated_assessment_boundary.sql`
- `supabase/functions/submit-assessment/index.ts`

DECISIONS:
- Curated assessments remain shared with authenticated users via `owner_id is null`.
- AI-generated assessments are assigned `owner_id` and are visible only to their creator.
- Generated assessments may point to their source document and use `origin = 'AI_GENERATED'`.
- Question visibility is inherited from assessment ownership.
- Server-side scoring independently verifies assessment ownership before reading answer keys.

DEPENDENCIES:
- Existing secure assessment scoring flow.
- Existing document ownership model.

TEST RESULT:
- Live migration `20260830141950_add_private_generated_assessment_boundary` applied successfully.
- `submit-assessment` Edge Function v2 is ACTIVE with JWT verification.
- Supabase security advisor reports zero lints.
- GitHub CI still required before merge.

BLOCKERS:
- Actual MCQ generation requires an authorized AI provider/gateway.
- Vercel deployment remains blocked on CodeRabbit review.

NEXT AGENT: AI generation contract / QA.
