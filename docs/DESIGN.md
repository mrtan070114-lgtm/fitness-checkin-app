# TnT健身日记 Web App 设计说明

## 目标

构建一个 Next.js + Supabase Web App，支持普通用户双人绑定、每日健身打卡、图片上传、记录锁定，以及管理员查看、筛选、编辑、删除记录。

## 技术方案

- Next.js App Router 负责页面、Server Actions 和路由保护。
- Supabase Auth 负责注册登录。
- Supabase Postgres 存储 `profiles` 和 `checkins`。
- Supabase Storage 的 `checkin-images` bucket 存储打卡图片。
- 权限以 Supabase RLS 为准，前端只负责隐藏入口和优化体验。

## 用户侧流程

1. 普通用户注册后由数据库触发器自动创建 `profiles` 记录，默认 `role = user`，并生成唯一 `bind_code`。
2. 用户登录后进入 `/dashboard`，看到今日运动次数、累计时长、最近一次运动类型、连续运动天数、本月运动记录次数和绑定对象。
3. `/checkin` 支持同一天提交多次运动记录，日期由服务端按 `NEXT_PUBLIC_APP_TIME_ZONE` 自动生成。
4. 每条记录可填写 `session_title` 作为本次运动名称；提交成功后 `locked = true`，普通用户没有编辑和删除入口，也没有 RLS 更新/删除权限。
5. 用户在 `/bind` 输入对方绑定码，通过数据库函数 `bind_partner` 完成双向绑定。
6. `/partner` 只读展示绑定对象记录。

## 管理员流程

1. 管理员登录后进入 `/admin/dashboard`。
2. 管理员可以查看用户总数、记录总数、今日打卡人数和最近记录。
3. `/admin/users` 展示所有用户；用户详情页展示该用户记录。
4. `/admin/checkins` 支持按用户名、日期、训练类型筛选。
5. 管理员可以进入编辑页修改训练类型、时长、体重、饮食、心情、备注和图片，也可以删除记录。

## 权限逻辑

- 普通用户可以 `select` 自己和绑定对象的 `profiles`、`checkins`。
- 普通用户只能 `insert` 自己的 `checkins`，并且必须 `locked = true`。
- 普通用户不能 `update` 或 `delete` `checkins`。
- 管理员由 `profiles.role = 'admin'` 判断，可以查看、修改、删除所有 `checkins`。
- 绑定操作需要更新双方 `profiles.bound_user_id`，因此封装为带校验的 `security definer` RPC：`bind_partner`。

## 核心文件

- `app/login/`：登录页面和登录表单。
- `app/register/`：普通用户注册页面。
- `app/dashboard/page.tsx`：普通用户首页统计。
- `app/checkin/`：今日打卡页面和提交动作。
- `app/records/page.tsx`：我的记录。
- `app/partner/page.tsx`：绑定对象记录。
- `app/bind/`：绑定码展示和绑定动作。
- `app/admin/`：管理员后台布局、统计、用户管理和记录管理。
- `components/`：复用 UI 组件。
- `lib/auth.ts`：服务端登录态、角色保护和跳转逻辑。
- `lib/dates.ts`：业务日期、本月范围、连续运动天数计算。
- `lib/permissions.ts`：前端可测试权限判断。
- `lib/supabase/`：浏览器、服务端和 middleware Supabase client。
- `lib/uploads.ts`：图片类型、大小校验和 Storage 上传。
- `supabase/schema.sql`：表、触发器、RPC、RLS 和 Storage policies。
