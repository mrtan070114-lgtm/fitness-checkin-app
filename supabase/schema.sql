-- 双人互相监督健身打卡记录 Web App
-- 在 Supabase SQL Editor 中完整执行本文件。

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  bind_code text not null unique,
  bound_user_id uuid null,
  theme_color text not null default 'green' check (theme_color in ('green', 'blue', 'purple', 'pink', 'orange', 'black')),
  avatar_url text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_bound_user_id_fkey
    foreign key (bound_user_id) references public.profiles(id) on delete set null,
  constraint profiles_cannot_bind_self
    check (bound_user_id is null or bound_user_id <> id)
);

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  checkin_date date not null,
  session_title text null,
  training_type text not null check (training_type in ('胸', '背', '腿', '肩', '手臂', '有氧', '休息')),
  duration_minutes integer null check (duration_minutes is null or duration_minutes between 0 and 1440),
  weight numeric null check (weight is null or weight between 0 and 500),
  diet text null,
  mood text null check (mood is null or mood in ('很好', '不错', '一般', '疲惫', '低落')),
  note text null,
  image_url text null,
  locked boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_bind_code_idx on public.profiles (bind_code);
create index if not exists profiles_bound_user_id_idx on public.profiles (bound_user_id);
create index if not exists checkins_user_date_idx on public.checkins (user_id, checkin_date desc);
create index if not exists checkins_user_created_at_idx on public.checkins (user_id, created_at desc);
create index if not exists checkins_date_idx on public.checkins (checkin_date desc);
create index if not exists checkins_training_type_idx on public.checkins (training_type);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists checkins_set_updated_at on public.checkins;
create trigger checkins_set_updated_at
before update on public.checkins
for each row execute function public.set_updated_at();

create or replace function public.generate_bind_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate text;
begin
  loop
    candidate := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (
      select 1 from public.profiles where bind_code = candidate
    );
  end loop;

  return candidate;
end;
$$;

revoke all on function public.generate_bind_code() from public;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  safe_username text;
begin
  safe_username := nullif(trim(coalesce(new.raw_user_meta_data ->> 'username', '')), '');

  insert into public.profiles (id, username, email, role, bind_code, created_at, updated_at)
  values (
    new.id,
    coalesce(safe_username, split_part(coalesce(new.email, 'user'), '@', 1), 'user'),
    coalesce(new.email, ''),
    'user',
    public.generate_bind_code(),
    now(),
    now()
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.bind_partner(target_bind_code text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile public.profiles;
  target_profile public.profiles;
  normalized_code text;
begin
  if (select auth.uid()) is null then
    raise exception '请先登录';
  end if;

  normalized_code := upper(trim(target_bind_code));

  select *
  into current_profile
  from public.profiles
  where id = (select auth.uid())
  for update;

  if current_profile.id is null then
    raise exception '当前用户资料不存在';
  end if;

  select *
  into target_profile
  from public.profiles
  where bind_code = normalized_code
  for update;

  if target_profile.id is null then
    raise exception '绑定码不存在';
  end if;

  if target_profile.id = current_profile.id then
    raise exception '不能绑定自己';
  end if;

  if current_profile.bound_user_id is not null and current_profile.bound_user_id <> target_profile.id then
    raise exception '你已经绑定了对象';
  end if;

  if target_profile.bound_user_id is not null and target_profile.bound_user_id <> current_profile.id then
    raise exception '对方已经绑定了对象';
  end if;

  update public.profiles
  set bound_user_id = target_profile.id,
      updated_at = now()
  where id = current_profile.id;

  update public.profiles
  set bound_user_id = current_profile.id,
      updated_at = now()
  where id = target_profile.id;

  select *
  into current_profile
  from public.profiles
  where id = (select auth.uid());

  return current_profile;
end;
$$;

revoke all on function public.bind_partner(text) from public;
grant execute on function public.bind_partner(text) to authenticated;

create or replace function public.unbind_partner()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  partner_id uuid;
begin
  current_user_id := (select auth.uid());

  if current_user_id is null then
    raise exception '请先登录';
  end if;

  select bound_user_id
  into partner_id
  from public.profiles
  where id = current_user_id
  for update;

  if not found then
    raise exception '当前用户资料不存在';
  end if;

  if partner_id is null then
    return;
  end if;

  update public.profiles
  set bound_user_id = null,
      updated_at = now()
  where id = current_user_id;

  update public.profiles
  set bound_user_id = null,
      updated_at = now()
  where id = partner_id
    and bound_user_id = current_user_id;
end;
$$;

revoke all on function public.unbind_partner() from public;
grant execute on function public.unbind_partner() to authenticated;

create or replace function public.update_my_theme_color(theme_color text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_theme text;
  updated_profile public.profiles;
begin
  if (select auth.uid()) is null then
    raise exception '请先登录';
  end if;

  normalized_theme := lower(trim(theme_color));

  if normalized_theme not in ('green', 'blue', 'purple', 'pink', 'orange', 'black') then
    raise exception '不支持的主题颜色';
  end if;

  update public.profiles
  set theme_color = normalized_theme,
      updated_at = now()
  where id = (select auth.uid())
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception '当前用户资料不存在';
  end if;

  return updated_profile;
end;
$$;

revoke all on function public.update_my_theme_color(text) from public;
grant execute on function public.update_my_theme_color(text) to authenticated;

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

alter table public.profiles enable row level security;
alter table public.checkins enable row level security;

drop policy if exists profiles_select_own_bound_admin on public.profiles;
create policy profiles_select_own_bound_admin
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or bound_user_id = (select auth.uid())
  or public.is_admin()
);

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin
on public.profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists checkins_select_own_bound_admin on public.checkins;
create policy checkins_select_own_bound_admin
on public.checkins
for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.is_admin()
  or user_id = (
    select bound_user_id
    from public.profiles
    where id = (select auth.uid())
  )
);

drop policy if exists checkins_insert_own_locked on public.checkins;
create policy checkins_insert_own_locked
on public.checkins
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and locked = true
);

drop policy if exists checkins_update_admin on public.checkins;
create policy checkins_update_admin
on public.checkins
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists checkins_delete_admin on public.checkins;
create policy checkins_delete_admin
on public.checkins
for delete
to authenticated
using (public.is_admin());

-- Supabase 新项目可能不会自动向 Data API 暴露 SQL 创建的表，需要显式授权。
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.checkins to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'checkin-images',
  'checkin-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists checkin_images_read on storage.objects;
create policy checkin_images_read
on storage.objects
for select
to authenticated
using (bucket_id = 'checkin-images');

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

drop policy if exists checkin_images_upload on storage.objects;
create policy checkin_images_upload
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'checkin-images'
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or public.is_admin()
  )
);

drop policy if exists checkin_images_admin_update on storage.objects;
create policy checkin_images_admin_update
on storage.objects
for update
to authenticated
using (bucket_id = 'checkin-images' and public.is_admin())
with check (bucket_id = 'checkin-images' and public.is_admin());

drop policy if exists checkin_images_admin_delete on storage.objects;
create policy checkin_images_admin_delete
on storage.objects
for delete
to authenticated
using (bucket_id = 'checkin-images' and public.is_admin());
