import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckinInteractions } from "@/components/CheckinInteractions";
import { RecordCard } from "@/components/RecordCard";
import { UserShell } from "@/components/UserShell";
import { requireUser } from "@/lib/auth";
import { fetchRecordInteractions } from "@/lib/interactions";
import { fetchProfileById } from "@/lib/profiles";
import type { Checkin, Profile } from "@/types/database";

type RecordDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RecordDetailPage({ params }: RecordDetailPageProps) {
  const { id } = await params;
  const { user, profile, supabase } = await requireUser();

  if (profile.role === "admin") {
    redirect(`/admin/checkins/${id}`);
  }

  const { data } = await supabase.from("checkins").select("*").eq("id", id).maybeSingle();

  if (!data) {
    notFound();
  }

  const record = data as Checkin;
  const isOwnRecord = record.user_id === user.id;
  const isPartnerRecord = Boolean(profile.bound_user_id && record.user_id === profile.bound_user_id);

  if (!isOwnRecord && !isPartnerRecord) {
    notFound();
  }

  let owner: Profile | null = null;
  if (!isOwnRecord) {
    const { data: partner } = await fetchProfileById(supabase, record.user_id);
    owner = partner as Profile | null;
  }
  const returnPath = `/records/${record.id}`;
  const interactions = await fetchRecordInteractions(supabase, record.id, user.id);

  return (
    <UserShell profile={profile} title="记录详情" subtitle="完整运动记录">
      <div className="button-row">
        <Link className="ghost-button" href={isOwnRecord ? "/records" : "/partner"}>
          返回记录
        </Link>
      </div>

      <RecordCard owner={owner} record={record} />
      <CheckinInteractions
        checkinId={record.id}
        currentUserId={user.id}
        returnPath={returnPath}
        likeCount={interactions.likeCount}
        likedByMe={interactions.likedByMe}
        comments={interactions.comments}
      />
    </UserShell>
  );
}
