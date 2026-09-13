import { badRequest } from "./httpError.js";

/**
 * Datas/horas são tratadas como "wall-clock" ingênuo (sem fuso), igual ao par
 * DateOnly/TimeOnly do backend original: `dateStr` é sempre "YYYY-MM-DD" e
 * `time` sempre "HH:mm". Nada aqui deve ser usado como instante real em UTC.
 */

export const splitIso = (iso: string): { dateStr: string; time: string } => {
  const match = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/.exec(iso);
  if (!match) throw badRequest(`Data/hora inválida: ${iso}`);
  return { dateStr: match[1], time: match[2] };
};

export const dateOnly = (dateStr: string): Date => new Date(`${dateStr}T00:00:00.000Z`);

export const dateOnlyString = (date: Date): string => date.toISOString().slice(0, 10);

export const combineIso = (dateStr: string, time: string): string => `${dateStr}T${time}:00.000Z`;

export const toMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export const fromMinutes = (minutes: number): string => {
  const wrapped = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const addMinutesToTime = (time: string, minutes: number): string => fromMinutes(toMinutes(time) + minutes);

export const rangesOverlap = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
  aStart < bEnd && bStart < aEnd;

export const addDays = (dateStr: string, days: number): string => {
  const date = dateOnly(dateStr);
  date.setUTCDate(date.getUTCDate() + days);
  return dateOnlyString(date);
};

/** Constrói um instante "naive" (trata a wall-clock recebida como se já fosse UTC), para poder comparar com bloqueios sem depender do fuso do processo. */
export const naiveDate = (iso: string): Date => {
  const { dateStr, time } = splitIso(iso);
  return new Date(combineIso(dateStr, time));
};

/** Como `naiveDate`, mas aceita também uma data pura "YYYY-MM-DD" (assume meia-noite). */
export const naiveDateLoose = (value: string): Date => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return dateOnly(value);
  return naiveDate(value);
};

