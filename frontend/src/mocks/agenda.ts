import type { AgendaSlot } from "../types";
import { professionalsMock } from "./profissionais";

const makeDate = (offset: number) => {
  const date = new Date("2026-05-20T12:00:00");
  date.setDate(date.getDate() + offset);
  return date;
};

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

const timeRange = (start: string, end: string) => {
  const [startHour] = start.split(":").map(Number);
  const [endHour] = end.split(":").map(Number);
  return Array.from({ length: Math.max(endHour - startHour, 0) }, (_, index) => {
    const hour = startHour + index;
    return `${String(hour).padStart(2, "0")}:00`;
  });
};

export const agendaMock: AgendaSlot[] = professionalsMock
  .filter((professional) => professional.role === "profissional")
  .flatMap((professional) =>
    Array.from({ length: 30 }, (_, dayIndex) => {
      const date = makeDate(dayIndex);
      const weekday = date.getDay();
      const rule = professional.workingHours.find((item) => item.weekday === weekday);
      if (!rule) return [];
      return timeRange(rule.start, rule.end).map((time, slotIndex) => ({
        id: `${professional.id}-${toDateKey(date)}-${time}`,
        professionalId: professional.id,
        date: toDateKey(date),
        time,
        available: (dayIndex + slotIndex) % 4 !== 0,
      }));
    }).flat(),
  );
