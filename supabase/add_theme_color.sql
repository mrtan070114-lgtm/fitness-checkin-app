-- 为用户资料增加主题颜色，并提供只更新当前用户主题的安全 RPC。

alter table public.profiles
add column if not exists theme_color text default 'green';

alter table public.profiles
alter column theme_color set default 'green';

update public.profiles
set theme_color = 'green'
where theme_color is null
   or theme_color not in ('green', 'blue', 'purple', 'pink', 'orange', 'black');

alter table public.profiles
drop constraint if exists profiles_theme_color_check;

alter table public.profiles
add constraint profiles_theme_color_check
check (theme_color in ('green', 'blue', 'purple', 'pink', 'orange', 'black'));

create or replace function public.update_my_theme_color(theme_color text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_theme text;
  updated_profile public.profiles;
begin
  if (select auth.uid()) is null then
    raise exception '请先登录';
  end if;

  normalized_theme := lower(trim(theme_color));

  if normalized_theme not in ('green', 'blue', 'purple', 'pink', 'orange', 'black') then
    raise exception '不支持的主题颜色';
  end if;

  update public.profiles
  set theme_color = normalized_theme,
      updated_at = now()
  where id = (select auth.uid())
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception '当前用户资料不存在';
  end if;

  return updated_profile;
end;
$$;

revoke all on function public.update_my_theme_color(text) from public;
grant execute on function public.update_my_theme_color(text) to authenticated;
