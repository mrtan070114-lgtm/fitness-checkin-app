import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("goals stats interactions and pwa source requirements", () => {
  it("ships goals and interactions SQL with RLS and safe access checks", () => {
    expect(existsSync(join(root, "supabase/add_goals.sql"))).toBe(true);
    expect(existsSync(join(root, "supabase/add_interactions.sql"))).toBe(true);

    const goals = read("supabase/add_goals.sql");
    const interactions = read("supabase/add_interactions.sql");

    expect(goals).toContain("create table if not exists public.goals");
    expect(goals).toContain("user_id uuid not null references public.profiles(id)");
    expect(goals).toContain("alter table public.goals enable row level security");
    expect(goals).toContain("goals_upsert_own");

    expect(interactions).toContain("create table if not exists public.checkin_likes");
    expect(interactions).toContain("create table if not exists public.checkin_comments");
    expect(interactions).toContain("unique (checkin_id, user_id)");
    expect(interactions).toContain("public.can_access_checkin");
    expect(interactions).toContain("public.toggle_checkin_like");
    expect(interactions).toContain("alter table public.checkin_comments enable row level security");
  });

  it("updates database types for goals likes and comments", () => {
    const types = read("types/database.ts");

    for (const token of ["export type Goal", "export type CheckinLike", "export type CheckinComment", "toggle_checkin_like"]) {
      expect(types).toContain(token);
    }
  });

  it("adds goals stats and pwa pages from profile settings", () => {
    for (const path of ["app/goals/page.tsx", "app/goals/actions.ts", "app/stats/page.tsx", "app/pwa/page.tsx"]) {
      expect(existsSync(join(root, path))).toBe(true);
    }

    const profile = read("app/profile/page.tsx");
    expect(profile).toContain("健身目标");
    expect(profile).toContain("/goals");
    expect(profile).toContain("数据统计");
    expect(profile).toContain("/stats");
    expect(profile).toContain("添加到手机桌面");
    expect(profile).toContain("/pwa");
  });

  it("shows goal summary on dashboard and renders stats chart", () => {
    const dashboard = read("app/dashboard/page.tsx");
    const stats = read("app/stats/page.tsx");

    expect(dashboard).toContain("本周目标完成度");
    expect(dashboard).toContain("今日目标完成度");
    expect(dashboard).toContain("目标体重进度");
    expect(stats).toContain("WeightTrendChart");
    expect(stats).toContain("训练类型占比");
    expect(stats).toContain("记录更多体重后即可生成趋势图");
  });

  it("adds likes and comments to record details and summary cards", () => {
    expect(existsSync(join(root, "app/records/actions.ts"))).toBe(true);
    expect(existsSync(join(root, "components/CheckinInteractions.tsx"))).toBe(true);

    const actions = read("app/records/actions.ts");
    const detail = read("app/records/[id]/page.tsx");
    const summary = read("components/RecordSummaryCard.tsx");

    expect(actions).toContain("toggleCheckinLike");
    expect(actions).toContain("addCheckinComment");
    expect(actions).toContain("deleteCheckinComment");
    expect(detail).toContain("CheckinInteractions");
    expect(summary).toContain("likeCount");
    expect(summary).toContain("commentCount");
  });

  it("adds pwa manifest metadata and icons", () => {
    expect(existsSync(join(root, "public/manifest.json"))).toBe(true);
    expect(existsSync(join(root, "public/icons/icon-192.png"))).toBe(true);
    expect(existsSync(join(root, "public/icons/icon-512.png"))).toBe(true);

    const manifest = read("public/manifest.json");
    const layout = read("app/layout.tsx");

    expect(manifest).toContain('"name": "双人健身打卡"');
    expect(manifest).toContain('"display": "standalone"');
    expect(layout).toContain('manifest: "/manifest.json"');
    expect(layout).toContain("appleWebApp");
    expect(layout).not.toMatch(/userScalable:\s*false|maximumScale:\s*1/);
  });
});
