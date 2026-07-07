import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getTodayDate } from "@/lib/dates";
import { RecordSummaryCard } from "@/components/RecordSummaryCard";
import { StatCard } from "@/components/StatCard";
import type { Checkin, Profile } from "@/types/database";

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();
  const today = getTodayDate();

  const [{ count: userCount }, { count: recordCount }, { count: todayCount }, { data: recentRecords }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("checkins").select("id", { count: "exact", head: true }),
    supabase.from("checkins").select("id", { count: "exact", head: true }).eq("checkin_date", today),
    supabase.from("checkins").select("*").order("created_at", { ascending: false }).limit(5)
  ]);

  const owners = await loadOwners(
    supabase,
    ((recentRecords || []) as Checkin[]).map((record) => record.user_id)
  );

  return (
    <div className="admin-stack">
      <section className="admin-heading">
        <p className="eyebrow">管理员后台</p>
        <h1>总览</h1>
      </section>

      <section className="stats-grid admin">
        <StatCard label="用户总数" value={userCount || 0} tone="green" />
        <StatCard label="总运动记录数" value={recordCount || 0} tone="blue" />
        <StatCard label="今日运动记录数" value={todayCount || 0} tone="orange" />
      </section>

      <section className="admin-panel">
        <div className="panel-title-row">
          <h2>最近提交的记录</h2>
          <Link className="text-link" href="/admin/checkins">
            查看全部
          </Link>
        </div>
        {!recentRecords?.length ? (
          <p className="muted">暂无记录。</p>
        ) : (
          <div className="record-list compact-list">
            {(recentRecords as Checkin[]).map((record) => (
              <RecordSummaryCard
                detailHref={`/admin/checkins/${record.id}`}
                owner={owners.get(record.user_id)}
                record={record}
                key={record.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

async function loadOwners(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], ids: string[]) {
  const uniqueIds = Array.from(new Set(ids));
  const map = new Map<string, Profile>();

  if (!uniqueIds.length) return map;

  const { data } = await supabase.from("profiles").select("*").in("id", uniqueIds);
  (data as Profile[] | null)?.forEach((profile) => map.set(profile.id, profile));
  return map;
}
