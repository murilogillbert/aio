import { addDays, dateOnly } from "./datetime.js";

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
    case "trimestre":
    case "3m":
    case "90d":
      return 90;
    case "6m":
    case "180d":
      return 180;
    case "12m":
      return 365;
    case "30d":
    default:
      return 30;
  }
};

// Períodos "de calendário" (mês/ano corrente) são tratados à parte de `parsePeriodDays`
// porque sua duração varia (28-31 dias, 365-366 dias).
const CALENDAR_PERIODS = new Set(["mes_atual", "ano_atual"]);

/**
 * `offset` desloca o período para trás em unidades do próprio período (1 = período anterior,
 * 2 = dois períodos atrás, ...) — usado pela navegação "períodos anteriores" das telas de métricas.
 */
export const getPeriodRange = (periodo?: string | null, offset = 0): PeriodRange => {
  const key = (periodo ?? "30d").toLowerCase();

  if (CALENDAR_PERIODS.has(key)) {
    const now = new Date();
    const start =
      key === "mes_atual" ? new Date(now.getFullYear(), now.getMonth() - offset, 1) : new Date(now.getFullYear() - offset, 0, 1);
    const end = key === "mes_atual" ? new Date(start.getFullYear(), start.getMonth() + 1, 1) : new Date(start.getFullYear() + 1, 0, 1);
    const days = Math.round((end.getTime() - start.getTime()) / 86_400_000);
    return { days, start, end };
  }

  const days = parsePeriodDays(key);
  const end = startOfDay(new Date());
  end.setDate(end.getDate() + 1 - days * offset);
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  return { days, start, end };
};

/**
 * Lê `start`/`end` ("YYYY-MM-DD", ambos inclusivos) de uma query string, se presentes, e monta
 * um PeriodRange customizado a partir deles — usado pelos filtros de data personalizada das
 * telas de métricas. Sem `start`/`end`, cai de volta em `getPeriodRange(periodo, offset)`.
 */
export const getRangeFromQuery = (query: { periodo?: string; offset?: string; start?: string; end?: string }): PeriodRange => {
  if (query.start && query.end) {
    const start = dateOnly(query.start);
    const end = dateOnly(addDays(query.end, 1));
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000));
    return { days, start, end };
  }
  return getPeriodRange(query.periodo, Number(query.offset ?? 0) || 0);
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
