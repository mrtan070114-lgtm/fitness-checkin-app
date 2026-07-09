import type { ExerciseDetail, TrainingType } from "@/types/database";
import { TRAINING_TYPES } from "@/lib/constants";

export type ExerciseKind = "strength" | "duration" | "cardio" | "mixed";

export type ExercisePreset = {
  name: string;
  kind: ExerciseKind;
  trainingType: TrainingType;
};

export const EXERCISE_TO_TRAINING_TYPE = {
  深蹲: "腿",
  箭步蹲: "腿",
  臀桥: "腿",
  提踵: "腿",

  俯卧撑: "胸",
  卧推: "胸",
  哑铃卧推: "胸",
  上斜卧推: "胸",

  仰卧起坐: "腹",
  卷腹: "腹",
  平板支撑: "腹",
  俄罗斯转体: "腹",
  举腿: "腹",

  引体向上: "背",
  划船: "背",
  硬拉: "背",

  推举: "肩",
  侧平举: "肩",
  前平举: "肩",

  弯举: "手臂",
  臂屈伸: "手臂",
  绳索下压: "手臂",

  跑步: "有氧",
  快走: "有氧",
  跳绳: "有氧",
  椭圆机: "有氧",
  骑行: "有氧"
} as const satisfies Record<string, TrainingType>;

export const EXERCISE_PRESETS: ExercisePreset[] = [
  { name: "俯卧撑", kind: "strength", trainingType: "胸" },
  { name: "卧推", kind: "strength", trainingType: "胸" },
  { name: "哑铃卧推", kind: "strength", trainingType: "胸" },
  { name: "上斜卧推", kind: "strength", trainingType: "胸" },
  { name: "划船", kind: "strength", trainingType: "背" },
  { name: "引体向上", kind: "strength", trainingType: "背" },
  { name: "硬拉", kind: "strength", trainingType: "背" },
  { name: "深蹲", kind: "strength", trainingType: "腿" },
  { name: "箭步蹲", kind: "strength", trainingType: "腿" },
  { name: "臀桥", kind: "strength", trainingType: "腿" },
  { name: "提踵", kind: "strength", trainingType: "腿" },
  { name: "仰卧起坐", kind: "strength", trainingType: "腹" },
  { name: "卷腹", kind: "strength", trainingType: "腹" },
  { name: "平板支撑", kind: "duration", trainingType: "腹" },
  { name: "俄罗斯转体", kind: "strength", trainingType: "腹" },
  { name: "举腿", kind: "strength", trainingType: "腹" },
  { name: "推举", kind: "strength", trainingType: "肩" },
  { name: "侧平举", kind: "strength", trainingType: "肩" },
  { name: "前平举", kind: "strength", trainingType: "肩" },
  { name: "弯举", kind: "strength", trainingType: "手臂" },
  { name: "臂屈伸", kind: "strength", trainingType: "手臂" },
  { name: "绳索下压", kind: "strength", trainingType: "手臂" },
  { name: "跑步", kind: "cardio", trainingType: "有氧" },
  { name: "快走", kind: "cardio", trainingType: "有氧" },
  { name: "骑行", kind: "cardio", trainingType: "有氧" },
  { name: "椭圆机", kind: "cardio", trainingType: "有氧" },
  { name: "跳绳", kind: "cardio", trainingType: "有氧" }
];

const presetKindByName = new Map(EXERCISE_PRESETS.map((exercise) => [exercise.name, exercise.kind]));
const trainingTypeSet = new Set<TrainingType>(TRAINING_TYPES);

type ParsedExerciseDetails = {
  exerciseNames: string[] | null;
  exerciseDetails: ExerciseDetail[] | null;
  trainingTypes: TrainingType[];
  error: string | null;
};

function parseNullableNumber(value: FormDataEntryValue | null, label: string, integer = false) {
  if (value === null || value === undefined || value === "") return { value: null, error: null };
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0 || (integer && !Number.isInteger(numericValue))) {
    return { value: null, error: `${label}必须是大于等于 0 的${integer ? "整数" : "数字"}` };
  }

  return { value: numericValue, error: null };
}

function parseNullableText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function isTrainingType(value: string): value is TrainingType {
  return trainingTypeSet.has(value as TrainingType);
}

function parseTrainingType(value: FormDataEntryValue | undefined) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return isTrainingType(trimmed) ? trimmed : null;
}

export function getExerciseKind(name: string): ExerciseKind {
  return presetKindByName.get(name) || "mixed";
}

export function getExerciseTrainingType(name: string, fallback?: TrainingType | null) {
  const trimmed = name.trim();
  return EXERCISE_TO_TRAINING_TYPE[trimmed as keyof typeof EXERCISE_TO_TRAINING_TYPE] || fallback || null;
}

export function deriveTrainingTypes(names: string[] | null | undefined, explicitTypes?: Array<string | null | undefined>) {
  const types: TrainingType[] = [];

  if (!Array.isArray(names)) return types;

  names.forEach((name, index) => {
    const explicitType = explicitTypes?.[index];
    const type = typeof explicitType === "string" && isTrainingType(explicitType)
      ? explicitType
      : getExerciseTrainingType(name);

    if (type && !types.includes(type)) {
      types.push(type);
    }
  });

  return types;
}

export function normalizeTrainingTypes(trainingTypes?: TrainingType[] | null, fallback?: TrainingType | null) {
  const types = Array.isArray(trainingTypes)
    ? trainingTypes.filter((type): type is TrainingType => typeof type === "string" && isTrainingType(type))
    : [];

  if (types.length) return Array.from(new Set(types));
  return fallback ? [fallback] : [];
}

export function formatTrainingTypes(trainingTypes?: TrainingType[] | null, fallback?: TrainingType | null) {
  const types = normalizeTrainingTypes(trainingTypes, fallback);
  return types.length ? types.join("、") : "未填写";
}

export function hasExerciseCountValue(detail: ExerciseDetail) {
  return detail.sets !== null && detail.sets !== undefined
    || detail.reps !== null && detail.reps !== undefined
    || detail.weight !== null && detail.weight !== undefined
    || detail.duration_seconds !== null && detail.duration_seconds !== undefined
    || detail.distance_km !== null && detail.distance_km !== undefined;
}

export function hasAnyExerciseCount(details?: ExerciseDetail[] | null) {
  return Array.isArray(details) && details.some(hasExerciseCountValue);
}

export function normalizeExerciseDetails(
  details: ExerciseDetail[] | null | undefined,
  names?: string[] | null
): ExerciseDetail[] {
  const normalized: ExerciseDetail[] = [];

  if (Array.isArray(details)) {
    for (const detail of details) {
      const name = typeof detail?.name === "string" ? detail.name.trim() : "";
      if (!name) continue;

      normalized.push({
        name,
        sets: detail.sets ?? null,
        reps: detail.reps ?? null,
        weight: detail.weight ?? null,
        duration_seconds: detail.duration_seconds ?? null,
        distance_km: detail.distance_km ?? null,
        note: detail.note ?? null
      });
    }
  }

  if (normalized.length || !Array.isArray(names)) return normalized;

  return names
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => ({ name }));
}

export function parseExerciseDetailsForm(formData: FormData): ParsedExerciseDetails {
  const rawNames = formData.getAll("exercise_name");
  const rawTrainingTypes = formData.getAll("exercise_training_type");
  const uniqueNames: string[] = [];
  const explicitTrainingTypes: Array<TrainingType | null> = [];

  rawNames.forEach((rawName, index) => {
    const name = typeof rawName === "string" ? rawName.trim() : "";
    if (!name || uniqueNames.includes(name)) return;

    uniqueNames.push(name);
    explicitTrainingTypes.push(parseTrainingType(rawTrainingTypes[index]));
  });

  if (!uniqueNames.length) {
    return { exerciseNames: null, exerciseDetails: null, trainingTypes: [], error: null };
  }

  const perExerciseTrainingTypes = uniqueNames.map((name, index) => explicitTrainingTypes[index] || getExerciseTrainingType(name));
  const missingTrainingTypeIndex = perExerciseTrainingTypes.findIndex((type) => !type);

  if (missingTrainingTypeIndex >= 0) {
    return {
      exerciseNames: null,
      exerciseDetails: null,
      trainingTypes: [],
      error: `请选择${uniqueNames[missingTrainingTypeIndex]}的归属部位`
    };
  }

  const details: ExerciseDetail[] = [];

  for (let index = 0; index < uniqueNames.length; index += 1) {
    const name = uniqueNames[index];
    const prefix = `exercise_detail_${index}`;
    const sets = parseNullableNumber(formData.get(`${prefix}_sets`), `${name}的组数`, true);
    const reps = parseNullableNumber(formData.get(`${prefix}_reps`), `${name}的次数`, true);
    const weight = parseNullableNumber(formData.get(`${prefix}_weight`), `${name}的重量`);
    const durationSeconds = parseNullableNumber(formData.get(`${prefix}_duration_seconds`), `${name}的秒数`, true);
    const durationMinutes = parseNullableNumber(formData.get(`${prefix}_duration_minutes`), `${name}的分钟数`);
    const distanceKm = parseNullableNumber(formData.get(`${prefix}_distance_km`), `${name}的距离`);
    const error = sets.error || reps.error || weight.error || durationSeconds.error || durationMinutes.error || distanceKm.error;

    if (error) {
      return { exerciseNames: null, exerciseDetails: null, trainingTypes: [], error };
    }

    details.push({
      name,
      sets: sets.value,
      reps: reps.value,
      weight: weight.value,
      duration_seconds: durationSeconds.value ?? (durationMinutes.value === null ? null : Math.round(durationMinutes.value * 60)),
      distance_km: distanceKm.value,
      note: parseNullableText(formData.get(`${prefix}_note`))
    });
  }

  return {
    exerciseNames: uniqueNames,
    exerciseDetails: details,
    trainingTypes: deriveTrainingTypes(uniqueNames, perExerciseTrainingTypes),
    error: null
  };
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(1)));
}

function formatDuration(seconds: number, preferMinutes = false) {
  if (preferMinutes || seconds >= 60) {
    const minutes = seconds / 60;
    return `${formatNumber(minutes)}分钟`;
  }

  return `${formatNumber(seconds)}秒`;
}

export function formatExerciseDetail(detail: ExerciseDetail, compact = false) {
  const parts: string[] = [];
  const kind = getExerciseKind(detail.name);
  const hasSets = detail.sets !== null && detail.sets !== undefined;
  const hasReps = detail.reps !== null && detail.reps !== undefined;
  const hasDuration = detail.duration_seconds !== null && detail.duration_seconds !== undefined;

  if (kind === "cardio") {
    if (hasDuration) parts.push(formatDuration(Number(detail.duration_seconds), true));
    if (detail.distance_km !== null && detail.distance_km !== undefined) parts.push(`${formatNumber(Number(detail.distance_km))}公里`);
  } else if (hasSets && hasReps) {
    parts.push(compact ? `${detail.sets}×${detail.reps}` : `${detail.sets}组 × ${detail.reps}次`);
  } else if (hasSets && hasDuration) {
    parts.push(compact ? `${detail.sets}×${detail.duration_seconds}秒` : `${detail.sets}组 × ${detail.duration_seconds}秒`);
  } else {
    if (hasSets) parts.push(`${detail.sets}组`);
    if (hasReps) parts.push(`${detail.reps}次`);
    if (hasDuration) parts.push(formatDuration(Number(detail.duration_seconds)));
  }

  if (detail.weight !== null && detail.weight !== undefined) parts.push(`${formatNumber(Number(detail.weight))}kg`);

  if (!parts.length) return compact ? detail.name : `${detail.name}：未填写训练计数`;
  return compact ? `${detail.name} ${parts.join(" ")}` : `${detail.name}：${parts.join(" · ")}`;
}

export function formatExerciseDetailsCompact(details: ExerciseDetail[] | null | undefined, names?: string[] | null) {
  const normalized = normalizeExerciseDetails(details, names);
  if (!normalized.length) return "未填写训练计数";

  return normalized.slice(0, 3).map((detail) => formatExerciseDetail(detail, true)).join("，");
}

type ExerciseStatsRecord = {
  exercise_details: ExerciseDetail[] | null;
  exercise_names: string[] | null;
};

export function getExerciseStats(records: ExerciseStatsRecord[]) {
  const details = records.flatMap((record) => normalizeExerciseDetails(record.exercise_details, record.exercise_names));
  const totalSets = details.reduce((total, detail) => total + (detail.sets || 0), 0);
  const totalReps = details.reduce((total, detail) => {
    if (!detail.reps) return total;
    return total + (detail.sets ? detail.sets * detail.reps : detail.reps);
  }, 0);
  const ranking = new Map<string, { name: string; count: number; reps: number; seconds: number }>();

  for (const detail of details) {
    const item = ranking.get(detail.name) || { name: detail.name, count: 0, reps: 0, seconds: 0 };
    item.count += 1;
    if (detail.reps) item.reps += detail.sets ? detail.sets * detail.reps : detail.reps;
    if (detail.duration_seconds) item.seconds += detail.sets ? detail.sets * detail.duration_seconds : detail.duration_seconds;
    ranking.set(detail.name, item);
  }

  return {
    totalActions: details.length,
    totalSets,
    totalReps,
    ranking: Array.from(ranking.values()).sort((a, b) => b.count - a.count || b.reps - a.reps || b.seconds - a.seconds)
  };
}
