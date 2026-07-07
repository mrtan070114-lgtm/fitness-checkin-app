import { APP_TIME_ZONE } from "@/lib/constants";

const DATE_PARTS = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

export function getDateInTimeZone(date = new Date(), timeZone = APP_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("无法格式化日期");
  }

  return `${year}-${month}-${day}`;
}

export function getTodayDate() {
  return getDateInTimeZone(new Date(), APP_TIME_ZONE);
}

export function addDays(dateString: string, days: number) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return DATE_PARTS.format(date);
}

export function getMonthRange(dateString: string) {
  const [year, month] = dateString.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return {
    start: `${year}-${String(month).padStart(2, "0")}-01`,
    end: `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
  };
}

export function calculateStreak(checkinDates: string[], today: string) {
  const dateSet = new Set(checkinDates.filter((date) => date <= today));
  let cursor = dateSet.has(today) ? today : addDays(today, -1);
  let streak = 0;

  while (dateSet.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

export function formatDisplayDate(dateString: string) {
  const [year, month, day] = dateString.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}
