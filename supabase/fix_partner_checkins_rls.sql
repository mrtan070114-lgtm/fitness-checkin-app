-- 修复对方记录读取和自己写入权限。
-- 允许用户读取自己的 checkins、已绑定对象的 checkins，管理员读取全部 checkins。
-- 允许用户新增自己的锁定 checkins。

alter table public.profiles enable row level security;
alter table public.checkins enable row level security;

grant usage on schema public to authenticated;
grant select on public.profiles to authenticated;
grant select, insert on public.checkins to authenticated;

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
