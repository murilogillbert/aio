import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { badRequest, conflict, notFound } from "../lib/httpError.js";
import { hashPassword } from "../lib/password.js";
import { dateOnly } from "../lib/datetime.js";
import { digitsOnly, generatePassword, toPatientRich } from "../dto/patient.js";

const router = Router();
router.use(requireAuth, requireRole("admin", "recepcao"));

const patientInclude = { user: true, _count: { select: { dependents: true } } } as const;

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search, includeInactive } = req.query as { search?: string; includeInactive?: string };

    const patients = await prisma.patient.findMany({
      where: includeInactive === "true" ? {} : { isActive: true },
      include: patientInclude,
    });

    const term = search?.trim().toLowerCase();
    const termDigits = search ? digitsOnly(search) : "";
    const filtered = term
      ? patients.filter(
          (patient) =>
            patient.user.fullName.toLowerCase().includes(term) ||
            patient.user.email.toLowerCase().includes(term) ||
            (termDigits.length > 0 &&
              (digitsOnly(patient.cpf).includes(termDigits) || digitsOnly(patient.user.phone).includes(termDigits))),
        )
      : patients;

    res.json(filtered.slice(0, 200).map(toPatientRich));
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const patient = await prisma.patient.findUnique({ where: { id: req.params.id }, include: patientInclude });
    if (!patient) throw notFound("Paciente não encontrado.");
    res.json(toPatientRich(patient));
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const force = req.query.force === "true";
    const body = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      cpf?: string;
      birthDate?: string | null;
      address?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      notes?: string;
    };
    if (!body.name || !body.email) throw badRequest("Informe nome e email.");

    if (!force) {
      const candidates = await prisma.patient.findMany({ include: patientInclude });
      const emailLower = body.email.toLowerCase();
      const cpfDigits = body.cpf ? digitsOnly(body.cpf) : "";
      const phoneDigits = body.phone ? digitsOnly(body.phone) : "";
      const matches = candidates.filter(
        (patient) =>
          patient.user.email.toLowerCase() === emailLower ||
          (cpfDigits.length > 0 && digitsOnly(patient.cpf) === cpfDigits) ||
          (phoneDigits.length > 0 && digitsOnly(patient.user.phone) === phoneDigits),
      );
      if (matches.length > 0) {
        res.status(409).json({ matches: matches.map(toPatientRich) });
        return;
      }
    }

    const generatedPassword = generatePassword();
    const passwordHash = await hashPassword(generatedPassword);
    const role = await prisma.role.findUnique({ where: { name: "paciente" } });
    if (!role) throw badRequest("Papel 'paciente' não configurado.");

    const patient = await prisma.patient.create({
      data: {
        cpf: body.cpf ?? "",
        address: body.address ?? "",
        city: body.city ?? "",
        state: body.state ?? "",
        postalCode: body.postalCode ?? "",
        notes: body.notes ?? "",
        birthDate: body.birthDate ? dateOnly(body.birthDate) : null,
        user: {
          create: {
            fullName: body.name,
            email: body.email,
            phone: body.phone ?? "",
            passwordHash,
            userRoles: { create: { roleId: role.id } },
          },
        },
      },
      include: patientInclude,
    });

    res.json({ patient: toPatientRich(patient), generatedPassword });
  }),
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const existing = await prisma.patient.findUnique({ where: { id: req.params.id }, include: { user: true } });
    if (!existing) throw notFound("Paciente não encontrado.");

    const body = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      cpf?: string;
      birthDate?: string | null;
      address?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      notes?: string;
    };

    if (body.email && body.email !== existing.user.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: body.email } });
      if (emailTaken) throw conflict("Este email já está em uso.");
    }

    const patient = await prisma.patient.update({
      where: { id: existing.id },
      data: {
        cpf: body.cpf,
        address: body.address,
        city: body.city,
        state: body.state,
        postalCode: body.postalCode,
        notes: body.notes,
        birthDate: body.birthDate ? dateOnly(body.birthDate) : body.birthDate === null ? null : undefined,
        user: {
          update: {
            fullName: body.name,
            email: body.email,
            phone: body.phone,
          },
        },
      },
      include: patientInclude,
    });

    res.json(toPatientRich(patient));
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const existing = await prisma.patient.findUnique({ where: { id: req.params.id } });
    if (!existing) throw notFound("Paciente não encontrado.");
    await prisma.patient.update({ where: { id: existing.id }, data: { isActive: false } });
    res.status(204).send();
  }),
);

export default router;
