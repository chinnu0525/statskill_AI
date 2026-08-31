# StatSkill AI

AI-powered Skill Intelligence & Learning Platform for statistical officials.

StatSkill AI supports competency measurement, skill-gap analysis, explainable learning recommendations, structured learning paths, grounded AI-assisted assessment generation, role-based workspaces, and organizational analytics.

## Current product capabilities

### Learner experience
- Authenticated competency profile and measured skill gaps.
- Dashboard metrics derived from the signed-in learner's assessment and learning data.
- Learning Advisor recommendations scored with an explainable `30/20/15/15/10/10` model using measured gaps, course metadata, and enrollment history.
- Sequential Learning Path based on real `learning_enrollments`, including progress, status, competency, level, duration, and source.
- Database-backed learning catalog with search, source filters, and adapter status/telemetry.
- Real enrollment for supported local courses.
- Learner reports and editable self-profile data.

### Assessment and AI
- Authenticated assessment delivery and server-controlled scoring boundaries.
- Private generated-assessment persistence and generation ledger.
- Grounded AI question generation from owned, processed learning materials.
- Grounding metadata that links generated questions back to source documents/chunks.
- English, हिन्दी, and తెలుగు portal support.

### Trainer, admin, and system workspaces
- Trainer workspace for owned learning materials and private assessments.
- Admin workforce analytics backed by authorized database data.
- Super-admin system-health views for platform operations.
- Role-aware navigation and access boundaries.

### Competency framework
The production database contains 35 competencies across four domains:
- Statistical: 11
- Technical: 12
- Digital Governance: 6
- Behavioural & Managerial: 6

The seed is maintained through Supabase migrations and is designed to be idempotent.

## iGOT / NSSTA integration boundary

iGOT and NSSTA are represented through adapters so the UI and domain model are ready for official integrations without misrepresenting mock data as a live government service.

- `LOCAL` catalog items can support real application enrollment when configured by the platform.
- `IGOT_MOCK` and `NSSTA_MOCK` entries are explicitly demo-only.
- Mock external entries must not claim or simulate a completed government enrollment.
- Official iGOT/NSSTA APIs, credentials, and approved integration contracts can replace the mock adapters later without changing the learner-facing catalog model.

## Architecture and engineering principles

- Next.js application deployed through Vercel.
- Supabase provides authentication, PostgreSQL data, RLS-backed access control, and migrations.
- `main` is the production branch; feature work uses `agent/*` branches and pull requests.
- CI validates dependency installation, production dependency audit, TypeScript, and Next.js production build.
- AI outputs are grounded in approved/owned learning material where the feature requires grounding.
- Sensitive answer keys and generated-assessment persistence are protected by database policies and controlled RPC boundaries.
- User-visible platform metrics should come from measured or authorized data rather than illustrative production claims.

## Local development

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Production dependency audit:

```bash
npm run audit:prod
```

Environment-specific Supabase and AI configuration must be provided through deployment/local environment variables rather than committed secrets.

## Status

The authenticated core platform, learner learning/recommendation surfaces, role workspaces, competency framework, CI validation, and Vercel production deployment are live in the current implementation.

Remaining external-integration work depends on official iGOT/NSSTA API access and credentials. Until those are available, external catalog adapters remain visibly mock/demo-only by design.
