import { randomUUID } from "node:crypto";
import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { badRequest, notFound } from "../lib/httpError.js";
import { addDays, dateOnly, splitIso } from "../lib/datetime.js";
import { hasConflict } from "../lib/conflict.js";
import { appointmentInclude, findAppointmentRich, toAppointmentRich } from "../dto/appointment.js";

const router = Router();
router.use(requireAuth, requireRole("admin", "recepcao", "profissional"));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { start, end, professionalId } = req.query as { start?: string; end?: string; professionalId?: string };
    if (!start || !end) throw badRequest("Informe start e end.");

    const startDate = dateOnly(start.slice(0, 10));
    const endDate = dateOnly(addDays(end.slice(0, 10), 1));

    const appointments = await prisma.appointment.findMany({
      where: {
        date: { gte: startDate, lt: endDate },
        ...(professionalId ? { professionalId } : {}),
      },
      include: appointmentInclude,
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });
    res.json(appointments.map(toAppointmentRich));
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const rich = await findAppointmentRich(req.params.id);
    if (!rich) throw notFound("Agendamento não encontrado.");
    res.json(rich);
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const body = req.body as {
      patientId?: string;
      professionalId?: string;
      serviceId?: string;
      roomId?: string | null;
      planId?: string | null;
      startTime?: string;
      durationMinutes?: number;
      notes?: string;
      appointmentType?: "Presencial" | "Online";
      equipmentIds?: string[];
      recurrence?: { weekly: boolean; durationDays: number };
    };
    if (!body.patientId || !body.professionalId || !body.serviceId || !body.startTime) {
      throw badRequest("Informe paciente, profissional, serviço e horário.");
    }

    const patient =
      (await prisma.patient.findUnique({ where: { id: body.patientId } })) ??
      (await prisma.patient.findUnique({ where: { userId: body.patientId } }));
    if (!patient) throw badRequest("Paciente não encontrado.");

    const service = await prisma.service.findUnique({ where: { id: body.serviceId } });
    if (!service) throw badRequest("Serviço não encontrado.");

    const duration = body.durationMinutes && body.durationMinutes >= 5 ? body.durationMinutes : service.durationMinutes;
    const { dateStr, time } = splitIso(body.startTime);

    const isRecurring = Boolean(body.recurrence?.weekly && body.recurrence.durationDays > 0);
    const dates: string[] = [];
    if (isRecurring) {
      for (let offset = 0; offset <= body.recurrence!.durationDays; offset += 7) {
        dates.push(addDays(dateStr, offset));
      }
    } else {
      dates.push(dateStr);
    }

    const recurrenceGroupId = isRecurring ? randomUUID() : null;
    const skippedDates: string[] = [];
    let createdId: string | null = null;

    for (const currentDate of dates) {
      const conflict = await hasConflict({
        professionalId: body.professionalId,
        dateStr: currentDate,
        time,
        durationMinutes: duration,
        roomId: body.roomId,
        equipmentIds: body.equipmentIds,
      });
      if (conflict) {
        skippedDates.push(currentDate);
        continue;
      }

      const appointment = await prisma.appointment.create({
        data: {
          patientId: patient.id,
          professionalId: body.professionalId,
          serviceId: body.serviceId,
          roomId: body.roomId ?? null,
          planId: body.planId ?? null,
          date: dateOnly(currentDate),
          time,
          status: "Agendado",
          type: body.appointmentType ?? "Presencial",
          notes: body.notes ?? "",
          recurrenceGroupId,
          statusLogs: { create: { status: "Agendado" } },
          equipmentsUsed: body.equipmentIds?.length
            ? { create: body.equipmentIds.map((equipmentId) => ({ equipmentId })) }
            : undefined,
        },
      });
      await prisma.movementLog.create({
        data: { eventType: "NEW_APPOINTMENT", description: `Agendamento criado para ${currentDate} ${time}` },
      });
      createdId = appointment.id;
    }

    const created = dates.length - skippedDates.length;
    if (dates.length === 1 && skippedDates.length === 0 && createdId) {
      res.json(await findAppointmentRich(createdId));
      return;
    }

    res.json({
      created,
      skipped: skippedDates.length,
      skippedDates,
      message: `${created} agendamento(s) criado(s), ${skippedDates.length} pulado(s) por conflito de horário.`,
    });
  }),
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound("Agendamento não encontrado.");

    const body = req.body as {
      patientId?: string;
      professionalId?: string;
      serviceId?: string;
      roomId?: string | null;
      planId?: string | null;
      startTime?: string;
      notes?: string;
      appointmentType?: "Presencial" | "Online";
    };

    const data: Record<string, unknown> = {};
    if (body.patientId !== undefined) data.patientId = body.patientId;
    if (body.professionalId !== undefined) data.professionalId = body.professionalId;
    if (body.serviceId !== undefined) data.serviceId = body.serviceId;
    if (body.roomId !== undefined) data.roomId = body.roomId;
    if (body.planId !== undefined) data.planId = body.planId;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.appointmentType !== undefined) data.type = body.appointmentType;
    if (body.startTime !== undefined) {
      const { dateStr, time } = splitIso(body.startTime);
      data.date = dateOnly(dateStr);
      data.time = time;
    }

    await prisma.appointment.update({ where: { id: existing.id }, data });
    res.json(await findAppointmentRich(existing.id));
  }),
);

router.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const { status, cancellationSource } = req.body as { status?: string; cancellationSource?: string };
    if (!status) throw badRequest("Informe o status.");

    const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound("Agendamento não encontrado.");

    const data: Record<string, unknown> = { status };
    if (status === "Cancelado") {
      data.cancelledAt = new Date();
      data.cancellationSource = cancellationSource ?? "Sistema";
    }

    await prisma.appointment.update({
      where: { id: existing.id },
      data: { ...data, statusLogs: { create: { status: status as never } } },
    });

    if (status === "Cancelado") {
      await prisma.movementLog.create({
        data: { eventType: "APPOINTMENT_CANCELLED", description: `Agendamento ${existing.id} cancelado` },
      });
    }

    res.json(await findAppointmentRich(existing.id));
  }),
);

router.patch(
  "/:id/confirmacao",
  asyncHandler(async (req, res) => {
    const { value } = req.body as { value?: string };
    if (!value) throw badRequest("Informe o valor da confirmação.");

    const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound("Agendamento não encontrado.");

    await prisma.appointment.update({ where: { id: existing.id }, data: { patientConfirmation: value as never } });
    res.json(await findAppointmentRich(existing.id));
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound("Agendamento não encontrado.");
    await prisma.appointment.delete({ where: { id: existing.id } });
    res.status(204).send();
  }),
);

router.delete(
  "/:id/futuros",
  asyncHandler(async (req, res) => {
    const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound("Agendamento não encontrado.");
    if (!existing.recurrenceGroupId) throw badRequest("Este agendamento não faz parte de uma série recorrente.");

    const result = await prisma.appointment.deleteMany({
      where: { recurrenceGroupId: existing.recurrenceGroupId, date: { gte: existing.date } },
    });

    res.json({ count: result.count, message: `${result.count} agendamento(s) futuro(s) removido(s).` });
  }),
);

router.post(
  "/:id/checkin",
  asyncHandler(async (req, res) => {
    const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound("Agendamento não encontrado.");

    await prisma.movementLog.create({
      data: { eventType: "CHECK_IN", description: `Check-in do agendamento ${existing.id}` },
    });

    res.json({ ok: true, message: "Check-in registrado." });
  }),
);

router.post(
  "/:id/pagamento",
  asyncHandler(async (req, res) => {
    const { amount, method, paidBeforeCompletion } = req.body as {
      amount?: number;
      method?: string;
      paidBeforeCompletion?: boolean;
    };
    if (amount === undefined || !method) throw badRequest("Informe valor e método de pagamento.");

    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: { professional: true, payment: true },
    });
    if (!appointment) throw notFound("Agendamento não encontrado.");
    if (appointment.payment) throw badRequest("Este agendamento já possui pagamento registrado.");

    const professionalService = await prisma.professionalService.findUnique({
      where: { professionalId_serviceId: { professionalId: appointment.professionalId, serviceId: appointment.serviceId } },
    });

    let commissionAmount: number;
    let commissionPct: number;
    if (professionalService?.compensationType === "fixed_value" && professionalService.compensationValue) {
      commissionAmount = Number(professionalService.compensationValue);
      commissionPct = amount > 0 ? Math.round((commissionAmount / amount) * 10000) / 100 : 0;
    } else if (professionalService?.compensationType === "custom_percent" && professionalService.compensationValue) {
      commissionPct = Number(professionalService.compensationValue);
      commissionAmount = Math.round(amount * (commissionPct / 100) * 100) / 100;
    } else {
      commissionPct = Number(appointment.professional.defaultCommissionPercent);
      commissionAmount = Math.round(amount * (commissionPct / 100) * 100) / 100;
    }

    const payment = await prisma.payment.create({
      data: { appointmentId: appointment.id, grossAmount: amount, method, paidAt: new Date() },
    });
    await prisma.commission.create({
      data: {
        appointmentId: appointment.id,
        professionalId: appointment.professionalId,
        amount: commissionAmount,
        percent: commissionPct,
      },
    });
    await prisma.movementLog.create({
      data: {
        eventType: "PAYMENT_CONFIRMED",
        description: `Pagamento de ${amount} confirmado para o agendamento ${appointment.id}${paidBeforeCompletion ? " (antes da conclusão)" : ""}`,
      },
    });

    res.json({ paymentId: payment.id, commissionAmount, commissionPct, message: "Pagamento registrado com sucesso." });
  }),
);

export default router;
