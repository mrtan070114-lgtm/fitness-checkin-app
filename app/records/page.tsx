import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { fetchRecentCheckins, RECORD_LIST_LIMIT, type CheckinSummary } from "@/lib/checkins";
import { getFriendlySupabaseError } from "@/lib/errors";
import { fetchInteractionCounts } from "@/lib/interactions";
import { EmptyState } from "@/components/EmptyState";
import { RecordSummaryCard } from "@/components/RecordSummaryCard";
import { UserShell } from "@/components/UserShell";

type RecordsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  const { user, profile, supabase } = await requireUser();
  const params = searchParams ? await searchParams : {};

  if (profile.role === "admin") {
    redirect("/admin/dashboard");
  }

  const { data: records, error } = await fetchRecentCheckins(supabase, user.id, RECORD_LIST_LIMIT);
  const interactionCounts = await fetchInteractionCounts(supabase, (records || []).map((record) => record.id));
  const errorMessage = getFriendlySupabaseError(error);

  return (
    <UserShell profile={profile} title="我的记录" subtitle="按提交时间从新到旧">
      {params.created ? <p className="alert success">运动记录添加成功，记录已锁定。</p> : null}
      {errorMessage ? <p className="alert error">{errorMessage}</p> : null}
      {!records?.length ? (
        <EmptyState title={errorMessage ? "记录暂时无法加载" : "还没有运动记录"} description={errorMessage ? "请稍后重试，或检查网络连接。" : "添加运动记录后，记录会显示在这里。"} />
      ) : (
        <section className="record-list">
          {(records as CheckinSummary[]).map((record) => (
            <RecordSummaryCard detailHref={`/records/${record.id}`} record={{ ...record, ...interactionCounts[record.id] }} key={record.id} />
          ))}
        </section>
      )}
      {records && records.length >= RECORD_LIST_LIMIT ? <p className="form-note">默认显示最近 {RECORD_LIST_LIMIT} 条记录，后续可继续增加加载更多。</p> : null}
    </UserShell>
  );
}
