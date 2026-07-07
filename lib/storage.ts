import { CHECKIN_IMAGE_BUCKET } from "@/lib/constants";

export type PublicUrlSupabase = {
  storage: {
    from: (bucket: string) => {
      getPublicUrl: (path: string) => {
        data: {
          publicUrl: string;
        };
      };
    };
  };
};

function isAbsoluteUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeCheckinImagePath(imageUrlOrPath: string) {
  let path = imageUrlOrPath.trim();

  path = path.replace(/^\/+/, "");
  path = path.replace(/^storage\/v1\/object\/public\/checkin-images\//, "");
  path = path.replace(/^object\/public\/checkin-images\//, "");
  path = path.replace(/^public\/checkin-images\//, "");
  path = path.replace(/^checkin-images\//, "");

  return path;
}

export function getCheckinImageUrl(supabase: PublicUrlSupabase, imageUrlOrPath: string | null | undefined) {
  if (!imageUrlOrPath) return null;

  const trimmed = imageUrlOrPath.trim();
  if (!trimmed) return null;

  if (isAbsoluteUrl(trimmed)) {
    return trimmed;
  }

  const path = normalizeCheckinImagePath(trimmed);
  return supabase.storage.from(CHECKIN_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}
