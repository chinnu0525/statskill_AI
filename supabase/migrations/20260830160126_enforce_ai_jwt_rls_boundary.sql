grant insert (id, user_id, feature, source_document_id, model, status, request_metadata, result_metadata, token_usage, error_code)
on public.ai_generations to authenticated;
grant update (source_document_id, model, status, request_metadata, result_metadata, token_usage, error_code, updated_at)
on public.ai_generations to authenticated;

drop policy if exists ai_generations_insert_own on public.ai_generations;
create policy ai_generations_insert_own on public.ai_generations
for insert to authenticated
with check (
  user_id = (select auth.uid())
  and (
    source_document_id is null
    or exists (
      select 1 from public.documents d
      where d.id = ai_generations.source_document_id
        and d.owner_id = (select auth.uid())
        and d.status = 'CHUNKED'
    )
  )
  and (feature <> 'QUIZ' or source_document_id is not null)
);

drop policy if exists ai_generations_update_own on public.ai_generations;
create policy ai_generations_update_own on public.ai_generations
for update to authenticated
using (user_id = (select auth.uid()))
with check (
  user_id = (select auth.uid())
  and (
    source_document_id is null
    or exists (
      select 1 from public.documents d
      where d.id = ai_generations.source_document_id
        and d.owner_id = (select auth.uid())
        and d.status = 'CHUNKED'
    )
  )
  and (feature <> 'QUIZ' or source_document_id is not null)
);

drop policy if exists assessments_insert_private_ai on public.assessments;
create policy assessments_insert_private_ai on public.assessments
for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and origin = 'AI_GENERATED'
  and competency_id is null
  and source_document_id is not null
  and generation_id is not null
  and exists (
    select 1 from public.documents d
    where d.id = assessments.source_document_id
      and d.owner_id = (select auth.uid())
      and d.status = 'CHUNKED'
  )
  and exists (
    select 1 from public.ai_generations g
    where g.id = assessments.generation_id
      and g.user_id = (select auth.uid())
      and g.feature = 'QUIZ'
      and g.source_document_id = assessments.source_document_id
      and g.status = 'PENDING'
  )
);

drop policy if exists questions_insert_private_ai on public.questions;
create policy questions_insert_private_ai on public.questions
for insert to authenticated
with check (
  source_document_id is not null
  and exists (
    select 1 from public.assessments a
    where a.id = questions.assessment_id
      and a.owner_id = (select auth.uid())
      and a.origin = 'AI_GENERATED'
      and a.source_document_id = questions.source_document_id
  )
);

drop policy if exists question_answers_no_client_access on public.question_answers;
revoke all on public.question_answers from anon, authenticated;
grant insert (question_id, correct_answer) on public.question_answers to authenticated;

drop policy if exists question_answers_insert_private_ai on public.question_answers;
create policy question_answers_insert_private_ai on public.question_answers
for insert to authenticated
with check (
  exists (
    select 1
    from public.questions q
    join public.assessments a on a.id = q.assessment_id
    where q.id = question_answers.question_id
      and a.owner_id = (select auth.uid())
      and a.origin = 'AI_GENERATED'
  )
);

create or replace function public.begin_my_ai_generation(
  p_generation_id uuid,
  p_feature text,
  p_source_document_id uuid,
  p_model text,
  p_request_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_existing_feature text;
  v_existing_status text;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_generation_id is null then
    raise exception 'generation id required' using errcode = '22023';
  end if;
  if p_feature not in ('QUIZ','TUTOR') then
    raise exception 'unsupported feature' using errcode = '22023';
  end if;
  if coalesce(trim(p_model), '') = '' then
    raise exception 'model required' using errcode = '22023';
  end if;
  if p_request_metadata is null or jsonb_typeof(p_request_metadata) <> 'object' then
    raise exception 'request metadata must be an object' using errcode = '22023';
  end if;
  if p_feature = 'QUIZ' and p_source_document_id is null then
    raise exception 'quiz source document required' using errcode = '22023';
  end if;
  if p_source_document_id is not null and not exists (
    select 1 from public.documents d
    where d.id = p_source_document_id
      and d.owner_id = v_user_id
      and d.status = 'CHUNKED'
  ) then
    raise exception 'owned chunked document required' using errcode = '42501';
  end if;

  select g.feature, g.status
    into v_existing_feature, v_existing_status
  from public.ai_generations g
  where g.id = p_generation_id
    and g.user_id = v_user_id;

  if not found then
    insert into public.ai_generations (
      id, user_id, feature, source_document_id, model, status,
      request_metadata, result_metadata, token_usage, error_code
    ) values (
      p_generation_id, v_user_id, p_feature, p_source_document_id, trim(p_model), 'PENDING',
      p_request_metadata, '{}'::jsonb, '{}'::jsonb, null
    );
    return;
  end if;

  if v_existing_feature <> p_feature then
    raise exception 'generation id unavailable' using errcode = '42501';
  end if;
  if v_existing_status <> 'ERROR' then
    raise exception 'generation is not retryable' using errcode = '55000';
  end if;

  update public.ai_generations
  set source_document_id = p_source_document_id,
      model = trim(p_model),
      status = 'PENDING',
      request_metadata = p_request_metadata,
      result_metadata = '{}'::jsonb,
      token_usage = '{}'::jsonb,
      error_code = null,
      updated_at = now()
  where id = p_generation_id
    and user_id = v_user_id;
end;
$$;

create or replace function public.complete_my_ai_generation(
  p_generation_id uuid,
  p_token_usage jsonb,
  p_result_metadata jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_updated integer;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_token_usage is null or jsonb_typeof(p_token_usage) <> 'object' then
    raise exception 'token usage must be an object' using errcode = '22023';
  end if;
  if p_result_metadata is null or jsonb_typeof(p_result_metadata) <> 'object' then
    raise exception 'result metadata must be an object' using errcode = '22023';
  end if;

  update public.ai_generations
  set status = 'COMPLETE',
      token_usage = p_token_usage,
      result_metadata = p_result_metadata,
      error_code = null,
      updated_at = now()
  where id = p_generation_id
    and user_id = v_user_id
    and status = 'PENDING';
  get diagnostics v_updated = row_count;

  if v_updated <> 1 then
    raise exception 'pending owned generation required' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.fail_my_ai_generation(
  p_generation_id uuid,
  p_error_code text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  update public.ai_generations
  set status = 'ERROR',
      error_code = left(coalesce(nullif(trim(p_error_code), ''), 'AI_GENERATION_FAILED'), 120),
      updated_at = now()
  where id = p_generation_id
    and user_id = v_user_id
    and status = 'PENDING';
end;
$$;

create or replace function public.persist_my_generated_assessment(
  p_generation_id uuid,
  p_document_id uuid,
  p_title text,
  p_locale text,
  p_questions jsonb,
  p_token_usage jsonb,
  p_result_metadata jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_assessment_id uuid;
  v_question_id uuid;
  v_item jsonb;
  v_source_ids uuid[];
  v_option_ids text[];
  v_option_labels text[];
  v_correct text;
  v_difficulty text;
  v_source_count integer;
  v_generation_status text;
  v_generation_document_id uuid;
  v_result_metadata jsonb;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_generation_id is null or p_document_id is null then
    raise exception 'generation and document required' using errcode = '22023';
  end if;
  if coalesce(trim(p_title), '') = '' then
    raise exception 'title required' using errcode = '22023';
  end if;
  if p_locale is null or p_locale not in ('en','hi','te') then
    raise exception 'unsupported locale' using errcode = '22023';
  end if;
  if jsonb_typeof(p_questions) <> 'array' or jsonb_array_length(p_questions) < 1 or jsonb_array_length(p_questions) > 20 then
    raise exception 'questions must contain 1 to 20 items' using errcode = '22023';
  end if;
  if p_token_usage is null or jsonb_typeof(p_token_usage) <> 'object' then
    raise exception 'token usage must be an object' using errcode = '22023';
  end if;
  if p_result_metadata is null or jsonb_typeof(p_result_metadata) <> 'object' then
    raise exception 'result metadata must be an object' using errcode = '22023';
  end if;

  select a.id into v_assessment_id
  from public.assessments a
  where a.generation_id = p_generation_id
    and a.owner_id = v_user_id;
  if found then
    return v_assessment_id;
  end if;

  select g.status, g.source_document_id
    into v_generation_status, v_generation_document_id
  from public.ai_generations g
  where g.id = p_generation_id
    and g.user_id = v_user_id
    and g.feature = 'QUIZ';

  if not found or v_generation_status <> 'PENDING' then
    raise exception 'pending owned quiz generation required' using errcode = '42501';
  end if;
  if v_generation_document_id is distinct from p_document_id then
    raise exception 'generation source document mismatch' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.documents d
    where d.id = p_document_id
      and d.owner_id = v_user_id
      and d.status = 'CHUNKED'
  ) then
    raise exception 'owned chunked document required' using errcode = '42501';
  end if;

  insert into public.assessments (
    title, competency_id, locale, owner_id, source_document_id, origin, generation_id
  ) values (
    trim(p_title), null, p_locale, v_user_id, p_document_id, 'AI_GENERATED', p_generation_id
  ) returning id into v_assessment_id;

  for v_item in select value from jsonb_array_elements(p_questions)
  loop
    if coalesce(trim(v_item ->> 'questionText'), '') = '' then
      raise exception 'question text required' using errcode = '22023';
    end if;
    if jsonb_typeof(v_item -> 'options') <> 'array' or jsonb_array_length(v_item -> 'options') <> 4 then
      raise exception 'exactly four options required' using errcode = '22023';
    end if;

    select array_agg(option_item ->> 'id' order by option_item ->> 'id'),
           array_agg(lower(trim(option_item ->> 'label')) order by option_item ->> 'id')
    into v_option_ids, v_option_labels
    from jsonb_array_elements(v_item -> 'options') option_item;

    if v_option_ids <> array['A','B','C','D']::text[] then
      raise exception 'option ids must be A, B, C and D' using errcode = '22023';
    end if;
    if exists (select 1 from unnest(v_option_labels) label where coalesce(label, '') = '') then
      raise exception 'option labels required' using errcode = '22023';
    end if;
    if (select count(distinct label) from unnest(v_option_labels) label) <> 4 then
      raise exception 'option labels must be unique' using errcode = '22023';
    end if;

    v_correct := v_item ->> 'correctOptionId';
    if v_correct is null or not (v_correct = any(v_option_ids)) then
      raise exception 'valid correct option required' using errcode = '22023';
    end if;
    if coalesce(trim(v_item ->> 'explanation'), '') = '' then
      raise exception 'explanation required' using errcode = '22023';
    end if;
    if coalesce(trim(v_item ->> 'topic'), '') = '' then
      raise exception 'topic required' using errcode = '22023';
    end if;

    v_difficulty := v_item ->> 'difficulty';
    if v_difficulty is null or v_difficulty not in ('EASY','MEDIUM','HARD') then
      raise exception 'valid difficulty required' using errcode = '22023';
    end if;

    if jsonb_typeof(v_item -> 'sourceChunkIds') <> 'array' or jsonb_array_length(v_item -> 'sourceChunkIds') < 1 then
      raise exception 'source chunk references required' using errcode = '22023';
    end if;

    select array_agg(source_id::uuid)
    into v_source_ids
    from jsonb_array_elements_text(v_item -> 'sourceChunkIds') source_id;

    if cardinality(v_source_ids) <> (select count(distinct source_id) from unnest(v_source_ids) source_id) then
      raise exception 'source chunk references must be unique' using errcode = '22023';
    end if;

    select count(*) into v_source_count
    from public.document_chunks c
    where c.document_id = p_document_id
      and c.id = any(v_source_ids);
    if v_source_count <> cardinality(v_source_ids) then
      raise exception 'all source chunks must belong to the source document' using errcode = '42501';
    end if;

    insert into public.questions (
      assessment_id, question_text, options, explanation, source_document_id,
      source_chunk_ids, difficulty, topic
    ) values (
      v_assessment_id,
      trim(v_item ->> 'questionText'),
      v_item -> 'options',
      trim(v_item ->> 'explanation'),
      p_document_id,
      v_source_ids,
      v_difficulty,
      trim(v_item ->> 'topic')
    ) returning id into v_question_id;

    insert into public.question_answers (question_id, correct_answer)
    values (v_question_id, v_correct);
  end loop;

  v_result_metadata := p_result_metadata || jsonb_build_object(
    'assessmentId', v_assessment_id,
    'title', trim(p_title),
    'questionCount', jsonb_array_length(p_questions)
  );

  update public.ai_generations
  set status = 'COMPLETE',
      token_usage = p_token_usage,
      result_metadata = v_result_metadata,
      error_code = null,
      updated_at = now()
  where id = p_generation_id
    and user_id = v_user_id
    and status = 'PENDING';

  if not found then
    raise exception 'generation completion failed' using errcode = '55000';
  end if;

  return v_assessment_id;
end;
$$;

revoke all on function public.begin_my_ai_generation(uuid, text, uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.begin_my_ai_generation(uuid, text, uuid, text, jsonb) to authenticated;
revoke all on function public.complete_my_ai_generation(uuid, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.complete_my_ai_generation(uuid, jsonb, jsonb) to authenticated;
revoke all on function public.fail_my_ai_generation(uuid, text) from public, anon, authenticated;
grant execute on function public.fail_my_ai_generation(uuid, text) to authenticated;
revoke all on function public.persist_my_generated_assessment(uuid, uuid, text, text, jsonb, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.persist_my_generated_assessment(uuid, uuid, text, text, jsonb, jsonb, jsonb) to authenticated;
