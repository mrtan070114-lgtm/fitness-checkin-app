import Link from "next/link";
import { deleteCheckin } from "@/app/admin/checkins/actions";
import { requireAdmin } from "@/lib/auth";
import { TRAINING_TYPES } from "@/lib/constants";
import { BackButton } from "@/components/BackButton";
import { RecordSummaryCard } from "@/components/RecordSummaryCard";
import { SubmitButton } from "@/components/SubmitButton";
import type { Checkin, Profile, TrainingType } from "@/types/database";

type AdminCheckinsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminCheckinsPage({ searchParams }: AdminCheckinsPageProps) {
  const { supabase } = await requireAdmin();
  const params = searchParams ? await searchParams : {};
  const username = typeof params.username === "string" ? params.username.trim() : "";
  const date = typeof params.date === "string" ? params.date : "";
  const trainingType = typeof params.training_type === "string" ? params.training_type : "";

  let userIds: string[] | null = null;

  if (username) {
    const { data: matchedUsers } = await supabase.from("profiles").select("id").ilike("username", `%${username}%`);
    userIds = (matchedUsers || []).map((user) => user.id);
  }

  let records: Checkin[] = [];

  if (!userIds || userIds.length > 0) {
    let query = supabase.from("checkins").select("*").order("created_at", { ascending: false });

    if (userIds) query = query.in("user_id", userIds);
    if (date) query = query.eq("checkin_date", date);
    if (TRAINING_TYPES.includes(trainingType as TrainingType)) query = query.eq("training_type", trainingType as TrainingType);

    const { data } = await query;
    records = (data || []) as Checkin[];
  }

  const owners = await loadOwners(
    supabase,
    records.map((record) => record.user_id)
  );

  return (
    <div className="admin-stack">
      <section className="admin-heading admin-heading-with-back">
        <BackButton />
        <div className="admin-heading-content">
          <p className="eyebrow">记录管理</p>
          <h1>所有打卡记录</h1>
        </div>
      </section>

      {params.deleted ? <p className="alert success">记录已删除。</p> : null}
      {params.updated ? <p className="alert success">记录已更新。</p> : null}
      {typeof params.error === "string" ? <p className="alert error">{params.error}</p> : null}

      <form className="filter-bar">
        <label>
          用户名
          <input defaultValue={username} name="username" placeholder="按用户名筛选" />
        </label>
        <label>
          日期
          <input defaultValue={date} name="date" type="date" />
        </label>
        <label>
          训练类型
          <select defaultValue={trainingType} name="training_type">
            <option value="">全部</option>
            {TRAINING_TYPES.map((type) => (
              <option value={type} key={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <button className="primary-button compact" type="submit">
          筛选
        </button>
        <Link className="ghost-button compact" href="/admin/checkins">
          重置
        </Link>
      </form>

      {!records.length ? (
        <section className="admin-panel">
          <p className="muted">没有符合条件的记录。</p>
        </section>
      ) : (
        <section className="record-list compact-list">
          {records.map((record) => (
            <RecordSummaryCard
              adminActions={
                <>
                  <Link className="secondary-button compact" href={`/admin/checkins/${record.id}/edit`}>
                    编辑
                  </Link>
                  <form action={deleteCheckin}>
                    <input name="id" type="hidden" value={record.id} />
                    <SubmitButton className="danger-button compact" pendingText="删除中...">
                      删除
                    </SubmitButton>
                  </form>
                </>
              }
              detailHref={`/admin/checkins/${record.id}`}
              owner={owners.get(record.user_id)}
              record={record}
              key={record.id}
            />
          ))}
        </section>
      )}
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
