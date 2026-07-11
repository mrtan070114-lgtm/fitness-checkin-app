import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("checkin create compatibility and rls requirements", () => {
  it("retries checkin insert without optional exercise columns when the database has not been migrated yet", () => {
    const action = read("app/checkin/actions.ts");

    expect(action).toContain("isMissingOptionalCheckinColumnError");
    expect(action).toContain("checkinInsertValues");
    expect(action).toContain("legacyCheckinInsertValues");
    expect(action).toContain("training_types");
    expect(action).toContain("exercise_names");
    expect(action).toContain("exercise_details");
    expect(action).toContain('console.error("create checkin failed", error)');
  });

  it("ships checkins insert grants and rls policy with the partner rls repair sql", () => {
    const sql = read("supabase/fix_partner_checkins_rls.sql");

    expect(sql).toMatch(/grant select,\s*insert on public\.checkins to authenticated/i);
    expect(sql).toMatch(/drop policy if exists checkins_insert_own_locked on public\.checkins/i);
    expect(sql).toMatch(/create policy checkins_insert_own_locked/i);
    expect(sql).toMatch(/for insert/i);
    expect(sql).toMatch(/with check\s*\(/i);
    expect(sql).toContain("user_id = (select auth.uid())");
    expect(sql).toContain("locked = true");
  });

  it("replaces the current goal weight after a weighted checkin and detects a decrease", () => {
    const action = read("app/checkin/actions.ts");

    expect(action).toContain('from("goals").select("current_weight")');
    expect(action).toContain('.eq("user_id", user.id)');
    expect(action).toContain("maybeSingle()");
    expect(action).toContain('from("goals").upsert(');
    expect(action).toContain("current_weight: parsed.data.weight");
    expect(action).toContain('onConflict: "user_id"');
    expect(action).toContain("getWeightLoss");
    expect(action).toContain('revalidatePath("/goals")');
  });

  it("renders the celebration only from a valid post-checkin payload", () => {
    const action = read("app/checkin/actions.ts");
    const page = read("app/checkin/page.tsx");

    expect(action).toContain('successParams.set("celebrate", "1")');
    expect(action).toContain('successParams.set("previousWeight"');
    expect(action).toContain('successParams.set("currentWeight"');
    expect(page).toContain("parseWeightCelebration(params)");
    expect(page).toContain("WeightLossCelebration");
    expect(page).toContain("{...celebration}");
  });
});
