import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("navigation performance source rules", () => {
  it("prefetches bottom navigation routes without full page reloads", () => {
    const nav = read("components/BottomNav.tsx");

    expect(nav).toContain('import Link from "next/link"');
    expect(nav).toContain("prefetch={true}");
    expect(nav).toContain("pendingHref");
    expect(nav).not.toMatch(/window\.location|<a\s/);
  });

  it("limits record list queries to the first page", () => {
    const records = read("app/records/page.tsx");
    const partner = read("app/partner/page.tsx");
    const checkins = read("lib/checkins.ts");

    expect(checkins).toContain("export const RECORD_LIST_LIMIT = 20");
    expect(checkins).toMatch(/\.range\(0,\s*limit - 1\)/);
    expect(records).toContain("RECORD_LIST_LIMIT");
    expect(records).toContain("fetchRecentCheckins");
    expect(partner).toContain("RECORD_LIST_LIMIT");
    expect(partner).toContain("fetchRecentCheckins");
    expect(records).not.toMatch(/select\(["']\*["']\)/);
    expect(partner).not.toMatch(/select\(["']\*["']\)/);
  });

  it("keeps summary images lightweight and lazy loaded", () => {
    const image = read("components/CheckinImage.tsx");

    expect(image).toContain('loading="lazy"');
    expect(image).toContain('decoding="async"');
  });

  it("adds lightweight loading states for high traffic user pages", () => {
    for (const path of [
      "app/dashboard/loading.tsx",
      "app/records/loading.tsx",
      "app/partner/loading.tsx",
      "app/profile/loading.tsx",
      "app/profile/theme/loading.tsx"
    ]) {
      expect(existsSync(join(root, path))).toBe(true);
      expect(read(path)).toContain("AppPageLoading");
    }
  });

  it("surfaces unstable network errors instead of silently ignoring Supabase errors", () => {
    const errors = read("lib/errors.ts");

    expect(errors).toContain("网络连接不稳定，请重试");
    expect(errors).toMatch(/fetch failed|ECONNRESET|network/i);
    expect(read("app/records/page.tsx")).toContain("getFriendlySupabaseError");
    expect(read("app/partner/page.tsx")).toContain("getFriendlySupabaseError");
    expect(read("app/dashboard/page.tsx")).toContain("getFriendlySupabaseError");
  });
});
