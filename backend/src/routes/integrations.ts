import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

const LEGACY_INTEGRATIONS = [
  { id: "gmail-oauth", name: "Gmail OAuth", status: "mock", description: "Autenticação Gmail para disparo de notificações." },
  { id: "gmail-pubsub", name: "Gmail Pub/Sub", status: "mock", description: "Assinatura de eventos de caixa de entrada." },
  { id: "gmail-resend", name: "Resend", status: "mock", description: "Envio de emails transacionais." },
  { id: "mercado-pago", name: "Mercado Pago", status: "mock", description: "Recebimento de pagamentos online." },
  { id: "whatsapp-business", name: "WhatsApp Business", status: "mock", description: "Notificações via WhatsApp." },
];

router.get("/", requireAuth, requireRole("admin"), (_req, res) => {
  res.json(LEGACY_INTEGRATIONS);
});

export default router;
