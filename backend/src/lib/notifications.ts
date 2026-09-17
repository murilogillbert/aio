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

export const notifyAdminsPaymentConfirmed = async (appointmentId: string, amount: number): Promise<void> => {
  const admins = await prisma.user.findMany({
    where: { isActive: true, userRoles: { some: { role: { name: "admin" } } } },
    select: { email: true },
  });
  if (admins.length === 0) return;

  const html = `<p>Pagamento de <strong>R$ ${amount.toFixed(2)}</strong> confirmado para o agendamento <code>${appointmentId}</code>.</p>`;
  await sendEmailSilently({ to: admins.map((a) => a.email), subject: "Pagamento confirmado", html });
};
