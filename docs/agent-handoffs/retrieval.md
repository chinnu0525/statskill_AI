# Retrieval Agent Handoff

TASK: Add provider-independent, grounded retrieval over uploaded learning materials.

STATUS: READY FOR CI

FILES CHANGED:
- `supabase/migrations/20260830140849_add_owner_scoped_chunk_text_search.sql`
- `src/services/retrieval.ts`
- `src/i18n/retrieval-messages.ts`
- `app/components/SourceSearch.tsx`
- `app/retrieval.css`
- `app/layout.tsx`
- `app/page.tsx`

DECISIONS:
- Use PostgreSQL full-text search with the `simple` dictionary so retrieval is language-neutral for English/Hindi/Telugu material.
- Keep search `SECURITY INVOKER` and owner-scoped; authenticated users can retrieve only chunks belonging to their own documents.
- Limit result count to 20 at the database boundary.
- Keep this retrieval layer provider-independent; embeddings/LLM generation can be added later as a hybrid second stage.

DEPENDENCIES:
- Existing `documents` and `document_chunks` tables with RLS.
- Existing authenticated Supabase client.

TEST RESULT:
- Live Supabase migration `20260830140849_add_owner_scoped_chunk_text_search` is already applied.
- GitHub CI must pass production dependency audit, TypeScript, and production build before merge.

BLOCKERS:
- Semantic embeddings and generated AI answers require an authorized AI provider/gateway.
- Final deployment is additionally blocked on a successful CodeRabbit review per project deployment policy.

NEXT AGENT: AI contract / QA.
