insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'learning-materials',
  'learning-materials',
  false,
  26214400,
  array[
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "learning_materials_owner_select" on storage.objects;
create policy "learning_materials_owner_select"
on storage.objects for select
to authenticated
using (
  bucket_id = 'learning-materials'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "learning_materials_owner_insert" on storage.objects;
create policy "learning_materials_owner_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'learning-materials'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "learning_materials_owner_update" on storage.objects;
create policy "learning_materials_owner_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'learning-materials'
  and (storage.foldername(name))[1] = (select auth.uid())::text
)
with check (
  bucket_id = 'learning-materials'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "learning_materials_owner_delete" on storage.objects;
create policy "learning_materials_owner_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'learning-materials'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
