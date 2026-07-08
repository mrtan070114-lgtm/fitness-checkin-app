import type { Profile } from "@/types/database";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { ThemeMetaUpdater } from "@/components/ThemeMetaUpdater";
import { getThemeCssVariables } from "@/lib/themes";

type UserShellProps = {
  profile: Profile;
  title?: string;
  subtitle?: string;
  hideHeader?: boolean;
  showBackButton?: boolean;
  children: React.ReactNode;
};

export function UserShell({ profile, title, subtitle, hideHeader = false, showBackButton = false, children }: UserShellProps) {
  return (
    <div className="user-shell" style={getThemeCssVariables(profile.theme_color)}>
      <ThemeMetaUpdater themeColor={profile.theme_color} />
      <div className="page-shell with-bottom-nav">
        {hideHeader ? null : <AppHeader profile={profile} title={title} subtitle={subtitle} showBackButton={showBackButton} />}
        <main className="content-stack">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
