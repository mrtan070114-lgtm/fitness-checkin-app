import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getTodayDate, formatDisplayDate } from "@/lib/dates";
import { CheckinForm } from "@/components/CheckinForm";
import { UserShell } from "@/components/UserShell";
import { WeightLossCelebration } from "@/components/WeightLossCelebration";
import { parseWeightCelebration } from "@/lib/celebration";

type CheckinPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CheckinPage({ searchParams }: CheckinPageProps) {
  const { profile } = await requireUser();
  const params = searchParams ? await searchParams : {};

  if (profile.role === "admin") {
    redirect("/admin");
  }

  const today = getTodayDate();
  const celebration = parseWeightCelebration(params);

  return (
    <UserShell profile={profile} title="添加运动记录" subtitle="记录这一次训练">
      <section className="checkin-date-strip" aria-label="记录日期">
        <CalendarDays size={17} aria-hidden="true" />
        <span>今天 · {formatDisplayDate(today)}</span>
      </section>

      {typeof params.error === "string" ? <p className="alert error">{params.error}</p> : null}
      {params.created ? (
        <section className="success-panel checkin-success-panel">
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

      {celebration ? <WeightLossCelebration {...celebration} /> : null}

      <CheckinForm />
    </UserShell>
  );
}
