# StatSkill AI — Architecture Contract

## Frontend

Next.js + TypeScript application. User-facing strings come exclusively from locale resources. Interface language and learning-content language are separate.

## Core services

- Identity & RBAC
- Competency profile
- Assessment
- Skill-gap engine
- Recommendation engine
- Learning catalogue
- Document ingestion
- RAG / AI tutor
- AI assessment generation
- Analytics
- External integration adapters

## Data

Supabase PostgreSQL is the primary system of record. Supabase Storage holds approved learning documents. pgvector/vector search supports retrieval-grounded AI features.

## External integrations

iGOT and NSSTA/TPAC are represented through stable adapter interfaces. Mock adapters are used when official API contracts are unavailable.

## Multilingual model

Supported locales: `en`, `hi`, `te`.

UI strings are locale-keyed resources. User preference is persisted. Course metadata and learning content have their own localization fields so a Telugu interface can still consume English-only content when a translation is unavailable.

## Security

Role-based access control, database row-level security, secure storage access, audit events, server-side secret handling, and AI prompt/retrieval protections are mandatory.

## Deployment

GitHub is the source of truth. Feature branches merge through pull requests. CI validates type-checking, tests, and build. Vercel provides preview and production deployments.
