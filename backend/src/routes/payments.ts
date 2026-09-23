import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { badRequest, forbidden, notFound } from "../lib/httpError.js";
import { computeCommission } from "../lib/commission.js";
import {
  createCardCharge,
  createCustomer,
  createPixCharge,
  getCustomer,
  getPixQrCode,
  AsaasError,
} from "../lib/asaas.js";

const router = Router();
router.use(requireAuth, requireRole("paciente"));

const asaasConfig = async () => {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic?.asaasApiKey) throw badRequest("Pagamento online não está configurado no momento.");
  return { apiKey: clinic.asaasApiKey, environment: clinic.asaasEnvironment };
};

const myPatient = async (userId: string) => {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw forbidden();
  return patient;
};

const ensureAsaasCustomer = async (config: { apiKey: string; environment: string }, patient: { id: string; asaasCustomerId: string | null; cpf: string }, user: { fullName: string; email: string }) => {
  if (patient.asaasCustomerId) {
    try {
      await getCustomer(config, patient.asaasCustomerId);
      return patient.asaasCustomerId;
    } catch {
      // segue e recria — cliente pode não existir mais no ambiente atual (ex.: troca sandbox/produção)
    }
  }
  if (!patient.cpf) throw badRequest("Cadastre seu CPF no perfil antes de pagar online.");
  const customer = await createCustomer(config, { name: user.fullName, email: user.email, cpfCnpj: patient.cpf.replace(/\D/g, "") });
  await prisma.patient.update({ where: { id: patient.id }, data: { asaasCustomerId: customer.id } });
  return customer.id;
};

router.get(
  "/cartoes",
  asyncHandler(async (req, res) => {
    const patient = await myPatient(req.user!.id);
    const cards = await prisma.patientCard.findMany({ where: { patientId: patient.id }, orderBy: { createdAt: "desc" } });
    res.json(cards.map((c) => ({ id: c.id, brand: c.brand, last4: c.last4, expiryMonth: c.expiryMonth, expiryYear: c.expiryYear })));
  }),
);

router.delete(
  "/cartoes/:id",
  asyncHandler(async (req, res) => {
    const patient = await myPatient(req.user!.id);
    const card = await prisma.patientCard.findUnique({ where: { id: req.params.id } });
    if (!card || card.patientId !== patient.id) throw notFound("Cartão não encontrado.");
    await prisma.patientCard.delete({ where: { id: card.id } });
    res.status(204).send();
  }),
);

router.post(
  "/checkout",
  asyncHandler(async (req, res) => {
    const body = req.body as {
      appointmentId?: string;
      method?: "PIX" | "CARTAO";
      savedCardId?: string;
      saveCard?: boolean;
      card?: { holderName: string; number: string; expiryMonth: string; expiryYear: string; ccv: string; cpfCnpj: string; postalCode: string; addressNumber: string; phone: string };
    };
    if (!body.appointmentId || !body.method) throw badRequest("Informe o agendamento e a forma de pagamento.");

    const patient = await myPatient(req.user!.id);
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    const appointment = await prisma.appointment.findUnique({
      where: { id: body.appointmentId },
      include: { service: true, professional: true, payment: true },
    });
    if (!appointment || appointment.patientId !== patient.id) throw notFound("Agendamento não encontrado.");
    if (appointment.payment) throw badRequest("Este agendamento já possui pagamento registrado.");

    const config = await asaasConfig();
    const asaasCustomerId = await ensureAsaasCustomer(config, patient, user!);
    let amount = Number(appointment.service.basePrice);
    if (appointment.planId) {
      const planService = await prisma.planService.findUnique({
        where: { planId_serviceId: { planId: appointment.planId, serviceId: appointment.serviceId } },
      });
      if (planService?.customPrice) amount = Number(planService.customPrice);
    }
    const dueDate = new Date().toISOString().slice(0, 10);

    if (body.method === "PIX") {
      const charge = await createPixCharge(config, { customer: asaasCustomerId, value: amount, dueDate, description: appointment.service.name });
      const qrCode = await getPixQrCode(config, charge.id);
      await prisma.payment.create({
        data: {
          appointmentId: appointment.id,
          grossAmount: amount,
          method: "Pix",
          billingType: "PIX",
          asaasPaymentId: charge.id,
          status: "PENDING",
        },
      });
      res.json({ status: "PENDING", pix: qrCode });
      return;
    }

    // CARTAO
    let creditCardToken: string | undefined;
    let creditCard: Parameters<typeof createCardCharge>[1]["creditCard"];
    let creditCardHolderInfo: Parameters<typeof createCardCharge>[1]["creditCardHolderInfo"];

    if (body.savedCardId) {
      const saved = await prisma.patientCard.findUnique({ where: { id: body.savedCardId } });
      if (!saved || saved.patientId !== patient.id) throw notFound("Cartão salvo não encontrado.");
      creditCardToken = saved.cardToken;
    } else if (body.card) {
      creditCard = {
        holderName: body.card.holderName,
        number: body.card.number,
        expiryMonth: body.card.expiryMonth,
        expiryYear: body.card.expiryYear,
        ccv: body.card.ccv,
      };
      creditCardHolderInfo = {
        name: body.card.holderName,
        email: user!.email,
        cpfCnpj: body.card.cpfCnpj.replace(/\D/g, ""),
        postalCode: body.card.postalCode.replace(/\D/g, ""),
        addressNumber: body.card.addressNumber,
        phone: body.card.phone.replace(/\D/g, ""),
      };
    } else {
      throw badRequest("Informe os dados do cartão ou um cartão salvo.");
    }

    let charge;
    try {
      charge = await createCardCharge(config, {
        customer: asaasCustomerId,
        value: amount,
        dueDate,
        description: appointment.service.name,
        remoteIp: req.ip ?? "0.0.0.0",
        creditCard,
        creditCardHolderInfo,
        creditCardToken,
      });
    } catch (error) {
      if (error instanceof AsaasError) throw badRequest("Pagamento recusado. Verifique os dados do cartão.");
      throw error;
    }

    const isConfirmed = charge.status === "CONFIRMED" || charge.status === "RECEIVED";
    const payment = await prisma.payment.create({
      data: {
        appointmentId: appointment.id,
        grossAmount: amount,
        method: "Cartão de crédito",
        billingType: "CREDIT_CARD",
        asaasPaymentId: charge.id,
        status: isConfirmed ? "CONFIRMED" : "PENDING",
      },
    });

    if (isConfirmed) {
      const { commissionAmount, commissionPct, taxPercent, netAmount } = await computeCommission(
        appointment.professionalId,
        appointment.serviceId,
        amount,
        Number(appointment.professional.defaultCommissionPercent),
      );
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
    }

    if (body.saveCard && charge.creditCardToken) {
      await prisma.patientCard.create({
        data: {
          patientId: patient.id,
          asaasCustomerId,
          cardToken: charge.creditCardToken,
          brand: "",
          last4: body.card?.number.slice(-4) ?? "",
          expiryMonth: body.card ? Number(body.card.expiryMonth) : null,
          expiryYear: body.card ? Number(body.card.expiryYear) : null,
        },
      });
    }

    res.json({ status: payment.status, paymentId: payment.id });
  }),
);

router.get(
  "/:appointmentId/status",
  asyncHandler(async (req, res) => {
    const patient = await myPatient(req.user!.id);
    const appointment = await prisma.appointment.findUnique({ where: { id: req.params.appointmentId }, include: { payment: true } });
    if (!appointment || appointment.patientId !== patient.id) throw notFound("Agendamento não encontrado.");
    res.json({ status: appointment.payment?.status ?? null });
  }),
);

export default router;
