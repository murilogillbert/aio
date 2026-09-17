import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { forbidden } from "../lib/httpError.js";

const router = Router();
router.use(requireAuth, requireRole("paciente"));

// Documentos/laudos do próprio paciente logado — somente leitura.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const patient = await prisma.patient.findUnique({ where: { userId: req.user!.id } });
    if (!patient) throw forbidden();

    const record = await prisma.medicalRecord.findUnique({ where: { patientId: patient.id } });
    const attachments = record
      ? await prisma.medicalAttachment.findMany({ where: { medicalRecordId: record.id }, orderBy: { createdAt: "desc" } })
      : [];

    res.json(
      attachments.map((attachment) => ({
        id: attachment.id,
        title: attachment.title,
        fileUrl: attachment.fileUrl,
        fileType: attachment.fileType,
        createdAt: attachment.createdAt.toISOString(),
      })),
    );
  }),
);

export default router;
