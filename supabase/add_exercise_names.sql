-- 为打卡记录增加训练动作名称列表。旧记录保持 null。

alter table public.checkins
add column if not exists exercise_names text[] null;
