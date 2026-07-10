import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("exercise details source requirements", () => {
  it("ships a compatible checkins exercise_details migration", () => {
    expect(existsSync(join(root, "supabase/add_exercise_details.sql"))).toBe(true);

    const sql = read("supabase/add_exercise_details.sql");
    expect(sql).toMatch(/alter table public\.checkins/i);
    expect(sql).toMatch(/add column if not exists exercise_names text\[\] null/i);
    expect(sql).toMatch(/add column if not exists exercise_details jsonb null/i);
    expect(sql).toMatch(/add column if not exists training_types text\[\] null/i);
    expect(sql).not.toMatch(/drop column|drop table/i);
  });

  it("updates database types and query columns", () => {
    const types = read("types/database.ts");
    const checkins = read("lib/checkins.ts");

    expect(types).toContain("export type ExerciseDetail");
    expect(types).toContain("exercise_names: string[] | null");
    expect(types).toContain("exercise_details: ExerciseDetail[] | null");
    expect(types).toContain("training_types: TrainingType[] | null");
    expect(checkins).toContain("exercise_names");
    expect(checkins).toContain("exercise_details");
    expect(checkins).toContain("training_types");
  });

  it("derives training types from exercise names instead of a manual checkin selector", () => {
    const form = read("components/CheckinForm.tsx");
    const fields = read("components/ExerciseDetailsFields.tsx");
    const helpers = read("lib/exerciseDetails.ts");
    const userAction = read("app/checkin/actions.ts");
    const adminAction = read("app/admin/checkins/actions.ts");

    expect(form).toContain("ExerciseDetailsFields");
    expect(form).not.toContain('name="training_type"');
    expect(fields).toContain("训练动作");
    expect(fields).toContain("已识别：");
    expect(fields).toContain("选择动作后自动识别训练部位");
    expect(fields).toContain("归属部位");
    expect(fields).toContain("exercise_training_type");
    expect(fields).toContain("每组次数");
    expect(fields).toContain("每组秒数");
    expect(fields).toContain("时长（分钟）");
    expect(fields).toContain("自定义动作");
    expect(fields).toContain("请输入动作名称");
    expect(fields).toContain("该动作已存在");
    expect(fields).toContain("确认添加");
    expect(fields).toContain("取消");
    expect(fields).toContain('event.key === "Enter"');
    expect(fields).toContain("event.preventDefault()");
    expect(fields).toContain("addCustomExercise()");
    expect(helpers).toContain("EXERCISE_TO_TRAINING_TYPE");
    expect(helpers).toContain("deriveTrainingTypes");
    expect(userAction).toContain("parseExerciseDetailsForm");
    expect(userAction).toContain("training_types: exerciseDetails.trainingTypes");
    expect(userAction).toContain("training_type: exerciseDetails.trainingTypes[0]");
    expect(adminAction).toContain("training_types: exerciseDetails.trainingTypes");
    expect(read("app/admin/checkins/[id]/edit/page.tsx")).toContain("ExerciseDetailsFields");
  });

  it("renders exercise details across records dashboard admin and stats pages", () => {
    expect(read("components/RecordCard.tsx")).toContain("训练计数");
    expect(read("components/RecordSummaryCard.tsx")).toContain("ExerciseDetailsSummary");
    expect(read("app/dashboard/page.tsx")).toContain("latestExerciseSummary");
    expect(read("app/stats/page.tsx")).toContain("训练计数统计");
    expect(read("app/stats/page.tsx")).toContain("动作排行榜");
  });

  it("uses a fast checkin flow with grouped exercises and a normal submit card", () => {
    const page = read("app/checkin/page.tsx");
    const form = read("components/CheckinForm.tsx");
    const fields = read("components/ExerciseDetailsFields.tsx");
    const action = read("app/checkin/actions.ts");
    const css = read("app/globals.css");

    expect(page).toContain("今天 ·");
    expect(page).not.toContain("一天可以添加多次运动");
    expect(page).not.toContain("提交后锁定");
    expect(fields).toContain("训练内容");
    expect(fields).toContain("动作计数");
    expect(form).toContain("基本信息");
    expect(form).toContain("更多记录");
    expect(form).toContain("<details");
    expect(form).toContain("name=\"session_title\"");
    expect(form).toContain("name=\"duration_minutes\"");
    expect(form).toContain("required");
    expect(form).toContain("checkin-submit-panel");
    expect(form).not.toContain("checkin-sticky-submit");
    expect(form).toContain("已选 <ExerciseSelectionCount /> 个动作");
    expect(fields).toContain("COMMON_EXERCISES");
    expect(fields).toContain("常用动作");
    expect(fields).toContain("全部动作");
    expect(fields).toContain("setActiveType");
    expect(fields).toContain("显示全部动作");
    expect(fields).toContain("已识别：");
    expect(fields).toContain("选择动作后自动识别训练部位");
    expect(action).toContain("请填写训练时长");
    expect(action).toContain("请至少填写一项动作计数");
    expect(css).toContain(".checkin-submit-panel");
    expect(css).not.toContain(".checkin-sticky-submit");
    expect(css).toContain("env(safe-area-inset-bottom)");
  });
});
