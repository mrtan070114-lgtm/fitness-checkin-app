-- 为个人资料编辑增加头像字段、安全 RPC 和头像 Storage bucket。

alter table public.profiles
add column if not exists avatar_url text;

create or replace function public.update_my_profile(display_name text, avatar_url text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_name text;
  normalized_avatar_url text;
  updated_profile public.profiles;
begin
  if (select auth.uid()) is null then
    raise exception '请先登录';
  end if;

  normalized_name := nullif(trim(display_name), '');

  if normalized_name is null then
    raise exception '昵称不能为空';
  end if;

  if char_length(normalized_name) > 20 then
    raise exception '昵称不能超过 20 个字符';
  end if;

  normalized_avatar_url := nullif(trim(coalesce(avatar_url, '')), '');

  if normalized_avatar_url is not null and normalized_avatar_url !~* '^https?://' then
    raise exception '头像地址格式不正确';
  end if;

  update public.profiles
  set username = normalized_name,
      avatar_url = normalized_avatar_url,
      updated_at = now()
  where id = (select auth.uid())
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception '当前用户资料不存在';
  end if;

  return updated_profile;
end;
$$;

revoke all on function public.update_my_profile(text, text) from public;
grant execute on function public.update_my_profile(text, text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists avatars_read_public on storage.objects;
create policy avatars_read_public
on storage.objects
for select
to public
using (bucket_id = 'avatars');

drop policy if exists avatars_insert_own_folder on storage.objects;
create policy avatars_insert_own_folder
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and name like (select auth.uid())::text || '/%'
);

drop policy if exists avatars_update_own_folder on storage.objects;
create policy avatars_update_own_folder
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and name like (select auth.uid())::text || '/%'
)
with check (
  bucket_id = 'avatars'
  and name like (select auth.uid())::text || '/%'
);
