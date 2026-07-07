import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { EmptyState } from "@/components/EmptyState";
import { RecordSummaryCard } from "@/components/RecordSummaryCard";
import { UserShell } from "@/components/UserShell";
import type { Checkin } from "@/types/database";

type RecordsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  const { user, profile, supabase } = await requireUser();
  const params = searchParams ? await searchParams : {};

  if (profile.role === "admin") {
    redirect("/admin/dashboard");
  }

  const { data: records } = await supabase
    .from("checkins")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <UserShell profile={profile} title="我的记录" subtitle="按提交时间从新到旧">
      {params.created ? <p className="alert success">运动记录添加成功，记录已锁定。</p> : null}
      {!records?.length ? (
        <EmptyState title="还没有运动记录" description="添加运动记录后，记录会显示在这里。" />
      ) : (
        <section className="record-list">
          {(records as Checkin[]).map((record) => (
            <RecordSummaryCard detailHref={`/records/${record.id}`} record={record} key={record.id} />
          ))}
        </section>
      )}
    </UserShell>
  );
}
