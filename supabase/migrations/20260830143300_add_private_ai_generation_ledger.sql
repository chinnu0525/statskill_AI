create table if not exists public.ai_generations (
  id uuid primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  feature text not null check (feature in ('QUIZ','TUTOR')),
  source_document_id uuid references public.documents(id) on delete set null,
  model text not null,
  status text not null default 'PENDING' check (status in ('PENDING','COMPLETE','ERROR')),
  request_metadata jsonb not null default '{}'::jsonb,
  result_metadata jsonb not null default '{}'::jsonb,
  token_usage jsonb not null default '{}'::jsonb,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_generations enable row level security;

drop policy if exists ai_generations_select_own on public.ai_generations;
create policy ai_generations_select_own on public.ai_generations
for select to authenticated
using (user_id = (select auth.uid()));

revoke all on public.ai_generations from anon, authenticated;
grant select on public.ai_generations to authenticated;

create index if not exists idx_ai_generations_user_created
on public.ai_generations(user_id, created_at desc);
