alter table public.document_chunks
add column if not exists search_vector tsvector
generated always as (to_tsvector('simple', content)) stored;

create index if not exists idx_document_chunks_search_vector
on public.document_chunks using gin (search_vector);

create or replace function public.search_my_document_chunks(
  search_query text,
  match_limit integer default 8
)
returns table (
  id uuid,
  document_id uuid,
  chunk_index integer,
  content text,
  metadata jsonb,
  rank real
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    c.id,
    c.document_id,
    c.chunk_index,
    c.content,
    c.metadata,
    ts_rank(c.search_vector, websearch_to_tsquery('simple', coalesce(search_query, ''))) as rank
  from public.document_chunks c
  join public.documents d on d.id = c.document_id
  where d.owner_id = (select auth.uid())
    and c.search_vector @@ websearch_to_tsquery('simple', coalesce(search_query, ''))
  order by rank desc, c.document_id, c.chunk_index
  limit least(greatest(coalesce(match_limit, 8), 1), 20);
$$;

revoke all on function public.search_my_document_chunks(text, integer) from public, anon;
grant execute on function public.search_my_document_chunks(text, integer) to authenticated;
