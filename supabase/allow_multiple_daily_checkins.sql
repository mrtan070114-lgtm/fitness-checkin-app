-- 允许同一用户同一天添加多条运动记录。
-- 在 Supabase SQL Editor 中执行本文件。
-- 本迁移不会删除已有 checkins 数据。

begin;

alter table public.checkins
add column if not exists session_title text;

alter table public.checkins
drop constraint if exists checkins_user_date_unique;

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.checkins'::regclass
      and c.contype = 'u'
      and (
        select array_agg(a.attname order by a.attname)
        from unnest(c.conkey) as k(attnum)
        join pg_attribute a
          on a.attrelid = c.conrelid
         and a.attnum = k.attnum
      ) = array['checkin_date', 'user_id']
  loop
    execute format('alter table public.checkins drop constraint if exists %I', constraint_record.conname);
  end loop;
end;
$$;

do $$
declare
  index_record record;
begin
  for index_record in
    select index_class.relname as index_name
    from pg_index i
    join pg_class index_class on index_class.oid = i.indexrelid
    where i.indrelid = 'public.checkins'::regclass
      and i.indisunique
      and not i.indisprimary
      and (
        select array_agg(a.attname order by a.attname)
        from unnest(i.indkey) as k(attnum)
        join pg_attribute a
          on a.attrelid = i.indrelid
         and a.attnum = k.attnum
      ) = array['checkin_date', 'user_id']
  loop
    execute format('drop index if exists public.%I', index_record.index_name);
  end loop;
end;
$$;

create index if not exists checkins_user_created_at_idx
on public.checkins (user_id, created_at desc);

commit;
