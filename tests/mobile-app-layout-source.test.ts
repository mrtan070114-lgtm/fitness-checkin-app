import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("mobile app shell layout", () => {
  it("uses the dashboard welcome area as the only dashboard header", () => {
    expect(read("components/UserShell.tsx")).toContain("hideHeader");
    expect(read("app/dashboard/page.tsx")).toContain("hideHeader");
    expect(read("app/dashboard/page.tsx")).not.toContain('title="首页" subtitle="今日状态"');
  });

  it("adds safe-area padding to the app shell and bottom navigation", () => {
    const css = read("app/globals.css");

    expect(css).toMatch(/padding-top:\s*calc\([^)]*env\(safe-area-inset-top\)/);
    expect(css).toMatch(/padding-bottom:\s*calc\([^)]*env\(safe-area-inset-bottom\)/);
    expect(css).toMatch(/\.page-shell\.with-bottom-nav\s*\{[^}]*padding-bottom:\s*calc\([^)]*env\(safe-area-inset-bottom\)/s);
    expect(css).toMatch(/\.bottom-nav\s*\{[^}]*padding:[^;]*env\(safe-area-inset-bottom\)/s);
  });

  it("keeps the bottom nav compact and app-like", () => {
    const css = read("app/globals.css");

    expect(css).toMatch(/\.bottom-nav\s*\{[^}]*min-height:\s*64px/s);
    expect(css).toMatch(/\.bottom-nav-item\s*\{[^}]*width:\s*64px/s);
    expect(css).toMatch(/\.bottom-nav-item\s*\{[^}]*min-height:\s*48px/s);
    expect(css).toMatch(/\.bottom-nav-item\.active\s*\{[^}]*background:\s*var\(--color-nav-active-bg\)/s);
  });

  it("sets mobile theme color without disabling user zoom", () => {
    const layout = read("app/layout.tsx");

    expect(layout).toContain("themeColor");
    expect(layout).not.toMatch(/userScalable:\s*false|maximumScale:\s*1/);
    expect(read("app/globals.css")).not.toMatch(/user-scalable\s*=\s*no|maximum-scale\s*=\s*1/i);
  });
});
