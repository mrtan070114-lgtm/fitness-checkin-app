import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarCheck, ListFilter } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { fetchRecentCheckins, RECORD_LIST_LIMIT, type CheckinSummary } from "@/lib/checkins";
import { formatDisplayDate, getMonthRange, getTodayDate, getWeekRange } from "@/lib/dates";
import { getFriendlySupabaseError } from "@/lib/errors";
import { fetchInteractionCounts } from "@/lib/interactions";
import { EmptyState } from "@/components/EmptyState";
import { RecordSummaryCard } from "@/components/RecordSummaryCard";
import { UserShell } from "@/components/UserShell";

type RecordsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type RecordFilter = "all" | "today" | "week" | "month" | "custom";

const FILTER_ITEMS: { key: RecordFilter; label: string; href: string }[] = [
  { key: "all", label: "全部记录", href: "/records" },
  { key: "today", label: "今天", href: "/records?filter=today" },
  { key: "week", label: "本周", href: "/records?filter=week" },
  { key: "month", label: "本月", href: "/records?filter=month" }
];

function getParamValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isRecordFilter(value: string | undefined): value is RecordFilter {
  return value === "today" || value === "week" || value === "month" || value === "custom" || value === "all";
}

function isDateValue(value: string | undefined) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function getRecordDateFilter(params: Record<string, string | string[] | undefined>, today: string) {
  const filterParam = getParamValue(params.filter);
  const activeFilter = isRecordFilter(filterParam) ? filterParam : "all";
  const selectedDate = isDateValue(getParamValue(params.date)) ? getParamValue(params.date)! : today;

  if (activeFilter === "today") {
    return {
      activeFilter,
      selectedDate,
      startDate: today,
      endDate: today,
      title: "今天的记录"
    };
  }

  if (activeFilter === "week") {
    const range = getWeekRange(today);
    return {
      activeFilter,
      selectedDate,
      startDate: range.start,
      endDate: range.end,
      title: "本周记录"
    };
  }

  if (activeFilter === "month") {
    const range = getMonthRange(today);
    return {
      activeFilter,
      selectedDate,
      startDate: range.start,
      endDate: range.end,
      title: "本月记录"
    };
  }

  if (activeFilter === "custom") {
    return {
      activeFilter,
      selectedDate,
      startDate: selectedDate,
      endDate: selectedDate,
      title: formatDisplayDate(selectedDate)
    };
  }

  return {
    activeFilter,
    selectedDate,
    startDate: undefined,
    endDate: undefined,
    title: "全部记录"
  };
}

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  const { user, profile, supabase } = await requireUser();
  const params = searchParams ? await searchParams : {};

  if (profile.role === "admin") {
    redirect("/admin/dashboard");
  }

  const today = getTodayDate();
  const dateFilter = getRecordDateFilter(params, today);
  const { data: records, error } = await fetchRecentCheckins(supabase, user.id, RECORD_LIST_LIMIT, {
    startDate: dateFilter.startDate,
    endDate: dateFilter.endDate
  });
  const interactionCounts = await fetchInteractionCounts(supabase, (records || []).map((record) => record.id));
  const errorMessage = getFriendlySupabaseError(error);
  const emptyTitle = dateFilter.activeFilter === "all" ? "还没有运动记录" : "这个日期还没有运动记录";
  const emptyDescription = dateFilter.activeFilter === "all"
    ? "添加运动记录后，记录会显示在这里。"
    : "换个日期或查看全部记录试试。";

  return (
    <UserShell profile={profile} title="我的记录" subtitle="按提交时间从新到旧">
      {params.created ? <p className="alert success">运动记录添加成功，记录已锁定。</p> : null}
      {errorMessage ? <p className="alert error">{errorMessage}</p> : null}

      <section className="records-overview-card">
        <div className="records-overview-icon">
          <CalendarCheck size={22} aria-hidden="true" />
        </div>
        <div>
          <p className="eyebrow">记录列表</p>
          <h2>{dateFilter.title}</h2>
          <p>共显示 {records?.length || 0} 条，点击卡片查看饮食、备注、图片和互动。</p>
        </div>
      </section>

      <section className="records-filter-card" aria-label="记录筛选">
        <div className="records-filter-heading">
          <div>
            <p className="eyebrow">筛选记录</p>
            <h2><ListFilter size={18} aria-hidden="true" /> 选择日期范围</h2>
          </div>
          <span>{records?.length || 0} 条</span>
        </div>

        <div className="records-filter-scroll" role="list" aria-label="快捷日期筛选">
          {FILTER_ITEMS.map((item) => {
            const active = dateFilter.activeFilter === item.key;
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={active ? "records-filter-chip active" : "records-filter-chip"}
                href={item.href}
                key={item.key}
                role="listitem"
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <form action="/records" className="records-date-form" method="get">
          <input name="filter" type="hidden" value="custom" />
          <label>
            自定义日期
            <input defaultValue={dateFilter.selectedDate} name="date" type="date" />
          </label>
          <button className="secondary-button compact" type="submit">
            查看
          </button>
        </form>
      </section>

      {!records?.length ? (
        <EmptyState title={errorMessage ? "记录暂时无法加载" : emptyTitle} description={errorMessage ? "请稍后重试，或检查网络连接。" : emptyDescription} />
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
