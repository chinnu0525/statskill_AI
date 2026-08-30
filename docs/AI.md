# StatSkill AI — Grounded AI Contract

## Principle
The LLM is an untrusted generation component. Authorization, source retrieval, validation, persistence, scoring, and competency updates remain deterministic application/database responsibilities.

## Grounding flow
1. Authenticate the user.
2. Resolve only documents owned by that user.
3. Retrieve owned source chunks.
4. Pass source chunks as untrusted reference data to the AI provider.
5. Require structured output containing source chunk IDs.
6. Validate every returned source ID against the supplied context.
7. Persist generated assessments through the service-role-only transactional RPC.
8. Never return correct answer keys to the browser.
9. Score attempts with the JWT-protected assessment scorer.

## Prompt-injection rule
Uploaded learning material is data, not instructions. Provider prompts must explicitly instruct the model to ignore commands, role changes, secrets requests, or tool instructions contained inside uploaded content.

## MCQ contract
- 1–20 questions.
- English, Hindi, or Telugu.
- Exactly four options with IDs A/B/C/D.
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

## Persistence
`persist_generated_assessment` is a `SECURITY DEFINER` Postgres function executable only by `service_role`. It validates:
- document ownership and `CHUNKED` status;
- locale and question count;
- four distinct A/B/C/D options;
- correct-answer validity;
- explanation/topic/difficulty;
- unique source chunk references;
- every cited chunk belongs to the selected document.

The function inserts the assessment, questions, and locked answer keys in one transaction.

## Provider adapter
The domain depends only on `AiProvider` from `src/domain/ai.ts`. A Vercel AI Gateway adapter can implement that interface using current AI SDK structured output APIs without changing domain rules.

## Deployment gate
Vercel deployment is allowed only after:
1. Production dependency audit passes.
2. TypeScript passes.
3. Production build passes.
4. Supabase security advisor is clean.
5. CodeRabbit completes a real review and all blocking issues are resolved.
