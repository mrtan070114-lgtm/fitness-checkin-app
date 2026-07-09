import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

function findLoadingFiles(dir: string): string[] {
  return readdirSync(join(root, dir)).flatMap((entry) => {
    const relativePath = `${dir}/${entry}`;
    const fullPath = join(root, relativePath);

    if (statSync(fullPath).isDirectory()) {
      return findLoadingFiles(relativePath);
    }

    return entry === "loading.tsx" ? [relativePath] : [];
  });
}

describe("global app page loading system", () => {
  const requiredPages = [
    ["app/dashboard/loading.tsx", "首页", "正在更新今日状态", "正在同步你的训练数据", 'variant="dashboard"'],
    ["app/checkin/loading.tsx", "打卡", "正在准备打卡表单", "马上就可以记录本次训练", 'variant="checkin"'],
    ["app/records/loading.tsx", "我的记录", "正在加载运动记录", "正在整理你的训练历史", 'variant="records"'],
    ["app/partner/loading.tsx", "对方记录", "正在同步监督对象记录", "正在获取对方最近训练动态", 'variant="partner"'],
    ["app/profile/loading.tsx", "我的", "正在加载个人信息", "正在同步头像、昵称和设置", 'variant="profile"'],
    ["app/goals/loading.tsx", "健身目标", "正在加载目标信息", "正在计算你的目标进度", 'variant="default"'],
    ["app/stats/loading.tsx", "数据统计", "正在生成训练统计", "正在分析你的运动数据", 'variant="stats"'],
    ["app/admin/loading.tsx", "管理员后台", "正在加载管理数据", "正在同步用户和记录信息", 'variant="admin"']
  ] as const;

  it("provides one reusable AppPageLoading component with theme and bottom nav support", () => {
    expect(existsSync(join(root, "components/AppPageLoading.tsx"))).toBe(true);

    const component = read("components/AppPageLoading.tsx");
    expect(component).toContain("type AppPageLoadingProps");
    expect(component).toContain('variant?: "dashboard" | "checkin" | "records" | "partner" | "profile" | "stats" | "admin" | "default"');
    expect(component).toContain("showBottomNav?: boolean");
    expect(component).toContain("ThemeMetaUpdater");
    expect(component).toContain("BottomNav");
    expect(component).toContain("renderSkeleton");
    expect(component).toContain("app-loading-spinner");
  });

  it("routes every loading.tsx through AppPageLoading", () => {
    const loadingFiles = findLoadingFiles("app");

    for (const path of requiredPages.map(([path]) => path)) {
      expect(loadingFiles).toContain(path);
    }

    for (const path of loadingFiles) {
      const source = read(path);
      expect(source).toContain('import { AppPageLoading } from "@/components/AppPageLoading"');
      expect(source).toContain("<AppPageLoading");
      expect(source).not.toContain('import { PageLoading } from "@/components/PageLoading"');
    }
  });

  it("uses page-specific loading copy and variants for main routes", () => {
    for (const [path, section, title, description, variant] of requiredPages) {
      const source = read(path);
      expect(source).toContain(`section="${section}"`);
      expect(source).toContain(`title="${title}"`);
      expect(source).toContain(`description="${description}"`);
      expect(source).toContain(variant);
    }
  });

  it("themes loading visuals through css variables instead of fixed colors", () => {
    const themes = read("lib/themes.ts");
    const css = read("app/globals.css");
    const component = read("components/AppPageLoading.tsx");

    for (const variable of ["--color-primary-very-soft", "--color-border", "--color-card"]) {
      expect(themes).toContain(variable);
      expect(css).toContain(variable);
    }

    const loadingCss = css.slice(css.indexOf(".app-page-loading"), css.indexOf("@keyframes app-loading-shimmer"));
    for (const variable of [
      "var(--color-primary)",
      "var(--color-primary-soft)",
      "var(--color-primary-very-soft)",
      "var(--color-border)",
      "var(--color-card)",
      "var(--bottom-nav-space)"
    ]) {
      expect(loadingCss).toContain(variable);
    }
    expect(component).toContain("app-loading-skeleton");
    expect(loadingCss).not.toMatch(/#126b42|#db2777|#2563eb|#7c3aed|pink|blue|green/i);
  });
});
