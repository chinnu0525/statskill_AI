# StatSkill AI — Product Requirements

## 1. Vision

StatSkill AI is an AI-powered Skill Intelligence and Learning Platform for statistical officials. It connects competency assessment, skill-gap identification, personalized learning, AI-generated assessment, AI tutoring, and organizational workforce analytics.

## 2. MVP users

- Official / learner
- Trainer / content creator
- Administrator

## 3. Core MVP capabilities

1. User authentication and role-based access.
2. Official competency profile.
3. Competency assessment and scoring.
4. Skill-gap identification and prioritization.
5. Personalized learning recommendations.
6. Course/program catalogue with iGOT and NSSTA/TPAC adapter interfaces.
7. Document upload for approved learning material.
8. Retrieval-grounded AI question generation.
9. Quiz delivery, scoring, explanations, and progress tracking.
10. AI learning assistant grounded in approved material where applicable.
11. Learner dashboard.
12. Administrator dashboard and workforce competency analytics.
13. English, Hindi, and Telugu interface localization.
14. Language selection on first launch and persistent language switcher.
15. Audit/security controls appropriate for the application.

## 4. UX principles

- Clean Government Modern visual language.
- Minimal cognitive load and progressive disclosure.
- Avoid unnecessary cards, decorative charts, and information density.
- Clear primary action per screen.
- Accessible typography and contrast.
- Responsive desktop/tablet/mobile layouts.
- Language choice is visible but unobtrusive.

## 5. Multilingual requirements

Supported locales:
- `en` — English
- `hi` — हिन्दी
- `te` — తెలుగు

The selected locale must persist per user. All product UI strings must come from localization resources rather than hard-coded text. AI assistant responses should follow the selected language by default. Learning content language is modeled separately from interface language.

## 6. AI requirements

- Structured outputs for generated assessments.
- Questions must be traceable to source material where generated from uploaded content.
- Validate generated questions before presenting them.
- Provide explanations after assessment where appropriate.
- Protect retrieval and generation pipelines against prompt injection and unsafe content.

## 7. Integration requirements

Use adapter interfaces for iGOT and NSSTA/TPAC. The MVP may use mock catalogues when official API specifications/credentials are unavailable. The application must not hard-code external API assumptions into learner-facing components.

## 8. MVP acceptance criteria

A complete demo must support this journey:

Official → language selection → profile → competency assessment → skill-gap analysis → personalized recommendations → learning → upload approved material → AI-generated quiz → quiz result → updated learning recommendation → administrator analytics.

## 9. Non-goals for MVP

- Production SSO with government identity providers unless credentials/specifications are supplied.
- Real iGOT/NSSTA transactions without official API specifications.
- Full predictive workforce forecasting before the core competency loop is stable.
