import { prisma } from "../db.js";

export const computeCommission = async (
  professionalId: string,
  serviceId: string,
  amount: number,
  defaultCommissionPercent: number,
): Promise<{ commissionAmount: number; commissionPct: number }> => {
  const professionalService = await prisma.professionalService.findUnique({
    where: { professionalId_serviceId: { professionalId, serviceId } },
  });

  if (professionalService?.compensationType === "fixed_value" && professionalService.compensationValue) {
    const commissionAmount = Number(professionalService.compensationValue);
    const commissionPct = amount > 0 ? Math.round((commissionAmount / amount) * 10000) / 100 : 0;
    return { commissionAmount, commissionPct };
  }
  if (professionalService?.compensationType === "custom_percent" && professionalService.compensationValue) {
    const commissionPct = Number(professionalService.compensationValue);
    const commissionAmount = Math.round(amount * (commissionPct / 100) * 100) / 100;
    return { commissionAmount, commissionPct };
  }
  const commissionPct = defaultCommissionPercent;
  const commissionAmount = Math.round(amount * (commissionPct / 100) * 100) / 100;
  return { commissionAmount, commissionPct };
};
