drop policy if exists questions_auth_select on public.questions;
revoke select on public.questions from anon, authenticated;

create or replace function public.get_assessment_questions(p_assessment_id uuid)
returns table (id uuid, question_text text, options jsonb)
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  return query
  select q.id, q.question_text, q.options
  from public.questions q
  where q.assessment_id = p_assessment_id
  order by q.created_at, q.id;
end;
$$;

revoke all on function public.get_assessment_questions(uuid) from public, anon;
grant execute on function public.get_assessment_questions(uuid) to authenticated;

create or replace function public.submit_assessment(p_assessment_id uuid, p_answers jsonb)
returns table (attempt_id uuid, score numeric)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_competency_id uuid;
  v_attempt_id uuid;
  v_total integer := 0;
  v_correct integer := 0;
  v_score numeric(5,2) := 0;
  v_gap numeric(5,2) := 0;
  v_priority text := 'LOW';
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if jsonb_typeof(p_answers) <> 'array' then
    raise exception 'answers must be a JSON array' using errcode = '22023';
  end if;

  select a.competency_id into v_competency_id
  from public.assessments a where a.id = p_assessment_id;
  if not found then
    raise exception 'assessment not found' using errcode = 'P0002';
  end if;

  select count(*)::integer into v_total
  from public.questions q where q.assessment_id = p_assessment_id;
  if v_total = 0 then
    raise exception 'assessment has no questions' using errcode = '22023';
  end if;

  select count(*)::integer into v_correct
  from public.questions q
  join lateral (
    select answer_item ->> 'answer' as answer
    from jsonb_array_elements(p_answers) answer_item
    where (answer_item ->> 'questionId')::uuid = q.id
    limit 1
  ) submitted on true
  where q.assessment_id = p_assessment_id
    and submitted.answer = q.correct_answer;

  v_score := round((v_correct::numeric / v_total::numeric) * 100, 2);

  insert into public.assessment_attempts (assessment_id, user_id, score, completed_at)
  values (p_assessment_id, v_user_id, v_score, now())
  returning id into v_attempt_id;

  if v_competency_id is not null then
    insert into public.user_competencies (user_id, competency_id, score, assessed_at)
    values (v_user_id, v_competency_id, v_score, now())
    on conflict (user_id, competency_id)
    do update set score = excluded.score, assessed_at = excluded.assessed_at;

    v_gap := greatest(0, 70 - v_score);
    v_priority := case when v_gap >= 35 then 'HIGH' when v_gap >= 15 then 'MEDIUM' else 'LOW' end;

    insert into public.skill_gaps (user_id, competency_id, priority, gap_score, rationale)
    values (
      v_user_id,
      v_competency_id,
      v_priority,
      v_gap,
      case when v_gap > 0 then 'Latest assessment score is below the target competency level.' else 'Target competency level is met.' end
    )
    on conflict (user_id, competency_id)
    do update set priority = excluded.priority, gap_score = excluded.gap_score,
      rationale = excluded.rationale, created_at = now();
  end if;

  return query select v_attempt_id, v_score;
end;
$$;

revoke all on function public.submit_assessment(uuid, jsonb) from public, anon;
grant execute on function public.submit_assessment(uuid, jsonb) to authenticated;
