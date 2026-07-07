-- 打卡记录点赞和留言。

create table if not exists public.checkin_likes (
  id uuid primary key default gen_random_uuid(),
  checkin_id uuid not null references public.checkins(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (checkin_id, user_id)
);

create table if not exists public.checkin_comments (
  id uuid primary key default gen_random_uuid(),
  checkin_id uuid not null references public.checkins(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(trim(content)) between 1 and 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists checkin_likes_checkin_id_idx on public.checkin_likes (checkin_id);
create index if not exists checkin_likes_user_id_idx on public.checkin_likes (user_id);
create index if not exists checkin_comments_checkin_id_created_at_idx on public.checkin_comments (checkin_id, created_at);
create index if not exists checkin_comments_user_id_idx on public.checkin_comments (user_id);

drop trigger if exists checkin_comments_set_updated_at on public.checkin_comments;
create trigger checkin_comments_set_updated_at
before update on public.checkin_comments
for each row execute function public.set_updated_at();

create or replace function public.can_access_checkin(target_checkin_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.checkins c
    left join public.profiles p on p.id = (select auth.uid())
    where c.id = target_checkin_id
      and (
        c.user_id = (select auth.uid())
        or public.is_admin()
        or c.user_id = p.bound_user_id
      )
  );
$$;

revoke all on function public.can_access_checkin(uuid) from public;
grant execute on function public.can_access_checkin(uuid) to authenticated;

create or replace function public.toggle_checkin_like(target_checkin_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  removed_count integer := 0;
begin
  current_user_id := (select auth.uid());

  if current_user_id is null then
    raise exception '请先登录';
  end if;

  if not public.can_access_checkin(target_checkin_id) then
    raise exception '无权操作这条记录';
  end if;

  delete from public.checkin_likes
  where checkin_id = target_checkin_id
    and user_id = current_user_id;

  get diagnostics removed_count = row_count;

  if removed_count > 0 then
    return false;
  end if;

  insert into public.checkin_likes (checkin_id, user_id)
  values (target_checkin_id, current_user_id);

  return true;
end;
$$;

revoke all on function public.toggle_checkin_like(uuid) from public;
grant execute on function public.toggle_checkin_like(uuid) to authenticated;

alter table public.checkin_likes enable row level security;
alter table public.checkin_comments enable row level security;

drop policy if exists checkin_likes_select_visible on public.checkin_likes;
create policy checkin_likes_select_visible
on public.checkin_likes
for select
to authenticated
using (public.can_access_checkin(checkin_id));

drop policy if exists checkin_likes_insert_visible on public.checkin_likes;
create policy checkin_likes_insert_visible
on public.checkin_likes
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and public.can_access_checkin(checkin_id)
);

drop policy if exists checkin_likes_delete_own on public.checkin_likes;
create policy checkin_likes_delete_own
on public.checkin_likes
for delete
to authenticated
using (
  user_id = (select auth.uid())
  or public.is_admin()
);

drop policy if exists checkin_comments_select_visible on public.checkin_comments;
create policy checkin_comments_select_visible
on public.checkin_comments
for select
to authenticated
using (public.can_access_checkin(checkin_id));

drop policy if exists checkin_comments_insert_visible on public.checkin_comments;
create policy checkin_comments_insert_visible
on public.checkin_comments
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and public.can_access_checkin(checkin_id)
);

drop policy if exists checkin_comments_update_own on public.checkin_comments;
create policy checkin_comments_update_own
on public.checkin_comments
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists checkin_comments_delete_own_admin on public.checkin_comments;
create policy checkin_comments_delete_own_admin
on public.checkin_comments
for delete
to authenticated
using (
  user_id = (select auth.uid())
  or public.is_admin()
);

grant select, insert, update, delete on public.checkin_likes to authenticated;
grant select, insert, update, delete on public.checkin_comments to authenticated;
