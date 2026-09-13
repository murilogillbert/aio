import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { badRequest, notFound } from "../lib/httpError.js";
import { naiveDate, naiveDateLoose } from "../lib/datetime.js";

const router = Router();
router.use(requireAuth, requireRole("admin", "recepcao", "profissional"));

const toBlockDto = (block: { id: string; professionalId: string; startAt: Date; endAt: Date; reason: string }) => ({
  id: block.id,
  professionalId: block.professionalId,
  startAt: block.startAt.toISOString(),
  endAt: block.endAt.toISOString(),
  reason: block.reason,
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { professionalId, start, end } = req.query as { professionalId?: string; start?: string; end?: string };
    const where: Record<string, unknown> = {};
    if (professionalId) where.professionalId = professionalId;
    if (start) where.endAt = { gte: naiveDateLoose(start) };
    if (end) where.startAt = { lte: naiveDateLoose(end) };

    const blocks = await prisma.professionalBlock.findMany({ where, orderBy: { startAt: "asc" } });
    res.json(blocks.map(toBlockDto));
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { professionalId, startAt, endAt, reason } = req.body as {
      professionalId?: string;
      startAt?: string;
      endAt?: string;
      reason?: string;
    };
    if (!professionalId || !startAt || !endAt) throw badRequest("Informe profissional, início e fim do bloqueio.");

    const start = naiveDate(startAt);
    const end = naiveDate(endAt);
    if (end <= start) throw badRequest("O fim do bloqueio deve ser após o início.");

    const block = await prisma.professionalBlock.create({
      data: { professionalId, startAt: start, endAt: end, reason: reason ?? "" },
    });
    res.json(toBlockDto(block));
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const existing = await prisma.professionalBlock.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound("Bloqueio não encontrado.");
    await prisma.professionalBlock.delete({ where: { id: existing.id } });
    res.status(204).send();
  }),
);

export default router;
