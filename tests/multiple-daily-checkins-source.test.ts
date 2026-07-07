import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("multiple daily checkins source rules", () => {
  const read = (path: string) => readFileSync(join(process.cwd(), path), "utf8");

  it("removes the per-user per-day unique constraint and ships a migration", () => {
    const schema = read("supabase/schema.sql");
    const migrationPath = join(process.cwd(), "supabase/allow_multiple_daily_checkins.sql");

    expect(schema).not.toMatch(/constraint\s+checkins_user_date_unique\s+unique\s*\(\s*user_id\s*,\s*checkin_date\s*\)/i);
    expect(schema).toMatch(/session_title\s+text\s+null/i);
    expect(existsSync(migrationPath)).toBe(true);

    const migration = read("supabase/allow_multiple_daily_checkins.sql");
    expect(migration).toMatch(/alter table public\.checkins\s+add column if not exists session_title text/i);
    expect(migration).toMatch(/drop constraint/i);
  });

  it("allows the checkin action to insert without checking for an existing same-day record", () => {
    const action = read("app/checkin/actions.ts");

    expect(action).toContain("session_title");
    expect(action).not.toContain("今天已经打卡，不能重复提交");
    expect(action).not.toContain("maybeSingle()");
  });

  it("updates user-facing forms and record lists for multiple entries", () => {
    expect(read("components/CheckinForm.tsx")).toContain("本次运动名称");
    expect(read("components/CheckinForm.tsx")).toContain("添加本次运动");
    expect(read("components/RecordCard.tsx")).toContain("session_title");
    expect(read("app/records/page.tsx")).toMatch(/order\("created_at", \{ ascending: false \}\)/);
    expect(read("app/partner/page.tsx")).toMatch(/order\("created_at", \{ ascending: false \}\)/);
  });
});
