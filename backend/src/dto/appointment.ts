import { prisma } from "../db.js";
import { addMinutesToTime, combineIso, dateOnlyString } from "../lib/datetime.js";

export const appointmentInclude = {
  patient: { include: { user: true } },
  dependent: true,
  professional: true,
  service: true,
  room: true,
  plan: true,
  payment: true,
} as const;

type AppointmentWithRelations = NonNullable<
  Awaited<ReturnType<typeof prisma.appointment.findFirst<{ include: typeof appointmentInclude }>>>
>;

export const toAppointmentRich = (appointment: AppointmentWithRelations) => {
  const dateStr = dateOnlyString(appointment.date);
  const endTime = addMinutesToTime(appointment.time, appointment.service.durationMinutes);
  return {
    id: appointment.id,
    patientId: appointment.patientId,
    patientName: appointment.patient.user.fullName,
    dependentId: appointment.dependentId ?? null,
    dependentName: appointment.dependent?.fullName ?? null,
    professionalId: appointment.professionalId,
    professionalName: appointment.professional.name,
    serviceId: appointment.serviceId,
    serviceName: appointment.service.name,
    roomId: appointment.roomId,
    roomName: appointment.room?.name ?? null,
    planId: appointment.planId,
    startTime: combineIso(dateStr, appointment.time),
    endTime: combineIso(dateStr, endTime),
    status: appointment.status,
    patientConfirmation: appointment.patientConfirmation,
    appointmentType: appointment.type,
    cancellationSource: appointment.cancellationSource ?? null,
    recurrenceGroupId: appointment.recurrenceGroupId ?? null,
    notes: appointment.notes,
    serviceColor: appointment.service.color,
    paymentStatus: appointment.payment ? "PAID" : null,
    paymentAmount: appointment.payment ? Number(appointment.payment.grossAmount) : null,
  };
};

export const findAppointmentRich = async (id: string) => {
  const appointment = await prisma.appointment.findUnique({ where: { id }, include: appointmentInclude });
  return appointment ? toAppointmentRich(appointment) : null;
};
