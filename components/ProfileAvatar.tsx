import type { Profile } from "@/types/database";

type ProfileAvatarProps = {
  profile: Pick<Profile, "username" | "avatar_url">;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

function getAvatarText(username: string) {
  return username.trim().slice(0, 1).toUpperCase() || "F";
}

function getSizeClass(size: NonNullable<ProfileAvatarProps["size"]>) {
  if (size === "lg") return "large";
  if (size === "xl") return "xl";
  if (size === "sm") return "small";
  return "";
}

export function ProfileAvatar({ profile, size = "md", className = "" }: ProfileAvatarProps) {
  const sizeClass = getSizeClass(size);
  const baseClassName = ["avatar-placeholder", sizeClass, className].filter(Boolean).join(" ");
  const label = `${profile.username} 的头像`;

  if (profile.avatar_url) {
    return (
      <img
        alt={label}
        className={`${baseClassName} profile-avatar-image`}
        src={profile.avatar_url}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <div className={baseClassName} aria-label={label}>
      {getAvatarText(profile.username)}
    </div>
  );
}
