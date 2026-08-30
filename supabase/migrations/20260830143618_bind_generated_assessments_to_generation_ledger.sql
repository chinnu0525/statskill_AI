alter table public.assessments
add column if not exists generation_id uuid unique references public.ai_generations(id) on delete set null;

drop function if exists public.persist_generated_assessment(uuid, uuid, text, text, jsonb);

create or replace function public.persist_generated_assessment(
  p_generation_id uuid,
  p_owner_id uuid,
  p_document_id uuid,
  p_title text,
  p_locale text,
  p_questions jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assessment_id uuid;
  v_question_id uuid;
  v_item jsonb;
  v_source_ids uuid[];
  v_option_ids text[];
  v_option_labels text[];
  v_correct text;
  v_difficulty text;
  v_source_count integer;
begin
  if p_generation_id is null or p_owner_id is null then
    raise exception 'generation and owner required' using errcode = '22023';
  end if;
  if coalesce(trim(p_title), '') = '' then
    raise exception 'title required' using errcode = '22023';
  end if;
  if p_locale not in ('en','hi','te') then
    raise exception 'unsupported locale' using errcode = '22023';
  end if;
  if jsonb_typeof(p_questions) <> 'array' or jsonb_array_length(p_questions) < 1 or jsonb_array_length(p_questions) > 20 then
    raise exception 'questions must contain 1 to 20 items' using errcode = '22023';
  end if;

  select a.id into v_assessment_id
  from public.assessments a
  where a.generation_id = p_generation_id;
  if found then
    return v_assessment_id;
  end if;

  if not exists (
    select 1 from public.ai_generations g
    where g.id = p_generation_id and g.user_id = p_owner_id and g.feature = 'QUIZ'
  ) then
    raise exception 'valid quiz generation required' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.documents d
    where d.id = p_document_id and d.owner_id = p_owner_id and d.status = 'CHUNKED'
  ) then
    raise exception 'owned chunked document required' using errcode = '42501';
  end if;

  insert into public.assessments (title, competency_id, locale, owner_id, source_document_id, origin, generation_id)
  values (trim(p_title), null, p_locale, p_owner_id, p_document_id, 'AI_GENERATED', p_generation_id)
  returning id into v_assessment_id;

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
    if v_difficulty not in ('EASY','MEDIUM','HARD') then
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
    where c.document_id = p_document_id and c.id = any(v_source_ids);
    if v_source_count <> cardinality(v_source_ids) then
      raise exception 'all source chunks must belong to the source document' using errcode = '42501';
    end if;

    insert into public.questions (
      assessment_id, question_text, options, explanation, source_document_id,
      source_chunk_ids, difficulty, topic
    )
    values (
      v_assessment_id,
      trim(v_item ->> 'questionText'),
      v_item -> 'options',
      trim(v_item ->> 'explanation'),
      p_document_id,
      v_source_ids,
      v_difficulty,
      trim(v_item ->> 'topic')
    )
    returning id into v_question_id;

    insert into public.question_answers (question_id, correct_answer)
    values (v_question_id, v_correct);
  end loop;

  return v_assessment_id;
end;
$$;

revoke all on function public.persist_generated_assessment(uuid, uuid, uuid, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.persist_generated_assessment(uuid, uuid, uuid, text, text, jsonb) to service_role;
