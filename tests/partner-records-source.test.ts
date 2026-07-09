import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("partner records loading requirements", () => {
  it("separates empty partner records from record query failures", () => {
    const page = read("app/partner/page.tsx");

    expect(page).toContain('console.error("load partner records failed", recordsError)');
    expect(page).toContain("recordsErrorMessage");
    expect(page).toContain("对方还没有运动记录");
    expect(page).toContain("对方记录暂时无法加载");
    expect(page).not.toContain('errorMessage ? "对方记录暂时无法加载" : "对方还没有记录"');
  });

  it("falls back to legacy checkin columns when newer exercise columns are missing", () => {
    const checkins = read("lib/checkins.ts");

    expect(checkins).toContain("LEGACY_RECORD_SUMMARY_COLUMNS");
    expect(checkins).toContain("isMissingOptionalCheckinColumnError");
    expect(checkins).toContain("normalizeLegacyCheckinSummary");
    expect(checkins).toContain("training_types: null");
    expect(checkins).toContain("exercise_names: null");
    expect(checkins).toContain("exercise_details: null");
  });

  it("ships idempotent SQL for partner checkin RLS and optional checkin columns", () => {
    for (const path of [
      "supabase/fix_partner_checkins_rls.sql",
      "supabase/add_training_types_array.sql",
      "supabase/add_exercise_names.sql",
      "supabase/add_exercise_details.sql"
    ]) {
      expect(existsSync(join(root, path))).toBe(true);
    }

    const rls = read("supabase/fix_partner_checkins_rls.sql");

    expect(rls).toMatch(/alter table public\.checkins enable row level security/i);
    expect(rls).toMatch(/create policy checkins_select_own_bound_admin/i);
    expect(rls).toContain("user_id = (select auth.uid())");
    expect(rls).toContain("public.is_admin()");
    expect(rls).toContain("from public.profiles");
    expect(rls).toContain("bound_user_id");
  });
});
