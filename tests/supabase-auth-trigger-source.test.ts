import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Supabase auth profile trigger SQL", () => {
  const schema = readFileSync(join(process.cwd(), "supabase/schema.sql"), "utf8");
  const repairPath = join(process.cwd(), "supabase/repair_missing_profiles.sql");

  it("defines handle_new_user and attaches it to auth.users after insert", () => {
    expect(schema).toMatch(/create or replace function public\.handle_new_user\(\)/i);
    expect(schema).toMatch(/create trigger on_auth_user_created\s+after insert on auth\.users/i);
    expect(schema).toMatch(/for each row execute function public\.handle_new_user\(\)/i);
  });

  it("copies username metadata and explicitly inserts profile timestamps", () => {
    expect(schema).toContain("new.raw_user_meta_data ->> 'username'");
    expect(schema).toMatch(/insert into public\.profiles \(id, username, email, role, bind_code, created_at, updated_at\)/i);
  });

  it("ships a repair SQL for auth users missing profiles", () => {
    expect(existsSync(repairPath)).toBe(true);
    const repairSql = readFileSync(repairPath, "utf8");

    expect(repairSql).toMatch(/left join public\.profiles p on p\.id = u\.id/i);
    expect(repairSql).toMatch(/where p\.id is null/i);
    expect(repairSql).toContain("u.raw_user_meta_data ->> 'username'");
    expect(repairSql).toMatch(/create trigger on_auth_user_created\s+after insert on auth\.users/i);
  });
});
