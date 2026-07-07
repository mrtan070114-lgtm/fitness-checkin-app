import type { SupabaseClient } from "@supabase/supabase-js";
import { AVATAR_BUCKET, CHECKIN_IMAGE_BUCKET, MAX_AVATAR_SIZE_BYTES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants";
import type { Database } from "@/types/database";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_AVATAR_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getFileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) {
    return fromName;
  }

  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

export function isUsableImage(file: unknown): file is File {
  return file instanceof File && file.size > 0;
}

export async function uploadCheckinImage(
  supabase: SupabaseClient<Database>,
  file: File,
  pathOwnerId: string
) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("只支持 JPG、PNG、WEBP 或 GIF 图片");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("图片不能超过 5MB");
  }

  const extension = getFileExtension(file);
  const path = `${pathOwnerId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(CHECKIN_IMAGE_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false
  });

  if (error) {
    throw new Error(error.message);
  }

  return supabase.storage.from(CHECKIN_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function uploadAvatarImage(
  supabase: SupabaseClient<Database>,
  file: File,
  pathOwnerId: string
) {
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    throw new Error("只支持 JPG、PNG 或 WEBP 图片");
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    throw new Error("头像不能超过 2MB");
  }

  const extension = getFileExtension(file);
  const path = `${pathOwnerId}/avatar-${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false
  });

  if (error) {
    throw new Error(error.message);
  }

  return supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl;
}
