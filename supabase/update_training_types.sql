-- 更新训练部位列表为：腹、胸、背、腿、肩、手臂、有氧。
-- 如果旧数据中存在“休息”，先转换为“有氧”，再重建 check 约束。

do $$
declare
  check_constraint record;
begin
  for check_constraint in
    select conname
    from pg_constraint
    where conrelid = 'public.checkins'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%training_type%'
  loop
    execute format('alter table public.checkins drop constraint if exists %I', check_constraint.conname);
  end loop;
end $$;

update public.checkins
set training_type = '有氧'
where training_type = '休息';

alter table public.checkins
add constraint checkins_training_type_check
check (training_type in ('腹', '胸', '背', '腿', '肩', '手臂', '有氧'));
