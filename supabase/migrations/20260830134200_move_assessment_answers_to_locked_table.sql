create table if not exists public.question_answers (
  question_id uuid primary key references public.questions(id) on delete cascade,
  correct_answer text not null
);

alter table public.question_answers enable row level security;
revoke all on public.question_answers from anon, authenticated;

insert into public.question_answers (question_id, correct_answer)
select id, correct_answer from public.questions
on conflict (question_id) do update set correct_answer = excluded.correct_answer;

drop function if exists public.get_assessment_questions(uuid);
drop function if exists public.submit_assessment(uuid, jsonb);

alter table public.questions drop column if exists correct_answer;

grant select on public.questions to authenticated;
drop policy if exists questions_auth_select on public.questions;
create policy questions_auth_select on public.questions
for select to authenticated using (true);

drop policy if exists question_answers_no_client_access on public.question_answers;
create policy question_answers_no_client_access
on public.question_answers
for all
to anon, authenticated
using (false)
with check (false);
