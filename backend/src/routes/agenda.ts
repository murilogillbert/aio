import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { badRequest } from "../lib/httpError.js";
import { addDays, addMinutesToTime, dateOnly, dateOnlyString, toMinutes } from "../lib/datetime.js";
import { notifyAppointmentCreated } from "../lib/notifications.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const professionalId = typeof req.query.profissionalId === "string" ? req.query.profissionalId : undefined;
    const mes = typeof req.query.mes === "string" ? req.query.mes : undefined;

    const startDateStr = mes && /^\d{4}-\d{2}$/.test(mes) ? `${mes}-01` : dateOnlyString(new Date());
    const days = Array.from({ length: 30 }, (_, index) => addDays(startDateStr, index));
    const start = dateOnly(days[0]);
    const end = dateOnly(addDays(days[days.length - 1], 1));

    const schedules = await prisma.professionalSchedule.findMany({
      where: professionalId ? { professionalId } : undefined,
    });

    const appointments = await prisma.appointment.findMany({
      where: {
        date: { gte: start, lt: end },
        status: { not: "Cancelado" },
        ...(professionalId ? { professionalId } : {}),
      },
      select: { id: true, professionalId: true, date: true, time: true },
    });
    const occupied = new Map<string, string>();
    appointments.forEach((appointment) => {
      const key = `${appointment.professionalId}|${dateOnlyString(appointment.date)}|${appointment.time}`;
      occupied.set(key, appointment.id);
    });

    const slots = [];
    for (const dateStr of days) {
      const weekday = dateOnly(dateStr).getUTCDay();
      for (const schedule of schedules.filter((item) => item.weekday === weekday)) {
        let time = schedule.startTime;
        while (toMinutes(time) < toMinutes(schedule.endTime)) {
          const key = `${schedule.professionalId}|${dateStr}|${time}`;
          const appointmentId = occupied.get(key);
          slots.push({
            id: key,
            professionalId: schedule.professionalId,
            date: dateStr,
            time,
            available: !appointmentId,
            appointmentId,
          });
          time = addMinutesToTime(time, 60);
        }
      }
    }

    res.json(slots);
  }),
);

router.post(
  "/agendamentos",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = req.body as {
      serviceId?: string;
      professionalId?: string;
      date?: string;
      time?: string;
      patientTarget?: string;
      patientId?: string;
    };
    if (!body.serviceId || !body.professionalId || !body.date || !body.time) {
      throw badRequest("Informe serviço, profissional, data e horário.");
    }

    let patient = await prisma.patient.findUnique({ where: { userId: req.user!.id } });
    if (!patient && body.patientId) {
      patient = await prisma.patient.findUnique({ where: { id: body.patientId } });
    }
    if (!patient) throw badRequest("Paciente não encontrado.");

    const dependentId =
      body.patientTarget && body.patientTarget !== "self" ? body.patientTarget : null;

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        dependentId,
        professionalId: body.professionalId,
        serviceId: body.serviceId,
        date: dateOnly(body.date),
        time: body.time,
        status: "Agendado",
        statusLogs: { create: { status: "Agendado" } },
      },
    });

    await notifyAppointmentCreated(appointment.id);

    res.json({
      id: appointment.id,
      patientId: appointment.patientId,
      dependentId: appointment.dependentId ?? undefined,
      professionalId: appointment.professionalId,
      serviceId: appointment.serviceId,
      date: dateOnlyString(appointment.date),
      time: appointment.time,
      status: appointment.status.toLowerCase(),
    });
  }),
);

export default router;
