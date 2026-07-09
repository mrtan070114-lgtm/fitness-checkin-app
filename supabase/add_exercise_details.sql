-- 训练计数：为每次打卡保存训练动作名称、自动识别部位和对应计数详情。
-- 旧记录保持 null，不影响既有数据和 training_type 字段。

alter table public.checkins
add column if not exists exercise_names text[] null;

alter table public.checkins
add column if not exists training_types text[] null;

alter table public.checkins
add column if not exists exercise_details jsonb null;

create index if not exists checkins_training_types_gin_idx
on public.checkins using gin (training_types);
