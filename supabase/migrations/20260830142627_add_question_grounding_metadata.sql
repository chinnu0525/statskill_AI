alter table public.questions
add column if not exists source_chunk_ids uuid[] not null default '{}'::uuid[],
add column if not exists difficulty text,
add column if not exists topic text;

alter table public.questions
drop constraint if exists questions_difficulty_check;

alter table public.questions
add constraint questions_difficulty_check
check (difficulty is null or difficulty in ('EASY','MEDIUM','HARD'));

create index if not exists idx_questions_source_document_id on public.questions(source_document_id);
