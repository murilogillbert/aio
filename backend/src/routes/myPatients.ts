import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { myProfessionalId } from "../lib/actor.js";

const router = Router();
router.use(requireAuth, requireRole("profissional"));

// Pacientes com quem o profissional logado já teve algum agendamento — só nome (nunca telefone).
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const professionalId = await myProfessionalId(req.user!);
    if (!professionalId) return res.json([]);

    const appointments = await prisma.appointment.findMany({
      where: { professionalId },
      select: { patientId: true, patient: { select: { user: { select: { fullName: true } } } } },
      distinct: ["patientId"],
    });

    res.json(
      appointments
        .map((a) => ({ id: a.patientId, fullName: a.patient.user.fullName }))
        .sort((a, b) => a.fullName.localeCompare(b.fullName)),
    );
  }),
);

export default router;
