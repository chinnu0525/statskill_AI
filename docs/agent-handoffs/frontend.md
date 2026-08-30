# Frontend Agent Handoff

## Scope
Next.js/TypeScript application shell and clean Government Modern interface.

## UX requirements
- Low cognitive load; avoid dashboard clutter.
- Learner home emphasizes competency score, three priority gaps, and two next recommendations.
- Admin views may be denser but must use progressive disclosure.
- Responsive and keyboard accessible.

## i18n requirements
- Supported locales: `en`, `hi`, `te`.
- First-launch language selection.
- Persist selection per user/device as appropriate.
- Global language switcher remains available.
- No hard-coded user-facing strings.
- English fallback for missing translation keys.
- RTL is not required for these three locales.

## Integration
Frontend calls service/API contracts and must not embed database-specific business logic or external iGOT/NSSTA credentials.
