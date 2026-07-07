import { describe, expect, it } from "vitest";
import { canMutateCheckin, canViewCheckin } from "@/lib/permissions";

describe("permission helpers", () => {
  const user = {
    id: "user-1",
    role: "user" as const,
    bound_user_id: "user-2"
  };

  it("lets a normal user view their own and partner records", () => {
    expect(canViewCheckin(user, "user-1")).toBe(true);
    expect(canViewCheckin(user, "user-2")).toBe(true);
  });

  it("prevents a normal user from viewing unrelated records", () => {
    expect(canViewCheckin(user, "user-3")).toBe(false);
  });

  it("does not let normal users mutate locked records", () => {
    expect(canMutateCheckin(user)).toBe(false);
  });

  it("lets admins view and mutate all records", () => {
    const admin = {
      id: "admin-1",
      role: "admin" as const,
      bound_user_id: null
    };

    expect(canViewCheckin(admin, "user-3")).toBe(true);
    expect(canMutateCheckin(admin)).toBe(true);
  });
});
