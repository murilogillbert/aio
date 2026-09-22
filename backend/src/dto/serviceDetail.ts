import { prisma } from "../db.js";

const detailInclude = {
  serviceCategories: true,
  professionalServices: true,
  roomServices: true,
  serviceEquipments: true,
  taxes: true,
  planServices: true,
} as const;

type ServiceDetailRow = NonNullable<
  Awaited<ReturnType<typeof prisma.service.findFirst<{ include: typeof detailInclude }>>>
>;

export const toServiceDetailDto = (service: ServiceDetailRow) => ({
  id: service.id,
  name: service.name,
  shortDescription: service.shortDescription,
  description: service.description,
  preparation: service.preparation,
  color: service.color,
  durationMinutes: service.durationMinutes,
  basePrice: Number(service.basePrice),
  requiresRoom: service.requiresRoom,
  defaultRoomId: service.defaultRoomId,
  onlineBooking: service.onlineBooking,
  showPrice: service.showPrice,
  showDuration: service.showDuration,
  isActive: service.isActive,
  featured: service.featured,
  categoryIds: service.serviceCategories.map((sc) => sc.categoryId),
  professionals: service.professionalServices.map((ps) => ({
    professionalId: ps.professionalId,
    compensationType: ps.compensationType,
    compensationValue: ps.compensationValue ? Number(ps.compensationValue) : null,
    commissionTaxMode: ps.commissionTaxMode,
    commissionTaxPercent: ps.commissionTaxPercent ? Number(ps.commissionTaxPercent) : null,
  })),
  roomIds: service.roomServices.map((rs) => rs.roomId),
  equipments: service.serviceEquipments.map((se) => ({ equipmentId: se.equipmentId, required: se.required })),
  taxes: service.taxes.map((tax) => ({ id: tax.id, name: tax.name, percent: Number(tax.percent) })),
  plans: service.planServices.map((ps) => ({
    planId: ps.planId,
    coverageRule: ps.coverageRule,
    customPrice: ps.customPrice ? Number(ps.customPrice) : null,
    showPrice: ps.showPrice,
  })),
});

export const findServiceDetail = async (id: string) => {
  const service = await prisma.service.findUnique({ where: { id }, include: detailInclude });
  return service ? toServiceDetailDto(service) : null;
};

const normalizeCompensationType = (value: string) =>
  value === "custom_percent" || value === "fixed_value" ? value : "default_commission";

const normalizeCommissionTaxMode = (value?: string) =>
  value === "service" || value === "custom" ? value : "none";

export type ServiceUpsertBody = {
  name: string;
  shortDescription: string;
  description: string;
  preparation: string;
  color: string;
  durationMinutes: number;
  basePrice: number;
  requiresRoom: boolean;
  defaultRoomId?: string | null;
  onlineBooking: boolean;
  showPrice: boolean;
  showDuration: boolean;
  isActive: boolean;
  featured: boolean;
  categoryIds: string[];
  professionals: {
    professionalId: string;
    compensationType: string;
    compensationValue?: number | null;
    commissionTaxMode?: string;
    commissionTaxPercent?: number | null;
  }[];
  roomIds: string[];
  equipments: { equipmentId: string; required: boolean }[];
  taxes: { id?: string; name: string; percent: number }[];
  plans: { planId: string; coverageRule: string; customPrice?: number | null; showPrice: boolean }[];
};

const scalarData = (body: ServiceUpsertBody) => ({
  name: body.name,
  shortDescription: body.shortDescription ?? "",
  description: body.description ?? "",
  preparation: body.preparation ?? "",
  color: body.color || "#C2410C",
  durationMinutes: body.durationMinutes > 0 ? body.durationMinutes : 60,
  basePrice: body.basePrice ?? 0,
  requiresRoom: Boolean(body.requiresRoom),
  defaultRoomId: body.defaultRoomId ?? null,
  onlineBooking: body.onlineBooking ?? true,
  showPrice: body.showPrice ?? true,
  showDuration: body.showDuration ?? true,
  isActive: body.isActive ?? true,
  featured: Boolean(body.featured),
});

const replaceRelations = async (serviceId: string, body: ServiceUpsertBody) => {
  await prisma.serviceCategory.deleteMany({ where: { serviceId } });
  const categoryIds = [...new Set(body.categoryIds ?? [])];
  if (categoryIds.length) {
    await prisma.serviceCategory.createMany({ data: categoryIds.map((categoryId) => ({ serviceId, categoryId })) });
  }

  await prisma.professionalService.deleteMany({ where: { serviceId } });
  const professionals = new Map((body.professionals ?? []).map((p) => [p.professionalId, p]));
  if (professionals.size) {
    await prisma.professionalService.createMany({
      data: [...professionals.values()].map((p) => {
        const compensationType = normalizeCompensationType(p.compensationType);
        const commissionTaxMode = normalizeCommissionTaxMode(p.commissionTaxMode);
        return {
          serviceId,
          professionalId: p.professionalId,
          compensationType,
          compensationValue: compensationType === "default_commission" ? null : p.compensationValue ?? null,
          commissionTaxMode,
          commissionTaxPercent: commissionTaxMode === "custom" ? p.commissionTaxPercent ?? null : null,
        };
      }),
    });
  }

  await prisma.roomService.deleteMany({ where: { serviceId } });
  const roomIds = [...new Set(body.roomIds ?? [])];
  if (roomIds.length) {
    await prisma.roomService.createMany({ data: roomIds.map((roomId) => ({ serviceId, roomId })) });
  }

  await prisma.serviceEquipment.deleteMany({ where: { serviceId } });
  const equipments = new Map((body.equipments ?? []).map((e) => [e.equipmentId, e]));
  if (equipments.size) {
    await prisma.serviceEquipment.createMany({
      data: [...equipments.values()].map((e) => ({ serviceId, equipmentId: e.equipmentId, required: e.required })),
    });
  }

  await prisma.serviceTax.deleteMany({ where: { serviceId } });
  if (body.taxes?.length) {
    await prisma.serviceTax.createMany({
      data: body.taxes.map((tax) => ({ serviceId, name: tax.name, percent: tax.percent })),
    });
  }

  await prisma.planService.deleteMany({ where: { serviceId } });
  const plans = new Map((body.plans ?? []).map((p) => [p.planId, p]));
  if (plans.size) {
    await prisma.planService.createMany({
      data: [...plans.values()].map((p) => ({
        serviceId,
        planId: p.planId,
        coverageRule: p.coverageRule ?? "",
        customPrice: p.customPrice ?? null,
        showPrice: p.showPrice ?? true,
      })),
    });
  }
};

export const createService = async (body: ServiceUpsertBody) => {
  const service = await prisma.service.create({ data: scalarData(body) });
  await replaceRelations(service.id, body);
  return findServiceDetail(service.id);
};

export const updateService = async (id: string, body: ServiceUpsertBody) => {
  await prisma.service.update({ where: { id }, data: scalarData(body) });
  await replaceRelations(id, body);
  return findServiceDetail(id);
};
