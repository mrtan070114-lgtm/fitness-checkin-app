import type { Goal } from "@/types/database";

export function formatGoalNumber(value: number | null | undefined, suffix = "") {
  if (value === null || value === undefined) return "未设置";
  return `${value}${suffix}`;
}

export function getWeightGap(goal: Pick<Goal, "current_weight" | "target_weight"> | null | undefined) {
  if (!goal || goal.current_weight === null || goal.target_weight === null) return null;
  return Number((goal.current_weight - goal.target_weight).toFixed(1));
}

export function getCompletionPercent(done: number, target: number | null | undefined) {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((done / target) * 100));
}
