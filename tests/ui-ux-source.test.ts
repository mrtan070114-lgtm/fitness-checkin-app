import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("user app ui/ux source requirements", () => {
  it("keeps logout out of the top header and moves mine navigation to profile", () => {
    expect(read("components/AppHeader.tsx")).not.toContain("SignOutButton");
    expect(read("components/BottomNav.tsx")).toContain('href: "/profile"');
    expect(existsSync(join(root, "app/profile/page.tsx"))).toBe(true);
    expect(read("app/profile/page.tsx")).toContain("SignOutButton");
  });

  it("groups the checkin form into app-like sections with the new submit copy", () => {
    const form = read("components/CheckinForm.tsx");

    expect(form).toContain("运动信息");
    expect(form).toContain("身体状态");
    expect(form).toContain("补充记录");
    expect(form).toContain("添加本次运动");
  });

  it("uses one storage helper for checkin image public urls and failure display", () => {
    expect(existsSync(join(root, "lib/storage.ts"))).toBe(true);
    expect(read("lib/storage.ts")).toContain("getCheckinImageUrl");
    expect(read("components/CheckinImage.tsx")).toContain("getCheckinImageUrl");
    expect(read("components/CheckinImage.tsx")).toContain("图片加载失败");
    expect(read("components/CheckinImage.tsx")).toContain("console.error");
  });
});
