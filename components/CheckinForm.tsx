import { MOODS, TRAINING_TYPES } from "@/lib/constants";
import { createCheckin } from "@/app/checkin/actions";
import { SubmitButton } from "@/components/SubmitButton";

export function CheckinForm() {
  return (
    <form action={createCheckin} className="checkin-form-stack">
      <section className="form-card form-section">
        <div className="section-heading">
          <p className="eyebrow">运动信息</p>
          <h2>这一次练了什么</h2>
        </div>

        <label>
          本次运动名称
          <input maxLength={80} name="session_title" placeholder="例如 早上跑步、晚上力量训练、胸部训练" />
        </label>

        <label>
          训练类型
          <select name="training_type" required defaultValue="胸">
            {TRAINING_TYPES.map((type) => (
              <option value={type} key={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label>
          训练时长（分钟）
          <input inputMode="numeric" min="0" max="1440" name="duration_minutes" placeholder="例如 60" type="number" />
        </label>
      </section>

      <section className="form-card form-section">
        <div className="section-heading">
          <p className="eyebrow">身体状态</p>
          <h2>记录今天的感受</h2>
        </div>

        <div className="form-grid two">
          <label>
            今日体重（kg）
            <input inputMode="decimal" min="0" max="500" name="weight" placeholder="例如 68.5" step="0.1" type="number" />
          </label>

          <label>
            心情状态
            <select name="mood" defaultValue="不错">
              {MOODS.map((mood) => (
                <option value={mood} key={mood}>
                  {mood}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="form-card form-section">
        <div className="section-heading">
          <p className="eyebrow">补充记录</p>
          <h2>饮食、备注和图片</h2>
        </div>

        <label>
          饮食情况
          <textarea name="diet" placeholder="记录今天饮食、蛋白质摄入或控糖情况" rows={4} />
        </label>

        <label>
          备注
          <textarea name="note" placeholder="训练感受、动作完成情况、明天计划" rows={4} />
        </label>

        <label>
          上传图片
          <input accept="image/jpeg,image/png,image/webp,image/gif" name="image" type="file" />
        </label>
      </section>

      <section className="submit-panel">
        <SubmitButton pendingText="正在保存...">添加本次运动</SubmitButton>
        <p className="form-note">提交成功后记录会立即锁定，普通用户不可修改或删除。</p>
      </section>
    </form>
  );
}
