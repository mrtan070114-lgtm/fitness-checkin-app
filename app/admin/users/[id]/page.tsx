import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { BackButton } from "@/components/BackButton";
import { RecordSummaryCard } from "@/components/RecordSummaryCard";
import type { Checkin, Profile } from "@/types/database";

type AdminUserDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminUserDetailPage({ params }: AdminUserDetailPageProps) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const [{ data: user }, { data: records }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
    supabase.from("checkins").select("*").eq("user_id", id).order("created_at", { ascending: false })
  ]);

  if (!user) {
    notFound();
  }

  const profile = user as Profile;

  return (
    <div className="admin-stack">
      <section className="admin-heading admin-heading-with-back">
        <BackButton />
        <div className="admin-heading-content">
          <p className="eyebrow">用户详情</p>
          <h1>{profile.username}</h1>
          <p>{profile.email}</p>
        </div>
      </section>

      <section className="admin-panel profile-detail">
        <p>
          <strong>用户ID：</strong>
          <span className="mono">{profile.id}</span>
        </p>
        <p>
          <strong>角色：</strong>
          {profile.role}
        </p>
        <p>
          <strong>绑定码：</strong>
          <span className="mono">{profile.bind_code}</span>
        </p>
        <p>
          <strong>绑定对象：</strong>
          {profile.bound_user_id || "未绑定"}
        </p>
      </section>

      <section className="admin-panel">
        <div className="panel-title-row">
          <h2>该用户的打卡记录</h2>
        </div>
        {!records?.length ? (
          <p className="muted">暂无记录。</p>
        ) : (
          <div className="record-list compact-list">
            {(records as Checkin[]).map((record) => (
              <RecordSummaryCard
                detailHref={`/admin/checkins/${record.id}`}
                owner={profile}
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
