import type { Profile } from "@/types/database";
import { ProfileAvatar } from "@/components/ProfileAvatar";

type AppHeaderProps = {
  profile: Profile;
  title?: string;
  subtitle?: string;
};

export function AppHeader({ profile, title = "健身打卡", subtitle = "双人监督健身记录" }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <ProfileAvatar profile={profile} />
    </header>
  );
}
