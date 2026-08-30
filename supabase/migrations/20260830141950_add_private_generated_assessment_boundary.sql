alter table public.assessments
add column if not exists owner_id uuid references public.profiles(id) on delete cascade,
add column if not exists source_document_id uuid references public.documents(id) on delete set null,
add column if not exists origin text not null default 'CURATED';

alter table public.assessments
drop constraint if exists assessments_origin_check;

alter table public.assessments
add constraint assessments_origin_check check (origin in ('CURATED','AI_GENERATED'));

create index if not exists idx_assessments_owner_id on public.assessments(owner_id);
create index if not exists idx_assessments_source_document_id on public.assessments(source_document_id);

drop policy if exists assessments_select on public.assessments;
create policy assessments_select on public.assessments
for select to authenticated
using (owner_id is null or owner_id = (select auth.uid()));

drop policy if exists questions_auth_select on public.questions;
drop policy if exists questions_select on public.questions;
create policy questions_select on public.questions
for select to authenticated
using (
  exists (
    select 1
    from public.assessments a
    where a.id = questions.assessment_id
      and (a.owner_id is null or a.owner_id = (select auth.uid()))
  )
);
