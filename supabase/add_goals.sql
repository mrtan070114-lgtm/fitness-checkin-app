-- 健身目标表：每个用户一条目标记录。

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  current_weight numeric null check (current_weight is null or current_weight between 0 and 500),
  target_weight numeric null check (target_weight is null or target_weight between 0 and 500),
  weekly_workout_target integer null check (weekly_workout_target is null or weekly_workout_target between 0 and 99),
  daily_minutes_target integer null check (daily_minutes_target is null or daily_minutes_target between 0 and 1440),
  target_date date null,
  goal_note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goals_user_id_unique unique (user_id)
);

create index if not exists goals_user_id_idx on public.goals (user_id);

drop trigger if exists goals_set_updated_at on public.goals;
create trigger goals_set_updated_at
before update on public.goals
for each row execute function public.set_updated_at();

alter table public.goals enable row level security;

drop policy if exists goals_select_own_admin on public.goals;
create policy goals_select_own_admin
on public.goals
for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.is_admin()
);

drop policy if exists goals_insert_own on public.goals;
create policy goals_insert_own
on public.goals
for insert
to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists goals_update_own on public.goals;
create policy goals_update_own
on public.goals
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists goals_upsert_own on public.goals;
create policy goals_upsert_own
on public.goals
for all
to authenticated
using (
  user_id = (select auth.uid())
  or public.is_admin()
)
with check (
  user_id = (select auth.uid())
  or public.is_admin()
);

grant select, insert, update, delete on public.goals to authenticated;
