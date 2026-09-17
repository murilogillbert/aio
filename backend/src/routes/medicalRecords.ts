import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth, requireRole, type AuthUser } from "../middleware/auth.js";
import { badRequest, forbidden, notFound } from "../lib/httpError.js";
import { toMedicalRecordDto, toSessionNoteDto } from "../dto/medicalRecord.js";
import { myProfessionalId } from "../lib/actor.js";

const router = Router();
router.use(requireAuth, requireRole("admin", "recepcao", "profissional"));

const isRestricted = (user: AuthUser) => user.role === "recepcao";

const canAccessPatient = async (user: AuthUser, patientId: string): Promise<boolean> => {
  if (user.role === "admin" || user.role === "recepcao") return true;
  const professionalId = await myProfessionalId(user);
  if (!professionalId) return false;
  const appointment = await prisma.appointment.findFirst({ where: { patientId, professionalId } });
  return Boolean(appointment);
};

const resolvePatient = async (idOrUserId: string) =>
  (await prisma.patient.findUnique({ where: { id: idOrUserId }, include: { user: true } })) ??
  (await prisma.patient.findUnique({ where: { userId: idOrUserId }, include: { user: true } }));

const getOrCreateRecord = async (patientId: string) => {
  const existing = await prisma.medicalRecord.findUnique({
    where: { patientId },
    include: { patient: { include: { user: true } } },
  });
  if (existing) return existing;
  return prisma.medicalRecord.create({
    data: { patientId },
    include: { patient: { include: { user: true } } },
  });
};

router.get(
  "/pacientes/:patientId",
  asyncHandler(async (req, res) => {
    const patient = await resolvePatient(req.params.patientId);
    if (!patient) throw notFound("Paciente não encontrado.");
    if (!(await canAccessPatient(req.user!, patient.id))) throw forbidden();

    const record = await getOrCreateRecord(patient.id);
    res.json(toMedicalRecordDto(record, isRestricted(req.user!)));
  }),
);

router.put(
  "/pacientes/:patientId",
  requireRole("admin", "profissional"),
  asyncHandler(async (req, res) => {
    const patient = await resolvePatient(req.params.patientId);
    if (!patient) throw notFound("Paciente não encontrado.");
    if (!(await canAccessPatient(req.user!, patient.id))) throw forbidden();

    const body = req.body as Record<string, unknown>;
    const record = await prisma.medicalRecord.upsert({
      where: { patientId: patient.id },
      create: {
        patientId: patient.id,
        bloodType: (body.bloodType as string) ?? "",
        allergies: (body.allergies as string) ?? "",
        chronicConditions: (body.chronicConditions as string) ?? "",
        currentMedications: (body.currentMedications as string) ?? "",
        familyHistory: (body.familyHistory as string) ?? "",
        surgicalHistory: (body.surgicalHistory as string) ?? "",
        habits: (body.habits as string) ?? "",
        heightCm: body.heightCm as number | undefined,
        weightKg: body.weightKg as number | undefined,
        updatedByUserId: req.user!.id,
        updatedAt: new Date(),
      },
      update: {
        bloodType: body.bloodType as string | undefined,
        allergies: body.allergies as string | undefined,
        chronicConditions: body.chronicConditions as string | undefined,
        currentMedications: body.currentMedications as string | undefined,
        familyHistory: body.familyHistory as string | undefined,
        surgicalHistory: body.surgicalHistory as string | undefined,
        habits: body.habits as string | undefined,
        heightCm: body.heightCm as number | undefined,
        weightKg: body.weightKg as number | undefined,
        updatedByUserId: req.user!.id,
        updatedAt: new Date(),
      },
      include: { patient: { include: { user: true } } },
    });

    await prisma.movementLog.create({
      data: { eventType: "MEDICAL_RECORD_UPDATED", description: `Prontuário do paciente ${patient.id} atualizado`, userId: req.user!.id },
    });

    res.json(toMedicalRecordDto(record, false));
  }),
);

router.get(
  "/pacientes/:patientId/evolucoes",
  asyncHandler(async (req, res) => {
    const patient = await resolvePatient(req.params.patientId);
    if (!patient) throw notFound("Paciente não encontrado.");
    if (!(await canAccessPatient(req.user!, patient.id))) throw forbidden();

    const record = await prisma.medicalRecord.findUnique({ where: { patientId: patient.id } });
    if (!record) return res.json([]);

    const professionalId = await myProfessionalId(req.user!);
    const notes = await prisma.sessionNote.findMany({
      where: { medicalRecordId: record.id, ...(professionalId ? { professionalId } : {}) },
      include: { appointment: { include: { professional: true, service: true } } },
      orderBy: { createdAt: "desc" },
    });

    const restricted = isRestricted(req.user!);
    res.json(
      notes.map((note) =>
        toSessionNoteDto(note, { ...note.appointment, patientId: patient.id }, restricted),
      ),
    );
  }),
);

router.get(
  "/agendamentos/:appointmentId/evolucao",
  requireRole("admin", "profissional"),
  asyncHandler(async (req, res) => {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.appointmentId },
      include: { professional: true, service: true },
    });
    if (!appointment) throw notFound("Agendamento não encontrado.");
    if (!(await canAccessPatient(req.user!, appointment.patientId))) throw forbidden();

    const note = await prisma.sessionNote.findUnique({ where: { appointmentId: appointment.id } });
    res.json(toSessionNoteDto(note, { ...appointment, patientId: appointment.patientId }, false));
  }),
);

router.post(
  "/agendamentos/:appointmentId/evolucao",
  requireRole("admin", "profissional"),
  asyncHandler(async (req, res) => {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.appointmentId },
      include: { professional: true, service: true },
    });
    if (!appointment) throw notFound("Agendamento não encontrado.");
    if (!(await canAccessPatient(req.user!, appointment.patientId))) throw forbidden();

    const existing = await prisma.sessionNote.findUnique({ where: { appointmentId: appointment.id } });
    if (existing) throw badRequest("Já existe uma evolução para este agendamento.");

    const record = await getOrCreateRecord(appointment.patientId);
    const body = req.body as Record<string, string | null | undefined>;
    const note = await prisma.sessionNote.create({
      data: {
        medicalRecordId: record.id,
        appointmentId: appointment.id,
        professionalId: appointment.professionalId,
        chiefComplaint: body.chiefComplaint ?? "",
        subjective: body.subjective ?? "",
        objective: body.objective ?? "",
        assessment: body.assessment ?? "",
        plan: body.plan ?? "",
        diagnosis: body.diagnosis ?? "",
        diagnosisCode: body.diagnosisCode ?? "",
        prescription: body.prescription ?? "",
        vitalSignsJson: body.vitalSignsJson ?? "",
      },
    });

    res.json(toSessionNoteDto(note, { ...appointment, patientId: appointment.patientId }, false));
  }),
);

router.put(
  "/evolucoes/:id",
  requireRole("admin", "profissional"),
  asyncHandler(async (req, res) => {
    const existing = await prisma.sessionNote.findUnique({
      where: { id: req.params.id },
      include: { appointment: { include: { professional: true, service: true } } },
    });
    if (!existing) throw notFound("Evolução não encontrada.");
    if (!(await canAccessPatient(req.user!, existing.appointment.patientId))) throw forbidden();
    if (existing.isSigned) throw badRequest("Evolução assinada não pode ser editada.");

    const body = req.body as Record<string, string | null | undefined>;
    const note = await prisma.sessionNote.update({
      where: { id: existing.id },
      data: {
        chiefComplaint: body.chiefComplaint ?? undefined,
        subjective: body.subjective ?? undefined,
        objective: body.objective ?? undefined,
        assessment: body.assessment ?? undefined,
        plan: body.plan ?? undefined,
        diagnosis: body.diagnosis ?? undefined,
        diagnosisCode: body.diagnosisCode ?? undefined,
        prescription: body.prescription ?? undefined,
        vitalSignsJson: body.vitalSignsJson ?? undefined,
        updatedAt: new Date(),
      },
    });

    res.json(toSessionNoteDto(note, { ...existing.appointment, patientId: existing.appointment.patientId }, false));
  }),
);

router.post(
  "/evolucoes/:id/assinar",
  requireRole("admin", "profissional"),
  asyncHandler(async (req, res) => {
    const existing = await prisma.sessionNote.findUnique({
      where: { id: req.params.id },
      include: { appointment: { include: { professional: true, service: true } } },
    });
    if (!existing) throw notFound("Evolução não encontrada.");
    if (!(await canAccessPatient(req.user!, existing.appointment.patientId))) throw forbidden();
    if (existing.isSigned) throw badRequest("Evolução já assinada.");

    const note = await prisma.sessionNote.update({
      where: { id: existing.id },
      data: { isSigned: true, signedAt: new Date() },
    });

    if (existing.appointment.status !== "Cancelado" && existing.appointment.status !== "Realizado") {
      await prisma.appointment.update({ where: { id: existing.appointmentId }, data: { status: "Realizado" } });
    }

    res.json(toSessionNoteDto(note, { ...existing.appointment, patientId: existing.appointment.patientId }, false));
  }),
);

router.get(
  "/pacientes/:patientId/anexos",
  asyncHandler(async (req, res) => {
    const patient = await resolvePatient(req.params.patientId);
    if (!patient) throw notFound("Paciente não encontrado.");
    if (!(await canAccessPatient(req.user!, patient.id))) throw forbidden();

    const record = await prisma.medicalRecord.findUnique({ where: { patientId: patient.id } });
    const attachments = record
      ? await prisma.medicalAttachment.findMany({ where: { medicalRecordId: record.id }, orderBy: { createdAt: "desc" } })
      : [];

    res.json(
      attachments.map((attachment) => ({
        id: attachment.id,
        patientId: patient.id,
        title: attachment.title,
        fileUrl: attachment.fileUrl,
        fileType: attachment.fileType,
        createdAt: attachment.createdAt.toISOString(),
      })),
    );
  }),
);

router.post(
  "/pacientes/:patientId/anexos",
  requireRole("admin", "profissional"),
  asyncHandler(async (req, res) => {
    const patient = await resolvePatient(req.params.patientId);
    if (!patient) throw notFound("Paciente não encontrado.");
    if (!(await canAccessPatient(req.user!, patient.id))) throw forbidden();

    const { title, fileUrl, fileType } = req.body as { title?: string; fileUrl?: string; fileType?: string };
    if (!fileUrl) throw badRequest("Informe a URL do arquivo.");

    const record = await getOrCreateRecord(patient.id);
    const attachment = await prisma.medicalAttachment.create({
      data: {
        medicalRecordId: record.id,
        title: title ?? "",
        fileUrl,
        fileType: fileType ?? "",
        uploadedByUserId: req.user!.id,
      },
    });

    res.json({
      id: attachment.id,
      patientId: patient.id,
      title: attachment.title,
      fileUrl: attachment.fileUrl,
      fileType: attachment.fileType,
      createdAt: attachment.createdAt.toISOString(),
    });
  }),
);

router.delete(
  "/anexos/:id",
  requireRole("admin", "profissional"),
  asyncHandler(async (req, res) => {
    const attachment = await prisma.medicalAttachment.findUnique({
      where: { id: req.params.id },
      include: { medicalRecord: true },
    });
    if (!attachment) throw notFound("Anexo não encontrado.");
    if (!(await canAccessPatient(req.user!, attachment.medicalRecord.patientId))) throw forbidden();
    await prisma.medicalAttachment.delete({ where: { id: attachment.id } });
    res.status(204).send();
  }),
);

export default router;
