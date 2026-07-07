import { describe, expect, it } from "vitest";
import { calculateStreak, getDateInTimeZone, getMonthRange } from "@/lib/dates";

describe("date helpers", () => {
  it("formats the business date in the configured time zone", () => {
    const date = new Date("2026-07-07T16:30:00.000Z");
    expect(getDateInTimeZone(date, "Asia/Shanghai")).toBe("2026-07-08");
    expect(getDateInTimeZone(date, "UTC")).toBe("2026-07-07");
  });

  it("calculates consecutive streak ending today", () => {
    expect(
      calculateStreak(["2026-07-07", "2026-07-06", "2026-07-04"], "2026-07-07")
    ).toBe(2);
  });

  it("allows a streak ending yesterday when today has not been checked in", () => {
    expect(calculateStreak(["2026-07-06", "2026-07-05"], "2026-07-07")).toBe(2);
  });

  it("returns the current month range for filtering", () => {
    expect(getMonthRange("2026-07-07")).toEqual({
      start: "2026-07-01",
      end: "2026-07-31"
    });
  });
});
