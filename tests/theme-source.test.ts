import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { themes } from "@/lib/themes";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

function contrastRatio(foreground: string, background: string) {
  function luminance(hex: string) {
    const channels = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
    const [red, green, blue] = channels.map((channel) => (
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    ));
    return red * 0.2126 + green * 0.7152 + blue * 0.0722;
  }

  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
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

  it("uses a complete tonal palette instead of layering accents over a green canvas", () => {
    const themes = read("lib/themes.ts");
    const css = read("app/globals.css");

    for (const field of [
      "canvas",
      "canvasTop",
      "canvasBottom",
      "surface",
      "surfaceSoft",
      "text",
      "muted",
      "line",
      "shadowRgb"
    ]) {
      expect(themes).toContain(`${field}:`);
    }

    for (const variable of [
      "--bg",
      "--app-bg-top",
      "--app-bg-bottom",
      "--surface",
      "--surface-soft",
      "--text",
      "--muted",
      "--line",
      "--theme-shadow-rgb"
    ]) {
      expect(themes).toContain(`\"${variable}\"`);
    }

    for (const pinkValue of ["#a9275d", "#f7e8ee", "#fff9fb", "#241b20", "#75676e", "#e8d9df"]) {
      expect(themes).toContain(pinkValue);
    }

    expect(css).toContain("var(--app-bg-top)");
    expect(css).toContain("var(--app-bg-bottom)");
    expect(css).toContain("rgba(var(--theme-shadow-rgb), 0.08)");
    expect(css).not.toContain("linear-gradient(180deg, #f7faf5 0%, var(--bg) 48%, #e7f0ea 100%)");
  });

  it("keeps themed foregrounds readable on mobile surfaces", () => {
    for (const theme of Object.values(themes)) {
      expect(contrastRatio(theme.text, theme.canvas)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(theme.muted, theme.canvas)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio("#ffffff", theme.buttonBg)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("applies theme variables through the user shell and global css", () => {
    expect(read("components/UserShell.tsx")).toContain("getThemeCssVariables");
    expect(read("components/UserShell.tsx")).toContain("style={getThemeCssVariables(profile.theme_color)}");
    expect(read("components/ThemeMetaUpdater.tsx")).toContain("getThemeCssVariableRecord");
    expect(read("components/ThemeMetaUpdater.tsx")).toContain("readStoredThemeColor");
    expect(read("components/ThemeMetaUpdater.tsx")).toContain("document.documentElement.style.setProperty");
    expect(read("components/ThemeMetaUpdater.tsx")).toContain('upsertMeta("theme-color", theme.primary)');
    expect(read("components/ThemeMetaUpdater.tsx")).toContain('document.documentElement.style.setProperty("--app-status-bar-color", theme.primary)');
    expect(read("components/ThemeMetaUpdater.tsx")).toContain("window.localStorage.setItem(themeStorageKey");
    expect(read("components/ThemeMetaUpdater.tsx")).toContain("document.cookie");
    expect(read("app/profile/theme/actions.ts")).toContain("themeCookieName");

    const css = read("app/globals.css");
    expect(css).toContain("--color-primary");
    expect(css).toContain("var(--color-button-bg)");
    expect(css).toContain("var(--color-nav-active-bg)");
    expect(css).toContain("var(--color-accent-border)");
  });

  it("does not mutate html theme attributes before hydration", () => {
    const layout = read("app/layout.tsx");
    const themes = read("lib/themes.ts");

    expect(layout).not.toContain("getThemeBootstrapScript");
    expect(layout).not.toContain("dangerouslySetInnerHTML");
    expect(layout).not.toContain("cookies()");
    expect(layout).not.toContain("themeCookieName");
    expect(layout).not.toContain("style={getThemeCssVariables");
    expect(themes).not.toContain("getThemeBootstrapScript");
    expect(themes).not.toContain("window.localStorage.getItem");
  });

  it("keeps loading states themed instead of hard-coding pink styles", () => {
    const css = read("app/globals.css");
    const loadingStyles = css.slice(css.indexOf(".app-page-loading"), css.indexOf("@keyframes app-loading-shimmer"));

    expect(read("components/AppPageLoading.tsx")).toContain("ThemeMetaUpdater");
    expect(read("components/AppPageLoading.tsx")).toContain("app-loading-spinner");
    expect(loadingStyles).toContain("var(--color-primary-dark)");
    expect(loadingStyles).toContain("var(--color-primary)");
    expect(loadingStyles).toContain("var(--color-primary-soft)");
    expect(loadingStyles).toContain("var(--color-primary-very-soft)");
    expect(loadingStyles).toContain("var(--color-border)");
    expect(loadingStyles).toContain("var(--color-card)");
    expect(loadingStyles).not.toMatch(/#db2777|#ec4899|pink|rose|bg-pink|text-pink|border-pink/i);
  });

  it("does not hard-code green as the mobile browser theme color", () => {
    const layout = read("app/layout.tsx");
    const manifest = read("public/manifest.json");
    const css = read("app/globals.css");
    const themes = read("lib/themes.ts");
    const updater = read("components/ThemeMetaUpdater.tsx");

    expect(layout).toContain('themeColor: "#f7faf5"');
    expect(layout).not.toContain('themeColor: "#126b42"');
    expect(manifest).toContain('"theme_color": "#f7faf5"');
    expect(manifest).toContain('"background_color": "#f7faf5"');
    expect(manifest).not.toContain('"theme_color": "#126b42"');
    expect(css).toContain("--app-status-bar-color: #f7faf5");
    expect(css).not.toContain("--app-status-bar-color: #126b42");

    for (const primary of ['primary: "#126b42"', 'primary: "#a9275d"', 'primary: "#2563eb"', 'primary: "#7c3aed"']) {
      expect(themes).toContain(primary);
    }
    expect(updater).toContain('upsertMeta("theme-color", theme.primary)');
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
