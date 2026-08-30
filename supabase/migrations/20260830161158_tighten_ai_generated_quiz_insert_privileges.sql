revoke insert on public.assessments from anon, authenticated;
grant insert (title, competency_id, locale, owner_id, source_document_id, origin, generation_id)
on public.assessments to authenticated;

revoke insert on public.questions from anon, authenticated;
grant insert (assessment_id, question_text, options, explanation, source_document_id, source_chunk_ids, difficulty, topic)
on public.questions to authenticated;

drop policy if exists questions_insert_private_ai on public.questions;
create policy questions_insert_private_ai on public.questions
for insert to authenticated
with check (
  source_document_id is not null
  and exists (
    select 1
    from public.assessments a
    join public.ai_generations g on g.id = a.generation_id
    where a.id = questions.assessment_id
      and a.owner_id = (select auth.uid())
      and a.origin = 'AI_GENERATED'
      and a.source_document_id = questions.source_document_id
      and g.user_id = (select auth.uid())
      and g.feature = 'QUIZ'
      and g.status = 'PENDING'
      and g.source_document_id = a.source_document_id
  )
);

drop policy if exists question_answers_insert_private_ai on public.question_answers;
create policy question_answers_insert_private_ai on public.question_answers
for insert to authenticated
with check (
  exists (
    select 1
    from public.questions q
    join public.assessments a on a.id = q.assessment_id
    join public.ai_generations g on g.id = a.generation_id
    where q.id = question_answers.question_id
      and a.owner_id = (select auth.uid())
      and a.origin = 'AI_GENERATED'
      and g.user_id = (select auth.uid())
      and g.feature = 'QUIZ'
      and g.status = 'PENDING'
      and g.source_document_id = a.source_document_id
  )
);
