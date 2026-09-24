import { prisma } from "../db.js";
import { sendEmailSilently } from "./email.js";

// Notificações inline, chamadas (e aguardadas) dentro dos próprios handlers de rota.
// Em serverless não há processo de fundo confiável (a function encerra assim que a
// resposta é enviada), então o envio precisa terminar antes do `res.json(...)`.
// `sendEmailSilently` nunca lança — uma falha de e-mail não derruba o fluxo principal.

export const notifyAppointmentCreated = async (appointmentId: string): Promise<void> => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { patient: { include: { user: true } }, professional: true, service: true },
  });
  if (!appointment) return;

  const dateLabel = appointment.date.toISOString().slice(0, 10);
  const html = `
    <p>Novo agendamento confirmado:</p>
    <ul>
      <li><strong>Serviço:</strong> ${appointment.service.name}</li>
      <li><strong>Data:</strong> ${dateLabel} às ${appointment.time}</li>
      <li><strong>Paciente:</strong> ${appointment.patient.user.fullName}</li>
      <li><strong>Profissional:</strong> ${appointment.professional.name}</li>
    </ul>
  `;

  const recipients = [appointment.patient.user.email, appointment.professional.email].filter(
    (email): email is string => Boolean(email),
  );
  if (recipients.length === 0) return;

  await sendEmailSilently({ to: recipients, subject: "Novo agendamento", html });
};

// Avisa a recepção e a administração, pelo canal interno de mensagens (não e-mail), sempre que
// um paciente cria um novo agendamento. Só considera a primeira conta (mais antiga) de cada role,
// conforme pedido — não é um broadcast para toda a equipe.
export const notifyNewAppointmentInternally = async (appointmentId: string): Promise<void> => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: { include: { user: true } },
      dependent: true,
      professional: true,
      service: true,
      plan: true,
    },
  });
  if (!appointment) return;

  const [firstAdmin, firstRecepcao] = await Promise.all([
    prisma.user.findFirst({ where: { userRoles: { some: { role: { name: "admin" } } } }, orderBy: { createdAt: "asc" } }),
    prisma.user.findFirst({ where: { userRoles: { some: { role: { name: "recepcao" } } } }, orderBy: { createdAt: "asc" } }),
  ]);
  const recipientIds = Array.from(new Set([firstAdmin?.id, firstRecepcao?.id].filter((id): id is string => Boolean(id))));
  if (recipientIds.length === 0) return;

  const dateLabel = appointment.date.toISOString().slice(0, 10);
  const patientName = appointment.dependent?.fullName ?? appointment.patient.user.fullName;
  const body = [
    "Novo agendamento criado pelo paciente.",
    `Paciente: ${patientName}`,
    `Data: ${dateLabel} às ${appointment.time}`,
    `Convênio: ${appointment.plan?.name ?? "Particular"}`,
    `Serviço: ${appointment.service.name}`,
    `Profissional: ${appointment.professional.name}`,
  ].join("\n");

  let conversation = await prisma.conversation.findFirst({
    where: { AND: recipientIds.map((userId) => ({ participants: { some: { userId } } })) },
    include: { participants: true },
  });
  if (conversation && conversation.participants.length !== recipientIds.length) conversation = null;

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        title: "Novos agendamentos",
        channel: "Interno",
        participants: { create: recipientIds.map((userId) => ({ userId })) },
      },
      include: { participants: true },
    });
  }

  await prisma.message.create({
    data: { conversationId: conversation.id, authorUserId: null, authorName: "Sistema", channel: "Interno", body },
  });
};

// Avisa o profissional, pelo canal interno de mensagens, quando a recepção faz check-in
// (notifica chegada) de um paciente — aparece nas mensagens dela junto com o restante da
// conversa com quem fez o check-in, permitindo responder.
export const notifyPatientArrived = async (
  appointmentId: string,
  checkedInBy: { id: string; fullName: string },
): Promise<void> => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { professional: true, patient: { include: { user: true } }, dependent: true, service: true },
  });
  if (!appointment?.professional.userId) return;
  if (appointment.professional.userId === checkedInBy.id) return;

  const professionalUserId = appointment.professional.userId;
  const patientName = appointment.dependent?.fullName ?? appointment.patient.user.fullName;
  const body = `Paciente ${patientName} chegou para o atendimento de ${appointment.service.name} às ${appointment.time}.`;

  const recipientIds = [checkedInBy.id, professionalUserId];
  let conversation = await prisma.conversation.findFirst({
    where: { AND: recipientIds.map((userId) => ({ participants: { some: { userId } } })) },
    include: { participants: true },
  });
  if (conversation && conversation.participants.length !== recipientIds.length) conversation = null;

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { title: "", channel: "Interno", participants: { create: recipientIds.map((userId) => ({ userId })) } },
      include: { participants: true },
    });
  }

  await prisma.message.create({
    data: { conversationId: conversation.id, authorUserId: checkedInBy.id, authorName: checkedInBy.fullName, channel: "Interno", body },
  });
};

export const notifyPatientRegistered = async (params: { email: string; fullName: string }): Promise<void> => {
  const html = `
    <div style="font-family: sans-serif; max-width: 480px;">
      <h2>Bem-vindo(a), ${params.fullName}</h2>
      <p>Seu cadastro foi realizado com sucesso. Agora você já pode entrar na sua conta para agendar consultas e acompanhar seus atendimentos.</p>
    </div>
  `;
  await sendEmailSilently({ to: params.email, subject: "Cadastro confirmado", html });
};

export const notifyAdminsPaymentConfirmed = async (appointmentId: string, amount: number): Promise<void> => {
  const admins = await prisma.user.findMany({
    where: { isActive: true, userRoles: { some: { role: { name: "admin" } } } },
    select: { email: true },
  });
  if (admins.length === 0) return;

  const html = `<p>Pagamento de <strong>R$ ${amount.toFixed(2)}</strong> confirmado para o agendamento <code>${appointmentId}</code>.</p>`;
  await sendEmailSilently({ to: admins.map((a) => a.email), subject: "Pagamento confirmado", html });
};

const CANCELLATION_SOURCE_LABEL: Record<string, string> = {
  Paciente: "pelo paciente",
  Recepcao: "pela recepção",
  Profissional: "pelo profissional",
  Sistema: "pelo sistema",
};

export const notifyAppointmentCancelled = async (appointmentId: string, cancellationSource?: string | null): Promise<void> => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { patient: { include: { user: true } }, professional: true, service: true },
  });
  if (!appointment) return;

  const dateLabel = appointment.date.toISOString().slice(0, 10);
  const who = cancellationSource ? CANCELLATION_SOURCE_LABEL[cancellationSource] ?? "" : "";
  const html = `
    <p>O agendamento abaixo foi cancelado ${who}:</p>
    <ul>
      <li><strong>Serviço:</strong> ${appointment.service.name}</li>
      <li><strong>Data:</strong> ${dateLabel} às ${appointment.time}</li>
      <li><strong>Paciente:</strong> ${appointment.patient.user.fullName}</li>
      <li><strong>Profissional:</strong> ${appointment.professional.name}</li>
    </ul>
  `;

  const recipients = [appointment.patient.user.email, appointment.professional.email].filter(
    (email): email is string => Boolean(email),
  );
  if (recipients.length === 0) return;

  await sendEmailSilently({ to: recipients, subject: "Agendamento cancelado", html });
};

export const notifyAppointmentConfirmed = async (appointmentId: string): Promise<void> => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { patient: { include: { user: true } }, professional: true, service: true },
  });
  if (!appointment) return;

  const dateLabel = appointment.date.toISOString().slice(0, 10);
  const html = `
    <p>Seu atendimento foi confirmado:</p>
    <ul>
      <li><strong>Serviço:</strong> ${appointment.service.name}</li>
      <li><strong>Data:</strong> ${dateLabel} às ${appointment.time}</li>
      <li><strong>Profissional:</strong> ${appointment.professional.name}</li>
    </ul>
  `;
  if (!appointment.patient.user.email) return;
  await sendEmailSilently({ to: appointment.patient.user.email, subject: "Atendimento confirmado", html });
};

const REMINDER_WINDOW_START_HOURS = 23;
const REMINDER_WINDOW_END_HOURS = 25;

/**
 * Dispara lembretes para agendamentos entre 23h e 25h no futuro (janela de 2h para
 * cobrir uma execução do cron a cada hora sem duplicar nem pular nenhum). Marca
 * `reminderSentAt` para nunca reenviar o mesmo lembrete. Chamado por POST /api/jobs/lembretes,
 * disparado externamente (GitHub Actions), já que não há processo de fundo em serverless.
 */
export const runAppointmentReminders = async (): Promise<{ sent: number; skippedDisabled: boolean }> => {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic?.remindersEnabled) return { sent: 0, skippedDisabled: true };

  const now = new Date();
  const windowStart = new Date(now.getTime() + REMINDER_WINDOW_START_HOURS * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_END_HOURS * 60 * 60 * 1000);

  const candidates = await prisma.appointment.findMany({
    where: {
      status: { notIn: ["Cancelado", "Realizado", "NaoCompareceu"] },
      reminderSentAt: null,
      date: { gte: dateOnlyUtc(windowStart), lte: dateOnlyUtc(windowEnd) },
    },
    include: { patient: { include: { user: true } }, professional: true, service: true },
  });

  const due = candidates.filter((appointment) => {
    const startsAt = new Date(`${appointment.date.toISOString().slice(0, 10)}T${appointment.time}:00.000Z`);
    return startsAt >= windowStart && startsAt <= windowEnd;
  });

  let sent = 0;
  for (const appointment of due) {
    if (!appointment.patient.user.email) continue;
    const dateLabel = appointment.date.toISOString().slice(0, 10);
    const html = `
      <p>Lembrete: você tem um atendimento amanhã.</p>
      <ul>
        <li><strong>Serviço:</strong> ${appointment.service.name}</li>
        <li><strong>Data:</strong> ${dateLabel} às ${appointment.time}</li>
        <li><strong>Profissional:</strong> ${appointment.professional.name}</li>
      </ul>
    `;
    await sendEmailSilently({ to: appointment.patient.user.email, subject: "Lembrete de atendimento amanhã", html });
    await prisma.appointment.update({ where: { id: appointment.id }, data: { reminderSentAt: new Date() } });
    sent += 1;
  }

  return { sent, skippedDisabled: false };
};

const dateOnlyUtc = (date: Date): Date => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
