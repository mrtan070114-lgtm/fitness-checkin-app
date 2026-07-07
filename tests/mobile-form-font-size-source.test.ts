import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("mobile form control font sizes", () => {
  it("keeps real form controls at 16px to avoid iOS Safari auto zoom", () => {
    const css = read("app/globals.css");

    expect(css).toMatch(/input,\s*textarea,\s*select,\s*button\s*\{[^}]*font-size:\s*16px/s);
    expect(css).not.toMatch(/user-scalable\s*=\s*no/i);
    expect(css).not.toMatch(/maximum-scale\s*=\s*1/i);
  });

  it("does not use Tailwind small text utilities on target pages", () => {
    const files = [
      "app/login/LoginForm.tsx",
      "app/register/RegisterForm.tsx",
      "components/CheckinForm.tsx",
      "app/bind/page.tsx",
      "app/profile/page.tsx"
    ];

    for (const file of files) {
      const source = read(file);
      expect(source).not.toMatch(/\btext-(xs|sm|\[1[0-5]px\])\b/);
    }
  });
});
