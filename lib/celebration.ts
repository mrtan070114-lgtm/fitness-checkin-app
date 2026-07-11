import { getWeightLoss } from "@/lib/goals";

export const celebrationDurationMs = 10_000;

type CelebrationSearchParams = Record<string, string | string[] | undefined>;

export function parseWeightCelebration(params: CelebrationSearchParams) {
  if (params.celebrate !== "1") return null;
  if (typeof params.previousWeight !== "string" || typeof params.currentWeight !== "string") return null;

  const previousWeight = Number(params.previousWeight);
  const currentWeight = Number(params.currentWeight);
  if (!Number.isFinite(previousWeight) || !Number.isFinite(currentWeight)) return null;
  if (previousWeight < 0 || currentWeight < 0) return null;

  const weightLoss = getWeightLoss(previousWeight, currentWeight);
  if (weightLoss === null || weightLoss <= 0) return null;

  return { previousWeight, currentWeight, weightLoss };
}

export function scheduleCelebrationAutoClose(
  onClose: () => void,
  durationMs = celebrationDurationMs
) {
  const timeoutId = globalThis.setTimeout(onClose, durationMs);
  return () => globalThis.clearTimeout(timeoutId);
}
