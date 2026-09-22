import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { badRequest, notFound } from "../lib/httpError.js";

const router = Router();
router.use(requireAuth, requireRole("admin", "recepcao", "profissional"));

const TIME_RE = /^\d{2}:\d{2}$/;

const toScheduleDto = (schedule: { id: string; professionalId: string; weekday: number; startTime: string; endTime: string }) => ({
  id: schedule.id,
  professionalId: schedule.professionalId,
  weekday: schedule.weekday,
  startTime: schedule.startTime,
  endTime: schedule.endTime,
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { professionalId } = req.query as { professionalId?: string };
    const schedules = await prisma.professionalSchedule.findMany({
      where: professionalId ? { professionalId } : undefined,
      orderBy: [{ weekday: "asc" }, { startTime: "asc" }],
    });
    res.json(schedules.map(toScheduleDto));
  }),
);

router.post(
  "/",
  requireRole("admin", "recepcao"),
  asyncHandler(async (req, res) => {
    const { professionalId, weekday, startTime, endTime } = req.body as {
      professionalId?: string;
      weekday?: number;
      startTime?: string;
      endTime?: string;
    };
    if (!professionalId || weekday === undefined || !startTime || !endTime) {
      throw badRequest("Informe profissional, dia da semana, início e fim.");
    }
    if (weekday < 0 || weekday > 6) throw badRequest("Dia da semana inválido.");
    if (!TIME_RE.test(startTime) || !TIME_RE.test(endTime)) throw badRequest("Horário inválido (use HH:mm).");
    if (endTime <= startTime) throw badRequest("O fim deve ser após o início.");

    const professional = await prisma.professional.findUnique({ where: { id: professionalId } });
    if (!professional) throw badRequest("Profissional não encontrado.");

    const schedule = await prisma.professionalSchedule.create({
      data: { professionalId, weekday, startTime, endTime },
    });
    res.status(201).json(toScheduleDto(schedule));
  }),
);

router.delete(
  "/:id",
  requireRole("admin", "recepcao"),
  asyncHandler(async (req, res) => {
    const existing = await prisma.professionalSchedule.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound("Horário não encontrado.");
    await prisma.professionalSchedule.delete({ where: { id: existing.id } });
    res.status(204).send();
  }),
);

export default router;
