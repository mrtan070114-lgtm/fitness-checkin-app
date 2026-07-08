import type { Profile } from "@/types/database";
import { BackButton } from "@/components/BackButton";
import { ProfileAvatar } from "@/components/ProfileAvatar";

type AppHeaderProps = {
  profile: Profile;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
};

export function AppHeader({ profile, title = "TnT健身日记", subtitle = "双人监督健身记录", showBackButton = false }: AppHeaderProps) {
  return (
    <header className={showBackButton ? "app-header app-header-with-back" : "app-header"}>
      {showBackButton ? <BackButton /> : null}
      <div className="app-header-copy">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <ProfileAvatar profile={profile} />
    </header>
  );
}
