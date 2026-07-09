import { APP_TIME_ZONE } from "@/lib/constants";

const DATE_PARTS = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

const DATE_TIME_PARTS = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

function getRequiredPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  const value = parts.find((part) => part.type === type)?.value;

  if (!value) {
    throw new Error("无法格式化日期");
  }

  return value;
}

export function getDateInTimeZone(date = new Date(), timeZone = APP_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const year = getRequiredPart(parts, "year");
  const month = getRequiredPart(parts, "month");
  const day = getRequiredPart(parts, "day");

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

export function getWeekRange(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = date.getUTCDay() || 7;
  const start = DATE_PARTS.format(new Date(Date.UTC(year, month - 1, day - dayOfWeek + 1)));
  const end = DATE_PARTS.format(new Date(Date.UTC(year, month - 1, day - dayOfWeek + 7)));

  return { start, end };
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

export function formatDateCN(dateString: string) {
  return formatDisplayDate(dateString);
}

export function formatWeekdayCN(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][weekday];
}

export function formatDateTimeCN(dateString: string) {
  const date = new Date(dateString);
  const parts = DATE_TIME_PARTS.formatToParts(date);
  const year = getRequiredPart(parts, "year");
  const month = getRequiredPart(parts, "month");
  const day = getRequiredPart(parts, "day");
  const hour = getRequiredPart(parts, "hour");
  const minute = getRequiredPart(parts, "minute");

  return `${year}年${Number(month)}月${Number(day)}日 ${hour}:${minute}`;
}
