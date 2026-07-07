-- 修复 Supabase Auth 用户没有 public.profiles 记录的问题。
-- 在 Supabase SQL Editor 中执行本文件。
-- 它会重建新用户触发器，并为已有缺失 profile 的 auth.users 补齐资料。

create extension if not exists pgcrypto;

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

insert into public.profiles (id, username, email, role, bind_code, created_at, updated_at)
select
  u.id,
  coalesce(
    nullif(trim(coalesce(u.raw_user_meta_data ->> 'username', '')), ''),
    split_part(coalesce(u.email, 'user'), '@', 1),
    'user'
  ) as username,
  coalesce(u.email, '') as email,
  'user' as role,
  public.generate_bind_code() as bind_code,
  coalesce(u.created_at, now()) as created_at,
  now() as updated_at
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 检查触发器是否存在且启用。
select
  trigger_name,
  event_manipulation,
  event_object_schema,
  event_object_table,
  action_statement
from information_schema.triggers
where event_object_schema = 'auth'
  and event_object_table = 'users'
  and trigger_name = 'on_auth_user_created';

-- 检查是否仍有 auth.users 缺失 public.profiles。
select u.id, u.email, u.created_at
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
