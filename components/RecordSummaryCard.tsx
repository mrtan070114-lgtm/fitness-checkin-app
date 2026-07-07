import Link from "next/link";
import { Lock } from "lucide-react";
import { CheckinImage } from "@/components/CheckinImage";
import { formatDisplayDate } from "@/lib/dates";
import type { Checkin, Profile } from "@/types/database";

type RecordSummaryCardProps = {
  record: Checkin;
  detailHref: string;
  owner?: Pick<Profile, "username" | "email"> | null;
  adminActions?: React.ReactNode;
};

function emptyText(value: string | number | null | undefined, suffix = "") {
  if (value === null || value === undefined || value === "") return "未填写";
  return `${value}${suffix}`;
}

export function RecordSummaryCard({ record, detailHref, owner, adminActions }: RecordSummaryCardProps) {
  const submittedAt = new Date(record.created_at).toLocaleString("zh-CN");

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
            <span>{record.training_type}</span>
            <span>{emptyText(record.duration_minutes, " 分钟")}</span>
            <span>{emptyText(record.weight, " kg")}</span>
          </div>

          <p className="summary-time">
            {formatDisplayDate(record.checkin_date)} · {submittedAt}
          </p>
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
