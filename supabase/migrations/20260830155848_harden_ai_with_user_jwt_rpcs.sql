-- This migration version was created while validating the JWT-only AI boundary
-- against the live Supabase security advisor. The initial remote experiment was
-- immediately superseded by 20260830160126_enforce_ai_jwt_rls_boundary.sql.
--
-- Keep this file intentionally inert so repository migration history matches the
-- remote project without recreating the transient SECURITY DEFINER design on a
-- fresh environment.
select 1;
