import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getTodayDate, formatDisplayDate } from "@/lib/dates";
import { CheckinForm } from "@/components/CheckinForm";
import { UserShell } from "@/components/UserShell";

type CheckinPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CheckinPage({ searchParams }: CheckinPageProps) {
  const { profile } = await requireUser();
  const params = searchParams ? await searchParams : {};

  if (profile.role === "admin") {
    redirect("/admin/dashboard");
  }

  const today = getTodayDate();

  return (
    <UserShell profile={profile} title="添加运动记录" subtitle="记录这一次训练">
      <section className="section-heading">
        <p className="eyebrow">日期自动生成</p>
        <h2>{formatDisplayDate(today)}</h2>
      </section>

      {typeof params.error === "string" ? <p className="alert error">{params.error}</p> : null}
      {params.created ? (
        <section className="success-panel">
          <p className="alert success">运动记录添加成功</p>
          <div className="success-actions">
            <Link className="secondary-button" href="/checkin">
              继续添加
            </Link>
            <Link className="primary-button" href="/records">
              查看记录
            </Link>
          </div>
        </section>
      ) : null}

      <CheckinForm />
    </UserShell>
  );
}
