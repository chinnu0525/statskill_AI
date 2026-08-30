# StatSkill AI deployment runbook

This runbook targets a zero-cost hackathon/demo deployment using Vercel Hobby plus the existing Supabase Free project. Do not buy a domain or upgrade the Vercel/Supabase plan without explicit approval.

## Vercel import

1. In Vercel, choose **Add New → Project**.
2. Import GitHub repository `chinnu0525/statskill_AI`.
3. Keep the framework preset as **Next.js** and the project root as the repository root.
4. Use the default install/build settings from `package.json`.
5. Deploy a Preview first for substantial changes. Do not promote a materially different unvalidated commit.

## Required environment variables

Configure these for Preview and Production:

- `NEXT_PUBLIC_SUPABASE_URL=https://mwsvvaqbfnllsunkkppw.supabase.co`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<the active publishable key from the StatSkill AI Supabase project>`

No AI provider environment variable is required. Tutor and quiz inference run in the learner's WebGPU-capable browser using the pinned WebLLM runtime and a small open-source model.

Do **not** add `SUPABASE_SERVICE_ROLE_KEY`; the app uses the signed-in learner JWT plus Supabase RLS and authenticated owner-scoped RPCs.

Legacy `AI_GATEWAY_MODEL` / `AI_GATEWAY_API_KEY` values can be removed from Vercel after the local-AI release is verified. They are not used by the learner UI.

## Preview checks

After the preview is built:

1. Open `/api/health`.
2. Confirm HTTP 200 and `checks.supabase=true`.
3. Confirm `checks.aiRuntime="browser-local-webgpu"` and `checks.aiProviderCredentialRequired=false`.
4. Record the exact Git commit SHA that passed CI. Confirm the Vercel deployment's Git commit is that same commit, and confirm `/api/health` `release` equals the first 12 characters of the validated SHA.
5. Load the app and verify the English/Hindi/Telugu selector.
6. Sign in with a test account.
7. Upload a small non-sensitive TXT/PDF/DOCX/PPTX learning material.
8. Confirm ingestion reaches the CHUNKED state and source search returns only that account's material.
9. Ask one grounded tutor question. On first use, allow the local model download to finish and verify the answer cites only owned source chunks.
10. Generate a 3-question quiz, complete it, and verify the secure scorer works.
11. Verify an ordinary learner cannot access admin analytics.

## Browser requirements

- Use a current WebGPU-capable Chrome or Edge browser with hardware acceleration enabled.
- The first AI action downloads the local model and can take longer than later requests.
- Model artifacts are cached by the browser; subsequent sessions should reuse the cached model where browser storage permits.
- If WebGPU is unavailable, the UI shows a specific compatibility message rather than silently sending material to a cloud AI provider.

## Release gates

Production promotion requires all relevant gates on the exact release head:

- GitHub CI production dependency audit passed.
- TypeScript passed.
- Next.js production build passed.
- Supabase security advisor is clean when database/RLS/function changes are part of the release.
- Vercel deployment commit and `/api/health` `release` match the validated release head.
- Preview/runtime health is good.
- Browser smoke test passes for significant client-runtime changes.

Use CodeRabbit when a change is security-sensitive, unusually risky, difficult to debug, or benefits materially from an independent review. It is not a mandatory gate for every routine change.

## Cost guardrails

- Stay on Vercel Hobby.
- Stay on Supabase Free.
- Use the free `*.vercel.app` domain.
- Do not purchase AI Gateway credits or add a payment card for AI inference.
- Browser-local AI requires no AI API key or paid inference account.
- Do not upload confidential government data during hackathon/demo testing unless the deployment and data-handling policy have been formally approved for that material.
