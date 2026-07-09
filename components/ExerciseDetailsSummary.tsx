import { formatExerciseDetail, formatExerciseDetailsCompact, normalizeExerciseDetails } from "@/lib/exerciseDetails";
import type { ExerciseDetail } from "@/types/database";

type ExerciseDetailsSummaryProps = {
  details: ExerciseDetail[] | null | undefined;
  names?: string[] | null;
  compact?: boolean;
};

export function ExerciseDetailsSummary({ details, names, compact = false }: ExerciseDetailsSummaryProps) {
  const normalized = normalizeExerciseDetails(details, names);

  if (compact) {
    return <p className="exercise-summary-compact">{formatExerciseDetailsCompact(details, names)}</p>;
  }

  if (!normalized.length) {
    return <p className="muted">未填写训练计数</p>;
  }

  return (
    <div className="exercise-summary-list">
      {normalized.map((detail) => (
        <div className="exercise-summary-item" key={detail.name}>
          <span>{formatExerciseDetail(detail)}</span>
          {detail.note ? <small>{detail.note}</small> : null}
        </div>
      ))}
    </div>
  );
}
