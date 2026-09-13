import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, requireRole("admin"), (_req, res) => {
  const now = new Date().toISOString();
  res.json([
    { id: "disparo-notificacoes", name: "Disparo de notificações", status: "ativo", lastRun: now },
    { id: "metricas-snapshot", name: "Snapshot de métricas", status: "ativo", lastRun: now },
  ]);
});

export default router;
