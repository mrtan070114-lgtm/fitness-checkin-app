-- 为打卡记录增加多训练部位字段。旧记录继续使用 training_type 作为兼容回退。

alter table public.checkins
add column if not exists training_types text[] null;

create index if not exists checkins_training_types_gin_idx
on public.checkins using gin (training_types);
