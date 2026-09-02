alter table public.questions
add column if not exists bloom_level text,
add column if not exists bloom_weight numeric(4,2);

update public.questions
set bloom_level = case difficulty
  when 'HARD' then 'ANALYZE'
  when 'MEDIUM' then 'APPLY'
  else 'UNDERSTAND'
end
where bloom_level is null;

update public.questions
set bloom_weight = case bloom_level
  when 'REMEMBER' then 1.00
  when 'UNDERSTAND' then 1.25
  when 'APPLY' then 1.50
  when 'ANALYZE' then 1.75
  when 'EVALUATE' then 2.00
  when 'CREATE' then 2.25
  else 1.00
end
where bloom_weight is null;

alter table public.questions
alter column bloom_level set default 'UNDERSTAND',
alter column bloom_level set not null,
alter column bloom_weight set default 1.25,
alter column bloom_weight set not null;

alter table public.questions drop constraint if exists questions_bloom_level_check;
alter table public.questions add constraint questions_bloom_level_check
check (bloom_level in ('REMEMBER','UNDERSTAND','APPLY','ANALYZE','EVALUATE','CREATE'));
alter table public.questions drop constraint if exists questions_bloom_weight_check;
alter table public.questions add constraint questions_bloom_weight_check
check (bloom_weight between 0.50 and 3.00);

alter table public.assessments
add column if not exists review_status text not null default 'APPROVED',
add column if not exists reviewed_at timestamptz,
add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;
alter table public.assessments drop constraint if exists assessments_review_status_check;
alter table public.assessments add constraint assessments_review_status_check
check (review_status in ('PRIVATE','PENDING_REVIEW','APPROVED','REJECTED'));
grant insert (review_status) on public.assessments to authenticated;
grant insert (bloom_level, bloom_weight) on public.questions to authenticated;
update public.assessments set review_status = 'PRIVATE'
where origin = 'AI_GENERATED' and review_status = 'APPROVED';

drop policy if exists assessments_select on public.assessments;
create policy assessments_select on public.assessments
for select to authenticated
using (owner_id is null or owner_id = (select auth.uid()) or review_status = 'APPROVED');

drop policy if exists questions_select on public.questions;
drop policy if exists questions_auth_select on public.questions;
create policy questions_select on public.questions
for select to authenticated
using (
  exists (
    select 1 from public.assessments a
    where a.id = questions.assessment_id
      and (a.owner_id is null or a.owner_id = (select auth.uid()) or a.review_status = 'APPROVED')
  )
);

drop policy if exists assessments_insert_private_ai on public.assessments;
create policy assessments_insert_private_ai on public.assessments
for insert to authenticated
with check (
  owner_id = (select auth.uid())
  and origin = 'AI_GENERATED'
  and competency_id is not null
  and exists (select 1 from public.competencies c where c.id = assessments.competency_id)
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

alter table public.user_competencies
add column if not exists current_level integer not null default 1,
add column if not exists required_level integer not null default 3;

alter table public.user_competencies drop constraint if exists user_competencies_current_level_check;
alter table public.user_competencies add constraint user_competencies_current_level_check check (current_level between 1 and 5);
alter table public.user_competencies drop constraint if exists user_competencies_required_level_check;
alter table public.user_competencies add constraint user_competencies_required_level_check check (required_level between 1 and 5);

update public.user_competencies
set current_level = case
  when score >= 90 then 5
  when score >= 80 then 4
  when score >= 60 then 3
  when score >= 40 then 2
  else 1
end;

alter table public.skill_gaps drop constraint if exists skill_gaps_priority_check;
update public.skill_gaps
set priority = case priority
  when 'LOW' then case when gap_score = 0 then 'NONE' else 'MODERATE' end
  when 'MEDIUM' then 'HIGH'
  when 'HIGH' then 'CRITICAL'
  else priority
end;
alter table public.skill_gaps add constraint skill_gaps_priority_check
check (priority in ('NONE','MODERATE','HIGH','CRITICAL'));

create table if not exists public.competency_level_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  competency_id uuid not null references public.competencies(id) on delete cascade,
  assessment_attempt_id uuid not null unique references public.assessment_attempts(id) on delete cascade,
  previous_level integer not null check (previous_level between 1 and 5),
  current_level integer not null check (current_level between 1 and 5),
  required_level integer not null check (required_level between 1 and 5),
  weighted_score numeric(5,2) not null check (weighted_score between 0 and 100),
  created_at timestamptz not null default now()
);

create index if not exists idx_competency_level_events_user_created
on public.competency_level_events(user_id, created_at desc);
create index if not exists idx_competency_level_events_competency
on public.competency_level_events(competency_id);

alter table public.competency_level_events enable row level security;
drop policy if exists competency_level_events_self_select on public.competency_level_events;
create policy competency_level_events_self_select on public.competency_level_events
for select to authenticated using (user_id = (select auth.uid()));
revoke insert, update, delete on public.competency_level_events from anon, authenticated;
grant select on public.competency_level_events to authenticated;

drop function if exists public.persist_my_generated_assessment(uuid, uuid, text, text, jsonb, jsonb, jsonb);

create or replace function public.persist_my_generated_assessment(
  p_generation_id uuid,
  p_document_id uuid,
  p_competency_id uuid,
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
  v_bloom_level text;
  v_bloom_weight numeric(4,2);
  v_source_count integer;
  v_generation_status text;
  v_generation_document_id uuid;
  v_result_metadata jsonb;
  v_owner_role text;
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
  where a.generation_id = p_generation_id and a.owner_id = v_user_id;
  if found then return v_assessment_id; end if;

  select g.status, g.source_document_id into v_generation_status, v_generation_document_id
  from public.ai_generations g
  where g.id = p_generation_id and g.user_id = v_user_id and g.feature = 'QUIZ';
  if not found or v_generation_status <> 'PENDING' then
    raise exception 'pending owned quiz generation required' using errcode = '42501';
  end if;
  if v_generation_document_id is distinct from p_document_id then
    raise exception 'generation source document mismatch' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.documents d
    where d.id = p_document_id and d.owner_id = v_user_id and d.status = 'CHUNKED'
  ) then
    raise exception 'owned chunked document required' using errcode = '42501';
  end if;
  if p_competency_id is null or not exists (select 1 from public.competencies c where c.id = p_competency_id) then
    raise exception 'valid competency required' using errcode = '22023';
  end if;

  select p.role into v_owner_role from public.profiles p where p.id = v_user_id;

  insert into public.assessments (
    title, competency_id, locale, owner_id, source_document_id, origin, generation_id, review_status
  ) values (
    trim(p_title), p_competency_id, p_locale, v_user_id, p_document_id, 'AI_GENERATED', p_generation_id,
    case when v_owner_role in ('TRAINER','SUPER_ADMIN') then 'PENDING_REVIEW' else 'PRIVATE' end
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
    v_bloom_level := v_item ->> 'bloomLevel';
    if v_bloom_level is null or v_bloom_level not in ('REMEMBER','UNDERSTAND','APPLY','ANALYZE','EVALUATE','CREATE') then
      raise exception 'valid Bloom level required' using errcode = '22023';
    end if;
    v_bloom_weight := case v_bloom_level
      when 'REMEMBER' then 1.00
      when 'UNDERSTAND' then 1.25
      when 'APPLY' then 1.50
      when 'ANALYZE' then 1.75
      when 'EVALUATE' then 2.00
      when 'CREATE' then 2.25
    end;

    if jsonb_typeof(v_item -> 'sourceChunkIds') <> 'array' or jsonb_array_length(v_item -> 'sourceChunkIds') < 1 then
      raise exception 'source chunk references required' using errcode = '22023';
    end if;
    select array_agg(source_id::uuid) into v_source_ids
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
      source_chunk_ids, difficulty, topic, bloom_level, bloom_weight
    ) values (
      v_assessment_id, trim(v_item ->> 'questionText'), v_item -> 'options',
      trim(v_item ->> 'explanation'), p_document_id, v_source_ids, v_difficulty,
      trim(v_item ->> 'topic'), v_bloom_level, v_bloom_weight
    ) returning id into v_question_id;

    insert into public.question_answers (question_id, correct_answer)
    values (v_question_id, v_correct);
  end loop;

  v_result_metadata := p_result_metadata || jsonb_build_object(
    'assessmentId', v_assessment_id,
    'title', trim(p_title),
    'questionCount', jsonb_array_length(p_questions),
    'scoring', 'BLOOM_WEIGHTED'
  );
  update public.ai_generations
  set status = 'COMPLETE', token_usage = p_token_usage, result_metadata = v_result_metadata,
      error_code = null, updated_at = now()
  where id = p_generation_id and user_id = v_user_id and status = 'PENDING';
  if not found then
    raise exception 'generation completion failed' using errcode = '55000';
  end if;
  return v_assessment_id;
end;
$$;

revoke all on function public.persist_my_generated_assessment(uuid, uuid, uuid, text, text, jsonb, jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.persist_my_generated_assessment(uuid, uuid, uuid, text, text, jsonb, jsonb, jsonb) to authenticated;

create or replace function public.get_assessment_questions(p_assessment_id uuid)
returns table (id uuid, question_text text, options jsonb)
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.assessments a
    where a.id = p_assessment_id
      and (a.owner_id is null or a.owner_id = v_user_id or a.review_status = 'APPROVED')
  ) then
    raise exception 'assessment unavailable' using errcode = '42501';
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

create or replace function public.review_my_generated_assessment(
  p_assessment_id uuid,
  p_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_role text;
  v_updated integer;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_status not in ('APPROVED','REJECTED','PENDING_REVIEW') then
    raise exception 'unsupported review status' using errcode = '22023';
  end if;
  select p.role into v_role from public.profiles p where p.id = v_user_id;
  if v_role is null or v_role not in ('TRAINER','SUPER_ADMIN') then
    raise exception 'trainer role required' using errcode = '42501';
  end if;

  update public.assessments a
  set review_status = p_status,
      reviewed_at = case when p_status in ('APPROVED','REJECTED') then now() else null end,
      reviewed_by = case when p_status in ('APPROVED','REJECTED') then v_user_id else null end
  where a.id = p_assessment_id
    and a.origin = 'AI_GENERATED'
    and (a.owner_id = v_user_id or v_role = 'SUPER_ADMIN');
  get diagnostics v_updated = row_count;
  if v_updated <> 1 then
    raise exception 'owned generated assessment required' using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.review_my_generated_assessment(uuid, text) from public, anon, authenticated;
grant execute on function public.review_my_generated_assessment(uuid, text) to authenticated;
