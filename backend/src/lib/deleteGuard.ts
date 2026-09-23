import { prisma } from "../db.js";
import { conflict } from "./httpError.js";

// Apaga tudo que trava a exclusão de um Appointment por causa de onDelete: Restrict
// (SessionNote, Commission, Payment) e então o próprio agendamento. AppointmentStatusLog
// e AppointmentEquipment já são Cascade no schema, não precisam de tratamento aqui.
const cascadeDeleteAppointment = async (appointmentId: string) => {
  await prisma.sessionNote.deleteMany({ where: { appointmentId } });
  await prisma.commission.deleteMany({ where: { appointmentId } });
  await prisma.payment.deleteMany({ where: { appointmentId } });
  await prisma.appointment.delete({ where: { id: appointmentId } });
};

export type BlockedSummary = { blocked: true; recommendDeactivate: boolean; summary: string };

export const checkAppointmentBlockers = async (appointmentId: string): Promise<BlockedSummary | null> => {
  const [hasPayment, hasSessionNote, commissions] = await Promise.all([
    prisma.payment.findUnique({ where: { appointmentId } }),
    prisma.sessionNote.findUnique({ where: { appointmentId } }),
    prisma.commission.count({ where: { appointmentId } }),
  ]);
  if (!hasPayment && !hasSessionNote && commissions === 0) return null;

  const parts: string[] = [];
  if (hasPayment) parts.push("um pagamento");
  if (commissions > 0) parts.push(`${commissions} comissão(ões)`);
  if (hasSessionNote) parts.push("um prontuário de evolução");
  return {
    blocked: true,
    recommendDeactivate: false,
    summary: `Este agendamento possui ${parts.join(", ")} vinculado(s). Excluir apaga tudo isso permanentemente — considere cancelar o agendamento em vez de excluí-lo.`,
  };
};

export const deleteAppointmentSafe = async (appointmentId: string, cascade: boolean) => {
  const blocked = await checkAppointmentBlockers(appointmentId);
  if (blocked && !cascade) throw conflict(blocked.summary, blocked);
  if (blocked) {
    await cascadeDeleteAppointment(appointmentId);
    return;
  }
  await prisma.appointment.delete({ where: { id: appointmentId } });
};

export const deleteFutureAppointmentsSafe = async (
  recurrenceGroupId: string,
  fromDate: Date,
  cascade: boolean,
): Promise<{ count: number }> => {
  const appointments = await prisma.appointment.findMany({
    where: { recurrenceGroupId, date: { gte: fromDate } },
    select: { id: true },
  });

  const blockedCount = (
    await Promise.all(appointments.map((a) => checkAppointmentBlockers(a.id)))
  ).filter(Boolean).length;

  if (blockedCount > 0 && !cascade) {
    throw conflict(
      `${blockedCount} desses agendamentos já possuem pagamento, comissão ou prontuário vinculados. Excluir apaga tudo isso permanentemente.`,
      { blocked: true, recommendDeactivate: false },
    );
  }

  if (blockedCount > 0) {
    for (const appointment of appointments) await cascadeDeleteAppointment(appointment.id);
    return { count: appointments.length };
  }

  const result = await prisma.appointment.deleteMany({ where: { recurrenceGroupId, date: { gte: fromDate } } });
  return { count: result.count };
};

export const checkProfessionalBlockers = async (professionalId: string): Promise<BlockedSummary | null> => {
  const appointments = await prisma.appointment.findMany({ where: { professionalId }, select: { patientId: true } });
  const sessionNotes = await prisma.sessionNote.count({ where: { professionalId } });
  const commissions = await prisma.commission.count({ where: { professionalId } });
  if (appointments.length === 0 && sessionNotes === 0 && commissions === 0) return null;

  const distinctPatients = new Set(appointments.map((a) => a.patientId)).size;
  return {
    blocked: true,
    recommendDeactivate: true,
    summary:
      `Este profissional possui ${appointments.length} agendamento(s) (${distinctPatients} paciente(s) diferentes), ` +
      `${sessionNotes} prontuário(s) de evolução e ${commissions} comissão(ões) vinculados. ` +
      `Recomendamos desativar o profissional em vez de excluir, para preservar o histórico clínico e financeiro.`,
  };
};

// Sempre seguro de limpar antes de excluir um profissional: são só configuração de agenda,
// sem valor histórico depois que o profissional deixa de existir.
const clearProfessionalSchedulingConfig = async (professionalId: string) => {
  await prisma.professionalSchedule.deleteMany({ where: { professionalId } });
  await prisma.professionalBlock.deleteMany({ where: { professionalId } });
};

export const deleteProfessionalCascade = async (professionalId: string) => {
  await clearProfessionalSchedulingConfig(professionalId);
  const appointments = await prisma.appointment.findMany({ where: { professionalId }, select: { id: true } });
  for (const appointment of appointments) await cascadeDeleteAppointment(appointment.id);
  // Comissões sem agendamento vinculado (não deveria acontecer, mas por segurança) e o profissional.
  await prisma.commission.deleteMany({ where: { professionalId } });
  const professional = await prisma.professional.findUnique({ where: { id: professionalId } });
  await prisma.professional.delete({ where: { id: professionalId } });
  if (professional?.userId) await prisma.user.update({ where: { id: professional.userId }, data: { isActive: false } });
};

export const deleteProfessionalSafe = async (professionalId: string, cascade: boolean) => {
  const blocked = await checkProfessionalBlockers(professionalId);
  if (blocked && !cascade) throw conflict(blocked.summary, blocked);
  if (blocked) {
    await deleteProfessionalCascade(professionalId);
    return;
  }
  await clearProfessionalSchedulingConfig(professionalId);
  const professional = await prisma.professional.findUnique({ where: { id: professionalId } });
  await prisma.professional.delete({ where: { id: professionalId } });
  if (professional?.userId) await prisma.user.update({ where: { id: professional.userId }, data: { isActive: false } });
};

export const checkServiceBlockers = async (serviceId: string): Promise<BlockedSummary | null> => {
  const appointments = await prisma.appointment.findMany({ where: { serviceId }, select: { patientId: true } });
  if (appointments.length === 0) return null;

  const distinctPatients = new Set(appointments.map((a) => a.patientId)).size;
  return {
    blocked: true,
    recommendDeactivate: true,
    summary:
      `Este serviço possui ${appointments.length} agendamento(s) (${distinctPatients} paciente(s) diferentes) vinculados, ` +
      `incluindo prontuários e comissões associados a eles. ` +
      `Recomendamos desativar o serviço em vez de excluir, para preservar o histórico clínico e financeiro.`,
  };
};

export const deleteServiceSafe = async (serviceId: string, cascade: boolean) => {
  const blocked = await checkServiceBlockers(serviceId);
  if (blocked && !cascade) throw conflict(blocked.summary, blocked);
  if (blocked) {
    const appointments = await prisma.appointment.findMany({ where: { serviceId }, select: { id: true } });
    for (const appointment of appointments) await cascadeDeleteAppointment(appointment.id);
  }
  await prisma.service.delete({ where: { id: serviceId } });
};

// Para recursos onde o vínculo bloqueante é só uma referência opcional (não histórico
// clínico/financeiro) — cascade aqui significa desvincular ou apagar a linha de
// configuração dependente, nunca apagar agendamento/paciente.

export const checkCategoryBlockers = async (categoryId: string): Promise<BlockedSummary | null> => {
  const children = await prisma.category.count({ where: { parentId: categoryId } });
  if (children === 0) return null;
  return {
    blocked: true,
    recommendDeactivate: false,
    summary: `Esta categoria possui ${children} subcategoria(s) vinculada(s). Elas ficarão sem categoria-mãe se você continuar.`,
  };
};

export const deleteCategorySafe = async (categoryId: string, cascade: boolean) => {
  const blocked = await checkCategoryBlockers(categoryId);
  if (blocked && !cascade) throw conflict(blocked.summary, blocked);
  if (blocked) await prisma.category.updateMany({ where: { parentId: categoryId }, data: { parentId: null } });
  await prisma.category.delete({ where: { id: categoryId } });
};

export const checkRoomBlockers = async (roomId: string): Promise<BlockedSummary | null> => {
  const appointments = await prisma.appointment.count({ where: { roomId } });
  const defaultForServices = await prisma.service.count({ where: { defaultRoomId: roomId } });
  if (appointments === 0 && defaultForServices === 0) return null;
  return {
    blocked: true,
    recommendDeactivate: false,
    summary:
      `Esta sala está vinculada a ${appointments} agendamento(s) e é sala padrão de ${defaultForServices} serviço(s). ` +
      `Esses vínculos ficarão sem sala definida se você continuar.`,
  };
};

export const deleteRoomSafe = async (roomId: string, cascade: boolean) => {
  const blocked = await checkRoomBlockers(roomId);
  if (blocked && !cascade) throw conflict(blocked.summary, blocked);
  if (blocked) {
    await prisma.appointment.updateMany({ where: { roomId }, data: { roomId: null } });
    await prisma.service.updateMany({ where: { defaultRoomId: roomId }, data: { defaultRoomId: null } });
  }
  await prisma.room.delete({ where: { id: roomId } });
};

export const checkPlanBlockers = async (planId: string): Promise<BlockedSummary | null> => {
  const appointments = await prisma.appointment.count({ where: { planId } });
  if (appointments === 0) return null;
  return {
    blocked: true,
    recommendDeactivate: false,
    summary: `Este convênio está vinculado a ${appointments} agendamento(s). Eles passarão a particular (sem convênio) se você continuar.`,
  };
};

export const deletePlanSafe = async (planId: string, cascade: boolean) => {
  const blocked = await checkPlanBlockers(planId);
  if (blocked && !cascade) throw conflict(blocked.summary, blocked);
  if (blocked) await prisma.appointment.updateMany({ where: { planId }, data: { planId: null } });
  await prisma.plan.delete({ where: { id: planId } });
};

export const checkJobOpeningBlockers = async (jobOpeningId: string): Promise<BlockedSummary | null> => {
  const applications = await prisma.jobApplication.count({ where: { jobOpeningId } });
  if (applications === 0) return null;
  return {
    blocked: true,
    recommendDeactivate: false,
    summary: `Esta vaga possui ${applications} candidatura(s) recebida(s). Elas serão mantidas, mas ficarão sem vaga associada, se você continuar.`,
  };
};

export const deleteJobOpeningSafe = async (jobOpeningId: string, cascade: boolean) => {
  const blocked = await checkJobOpeningBlockers(jobOpeningId);
  if (blocked && !cascade) throw conflict(blocked.summary, blocked);
  if (blocked) await prisma.jobApplication.updateMany({ where: { jobOpeningId }, data: { jobOpeningId: null } });
  await prisma.jobOpening.delete({ where: { id: jobOpeningId } });
};

export const checkMessageTemplateBlockers = async (templateId: string): Promise<BlockedSummary | null> => {
  const rules = await prisma.notificationRule.count({ where: { templateId } });
  if (rules === 0) return null;
  return {
    blocked: true,
    recommendDeactivate: false,
    summary: `Este template está em uso por ${rules} regra(s) de notificação automática. Essas regras serão excluídas junto se você continuar.`,
  };
};

export const deleteMessageTemplateSafe = async (templateId: string, cascade: boolean) => {
  const blocked = await checkMessageTemplateBlockers(templateId);
  if (blocked && !cascade) throw conflict(blocked.summary, blocked);
  if (blocked) await prisma.notificationRule.deleteMany({ where: { templateId } });
  await prisma.messageTemplate.delete({ where: { id: templateId } });
};
