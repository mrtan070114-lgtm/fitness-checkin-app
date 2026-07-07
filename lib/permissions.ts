import type { UserRole } from "@/types/database";

export type PermissionProfile = {
  id: string;
  role: UserRole;
  bound_user_id: string | null;
};

export function isAdmin(profile: Pick<PermissionProfile, "role"> | null | undefined) {
  return profile?.role === "admin";
}

export function canViewCheckin(profile: PermissionProfile, recordOwnerId: string) {
  return isAdmin(profile) || profile.id === recordOwnerId || profile.bound_user_id === recordOwnerId;
}

export function canMutateCheckin(profile: Pick<PermissionProfile, "role">) {
  return isAdmin(profile);
}
