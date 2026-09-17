import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { badRequest, forbidden, notFound } from "../lib/httpError.js";
import { dateOnly, dateOnlyString } from "../lib/datetime.js";

const router = Router();
router.use(requireAuth, requireRole("paciente"));

const toDependentDto = (dependent: { id: string; fullName: string; birthDate: Date; relationship: string }) => ({
  id: dependent.id,
  fullName: dependent.fullName,
  birthDate: dateOnlyString(dependent.birthDate),
  relationship: dependent.relationship,
});

const myPatient = async (userId: string) => {
  const patient = await prisma.patient.findUnique({ where: { userId } });
  if (!patient) throw forbidden();
  return patient;
};

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { fullName, birthDate, relationship } = req.body as { fullName?: string; birthDate?: string; relationship?: string };
    if (!fullName || !birthDate) throw badRequest("Informe nome e data de nascimento.");

    const patient = await myPatient(req.user!.id);
    const dependent = await prisma.dependent.create({
      data: { patientId: patient.id, fullName, birthDate: dateOnly(birthDate), relationship: relationship ?? "" },
    });
    res.status(201).json(toDependentDto(dependent));
  }),
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const patient = await myPatient(req.user!.id);
    const existing = await prisma.dependent.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.patientId !== patient.id) throw notFound("Dependente não encontrado.");

    const { fullName, birthDate, relationship } = req.body as { fullName?: string; birthDate?: string; relationship?: string };
    const dependent = await prisma.dependent.update({
      where: { id: existing.id },
      data: { fullName, birthDate: birthDate ? dateOnly(birthDate) : undefined, relationship },
    });
    res.json(toDependentDto(dependent));
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const patient = await myPatient(req.user!.id);
    const existing = await prisma.dependent.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.patientId !== patient.id) throw notFound("Dependente não encontrado.");

    await prisma.dependent.delete({ where: { id: existing.id } });
    res.status(204).send();
  }),
);

export default router;
