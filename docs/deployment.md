# StatSkill AI deployment runbook

This runbook targets a zero-cost hackathon/demo deployment using Vercel Hobby plus the existing Supabase Free project. Do not buy a domain, purchase AI credits, or upgrade the Vercel/Supabase plan without explicit approval.

## Vercel import

1. In Vercel, choose **Add New → Project**.
2. Import GitHub repository `chinnu0525/statskill_AI`.
3. Keep the framework preset as **Next.js** and the project root as the repository root.
4. Use the default install/build settings from `package.json`.
5. Deploy a **Preview** first. Do not promote to production until the preview passes the checks below.

## Required environment variables

Configure these for Preview and Production:

- `NEXT_PUBLIC_SUPABASE_URL=https://mwsvvaqbfnllsunkkppw.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<the active publishable key from the StatSkill AI Supabase project>`
- `AI_GATEWAY_MODEL=<a currently available Vercel AI Gateway language model in creator/model format>`

Do **not** add `SUPABASE_SERVICE_ROLE_KEY`; the app uses the signed-in learner JWT plus Supabase RLS.

On Vercel, prefer the automatically provided `VERCEL_OIDC_TOKEN` for AI Gateway authentication. Only use `AI_GATEWAY_API_KEY` as a fallback outside Vercel.

## Preview checks

After the preview is built:

1. Open `/api/health`.
2. Confirm HTTP 200 and `checks.supabase=true`.
3. Confirm `checks.aiGateway=true` before running an AI smoke test.
4. Record the exact Git commit SHA that passed CI and CodeRabbit. Confirm the Vercel deployment's Git commit is that same commit, and confirm `/api/health` `release` equals the first 12 characters of that reviewed SHA. Do not promote a different or newer deployment without reviewing that new head again.
5. Load the app and verify the English/Hindi/Telugu selector.
6. Sign in with a test account.
7. Upload a small non-sensitive TXT/PDF/DOCX/PPTX learning material.
8. Confirm ingestion reaches the CHUNKED state and source search returns only that account's material.
9. Ask one grounded tutor question and verify cited source chunks.
10. Generate one small quiz (for example 3 questions), complete it, and verify the secure scorer works.
11. Verify an ordinary learner cannot access admin analytics.

## Release gates

Production promotion requires all of the following on the exact release head:

- GitHub CI dependency audit passed.
- TypeScript passed.
- Next.js production build passed.
- Supabase security advisor has zero security lints.
- CodeRabbit review completed and all actionable issues resolved.
- Vercel deployment commit and `/api/health` `release` match the exact reviewed release head.
- Preview `/api/health` is healthy.
- Browser smoke test and AI smoke test passed.

## Cost guardrails

- Stay on Vercel Hobby.
- Stay on Supabase Free.
- Use the free `*.vercel.app` domain.
- Do not purchase AI Gateway credits or enable a paid plan automatically.
- Keep AI smoke tests minimal and use a low-cost model while covered by available free credits.
- Do not upload confidential government data during free-tier AI testing.
