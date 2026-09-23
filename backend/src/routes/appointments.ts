import { randomUUID } from "node:crypto";
import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { badRequest, forbidden, notFound } from "../lib/httpError.js";
import { addDays, dateOnly, splitIso } from "../lib/datetime.js";
import { hasConflict } from "../lib/conflict.js";
import { appointmentInclude, findAppointmentRich, toAppointmentRich } from "../dto/appointment.js";
import { myPatientId, myProfessionalId } from "../lib/actor.js";
import {
  notifyAdminsPaymentConfirmed,
  notifyAppointmentCancelled,
  notifyAppointmentConfirmed,
  notifyAppointmentCreated,
} from "../lib/notifications.js";
import { computeCommission } from "../lib/commission.js";
import { deleteAppointmentSafe, deleteFutureAppointmentsSafe } from "../lib/deleteGuard.js";

const router = Router();
router.use(requireAuth, requireRole("admin", "recepcao", "profissional", "paciente"));

// Ao marcar como Realizado, credita o profissional automaticamente — sem depender da recepção cobrar depois.
// appointment.payment é único por agendamento (constraint no schema), então isso nunca duplica um pagamento/comissão
// já registrado antes (pago online, cobrado manualmente antes da conclusão etc.) — vira um no-op nesses casos.
const autoRegisterCompletionPayment = async (appointmentId: string) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { service: true, professional: true, payment: true },
  });
  if (!appointment || appointment.payment) return;

  let amount = Number(appointment.service.basePrice);
  if (appointment.planId) {
    const planService = await prisma.planService.findUnique({
      where: { planId_serviceId: { planId: appointment.planId, serviceId: appointment.serviceId } },
    });
    if (planService?.customPrice) amount = Number(planService.customPrice);
  }

  const { commissionAmount, commissionPct, taxPercent, netAmount } = await computeCommission(
    appointment.professionalId,
    appointment.serviceId,
    amount,
    Number(appointment.professional.defaultCommissionPercent),
  );

  await prisma.payment.create({
    data: { appointmentId: appointment.id, grossAmount: amount, method: "Automático", billingType: "AUTO", paidAt: new Date() },
  });
  await prisma.commission.create({
    data: {
      appointmentId: appointment.id,
      professionalId: appointment.professionalId,
      amount: commissionAmount,
      percent: commissionPct,
      taxPercent,
      netAmount,
    },
  });
  await prisma.movementLog.create({
    data: {
      eventType: "PAYMENT_CONFIRMED",
      description: `Pagamento de ${amount} confirmado automaticamente ao concluir o agendamento ${appointment.id}`,
    },
  });
  await notifyAdminsPaymentConfirmed(appointment.id, amount);
};

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { start, end, professionalId, patientId } = req.query as {
      start?: string;
      end?: string;
      professionalId?: string;
      patientId?: string;
    };
    // Com patientId, start/end são opcionais — permite buscar o histórico completo
    // (passado e futuro) de um paciente específico, ex. tela de pacientes da recepção.
    if ((!start || !end) && !patientId) throw badRequest("Informe start e end, ou patientId.");

    const dateFilter = start && end ? { date: { gte: dateOnly(start.slice(0, 10)), lt: dateOnly(addDays(end.slice(0, 10), 1)) } } : {};

    const ownProfessionalId = await myProfessionalId(req.user!);
    const ownPatientId = await myPatientId(req.user!);

    const appointments = await prisma.appointment.findMany({
      where: {
        ...dateFilter,
        ...(patientId ? { patientId } : {}),
        // Profissional/paciente sempre veem só os próprios dados, independente do que a query pedir.
        ...(ownProfessionalId ? { professionalId: ownProfessionalId } : professionalId ? { professionalId } : {}),
        ...(ownPatientId ? { patientId: ownPatientId } : {}),
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

    const ownProfessionalId = await myProfessionalId(req.user!);
    if (ownProfessionalId && rich.professionalId !== ownProfessionalId) throw forbidden();
    const ownPatientId = await myPatientId(req.user!);
    if (ownPatientId && rich.patientId !== ownPatientId) throw forbidden();

    res.json(rich);
  }),
);

router.post(
  "/",
  requireRole("admin", "recepcao", "profissional"),
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
      await notifyAppointmentCreated(createdId);
      res.json(await findAppointmentRich(createdId));
      return;
    }
    if (createdId) await notifyAppointmentCreated(createdId);

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
    const existing = await prisma.appointment.findUnique({ where: { id: req.params.id }, include: { service: true } });
    if (!existing) throw notFound("Agendamento não encontrado.");

    const ownPatientId = await myPatientId(req.user!);
    if (ownPatientId) {
      // Paciente só pode remarcar (mudar data/horário) o próprio agendamento.
      if (existing.patientId !== ownPatientId) throw forbidden();
      const { startTime } = req.body as { startTime?: string };
      if (!startTime) throw badRequest("Informe o novo horário.");
      const { dateStr, time } = splitIso(startTime);
      const conflict = await hasConflict({
        professionalId: existing.professionalId,
        dateStr,
        time,
        durationMinutes: existing.service.durationMinutes,
        excludeAppointmentId: existing.id,
      });
      if (conflict) throw badRequest("Horário indisponível.");

      await prisma.appointment.update({
        where: { id: existing.id },
        data: { date: dateOnly(dateStr), time, status: "Agendado", patientConfirmation: "Pendente" },
      });
      res.json(await findAppointmentRich(existing.id));
      return;
    }

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
    let { status, cancellationSource } = req.body as { status?: string; cancellationSource?: string };
    if (!status) throw badRequest("Informe o status.");

    const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound("Agendamento não encontrado.");

    const ownPatientId = await myPatientId(req.user!);
    if (ownPatientId) {
      // Paciente só pode cancelar o próprio agendamento — nenhuma outra transição de status.
      if (existing.patientId !== ownPatientId) throw forbidden();
      if (status !== "Cancelado") throw forbidden("Pacientes só podem cancelar agendamentos.");
      cancellationSource = "Paciente";
    }

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
      await notifyAppointmentCancelled(existing.id, data.cancellationSource as string | undefined);
    } else if (status === "Realizado") {
      await autoRegisterCompletionPayment(existing.id);
    }

    res.json(await findAppointmentRich(existing.id));
  }),
);

router.patch(
  "/:id/confirmacao",
  requireRole("admin", "recepcao", "profissional"),
  asyncHandler(async (req, res) => {
    const { value } = req.body as { value?: string };
    if (!value) throw badRequest("Informe o valor da confirmação.");

    const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound("Agendamento não encontrado.");

    await prisma.appointment.update({ where: { id: existing.id }, data: { patientConfirmation: value as never } });
    if (value === "Confirmado") await notifyAppointmentConfirmed(existing.id);
    res.json(await findAppointmentRich(existing.id));
  }),
);

router.delete(
  "/:id",
  requireRole("admin", "recepcao", "profissional"),
  asyncHandler(async (req, res) => {
    const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound("Agendamento não encontrado.");
    const cascade = req.query.cascade === "true";
    await deleteAppointmentSafe(existing.id, cascade);
    res.status(204).send();
  }),
);

router.delete(
  "/:id/futuros",
  requireRole("admin", "recepcao", "profissional"),
  asyncHandler(async (req, res) => {
    const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound("Agendamento não encontrado.");
    if (!existing.recurrenceGroupId) throw badRequest("Este agendamento não faz parte de uma série recorrente.");

    const cascade = req.query.cascade === "true";
    const result = await deleteFutureAppointmentsSafe(existing.recurrenceGroupId, existing.date, cascade);

    res.json({ count: result.count, message: `${result.count} agendamento(s) futuro(s) removido(s).` });
  }),
);

router.post(
  "/:id/checkin",
  requireRole("admin", "recepcao", "profissional"),
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
  requireRole("admin", "recepcao"),
  asyncHandler(async (req, res) => {
    const { amount, method, methodDetail, paidBeforeCompletion } = req.body as {
      amount?: number;
      method?: string;
      methodDetail?: string;
      paidBeforeCompletion?: boolean;
    };
    if (amount === undefined || !method) throw badRequest("Informe valor e método de pagamento.");

    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: { professional: true, payment: true },
    });
    if (!appointment) throw notFound("Agendamento não encontrado.");
    if (appointment.payment) throw badRequest("Este agendamento já possui pagamento registrado.");

    const { commissionAmount, commissionPct, taxPercent, netAmount } = await computeCommission(
      appointment.professionalId,
      appointment.serviceId,
      amount,
      Number(appointment.professional.defaultCommissionPercent),
    );

    const payment = await prisma.payment.create({
      data: { appointmentId: appointment.id, grossAmount: amount, method, methodDetail: methodDetail ?? null, paidAt: new Date() },
    });
    await prisma.commission.create({
      data: {
        appointmentId: appointment.id,
        professionalId: appointment.professionalId,
        amount: commissionAmount,
        percent: commissionPct,
        taxPercent,
        netAmount,
      },
    });
    await prisma.movementLog.create({
      data: {
        eventType: "PAYMENT_CONFIRMED",
        description: `Pagamento de ${amount} confirmado para o agendamento ${appointment.id}${paidBeforeCompletion ? " (antes da conclusão)" : ""}`,
      },
    });
    await notifyAdminsPaymentConfirmed(appointment.id, amount);

    res.json({ paymentId: payment.id, commissionAmount, commissionPct, taxPercent, netAmount, message: "Pagamento registrado com sucesso." });
  }),
);

export default router;
