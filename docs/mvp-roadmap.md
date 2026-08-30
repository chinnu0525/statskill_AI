# StatSkill AI — MVP Execution Roadmap

## Stage 1 — Foundations
- Requirements contract: complete
- Architecture contract: complete
- i18n contract: complete
- Multi-agent protocol: complete
- Design system / learner prototype: initiated in Figma

## Stage 2 — Parallel implementation
1. Database Agent: Supabase schema, RLS baseline, seed catalogue data.
2. Frontend Agent: Next.js application shell, locale selection, navigation and learner dashboard.
3. Architecture/Backend Agent: typed API/service contracts.
4. AI Agent: service interfaces and deterministic mock recommendation/assessment pipeline before live model dependency.
5. Integration Agent: iGOT and NSSTA/TPAC mock adapters.

## Stage 3 — Integration
- Merge prerequisite contracts first.
- Rebase dependent branches from latest main.
- Connect frontend to backend services.
- Connect backend to Supabase.
- Connect AI/RAG behind service interfaces.

## Stage 4 — Quality and release
- Security review and RLS validation.
- Unit/integration/E2E tests in en, hi, te.
- Accessibility and responsive UI review.
- AI grounding/evaluation checks.
- Vercel preview deployment.
- QA acceptance.
- Production deployment.

## Release principle
No feature is considered complete until it is documented, tested, multilingual where user-facing, and integrated through a reviewed PR. `main` remains production-ready.
