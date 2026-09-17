import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { computeCommission } from "../lib/commission.js";
import { notifyAdminsPaymentConfirmed } from "../lib/notifications.js";

const router = Router();

const CONFIRMED_EVENTS = new Set(["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"]);

// Sem requireAuth — validado pelo header `asaas-access-token` (definido na configuração
// do webhook no painel Asaas, deve bater com Clinic.asaasWebhookToken).
router.post(
  "/asaas",
  asyncHandler(async (req, res) => {
    const clinic = await prisma.clinic.findFirst();
    if (clinic?.asaasWebhookToken) {
      const token = req.headers["asaas-access-token"];
      if (token !== clinic.asaasWebhookToken) {
        res.status(401).json({ ok: false });
        return;
      }
    }

    const { event, payment } = req.body as { event?: string; payment?: { id: string; status: string } };
    if (event && payment?.id && CONFIRMED_EVENTS.has(event)) {
      const existing = await prisma.payment.findFirst({ where: { asaasPaymentId: payment.id } });
      if (existing && existing.status !== "CONFIRMED") {
        await prisma.payment.update({ where: { id: existing.id }, data: { status: "CONFIRMED" } });

        const appointment = await prisma.appointment.findUnique({
          where: { id: existing.appointmentId },
          include: { professional: true },
        });
        if (appointment) {
          const { commissionAmount, commissionPct } = await computeCommission(
            appointment.professionalId,
            appointment.serviceId,
            Number(existing.grossAmount),
            Number(appointment.professional.defaultCommissionPercent),
          );
          const hasCommission = await prisma.commission.findFirst({ where: { appointmentId: appointment.id } });
          if (!hasCommission) {
            await prisma.commission.create({
              data: { appointmentId: appointment.id, professionalId: appointment.professionalId, amount: commissionAmount, percent: commissionPct },
            });
          }
        }

        await notifyAdminsPaymentConfirmed(existing.appointmentId, Number(existing.grossAmount));
      }
    }

    res.json({ ok: true });
  }),
);

export default router;
