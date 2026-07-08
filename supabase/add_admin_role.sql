-- 管理员基础权限字段。
-- 可重复执行，不会破坏现有用户数据。

alter table public.profiles
add column if not exists role text;

update public.profiles
set role = 'user'
where role is null
   or role not in ('user', 'admin');

alter table public.profiles
alter column role set default 'user';

alter table public.profiles
alter column role set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_role_check'
  ) then
    alter table public.profiles
    add constraint profiles_role_check
    check (role in ('user', 'admin'));
  end if;
end $$;
