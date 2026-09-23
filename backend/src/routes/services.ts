import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { notFound } from "../lib/httpError.js";
import { createService, findServiceDetail, updateService, type ServiceUpsertBody } from "../dto/serviceDetail.js";
import { deleteServiceSafe } from "../lib/deleteGuard.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (_req, res) => {
    const services = await prisma.service.findMany({ include: { professionalServices: true } });
    res.json(
      services.map((s) => ({
        id: s.id,
        name: s.name,
        shortDescription: s.shortDescription,
        durationMinutes: s.durationMinutes,
        basePrice: Number(s.basePrice),
        color: s.color,
        isActive: s.isActive,
        professionalCount: s.professionalServices.length,
      })),
    );
  }),
);

router.get(
  "/referencias",
  asyncHandler(async (_req, res) => {
    const [categories, rooms, equipments, plans, professionals] = await Promise.all([
      prisma.category.findMany({ where: { type: "servico" } }),
      prisma.room.findMany({ where: { isActive: true } }),
      prisma.equipment.findMany({ where: { isActive: true } }),
      prisma.plan.findMany(),
      prisma.professional.findMany({ where: { providesCare: true, isActive: true } }),
    ]);

    res.json({
      categories: categories.map((c) => ({ id: c.id, label: c.name })),
      rooms: rooms.map((r) => ({ id: r.id, label: r.name })),
      equipments: equipments.map((e) => ({ id: e.id, label: e.name })),
      plans: plans.map((p) => ({ id: p.id, label: p.name })),
      professionals: professionals.map((p) => ({
        id: p.id,
        name: p.name,
        defaultCommissionPercent: Number(p.defaultCommissionPercent),
        specialty: p.specialty,
      })),
    });
  }),
);

router.get(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const detail = await findServiceDetail(req.params.id);
    if (!detail) throw notFound("Serviço não encontrado.");
    res.json(detail);
  }),
);

router.post(
  "/",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    res.json(await createService(req.body as ServiceUpsertBody));
  }),
);

router.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const existing = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound("Serviço não encontrado.");
    res.json(await updateService(req.params.id, req.body as ServiceUpsertBody));
  }),
);

router.delete(
  "/:id",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const existing = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound("Serviço não encontrado.");
    const cascade = req.query.cascade === "true";
    await deleteServiceSafe(existing.id, cascade);
    res.status(204).send();
  }),
);

export default router;
