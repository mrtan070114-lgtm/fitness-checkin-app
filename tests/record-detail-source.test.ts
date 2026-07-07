import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("compact record cards and detail pages", () => {
  it("renders record lists with compact summary cards", () => {
    expect(existsSync(join(root, "components/RecordSummaryCard.tsx"))).toBe(true);

    const summary = read("components/RecordSummaryCard.tsx");
    expect(summary).toContain("record-summary-card");
    expect(summary).toContain("查看详情");
    expect(summary).toContain("record-thumbnail");
    expect(summary).toContain("已锁定");
    expect(summary).not.toContain("饮食情况");
    expect(summary).not.toContain("备注");
    expect(summary).not.toContain("心情");

    expect(read("app/records/page.tsx")).toContain("RecordSummaryCard");
    expect(read("app/partner/page.tsx")).toContain("RecordSummaryCard");
    expect(read("app/admin/checkins/page.tsx")).toContain("RecordSummaryCard");
  });

  it("adds full read-only detail pages for normal users and admins", () => {
    expect(existsSync(join(root, "app/records/[id]/page.tsx"))).toBe(true);
    expect(read("app/records/[id]/page.tsx")).toContain("返回记录");
    expect(read("app/records/[id]/page.tsx")).toContain("RecordCard");
    expect(read("app/records/[id]/page.tsx")).not.toContain("deleteCheckin");

    expect(existsSync(join(root, "app/admin/checkins/[id]/page.tsx"))).toBe(true);
    expect(read("app/admin/checkins/[id]/page.tsx")).toContain("编辑记录");
    expect(read("app/admin/checkins/[id]/page.tsx")).toContain("RecordCard");
  });

  it("does not render record cards on the checkin form page", () => {
    const page = read("app/checkin/page.tsx");

    expect(page).not.toContain("RecordCard");
    expect(page).not.toContain("todayRecords");
    expect(page).not.toContain("今日已记录");
  });
});
