export type PeriodRange = { days: number; start: Date; end: Date };

const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

export const parsePeriodDays = (periodo?: string | null): number => {
  switch ((periodo ?? "30d").toLowerCase()) {
    case "hoje":
    case "1d":
      return 1;
    case "7d":
      return 7;
    case "3m":
    case "90d":
      return 90;
    case "12m":
      return 365;
    case "30d":
    default:
      return 30;
  }
};

export const getPeriodRange = (periodo?: string | null): PeriodRange => {
  const days = parsePeriodDays(periodo);
  const end = startOfDay(new Date());
  end.setDate(end.getDate() + 1);
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  return { days, start, end };
};

export const getPreviousRange = (range: PeriodRange): PeriodRange => {
  const end = new Date(range.start);
  const start = new Date(range.start);
  start.setDate(start.getDate() - range.days);
  return { days: range.days, start, end };
};

export const trend = (previous: number, current: number): number => {
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100 * 100) / 100;
};
