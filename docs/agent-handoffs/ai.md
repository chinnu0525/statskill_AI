# AI Agent Handoff

## Scope
Competency intelligence, recommendations, document-grounded assessment generation, and AI tutor.

## Architecture
AI features must sit behind application services. Core scoring and recommendation ranking must have deterministic fallbacks so the MVP remains usable if an LLM is unavailable.

## RAG
Uploaded learning material is extracted, chunked, embedded, and retrieved for grounded answers/questions. Generated questions retain source references.

## Safety and quality
- Validate structured model output.
- Reject malformed questions.
- Avoid unsupported claims outside retrieved material for source-grounded tasks.
- Record model/evaluation metadata where practical.
- Never expose secrets to the browser.
- AI-generated learning recommendations are advisory and explain their basis.

## Languages
The tutor and generated assessment presentation should support `en`, `hi`, and `te`; locale selection comes from the shared i18n service rather than separate AI prompts scattered across the UI.
