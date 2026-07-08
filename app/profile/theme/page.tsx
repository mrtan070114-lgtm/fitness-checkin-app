import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import type { CSSProperties } from "react";
import { updateThemeColor } from "@/app/profile/theme/actions";
import { requireUser } from "@/lib/auth";
import type { AppTheme } from "@/lib/themes";
import { getThemeByColor, themeOptions } from "@/lib/themes";
import { UserShell } from "@/components/UserShell";

type ThemePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getPreviewStyle(theme: (typeof themeOptions)[number]) {
  return {
    "--theme-preview": theme.primary,
    "--theme-preview-soft": theme.primarySoft,
    "--theme-preview-border": theme.accentBorder
  } as CSSProperties;
}

function ThemeOptionForm({ theme, selected }: { theme: AppTheme; selected: boolean }) {
  return (
    <form action={updateThemeColor}>
      <input name="theme_color" type="hidden" value={theme.value} />
      <button className={selected ? "theme-option-card selected" : "theme-option-card"} style={getPreviewStyle(theme)} type="submit">
        <span className="theme-preview-dot" aria-hidden="true" />
        <span className="theme-option-name">{theme.label}</span>
        <span className="theme-option-status">
          {selected ? (
            <>
              <Check size={16} aria-hidden="true" />
              当前选中
            </>
          ) : (
            "点击切换"
          )}
        </span>
      </button>
    </form>
  );
}

export default async function ThemePage({ searchParams }: ThemePageProps) {
  const { profile } = await requireUser();
  const params = searchParams ? await searchParams : {};

  if (profile.role === "admin") {
    redirect("/admin");
  }

  const currentTheme = getThemeByColor(profile.theme_color);

  return (
    <UserShell profile={profile} title="外观设置" subtitle="选择你喜欢的主题颜色" showBackButton>
      {params.success || params.updated ? <p className="alert success">主题已更新</p> : null}
      {typeof params.error === "string" ? <p className="alert error">{params.error}</p> : null}

      <section className="info-card rich-card">
        <p className="eyebrow">当前主题</p>
        <h2>{currentTheme.label}</h2>
        <p className="muted">选择后，按钮、底部导航、强调卡片和锁定标签会同步变化。</p>
      </section>

      <section className="theme-grid" aria-label="主题颜色列表">
        {themeOptions.map((theme) => (
          <ThemeOptionForm key={theme.value} theme={theme} selected={theme.value === currentTheme.value} />
        ))}
      </section>

      <section className="submit-panel">
        <p className="form-note">主题颜色会保存到你的账号资料中，重新登录后仍会保留。</p>
      </section>
    </UserShell>
  );
}
