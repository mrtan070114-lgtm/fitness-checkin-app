import Link from "next/link";
import { Heart, Lock, MessageCircle } from "lucide-react";
import { CheckinImage } from "@/components/CheckinImage";
import { ExerciseDetailsSummary } from "@/components/ExerciseDetailsSummary";
import { formatDateTimeCN, formatDisplayDate } from "@/lib/dates";
import type { CheckinSummary } from "@/lib/checkins";
import type { Profile } from "@/types/database";

type RecordSummaryCardProps = {
  record: CheckinSummary;
  detailHref: string;
  owner?: Pick<Profile, "username" | "email"> | null;
  adminActions?: React.ReactNode;
};

function emptyText(value: string | number | null | undefined, suffix = "") {
  if (value === null || value === undefined || value === "") return "未填写";
  return `${value}${suffix}`;
}

export function RecordSummaryCard({ record, detailHref, owner, adminActions }: RecordSummaryCardProps) {
  const submittedAt = formatDateTimeCN(record.created_at);
  const trainingTypes = record.training_types?.length
    ? record.training_types
    : record.training_type
      ? [record.training_type]
      : [];
  const exerciseNames = record.exercise_names?.length ? record.exercise_names.join("、") : "未填写动作";
  const likeCount = record.likeCount || 0;
  const commentCount = record.commentCount || 0;

  return (
    <article className="record-summary-card">
      <Link className="record-summary-main" href={detailHref}>
        <div className="record-summary-copy">
          <div className="record-summary-title-row">
            <div>
              {owner ? <p className="eyebrow">{owner.username}</p> : null}
              <h2>{record.session_title || "未命名运动"}</h2>
            </div>
            {record.locked ? (
              <span className="summary-lock">
                <Lock size={13} aria-hidden="true" />
                已锁定
              </span>
            ) : null}
          </div>

          <div className="summary-facts">
            <span>{trainingTypes.length ? trainingTypes.join("、") : "未填写"}</span>
            <span>{exerciseNames}</span>
            <span>{emptyText(record.duration_minutes, " 分钟")}</span>
            <span>{emptyText(record.weight, " kg")}</span>
          </div>

          <ExerciseDetailsSummary compact details={record.exercise_details} names={record.exercise_names} />

          <p className="summary-time">
            {formatDisplayDate(record.checkin_date)} · {submittedAt}
          </p>

          <div className="interaction-badges" aria-label="互动统计">
            <span>
              <Heart size={13} aria-hidden="true" /> {likeCount}
            </span>
            <span>
              <MessageCircle size={13} aria-hidden="true" /> {commentCount}
            </span>
          </div>
        </div>

        {record.image_url ? (
          <CheckinImage
            className="record-thumbnail"
            errorClassName="record-thumbnail image-error thumbnail-error"
            imageUrl={record.image_url}
            alt={`${record.checkin_date} 运动缩略图`}
          />
        ) : null}
      </Link>

      <div className="record-summary-actions">
        <Link className="secondary-button compact" href={detailHref}>
          查看详情
        </Link>
        {adminActions}
      </div>
    </article>
  );
}
