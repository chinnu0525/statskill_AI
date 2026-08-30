# DevOps Agent Handoff

## Scope
CI/CD, preview environments, production deployment, and release documentation.

## Pipeline
Pull request → lint/typecheck/test/build → preview deployment → QA acceptance → production promotion.

## Rules
- Never deploy unreviewed feature branches to production.
- Keep environment variables out of Git.
- Use preview deployments for visual and integration verification.
- Production deployment requires QA sign-off.
