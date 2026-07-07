# 本地运行和 Supabase 配置

## 1. 安装依赖

```bash
cd /Users/mac/Documents/Code/ackem-main/fitness-checkin-app
npm install
```

## 2. 创建 Supabase 数据库结构

1. 打开 Supabase 项目。
2. 进入 SQL Editor。
3. 复制并执行 `supabase/schema.sql` 的完整内容。

这个 SQL 会创建：

- `profiles`
- `checkins`
- 同一用户同一天允许多条 `checkins`
- 新用户 profile 触发器
- 双向绑定 RPC：`bind_partner`
- RLS policies
- `checkin-images` Storage bucket 和 policies
- `authenticated` 角色所需的 Data API `GRANT`

如果登录时提示“登录成功，但没有找到用户资料”，说明 `auth.users` 已有用户，但 `public.profiles` 缺失。通常原因是触发器尚未执行到线上数据库，或用户是在触发器创建前注册的。执行：

```sql
-- SQL Editor 中执行完整文件
-- supabase/repair_missing_profiles.sql
```

该脚本会重建 `public.handle_new_user()`、重建 `auth.users` 上的 `on_auth_user_created` after insert trigger，并为已有缺失 profile 的用户补齐记录。

如果旧数据库已经执行过“一天一条记录”的版本，还需要执行：

```sql
-- SQL Editor 中执行完整文件
-- supabase/allow_multiple_daily_checkins.sql
```

该脚本会删除 `user_id + checkin_date` 的唯一约束，并添加可选字段 `session_title`。

## 3. Storage 配置说明

SQL 已自动创建 `checkin-images` bucket：

- `public = true`，前端可直接用 public URL 预览图片。
- 限制图片大小为 5MB。
- MIME 类型限制为 JPG、PNG、WEBP、GIF。
- 普通用户只能上传到自己 UID 开头的目录。
- 管理员可以上传、更新、删除该 bucket 中的图片对象。

## 4. 配置环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

填写：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
NEXT_PUBLIC_APP_TIME_ZONE=Asia/Shanghai
```

不要在前端暴露 Supabase service role key。

## 5. 管理员账号创建方式

推荐方式：

1. 在 Supabase Dashboard 的 Authentication 页面手动创建一个用户。
2. 如果触发器已创建 profile，执行：

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com';
```

如果该用户没有 profile，执行：

```sql
insert into public.profiles (id, username, email, role, bind_code)
select
  id,
  'admin',
  email,
  'admin',
  public.generate_bind_code()
from auth.users
where email = 'admin@example.com'
on conflict (id) do update
set role = 'admin';
```

管理员账号不通过前台注册入口开放。

## 6. 启动本地开发

```bash
npm run dev
```

打开：

```text
http://localhost:3000
```

## 7. 验证命令

```bash
npm test
npm run typecheck
npm run build
```
