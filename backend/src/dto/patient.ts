import { dateOnlyString } from "../lib/datetime.js";

type PatientWithUser = {
  id: string;
  userId: string;
  cpf: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  notes: string;
  isActive: boolean;
  birthDate: Date | null;
  user: { fullName: string; email: string; phone: string };
  _count?: { dependents: number };
};

export const toPatientRich = (patient: PatientWithUser) => ({
  id: patient.id,
  userId: patient.userId,
  name: patient.user.fullName,
  email: patient.user.email,
  phone: patient.user.phone,
  cpf: patient.cpf,
  birthDate: patient.birthDate ? dateOnlyString(patient.birthDate) : null,
  address: patient.address,
  city: patient.city,
  state: patient.state,
  postalCode: patient.postalCode,
  notes: patient.notes,
  isActive: patient.isActive,
  dependents: patient._count?.dependents ?? 0,
});

export const digitsOnly = (value: string) => value.replace(/\D/g, "");

const PASSWORD_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export const generatePassword = (length = 10) => {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += PASSWORD_ALPHABET[Math.floor(Math.random() * PASSWORD_ALPHABET.length)];
  }
  return result;
};
