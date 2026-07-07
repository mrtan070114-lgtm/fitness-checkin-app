import { describe, expect, it, vi } from "vitest";
import { getCheckinImageUrl } from "@/lib/storage";

function createStorageStub() {
  const getPublicUrl = vi.fn((path: string) => ({
    data: {
      publicUrl: `https://project.supabase.co/storage/v1/object/public/checkin-images/${path}`
    }
  }));

  return {
    supabase: {
      storage: {
        from: vi.fn(() => ({
          getPublicUrl
        }))
      }
    },
    getPublicUrl
  };
}

describe("checkin image URL resolution", () => {
  it("keeps existing absolute public URLs unchanged", () => {
    const { supabase, getPublicUrl } = createStorageStub();
    const url = "https://project.supabase.co/storage/v1/object/public/checkin-images/user-1/a.jpeg";

    expect(getCheckinImageUrl(supabase, url)).toBe(url);
    expect(getPublicUrl).not.toHaveBeenCalled();
  });

  it("converts a stored object path to a public URL", () => {
    const { supabase, getPublicUrl } = createStorageStub();

    expect(getCheckinImageUrl(supabase, "user-1/a.jpeg")).toBe(
      "https://project.supabase.co/storage/v1/object/public/checkin-images/user-1/a.jpeg"
    );
    expect(getPublicUrl).toHaveBeenCalledWith("user-1/a.jpeg");
  });

  it("normalizes paths that already include the bucket name", () => {
    const { supabase, getPublicUrl } = createStorageStub();

    expect(getCheckinImageUrl(supabase, "checkin-images/user-1/a.jpeg")).toBe(
      "https://project.supabase.co/storage/v1/object/public/checkin-images/user-1/a.jpeg"
    );
    expect(getPublicUrl).toHaveBeenCalledWith("user-1/a.jpeg");
  });
});
