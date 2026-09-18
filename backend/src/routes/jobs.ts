import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { unauthorized } from "../lib/httpError.js";
import { env } from "../env.js";
import { prisma } from "../db.js";
import { runAppointmentReminders } from "../lib/notifications.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (_req, res) => {
    const clinic = await prisma.clinic.findFirst();
    res.json([
      {
        id: "lembretes-24h",
        name: "Lembrete de atendimento (24h antes)",
        status: clinic?.remindersEnabled ? "ativo" : "desativado",
        trigger: "Disparado externamente (cron) via POST /api/jobs/lembretes",
      },
    ]);
  }),
);

// Disparado por um agendador externo (GitHub Actions, cron-job.org etc.) — não pelo
// Vercel Cron. Autenticado por um segredo compartilhado, não por login de usuário,
// já que quem chama é uma automação e não uma pessoa logada.
router.post(
  "/lembretes",
  asyncHandler(async (req, res) => {
    if (!env.cronSecret || req.headers["x-cron-secret"] !== env.cronSecret) throw unauthorized();
    const result = await runAppointmentReminders();
    res.json(result);
  }),
);

export default router;
