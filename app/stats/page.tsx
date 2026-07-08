import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { addDays, calculateStreak, getMonthRange, getTodayDate, getWeekRange } from "@/lib/dates";
import { WeightTrendChart } from "@/components/WeightTrendChart";
import { UserShell } from "@/components/UserShell";
import type { Checkin, TrainingType } from "@/types/database";

type WeightPoint = {
  date: string;
  weight: number;
};

const TRAINING_ORDER: TrainingType[] = ["腹", "胸", "背", "腿", "肩", "手臂", "有氧"];

function getWeightPoints(records: Pick<Checkin, "checkin_date" | "weight" | "created_at">[]) {
  const latestByDate = new Map<string, WeightPoint & { created_at: string }>();

  for (const record of records) {
    if (record.weight === null) continue;
    const existing = latestByDate.get(record.checkin_date);
    if (!existing || record.created_at > existing.created_at) {
      latestByDate.set(record.checkin_date, {
        date: record.checkin_date,
        weight: Number(record.weight),
        created_at: record.created_at
      });
    }
  }

  return Array.from(latestByDate.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(({ date, weight }) => ({ date, weight }));
}

function formatChange(points: WeightPoint[]) {
  if (points.length < 2) return "数据不足";
  const change = Number((points[points.length - 1].weight - points[0].weight).toFixed(1));
  return `${change > 0 ? "+" : ""}${change} kg`;
}

export default async function StatsPage() {
  const { user, profile, supabase } = await requireUser();

  if (profile.role === "admin") {
    redirect("/admin");
  }

  const today = getTodayDate();
  const since = addDays(today, -365);
  const weekRange = getWeekRange(today);
  const monthRange = getMonthRange(today);

  const { data } = await supabase
    .from("checkins")
    .select("checkin_date,training_type,duration_minutes,weight,created_at")
    .eq("user_id", user.id)
    .gte("checkin_date", since)
    .lte("checkin_date", today)
    .order("created_at", { ascending: true });

  const records = (data || []) as Pick<Checkin, "checkin_date" | "training_type" | "duration_minutes" | "weight" | "created_at">[];
  const weekRecords = records.filter((record) => record.checkin_date >= weekRange.start && record.checkin_date <= weekRange.end);
  const monthRecords = records.filter((record) => record.checkin_date >= monthRange.start && record.checkin_date <= monthRange.end);
  const totalMinutes = records.reduce((total, record) => total + (record.duration_minutes || 0), 0);
  const averageDuration = records.length ? Math.round(totalMinutes / records.length) : 0;
  const streak = calculateStreak(records.map((record) => record.checkin_date), today);
  const weightPoints = getWeightPoints(records);
  const weights = weightPoints.map((point) => point.weight);
  const typeCounts = TRAINING_ORDER.map((type) => ({
    type,
    count: records.filter((record) => record.training_type === type).length
  })).filter((item) => item.count > 0);
  const maxTypeCount = Math.max(1, ...typeCounts.map((item) => item.count));

  return (
    <UserShell profile={profile} title="数据统计" subtitle="体重趋势和训练表现" showBackButton>
      <section className="info-card rich-card">
        <p className="eyebrow">体重变化曲线</p>
        <WeightTrendChart points={weightPoints} />
        {weightPoints.length < 2 ? <p className="muted">记录更多体重后即可生成趋势图</p> : null}
        <div className="metric-grid">
          <article className="mini-stat"><span>最近体重</span><strong>{weights.length ? `${weights[weights.length - 1]} kg` : "暂无"}</strong></article>
          <article className="mini-stat"><span>最高体重</span><strong>{weights.length ? `${Math.max(...weights)} kg` : "暂无"}</strong></article>
          <article className="mini-stat"><span>最低体重</span><strong>{weights.length ? `${Math.min(...weights)} kg` : "暂无"}</strong></article>
          <article className="mini-stat"><span>相比第一次</span><strong>{formatChange(weightPoints)}</strong></article>
        </div>
      </section>

      <section className="info-card rich-card">
        <p className="eyebrow">周/月运动统计</p>
        <div className="metric-grid">
          <article className="mini-stat"><span>本周运动次数</span><strong>{weekRecords.length} 次</strong></article>
          <article className="mini-stat"><span>本周累计时长</span><strong>{weekRecords.reduce((total, record) => total + (record.duration_minutes || 0), 0)} 分钟</strong></article>
          <article className="mini-stat"><span>本月运动次数</span><strong>{monthRecords.length} 次</strong></article>
          <article className="mini-stat"><span>本月累计时长</span><strong>{monthRecords.reduce((total, record) => total + (record.duration_minutes || 0), 0)} 分钟</strong></article>
          <article className="mini-stat"><span>连续运动天数</span><strong>{streak} 天</strong></article>
          <article className="mini-stat"><span>平均每次运动时长</span><strong>{averageDuration} 分钟</strong></article>
        </div>
      </section>

      <section className="info-card rich-card">
        <p className="eyebrow">训练类型占比</p>
        {typeCounts.length ? (
          <div className="progress-list">
            {typeCounts.map((item) => (
              <div key={item.type}>
                <span>{item.type} · {item.count} 次</span>
                <div className="progress-track"><span style={{ width: `${Math.round((item.count / maxTypeCount) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">添加运动记录后，这里会显示训练类型占比。</p>
        )}
      </section>
    </UserShell>
  );
}
