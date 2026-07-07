import type { Profile } from "@/types/database";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";

type UserShellProps = {
  profile: Profile;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function UserShell({ profile, title, subtitle, children }: UserShellProps) {
  return (
    <div className="page-shell with-bottom-nav">
      <AppHeader profile={profile} title={title} subtitle={subtitle} />
      <main className="content-stack">{children}</main>
      <BottomNav />
    </div>
  );
}
