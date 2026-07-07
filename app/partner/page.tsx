import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { fetchRecentCheckins, RECORD_LIST_LIMIT, type CheckinSummary } from "@/lib/checkins";
import { getTodayDate } from "@/lib/dates";
import { getFriendlySupabaseError } from "@/lib/errors";
import { fetchInteractionCounts } from "@/lib/interactions";
import { fetchProfileById } from "@/lib/profiles";
import { EmptyState } from "@/components/EmptyState";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { RecordSummaryCard } from "@/components/RecordSummaryCard";
import { UserShell } from "@/components/UserShell";
import type { Profile } from "@/types/database";

export default async function PartnerPage() {
  const { profile, supabase } = await requireUser();
  const today = getTodayDate();

  if (profile.role === "admin") {
    redirect("/admin/dashboard");
  }

  if (!profile.bound_user_id) {
    return (
      <UserShell profile={profile} title="对方记录" subtitle="查看监督对象的训练">
        <EmptyState
          title="还没有绑定监督对象"
          description="绑定成功后，你可以查看对方所有打卡记录，但不能修改或删除。"
          action={
            <Link className="primary-button" href="/bind">
              去绑定
            </Link>
          }
        />
      </UserShell>
    );
  }

  const [{ data: partner, error: partnerError }, { data: records, error: recordsError }, { data: todayRecords, error: todayError }] = await Promise.all([
    fetchProfileById(supabase, profile.bound_user_id),
    fetchRecentCheckins(supabase, profile.bound_user_id, RECORD_LIST_LIMIT),
    supabase
      .from("checkins")
      .select("duration_minutes")
      .eq("user_id", profile.bound_user_id)
      .eq("checkin_date", today)
      .order("created_at", { ascending: false })
  ]);

  const partnerProfile = partner as Profile | null;
  const interactionCounts = await fetchInteractionCounts(supabase, (records || []).map((record) => record.id));
  const errorMessage = getFriendlySupabaseError(partnerError || recordsError || todayError);
  const partnerTodayCount = todayRecords?.length || 0;
  const partnerTodayDuration = (todayRecords || []).reduce((total, record) => total + (record.duration_minutes || 0), 0);

  return (
    <UserShell profile={profile} title="对方记录" subtitle="查看监督对象的训练">
      {errorMessage ? <p className="alert error">{errorMessage}</p> : null}

      <section className="partner-profile-card">
        <ProfileAvatar profile={partnerProfile || { username: "对方", avatar_url: null }} size="lg" />
        <div>
          <p className="eyebrow">当前绑定对象</p>
          <h2>{partnerProfile?.username || "绑定对象"}</h2>
          <p className="muted">{partnerProfile?.email || "暂无邮箱"}</p>
        </div>
        <dl className="partner-metrics">
          <div>
            <dt>今日运动次数</dt>
            <dd>{partnerTodayCount} 次</dd>
          </div>
          <div>
            <dt>今日累计时长</dt>
            <dd>{partnerTodayDuration} 分钟</dd>
          </div>
        </dl>
      </section>

      {!records?.length ? (
        <EmptyState title={errorMessage ? "对方记录暂时无法加载" : "对方还没有记录"} description={errorMessage ? "请稍后重试，或检查网络连接。" : "对方提交打卡后，你会在这里看到完整记录。"} />
      ) : (
        <section className="record-list">
          {(records as CheckinSummary[]).map((record) => (
            <RecordSummaryCard detailHref={`/records/${record.id}`} owner={partnerProfile} record={{ ...record, ...interactionCounts[record.id] }} key={record.id} />
          ))}
        </section>
      )}
      {records && records.length >= RECORD_LIST_LIMIT ? <p className="form-note">默认显示最近 {RECORD_LIST_LIMIT} 条对方记录。</p> : null}
    </UserShell>
  );
}
