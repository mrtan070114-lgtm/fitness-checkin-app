import type { Profile } from "@/types/database";

type AppHeaderProps = {
  profile: Profile;
  title?: string;
  subtitle?: string;
};

function getAvatarText(username: string) {
  return username.trim().slice(0, 1).toUpperCase() || "F";
}

export function AppHeader({ profile, title = "健身打卡", subtitle = "双人监督健身记录" }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="avatar-placeholder" aria-label={`${profile.username} 的头像`}>
        {getAvatarText(profile.username)}
      </div>
    </header>
  );
}
