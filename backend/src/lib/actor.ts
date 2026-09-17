import { prisma } from "../db.js";
import type { AuthUser } from "../middleware/auth.js";

// Resolve o perfil operacional (Professional/Patient) do usuário autenticado —
// usado para escopar dados ao próprio profissional/paciente em vez de expor a base inteira.

export const myProfessionalId = async (user: AuthUser): Promise<string | null> => {
  if (user.role !== "profissional") return null;
  const professional = await prisma.professional.findUnique({ where: { userId: user.id } });
  return professional?.id ?? null;
};

export const myPatientId = async (user: AuthUser): Promise<string | null> => {
  if (user.role !== "paciente") return null;
  const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
  return patient?.id ?? null;
};
