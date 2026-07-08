import type { Mood, TrainingType } from "@/types/database";

export const TRAINING_TYPES = ["腹", "胸", "背", "腿", "肩", "手臂", "有氧"] as const satisfies readonly TrainingType[];

export const MOODS = ["很好", "不错", "一般", "疲惫", "低落"] as const satisfies readonly Mood[];

export const CHECKIN_IMAGE_BUCKET = "checkin-images";
export const AVATAR_BUCKET = "avatars";

export const APP_TIME_ZONE = process.env.NEXT_PUBLIC_APP_TIME_ZONE || "Asia/Shanghai";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
