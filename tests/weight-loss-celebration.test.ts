import { afterEach, describe, expect, it, vi } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseWeightCelebration, scheduleCelebrationAutoClose } from "@/lib/celebration";

const root = process.cwd();

describe("weight loss celebration", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("automatically closes after exactly ten seconds", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    scheduleCelebrationAutoClose(onClose);
    vi.advanceTimersByTime(9_999);
    expect(onClose).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("can cancel the automatic close timer", () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    const cancel = scheduleCelebrationAutoClose(onClose);
    cancel();
    vi.advanceTimersByTime(10_000);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("derives a valid celebration payload from trusted numeric meaning", () => {
    expect(parseWeightCelebration({
      celebrate: "1",
      previousWeight: "62",
      currentWeight: "61.5"
    })).toEqual({ previousWeight: 62, currentWeight: 61.5, weightLoss: 0.5 });
  });

  it("rejects missing, forged, increased, or non-finite celebration values", () => {
    expect(parseWeightCelebration({ previousWeight: "62", currentWeight: "61.5" })).toBeNull();
    expect(parseWeightCelebration({ celebrate: "1", previousWeight: "61", currentWeight: "62" })).toBeNull();
    expect(parseWeightCelebration({ celebrate: "1", previousWeight: "NaN", currentWeight: "61" })).toBeNull();
    expect(parseWeightCelebration({ celebrate: "1", previousWeight: "-1", currentWeight: "-2" })).toBeNull();
  });

  it("ships the selected accessible dialog with manual and keyboard close controls", () => {
    const componentPath = join(root, "components/WeightLossCelebration.tsx");
    expect(existsSync(componentPath)).toBe(true);

    const component = readFileSync(componentPath, "utf8");
    expect(component).toContain('role="dialog"');
    expect(component).toContain('aria-modal="true"');
    expect(component).toContain("今天的你，值得庆祝");
    expect(component).toContain("持续坚持");
    expect(component).not.toContain("weight-celebration-stats");
    expect(component).toContain("我会坚持下去");
    expect(component).toContain("scheduleCelebrationAutoClose");
    expect(component).toContain('event.key === "Escape"');
    expect(component).toContain("closeCelebration");
    expect(component).toContain("if (!isOpen) return;");
    expect(component).toContain("[closeCelebration, isOpen]");
  });

  it("uses the generated heart artwork from selected option three", () => {
    const assetPath = join(root, "public/weight-loss-celebration-heart.png");
    expect(existsSync(assetPath)).toBe(true);

    const component = readFileSync(join(root, "components/WeightLossCelebration.tsx"), "utf8");
    expect(component).toContain("/weight-loss-celebration-heart.png");
  });
});
