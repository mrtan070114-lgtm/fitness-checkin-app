import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("profile edit source requirements", () => {
  it("ships avatar_url schema changes and a safe profile update rpc", () => {
    const sqlPath = join(root, "supabase/add_profile_edit_fields.sql");
    expect(existsSync(sqlPath)).toBe(true);

    const sql = read("supabase/add_profile_edit_fields.sql");
    expect(sql).toMatch(/alter table public\.profiles\s+add column if not exists avatar_url text/i);
    expect(sql).toMatch(/create or replace function public\.update_my_profile\(display_name text,\s*avatar_url text\)/i);
    expect(sql).toMatch(/security definer/i);
    expect(sql).toMatch(/where id = \(select auth\.uid\(\)\)/i);
    expect(sql).toMatch(/grant execute on function public\.update_my_profile\(text,\s*text\) to authenticated/i);
    expect(sql).toContain("'avatars'");
  });

  it("updates profile types and profile select fields", () => {
    expect(read("types/database.ts")).toContain("avatar_url: string | null");
    expect(read("types/database.ts")).toContain("update_my_profile");
    expect(read("lib/profiles.ts")).toContain("avatar_url");
  });

  it("adds profile editing page and server action", () => {
    expect(existsSync(join(root, "app/profile/edit/page.tsx"))).toBe(true);
    expect(existsSync(join(root, "app/profile/edit/actions.ts"))).toBe(true);

    const page = read("app/profile/edit/page.tsx");
    const action = read("app/profile/edit/actions.ts");

    expect(page).toContain("编辑个人资料");
    expect(page).toContain("修改你的头像和昵称");
    expect(page).toContain('accept="image/jpeg,image/png,image/webp"');
    expect(page).toContain("defaultValue={profile.username}");
    expect(action).toContain('rpc("update_my_profile"');
    expect(action).toContain("uploadAvatarImage");
    expect(action).toContain("个人资料已更新");
    expect(action).toContain("encodeURIComponent(errorMessage)");
  });

  it("uses a shared avatar component across user and partner surfaces", () => {
    expect(existsSync(join(root, "components/ProfileAvatar.tsx"))).toBe(true);

    for (const path of [
      "components/AppHeader.tsx",
      "app/dashboard/page.tsx",
      "app/profile/page.tsx",
      "app/partner/page.tsx",
      "app/profile/edit/page.tsx"
    ]) {
      expect(read(path)).toContain("ProfileAvatar");
    }
  });

  it("uploads avatars to the public avatars bucket with validation", () => {
    const uploads = read("lib/uploads.ts");

    expect(read("lib/constants.ts")).toContain('AVATAR_BUCKET = "avatars"');
    expect(uploads).toContain("uploadAvatarImage");
    expect(uploads).toContain("AVATAR_BUCKET");
    expect(uploads).toContain("avatar-${Date.now()}");
    expect(uploads).toContain("只支持 JPG、PNG 或 WEBP 图片");
    expect(uploads).toContain("头像不能超过 2MB");
  });
});
