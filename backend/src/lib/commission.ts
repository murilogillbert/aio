import { prisma } from "../db.js";

const round2 = (value: number) => Math.round(value * 100) / 100;

export const computeCommission = async (
  professionalId: string,
  serviceId: string,
  amount: number,
  defaultCommissionPercent: number,
): Promise<{ commissionAmount: number; commissionPct: number; taxPercent: number; netAmount: number }> => {
  const professionalService = await prisma.professionalService.findUnique({
    where: { professionalId_serviceId: { professionalId, serviceId } },
  });

  let commissionAmount: number;
  let commissionPct: number;

  if (professionalService?.compensationType === "fixed_value" && professionalService.compensationValue) {
    commissionAmount = Number(professionalService.compensationValue);
    commissionPct = amount > 0 ? round2((commissionAmount / amount) * 100) : 0;
  } else if (professionalService?.compensationType === "custom_percent" && professionalService.compensationValue) {
    commissionPct = Number(professionalService.compensationValue);
    commissionAmount = round2(amount * (commissionPct / 100));
  } else {
    commissionPct = defaultCommissionPercent;
    commissionAmount = round2(amount * (commissionPct / 100));
  }

  const taxPercent = await resolveCommissionTaxPercent(professionalService, serviceId);
  const netAmount = round2(commissionAmount * (1 - taxPercent / 100));

  return { commissionAmount, commissionPct, taxPercent, netAmount };
};

const resolveCommissionTaxPercent = async (
  professionalService: { commissionTaxMode: string; commissionTaxPercent: unknown } | null,
  serviceId: string,
): Promise<number> => {
  if (!professionalService || professionalService.commissionTaxMode === "none") return 0;

  if (professionalService.commissionTaxMode === "custom") {
    return professionalService.commissionTaxPercent ? Number(professionalService.commissionTaxPercent) : 0;
  }

  if (professionalService.commissionTaxMode === "service") {
    const taxes = await prisma.serviceTax.findMany({ where: { serviceId } });
    return round2(taxes.reduce((sum, tax) => sum + Number(tax.percent), 0));
  }

  return 0;
};
