import { describe, expect, it } from "vitest";
import { formatWeightGoalStatus, getWeightGap } from "@/lib/goals";

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
});
