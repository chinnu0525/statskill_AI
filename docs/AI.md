# StatSkill AI — Grounded AI Contract

## Principle
The local LLM is an untrusted generation component. Authorization, source retrieval, validation, persistence, scoring, and competency updates remain deterministic application/database responsibilities.

## Grounding flow
1. Authenticate the learner with Supabase Auth.
2. Resolve only documents owned by that learner through RLS.
3. Retrieve owned source chunks in the browser.
4. Pass source chunks as untrusted reference data to the browser-local LLM.
5. Require structured output containing short source references.
6. Map those references back to real chunk UUIDs and validate every citation against the supplied context.
7. Persist generated assessments through the authenticated owner-scoped transactional RPC.
8. Never return correct answer keys through normal question reads.
9. Score attempts with the JWT-protected assessment scorer.

## Local inference
- Runtime: pinned `@mlc-ai/web-llm` package.
- Model: `Qwen2.5-0.5B-Instruct-q4f16_1-MLC`.
- Execution: learner browser via WebGPU.
- First use downloads model artifacts and caches them locally in the browser.
- No AI API key, payment card, Vercel AI Gateway credit, or server-side inference credential is required.
- Learning-material excerpts are not sent to an AI inference provider. Supabase is still used for authenticated storage/retrieval and persistence.

## Prompt-injection rule
Uploaded learning material is data, not instructions. Prompts explicitly instruct the local model to ignore commands, role changes, secrets requests, or tool instructions contained inside uploaded content.

## MCQ contract
- Domain contract supports 1–20 questions; the local UI currently offers 3, 5, or 10 to match the small on-device model's reliability envelope.
- English, Hindi, or Telugu.
- Exactly four options with IDs A/B/C/D after normalization.
- Unique non-empty option labels.
- Correct option must be one of A/B/C/D.
- Grounded explanation required.
- Topic and EASY/MEDIUM/HARD difficulty required.
- At least one source chunk citation per question.
- Every citation must be one of the source chunks supplied to the model.
- Generated assessments use `origin = AI_GENERATED`, are private to their creator, and default to no official competency mapping.

## Tutor contract
The tutor returns `supported`, `answer`, and `sourceChunkIds`.
- If `supported = true`, at least one supplied source chunk must be cited.
- If `supported = false`, citations must be empty and the answer must clearly abstain rather than fabricate evidence.
- The model cannot cite chunks it did not receive.
- The raw learner question is not persisted in the AI ledger; only its SHA-256 hash and context chunk IDs are recorded.

## Persistence
`persist_my_generated_assessment` is an authenticated owner-scoped Postgres RPC. It derives the current learner from `auth.uid()` and validates:
- document ownership and `CHUNKED` status;
- locale and question count;
- four distinct A/B/C/D options;
- correct-answer validity;
- explanation/topic/difficulty;
- unique source chunk references;
- every cited chunk belongs to the selected document;
- an owned `PENDING` quiz generation exists for the same document.

The function inserts the assessment, questions, and locked answer keys in one transaction and marks the generation complete.

## Provider abstraction
The domain continues to depend only on the contracts in `src/domain/ai.ts`. `src/services/local-ai.ts` is the current implementation. A future approved provider can be added without changing validation, persistence, or scoring rules.

## Engineering gates
For normal changes:
1. Production dependency audit passes.
2. TypeScript passes.
3. Production build passes.
4. Relevant Supabase security checks remain clean when database/security policy changes are involved.
5. The deployed commit matches the validated Git head.

CodeRabbit is used when a change is security-sensitive, unusually risky, difficult to debug, or when an independent code-review pass would materially improve confidence; it is not required for every routine change.
