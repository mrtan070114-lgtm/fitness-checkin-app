import { notFound } from "next/navigation";
import { updateCheckin } from "@/app/admin/checkins/actions";
import { BackButton } from "@/components/BackButton";
import { CheckinImage } from "@/components/CheckinImage";
import { requireAdmin } from "@/lib/auth";
import { MOODS, TRAINING_TYPES } from "@/lib/constants";
import { SubmitButton } from "@/components/SubmitButton";
import type { Checkin, Profile } from "@/types/database";

type AdminEditCheckinPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminEditCheckinPage({ params, searchParams }: AdminEditCheckinPageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const { supabase } = await requireAdmin();
  const { data: record } = await supabase.from("checkins").select("*").eq("id", id).maybeSingle();

  if (!record) {
    notFound();
  }

  const checkin = record as Checkin;
  const { data: owner } = await supabase.from("profiles").select("*").eq("id", checkin.user_id).maybeSingle();
  const profile = owner as Profile | null;

  return (
    <div className="admin-stack">
      <section className="admin-heading admin-heading-with-back">
        <BackButton />
        <div className="admin-heading-content">
          <p className="eyebrow">编辑记录</p>
          <h1>{profile?.username || "用户"} 的打卡记录</h1>
        </div>
      </section>

      {typeof query.error === "string" ? <p className="alert error">{query.error}</p> : null}

      <form action={updateCheckin} className="form-card admin-edit-form">
        <input name="id" type="hidden" value={checkin.id} />
        <label>
          本次运动名称
          <input defaultValue={checkin.session_title || ""} maxLength={80} name="session_title" placeholder="例如 早上跑步、晚上力量训练、胸部训练" />
        </label>

        <label>
          训练类型
          <select name="training_type" required defaultValue={checkin.training_type}>
            {TRAINING_TYPES.map((type) => (
              <option value={type} key={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <div className="form-grid two">
          <label>
            训练时长（分钟）
            <input defaultValue={checkin.duration_minutes ?? ""} inputMode="numeric" min="0" max="1440" name="duration_minutes" type="number" />
          </label>
          <label>
            今日体重（kg）
            <input defaultValue={checkin.weight ?? ""} inputMode="decimal" min="0" max="500" name="weight" step="0.1" type="number" />
          </label>
        </div>

        <label>
          心情状态
          <select name="mood" defaultValue={checkin.mood || ""}>
            <option value="">未填写</option>
            {MOODS.map((mood) => (
              <option value={mood} key={mood}>
                {mood}
              </option>
            ))}
          </select>
        </label>

        <label>
          饮食情况
          <textarea defaultValue={checkin.diet || ""} name="diet" rows={4} />
        </label>

        <label>
          备注
          <textarea defaultValue={checkin.note || ""} name="note" rows={4} />
        </label>

        {checkin.image_url ? (
          <CheckinImage className="edit-image-preview" imageUrl={checkin.image_url} alt="当前打卡图片" />
        ) : null}

        <label>
          更换图片
          <input accept="image/jpeg,image/png,image/webp,image/gif" name="image" type="file" />
        </label>

        <div className="button-row">
          <SubmitButton pendingText="保存中...">保存修改</SubmitButton>
        </div>
      </form>
    </div>
  );
}
