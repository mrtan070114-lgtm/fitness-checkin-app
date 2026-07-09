import { Lock } from "lucide-react";
import { CheckinImage } from "@/components/CheckinImage";
import { ExerciseDetailsSummary } from "@/components/ExerciseDetailsSummary";
import { formatDisplayDate } from "@/lib/dates";
import { formatTrainingTypes } from "@/lib/exerciseDetails";
import type { Checkin, Profile } from "@/types/database";

type RecordCardProps = {
  record: Checkin;
  owner?: Pick<Profile, "username" | "email"> | null;
  adminActions?: React.ReactNode;
};

function emptyText(value: string | number | null | undefined, suffix = "") {
  if (value === null || value === undefined || value === "") return "未填写";
  return `${value}${suffix}`;
}

export function RecordCard({ record, owner, adminActions }: RecordCardProps) {
  const submittedAt = new Date(record.created_at).toLocaleString("zh-CN");
  const exerciseNames = record.exercise_names?.length ? record.exercise_names.join("、") : "未填写";

  return (
    <article className="record-card">
      <div className="record-card-header">
        <div>
          <p className="eyebrow">{owner ? owner.username : "打卡记录"}</p>
          <h2>{record.session_title || "未命名运动"}</h2>
          <p className="record-title">{formatDisplayDate(record.checkin_date)} · 提交时间 {submittedAt}</p>
        </div>
        {record.locked ? (
          <span className="lock-badge">
            <Lock size={14} aria-hidden="true" />
            已锁定，不可修改
          </span>
        ) : null}
      </div>

      <dl className="record-grid">
        <div>
          <dt>日期</dt>
          <dd>{formatDisplayDate(record.checkin_date)}</dd>
        </div>
        <div>
          <dt>提交时间</dt>
          <dd>{submittedAt}</dd>
        </div>
        <div>
          <dt>本次运动名称</dt>
          <dd>{record.session_title || "未填写"}</dd>
        </div>
        <div>
          <dt>训练部位</dt>
          <dd>{formatTrainingTypes(record.training_types, record.training_type)}</dd>
        </div>
        <div>
          <dt>训练动作</dt>
          <dd>{exerciseNames}</dd>
        </div>
        <div>
          <dt>训练时长</dt>
          <dd>{emptyText(record.duration_minutes, " 分钟")}</dd>
        </div>
        <div>
          <dt>今日体重</dt>
          <dd>{emptyText(record.weight, " kg")}</dd>
        </div>
        <div>
          <dt>心情</dt>
          <dd>{emptyText(record.mood)}</dd>
        </div>
      </dl>

      <div className="record-text">
        <strong>训练计数</strong>
        <ExerciseDetailsSummary details={record.exercise_details} names={record.exercise_names} />
      </div>

      <div className="record-text">
        <strong>饮食情况</strong>
        <p>{record.diet || "未填写"}</p>
      </div>
      <div className="record-text">
        <strong>备注</strong>
        <p>{record.note || "未填写"}</p>
      </div>

      {record.image_url ? (
        <CheckinImage imageUrl={record.image_url} alt={`${record.checkin_date} 打卡图片`} />
      ) : null}

      <div className="record-meta">
        <span>{record.locked ? "已锁定，不可修改" : "未锁定"}</span>
        {owner?.email ? <span>{owner.email}</span> : null}
      </div>

      {adminActions ? <div className="record-actions">{adminActions}</div> : null}
    </article>
  );
}
