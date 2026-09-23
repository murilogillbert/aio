import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { notFound } from "../lib/httpError.js";
import { primaryRole } from "../dto/user.js";

const router = Router();

const serviceInclude = {
  serviceCategories: { include: { category: true } },
  professionalServices: true,
  roomServices: true,
  serviceEquipments: true,
  planServices: { include: { plan: true } },
} as const;

type ServiceWithRelations = Awaited<ReturnType<typeof prisma.service.findFirst<{ include: typeof serviceInclude }>>>;

const toServiceDto = (service: NonNullable<ServiceWithRelations>) => ({
  id: service.id,
  name: service.name,
  category: service.serviceCategories[0]?.category.name ?? "",
  shortDescription: service.shortDescription,
  description: service.description,
  durationMinutes: service.durationMinutes,
  priceFrom: Number(service.basePrice),
  professionalIds: service.professionalServices.map((ps) => ps.professionalId),
  roomIds: service.roomServices.map((rs) => rs.roomId),
  equipmentIds: service.serviceEquipments.map((se) => se.equipmentId),
  featured: service.featured,
  plans: service.planServices.map((ps) => ({
    planId: ps.planId,
    planName: ps.plan.name,
    coverageRule: ps.coverageRule,
    customPrice: ps.customPrice ? Number(ps.customPrice) : null,
    showPrice: ps.showPrice,
  })),
});

const professionalInclude = {
  user: { include: { userRoles: { include: { role: true } } } },
  professionalServices: { include: { service: { include: { serviceCategories: { include: { category: true } } } } } },
  schedules: true,
} as const;

type ProfessionalWithRelations = Awaited<
  ReturnType<typeof prisma.professional.findFirst<{ include: typeof professionalInclude }>>
>;

const toProfessionalDto = (professional: NonNullable<ProfessionalWithRelations>) => {
  const categories = new Set<string>();
  professional.professionalServices.forEach((ps) => {
    ps.service.serviceCategories.forEach((sc) => categories.add(sc.category.name));
  });

  const role = professional.user
    ? primaryRole(professional.user.userRoles)
    : professional.providesCare
      ? "profissional"
      : "administrativo";

  return {
    id: professional.id,
    name: professional.name,
    role,
    photoUrl: professional.photoUrl,
    bio: professional.bio,
    specialty: professional.specialty,
    categories: [...categories],
    defaultCommission: Number(professional.defaultCommissionPercent),
    services: professional.professionalServices.map((ps) => ps.serviceId),
    workingHours: professional.schedules.map((schedule) => ({
      weekday: schedule.weekday,
      start: schedule.startTime,
      end: schedule.endTime,
    })),
    monthlyFixedPayment: professional.monthlyFixedPayment ? Number(professional.monthlyFixedPayment) : undefined,
    featured: professional.featured,
  };
};

router.get(
  "/servicos",
  asyncHandler(async (_req, res) => {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: serviceInclude,
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });
    res.json(services.map(toServiceDto));
  }),
);

router.get(
  "/servicos/:id",
  asyncHandler(async (req, res) => {
    const service = await prisma.service.findUnique({ where: { id: req.params.id }, include: serviceInclude });
    if (!service) throw notFound("Serviço não encontrado.");
    res.json(toServiceDto(service));
  }),
);

router.get(
  "/profissionais",
  asyncHandler(async (_req, res) => {
    const professionals = await prisma.professional.findMany({
      where: { isActive: true },
      include: professionalInclude,
      orderBy: [{ featured: "desc" }, { name: "asc" }],
    });
    res.json(professionals.map(toProfessionalDto));
  }),
);

router.get(
  "/profissionais/:id",
  asyncHandler(async (req, res) => {
    const professional = await prisma.professional.findUnique({
      where: { id: req.params.id },
      include: professionalInclude,
    });
    if (!professional) throw notFound("Profissional não encontrado.");
    res.json(toProfessionalDto(professional));
  }),
);

router.get(
  "/profissionais/por-servico/:serviceId",
  asyncHandler(async (req, res) => {
    const professionals = await prisma.professional.findMany({
      where: { isActive: true, professionalServices: { some: { serviceId: req.params.serviceId } } },
      include: professionalInclude,
    });
    res.json(professionals.map(toProfessionalDto));
  }),
);

router.get(
  "/categorias",
  asyncHandler(async (_req, res) => {
    const categories = await prisma.category.findMany();
    res.json(categories.map((category) => category.name));
  }),
);

export default router;
