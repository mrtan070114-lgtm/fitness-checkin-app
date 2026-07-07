-- 解除当前登录用户与绑定对象的双向绑定关系。
-- 通过 auth.uid() 定位当前用户，不接收外部 user_id，避免普通用户解绑别人。

create or replace function public.unbind_partner()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  partner_id uuid;
begin
  current_user_id := (select auth.uid());

  if current_user_id is null then
    raise exception '请先登录';
  end if;

  select bound_user_id
  into partner_id
  from public.profiles
  where id = current_user_id
  for update;

  if not found then
    raise exception '当前用户资料不存在';
  end if;

  if partner_id is null then
    return;
  end if;

  update public.profiles
  set bound_user_id = null,
      updated_at = now()
  where id = current_user_id;

  update public.profiles
  set bound_user_id = null,
      updated_at = now()
  where id = partner_id
    and bound_user_id = current_user_id;
end;
$$;

revoke all on function public.unbind_partner() from public;
grant execute on function public.unbind_partner() to authenticated;
