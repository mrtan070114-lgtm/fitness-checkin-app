import { describe, expect, it } from "vitest";
import { formatWeightGoalStatus, getWeightGap, getWeightLoss } from "@/lib/goals";

describe("goal weight progress", () => {
  it("does not mark a weight loss goal as reached while current weight is above target", () => {
    const goal = { current_weight: 80, target_weight: 70 };

    expect(getWeightGap(goal)).toBe(10);
    expect(formatWeightGoalStatus(goal)).toBe("还差 10 kg");
  });

  it("marks a weight loss goal as reached once current weight is at or below target", () => {
    expect(formatWeightGoalStatus({ current_weight: 70, target_weight: 70 })).toBe("已达到目标");
    expect(formatWeightGoalStatus({ current_weight: 69.5, target_weight: 70 })).toBe("已达到目标");
  });

  it("returns the one-decimal weight loss when the latest weight is lower", () => {
    expect(getWeightLoss(62, 61.47)).toBe(0.5);
  });

  it("does not celebrate a first, equal, or increased weight", () => {
    expect(getWeightLoss(null, 61.5)).toBeNull();
    expect(getWeightLoss(undefined, 61.5)).toBeNull();
    expect(getWeightLoss(61.5, 61.5)).toBeNull();
    expect(getWeightLoss(61.5, 62)).toBeNull();
  });
});
