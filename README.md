# TnT健身日记

这是一个使用 Next.js + Supabase 开发的双人互相监督健身记录 Web App，包含：

- 用户注册和登录
- 普通用户与管理员角色
- 双人绑定码绑定
- 每天可添加多次运动记录
- 图片上传到 Supabase Storage
- 普通用户记录锁定
- 管理员后台统计、用户管理、记录筛选、编辑和删除

## 快速开始

```bash
cd /Users/mac/Documents/Code/ackem-main/fitness-checkin-app
npm install
cp .env.example .env.local
npm run dev
```

打开 `http://localhost:3000`。

## Supabase SQL

完整 SQL 在：

```text
supabase/schema.sql
```

在 Supabase SQL Editor 中完整执行。它会创建 `profiles`、`checkins`、触发器、RLS、绑定 RPC、Storage bucket 和 Storage policies。

## 配置文档

- 设计和文件说明：`docs/DESIGN.md`
- 本地运行、Storage、管理员创建方式：`docs/SETUP.md`

## 验证

```bash
npm test
npm run typecheck
npm run build
```
