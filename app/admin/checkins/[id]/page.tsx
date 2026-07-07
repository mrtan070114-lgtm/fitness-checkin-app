import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteCheckin } from "@/app/admin/checkins/actions";
import { CheckinInteractions } from "@/components/CheckinInteractions";
import { RecordCard } from "@/components/RecordCard";
import { SubmitButton } from "@/components/SubmitButton";
import { requireAdmin } from "@/lib/auth";
import { fetchRecordInteractions } from "@/lib/interactions";
import type { Checkin, Profile } from "@/types/database";

type AdminCheckinDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminCheckinDetailPage({ params }: AdminCheckinDetailPageProps) {
  const { id } = await params;
  const { user, supabase } = await requireAdmin();
  const { data } = await supabase.from("checkins").select("*").eq("id", id).maybeSingle();

  if (!data) {
    notFound();
  }

  const record = data as Checkin;
  const { data: owner } = await supabase.from("profiles").select("*").eq("id", record.user_id).maybeSingle();
  const profile = owner as Profile | null;
  const interactions = await fetchRecordInteractions(supabase, record.id, user.id);

  return (
    <div className="admin-stack">
      <section className="admin-heading">
        <p className="eyebrow">记录详情</p>
        <h1>{profile?.username || "用户"} 的运动记录</h1>
      </section>

      <div className="button-row">
        <Link className="ghost-button" href="/admin/checkins">
          返回记录
        </Link>
        <Link className="secondary-button" href={`/admin/checkins/${record.id}/edit`}>
          编辑记录
        </Link>
      </div>

      <RecordCard
        adminActions={
          <>
            <Link className="secondary-button compact" href={`/admin/checkins/${record.id}/edit`}>
              编辑记录
            </Link>
            <form action={deleteCheckin}>
              <input name="id" type="hidden" value={record.id} />
              <SubmitButton className="danger-button compact" pendingText="删除中...">
                删除
              </SubmitButton>
            </form>
          </>
        }
        owner={profile}
        record={record}
      />
      <CheckinInteractions
        allowDeleteAll
        allowNewInteractions={false}
        checkinId={record.id}
        currentUserId={user.id}
        returnPath={`/admin/checkins/${record.id}`}
        likeCount={interactions.likeCount}
        likedByMe={interactions.likedByMe}
        comments={interactions.comments}
      />
    </div>
  );
}
