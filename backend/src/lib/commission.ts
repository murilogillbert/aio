import { prisma } from "../db.js";
import { notifyAdminsPaymentConfirmed } from "./notifications.js";

const round2 = (value: number) => Math.round(value * 100) / 100;

// Prioridade do valor cobrado num agendamento: valor personalizado combinado na hora de
// agendar (recepção/admin) > preço do convênio vinculado ao serviço > preço base do serviço.
export const resolveAppointmentPrice = async (
  appointment: { serviceId: string; planId: string | null; customPrice: unknown },
  basePrice: number,
): Promise<number> => {
  if (appointment.customPrice != null) return Number(appointment.customPrice);
  if (appointment.planId) {
    const planService = await prisma.planService.findUnique({
      where: { planId_serviceId: { planId: appointment.planId, serviceId: appointment.serviceId } },
    });
    if (planService?.customPrice) return Number(planService.customPrice);
  }
  return basePrice;
};

// Ao marcar como Realizado (seja pela troca de status ou ao assinar a evolução), credita o
// profissional automaticamente — sem depender da recepção cobrar depois. appointment.payment é
// único por agendamento (constraint no schema), então isso nunca duplica um pagamento/comissão
// já registrado antes (pago online, cobrado manualmente antes da conclusão etc.) — vira um no-op.
export const autoRegisterCompletionPayment = async (appointmentId: string): Promise<void> => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { service: true, professional: true, payment: true },
  });
  if (!appointment || appointment.payment) return;

  const amount = await resolveAppointmentPrice(appointment, Number(appointment.service.basePrice));

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

export const computeCommission = async (
  professionalId: string,
  serviceId: string,
  amount: number,
  defaultCommissionPercent: number,
): Promise<{ commissionAmount: number; commissionPct: number; taxPercent: number; netAmount: number }> => {
  const professionalService = await prisma.professionalService.findUnique({
    where: { professionalId_serviceId: { professionalId, serviceId } },
  });

  let commissionAmount: number;
  let commissionPct: number;

  if (professionalService?.compensationType === "fixed_value" && professionalService.compensationValue) {
    commissionAmount = Number(professionalService.compensationValue);
    commissionPct = amount > 0 ? round2((commissionAmount / amount) * 100) : 0;
  } else if (professionalService?.compensationType === "custom_percent" && professionalService.compensationValue) {
    commissionPct = Number(professionalService.compensationValue);
    commissionAmount = round2(amount * (commissionPct / 100));
  } else {
    commissionPct = defaultCommissionPercent;
    commissionAmount = round2(amount * (commissionPct / 100));
  }

  const taxPercent = await resolveCommissionTaxPercent(professionalService, serviceId);
  const netAmount = round2(commissionAmount * (1 - taxPercent / 100));

  return { commissionAmount, commissionPct, taxPercent, netAmount };
};

const resolveCommissionTaxPercent = async (
  professionalService: { commissionTaxMode: string; commissionTaxPercent: unknown } | null,
  serviceId: string,
): Promise<number> => {
  if (!professionalService || professionalService.commissionTaxMode === "none") return 0;

  if (professionalService.commissionTaxMode === "custom") {
    return professionalService.commissionTaxPercent ? Number(professionalService.commissionTaxPercent) : 0;
  }

  if (professionalService.commissionTaxMode === "service") {
    const taxes = await prisma.serviceTax.findMany({ where: { serviceId } });
    return round2(taxes.reduce((sum, tax) => sum + Number(tax.percent), 0));
  }

  return 0;
};
