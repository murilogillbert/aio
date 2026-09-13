import { combineIso, dateOnlyString } from "../lib/datetime.js";

type MedicalRecordWithPatient = {
  id: string;
  patientId: string;
  bloodType: string;
  allergies: string;
  chronicConditions: string;
  currentMedications: string;
  familyHistory: string;
  surgicalHistory: string;
  habits: string;
  heightCm: unknown;
  weightKg: unknown;
  createdAt: Date;
  updatedAt: Date | null;
  patient: { user: { fullName: string } };
};

export const toMedicalRecordDto = (record: MedicalRecordWithPatient, restricted: boolean) => ({
  id: record.id,
  patientId: record.patientId,
  patientName: record.patient.user.fullName,
  bloodType: record.bloodType || null,
  allergies: record.allergies || null,
  chronicConditions: restricted ? null : record.chronicConditions || null,
  currentMedications: record.currentMedications || null,
  familyHistory: restricted ? null : record.familyHistory || null,
  surgicalHistory: restricted ? null : record.surgicalHistory || null,
  habits: restricted ? null : record.habits || null,
  heightCm: record.heightCm !== null ? Number(record.heightCm) : null,
  weightKg: record.weightKg !== null ? Number(record.weightKg) : null,
  createdAt: record.createdAt.toISOString(),
  updatedAt: record.updatedAt ? record.updatedAt.toISOString() : null,
  isRestrictedView: restricted,
});

type SessionNoteWithRelations = {
  id: string;
  appointmentId: string;
  professionalId: string;
  chiefComplaint: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  diagnosis: string;
  diagnosisCode: string;
  prescription: string;
  vitalSignsJson: string;
  isSigned: boolean;
  signedAt: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
};

type AppointmentContext = {
  patientId: string;
  date: Date;
  time: string;
  status: string;
  professional: { name: string };
  service: { name: string };
};

export const toSessionNoteDto = (
  note: SessionNoteWithRelations | null,
  appointment: AppointmentContext,
  restricted: boolean,
) => ({
  id: note?.id ?? "",
  appointmentId: appointment ? note?.appointmentId ?? "" : "",
  patientId: appointment.patientId,
  professionalId: note?.professionalId ?? "",
  professionalName: appointment.professional.name,
  serviceName: appointment.service.name,
  appointmentStartTime: combineIso(dateOnlyString(appointment.date), appointment.time),
  appointmentStatus: appointment.status,
  chiefComplaint: restricted ? null : note?.chiefComplaint || null,
  subjective: restricted ? null : note?.subjective || null,
  objective: restricted ? null : note?.objective || null,
  assessment: restricted ? null : note?.assessment || null,
  plan: restricted ? null : note?.plan || null,
  diagnosis: restricted ? null : note?.diagnosis || null,
  diagnosisCode: restricted ? null : note?.diagnosisCode || null,
  prescription: restricted ? null : note?.prescription || null,
  vitalSignsJson: restricted ? null : note?.vitalSignsJson || null,
  isSigned: note?.isSigned ?? false,
  signedAt: note?.signedAt ? note.signedAt.toISOString() : null,
  createdAt: note?.createdAt ? note.createdAt.toISOString() : new Date().toISOString(),
  updatedAt: note?.updatedAt ? note.updatedAt.toISOString() : null,
  isRestrictedView: restricted,
});
