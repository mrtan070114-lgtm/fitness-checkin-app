import { redirect } from "next/navigation";
import { updateProfile } from "@/app/profile/edit/actions";
import { requireUser } from "@/lib/auth";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { SubmitButton } from "@/components/SubmitButton";
import { UserShell } from "@/components/UserShell";

type ProfileEditPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProfileEditPage({ searchParams }: ProfileEditPageProps) {
  const { profile } = await requireUser();
  const params = searchParams ? await searchParams : {};

  if (profile.role === "admin") {
    redirect("/admin");
  }

  return (
    <UserShell profile={profile} title="编辑个人资料" subtitle="修改你的头像和昵称" showBackButton>
      {typeof params.error === "string" ? <p className="alert error">{params.error}</p> : null}

      <form action={updateProfile} className="checkin-form-stack" encType="multipart/form-data">
        <section className="form-card form-section">
          <div className="section-heading">
            <p className="eyebrow">当前头像</p>
            <h2>头像预览</h2>
          </div>

          <div className="avatar-preview-row">
            <ProfileAvatar profile={profile} size="xl" />
            <div>
              <p className="muted">支持 JPG、PNG、WEBP，头像不能超过 2MB。</p>
            </div>
          </div>

          <label>
            上传头像
            <input accept="image/jpeg,image/png,image/webp" name="avatar" type="file" />
          </label>
        </section>

        <section className="form-card form-section">
          <div className="section-heading">
            <p className="eyebrow">昵称</p>
            <h2>别人会看到这个名字</h2>
          </div>

          <label>
            昵称
            <input defaultValue={profile.username} maxLength={20} minLength={1} name="display_name" placeholder="请输入昵称" required />
          </label>
        </section>

        <section className="submit-panel">
          <SubmitButton pendingText="保存中...">保存资料</SubmitButton>
          <p className="form-note">只会更新头像和昵称，不会修改邮箱、角色、绑定码或绑定关系。</p>
        </section>
      </form>
    </UserShell>
  );
}
