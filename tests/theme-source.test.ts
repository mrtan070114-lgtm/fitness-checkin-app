import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("theme color source requirements", () => {
  it("ships the profile theme_color migration and safe rpc", () => {
    const sqlPath = join(root, "supabase/add_theme_color.sql");
    expect(existsSync(sqlPath)).toBe(true);

    const sql = read("supabase/add_theme_color.sql");
    expect(sql).toMatch(/alter table public\.profiles\s+add column if not exists theme_color text default 'green'/i);
    expect(sql).toMatch(/create or replace function public\.update_my_theme_color\(theme_color text\)/i);
    expect(sql).toMatch(/security definer/i);
    expect(sql).toMatch(/auth\.uid\(\)/i);
    expect(sql).toMatch(/where id = \(select auth\.uid\(\)\)/i);
    expect(sql).toMatch(/grant execute on function public\.update_my_theme_color\(text\) to authenticated/i);
  });

  it("defines supported themes and css variable mapping", () => {
    expect(existsSync(join(root, "lib/themes.ts"))).toBe(true);
    const themes = read("lib/themes.ts");

    for (const color of ["green", "blue", "purple", "pink", "orange", "black"]) {
      expect(themes).toContain(color);
    }

    for (const variable of [
      "--color-primary",
      "--color-primary-soft",
      "--color-primary-dark",
      "--color-button-bg",
      "--color-button-text",
      "--color-nav-active-bg",
      "--color-nav-active-text",
      "--color-accent-border"
    ]) {
      expect(themes).toContain(variable);
    }

    expect(themes).toContain("getThemeByColor");
    expect(read("types/database.ts")).toContain("theme_color");
    expect(read("types/database.ts")).toContain("update_my_theme_color");
  });

  it("applies theme variables through the user shell and global css", () => {
    expect(read("components/UserShell.tsx")).toContain("getThemeCssVariables");
    expect(read("components/UserShell.tsx")).toContain("style={getThemeCssVariables(profile.theme_color)}");
    expect(read("components/ThemeMetaUpdater.tsx")).toContain("getThemeCssVariableRecord");
    expect(read("components/ThemeMetaUpdater.tsx")).toContain("document.documentElement.style.setProperty");
    expect(read("components/ThemeMetaUpdater.tsx")).toContain("window.localStorage.setItem(themeStorageKey");
    expect(read("app/layout.tsx")).toContain("getThemeBootstrapScript");
    expect(read("app/layout.tsx")).toContain("dangerouslySetInnerHTML");

    const css = read("app/globals.css");
    expect(css).toContain("--color-primary");
    expect(css).toContain("var(--color-button-bg)");
    expect(css).toContain("var(--color-nav-active-bg)");
    expect(css).toContain("var(--color-accent-border)");
  });

  it("adds profile entry and theme settings page", () => {
    expect(read("app/profile/page.tsx")).toContain("外观设置");
    expect(read("app/profile/page.tsx")).toContain("/profile/theme");

    expect(existsSync(join(root, "app/profile/theme/page.tsx"))).toBe(true);
    expect(existsSync(join(root, "app/profile/theme/actions.ts"))).toBe(true);
    expect(read("app/profile/theme/page.tsx")).toContain("选择你喜欢的主题颜色");
    expect(read("app/profile/theme/page.tsx")).toContain("主题已更新");
    expect(read("app/profile/theme/actions.ts")).toContain('rpc("update_my_theme_color"');
  });

  it("keeps theme option forms isolated and redirects action errors back to the page", () => {
    const page = read("app/profile/theme/page.tsx");
    const action = read("app/profile/theme/actions.ts");

    expect(page).toContain("function ThemeOptionForm");
    expect(page).not.toContain('<form action={updateThemeColor} key={theme.value}>');
    expect(page).not.toContain("SubmitButton");
    expect(action).toContain('redirect("/profile/theme?success=1")');
    expect(action).toContain("encodeURIComponent(errorMessage)");
    expect(action).toContain("formData.get(\"theme_color\")");
  });
});
