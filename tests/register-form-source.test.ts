import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("RegisterForm submit handler", () => {
  const source = readFileSync(join(process.cwd(), "app/register/RegisterForm.tsx"), "utf8");

  it("keeps a stable form reference before awaiting signUp", () => {
    expect(source).toContain("const form = event.currentTarget;");
  });

  it("does not reset through event.currentTarget after async work", () => {
    expect(source).not.toContain("event.currentTarget.reset()");
    expect(source).toContain("form.reset()");
  });
});
