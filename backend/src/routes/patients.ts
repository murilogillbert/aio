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

const PATIENT_LIST_LIMIT = 200;

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search, includeInactive } = req.query as { search?: string; includeInactive?: string };
    const activeFilter = includeInactive === "true" ? {} : { isActive: true };

    const term = search?.trim();
    if (!term) {
      const patients = await prisma.patient.findMany({
        where: activeFilter,
        include: patientInclude,
        take: PATIENT_LIST_LIMIT,
        orderBy: { user: { fullName: "asc" } },
      });
      res.json(patients.map(toPatientRich));
      return;
    }

    // Busca no SQL (nome/email por ILIKE, CPF/telefone normalizando dígitos) em vez de
    // carregar a tabela inteira de pacientes pra filtrar em JS — evita full table scan
    // a cada busca conforme a base de pacientes cresce.
    const termDigits = digitsOnly(term);
    const matches = await prisma.$queryRaw<{ id: string }[]>`
      SELECT p.id FROM "Patient" p
      JOIN "User" u ON u.id = p."userId"
      WHERE (${includeInactive === "true"} OR p."isActive" = true)
        AND (
          u."fullName" ILIKE ${`%${term}%`}
          OR u.email ILIKE ${`%${term}%`}
          OR (${termDigits} != '' AND regexp_replace(p.cpf, '[^0-9]', '', 'g') LIKE ${`%${termDigits}%`})
          OR (${termDigits} != '' AND regexp_replace(u.phone, '[^0-9]', '', 'g') LIKE ${`%${termDigits}%`})
        )
      LIMIT ${PATIENT_LIST_LIMIT}
    `;

    if (matches.length === 0) {
      res.json([]);
      return;
    }

    const patients = await prisma.patient.findMany({
      where: { id: { in: matches.map((m) => m.id) } },
      include: patientInclude,
      orderBy: { user: { fullName: "asc" } },
    });
    res.json(patients.map(toPatientRich));
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
      const cpfDigits = body.cpf ? digitsOnly(body.cpf) : "";
      const phoneDigits = body.phone ? digitsOnly(body.phone) : "";
      const candidateIds = await prisma.$queryRaw<{ id: string }[]>`
        SELECT p.id FROM "Patient" p
        JOIN "User" u ON u.id = p."userId"
        WHERE LOWER(u.email) = LOWER(${body.email})
          OR (${cpfDigits} != '' AND regexp_replace(p.cpf, '[^0-9]', '', 'g') = ${cpfDigits})
          OR (${phoneDigits} != '' AND regexp_replace(u.phone, '[^0-9]', '', 'g') = ${phoneDigits})
      `;
      if (candidateIds.length > 0) {
        const matches = await prisma.patient.findMany({
          where: { id: { in: candidateIds.map((c) => c.id) } },
          include: patientInclude,
        });
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
    await prisma.user.update({ where: { id: existing.userId }, data: { isActive: false } });
    res.status(204).send();
  }),
);

router.post(
  "/:id/reativar",
  asyncHandler(async (req, res) => {
    const existing = await prisma.patient.findUnique({ where: { id: req.params.id }, include: { user: true } });
    if (!existing) throw notFound("Paciente não encontrado.");
    await prisma.patient.update({ where: { id: existing.id }, data: { isActive: true } });
    if (existing.userId) await prisma.user.update({ where: { id: existing.userId }, data: { isActive: true } });
    res.json(toPatientRich(await prisma.patient.findUniqueOrThrow({ where: { id: existing.id }, include: patientInclude })));
  }),
);

export default router;
