import { HeartPulse, ImagePlus, NotebookPen } from "lucide-react";
import { MOODS } from "@/lib/constants";
import { createCheckin } from "@/app/checkin/actions";
import { ExerciseDetailsFields, ExerciseSelectionCount } from "@/components/ExerciseDetailsFields";
import { SubmitButton } from "@/components/SubmitButton";

export function CheckinForm() {
  return (
    <form action={createCheckin} className="checkin-form-stack enhanced-checkin-form">
      <ExerciseDetailsFields layout="quick" />

      <section className="form-card form-section checkin-step-card">
        <div className="section-heading section-heading-with-icon">
          <span className="form-section-icon"><HeartPulse size={18} aria-hidden="true" /></span>
          <div>
            <p className="eyebrow">基本信息</p>
            <h2>补充本次状态</h2>
          </div>
        </div>

        <div className="form-grid three">
          <label>
            训练时长（分钟）
            <input inputMode="numeric" min="1" max="1440" name="duration_minutes" placeholder="例如 60" required type="number" />
          </label>
          <label>
            今日体重（kg）
            <input inputMode="decimal" min="0" max="500" name="weight" placeholder="例如 68.5" step="0.1" type="number" />
          </label>

          <label>
            心情状态
            <select name="mood" defaultValue="">
              <option value="">未填写</option>
              {MOODS.map((mood) => (
                <option value={mood} key={mood}>
                  {mood}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <details className="form-card form-section checkin-step-card checkin-more-details">
        <summary>
          <span className="form-section-icon"><NotebookPen size={18} aria-hidden="true" /></span>
          <span>
            <span className="eyebrow">更多记录</span>
            <strong>运动名称、饮食、备注和图片</strong>
          </span>
        </summary>
        <div className="checkin-more-content">
          <label>
            运动名称
            <input maxLength={80} name="session_title" placeholder="例如 早上跑步、晚上力量训练、胸部训练" />
          </label>

          <label>
            饮食情况
            <textarea name="diet" placeholder="记录今天饮食、蛋白质摄入或控糖情况" rows={3} />
          </label>

          <label>
            备注
            <textarea name="note" placeholder="训练感受、动作完成情况、明天计划" rows={3} />
          </label>

          <label>
            <span className="input-label-with-icon"><ImagePlus size={16} aria-hidden="true" /> 上传图片</span>
            <input accept="image/jpeg,image/png,image/webp,image/gif" name="image" type="file" />
          </label>
        </div>
      </details>

      <section className="submit-panel checkin-submit-panel">
        <span className="checkin-selected-count">已选 <ExerciseSelectionCount /> 个动作</span>
        <SubmitButton pendingText="正在保存...">添加本次运动</SubmitButton>
      </section>
    </form>
  );
}
