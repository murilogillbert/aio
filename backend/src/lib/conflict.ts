import { prisma } from "../db.js";
import { combineIso, dateOnly, fromMinutes, rangesOverlap, toMinutes } from "./datetime.js";

export const hasConflict = async (params: {
  professionalId: string;
  dateStr: string;
  time: string;
  durationMinutes: number;
  roomId?: string | null;
  equipmentIds?: string[];
  excludeAppointmentId?: string;
}): Promise<boolean> => {
  const date = dateOnly(params.dateStr);
  const newStart = toMinutes(params.time);
  const newEnd = newStart + params.durationMinutes;

  const orConditions: object[] = [{ professionalId: params.professionalId }];
  if (params.roomId) orConditions.push({ roomId: params.roomId });
  if (params.equipmentIds?.length) {
    orConditions.push({ equipmentsUsed: { some: { equipmentId: { in: params.equipmentIds } } } });
  }

  const sameDayAppointments = await prisma.appointment.findMany({
    where: {
      date,
      status: { not: "Cancelado" },
      ...(params.excludeAppointmentId ? { id: { not: params.excludeAppointmentId } } : {}),
      OR: orConditions,
    },
    include: { service: true },
  });

  for (const appointment of sameDayAppointments) {
    const start = toMinutes(appointment.time);
    const end = start + appointment.service.durationMinutes;
    if (rangesOverlap(newStart, newEnd, start, end)) return true;
  }

  const blocks = await prisma.professionalBlock.findMany({ where: { professionalId: params.professionalId } });
  const newStartDate = new Date(combineIso(params.dateStr, params.time));
  const newEndDate = new Date(combineIso(params.dateStr, fromMinutes(newEnd)));
  for (const block of blocks) {
    if (newStartDate < block.endAt && block.startAt < newEndDate) return true;
  }

  return false;
};
