create schema if not exists app_private;
revoke all on schema app_private from public;

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, locale, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case
      when new.raw_user_meta_data ->> 'locale' in ('en','hi','te') then new.raw_user_meta_data ->> 'locale'
      else 'en'
    end,
    'OFFICIAL'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function app_private.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function app_private.handle_new_user();

revoke update on table public.profiles from authenticated;
grant update (full_name, locale, department, updated_at) on table public.profiles to authenticated;
