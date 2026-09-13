import { prisma } from "../db.js";

export const primaryRole = (userRoles: { role: { name: string } }[]): string =>
  userRoles[0]?.role.name ?? "paciente";

export const buildSafeUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: { include: { role: true } },
      patient: {
        include: {
          dependents: true,
          appointments: { orderBy: [{ date: "asc" }, { time: "asc" }] },
        },
      },
    },
  });
  if (!user) return null;

  const role = primaryRole(user.userRoles);
  const base = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role,
  };

  if (!user.patient) return base;

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: user.id } } },
    include: { messages: { orderBy: { sentAt: "asc" } } },
  });

  return {
    ...base,
    dependents: user.patient.dependents.map((dependent) => ({
      id: dependent.id,
      fullName: dependent.fullName,
      birthDate: dependent.birthDate.toISOString().slice(0, 10),
      relationship: dependent.relationship,
    })),
    appointments: user.patient.appointments.map((appointment) => ({
      id: appointment.id,
      patientId: appointment.patientId,
      dependentId: appointment.dependentId ?? undefined,
      professionalId: appointment.professionalId,
      serviceId: appointment.serviceId,
      date: appointment.date.toISOString().slice(0, 10),
      time: appointment.time,
      status: appointment.status.toLowerCase(),
    })),
    conversations: conversations.map((conversation) => ({
      id: conversation.id,
      title: conversation.title,
      channel: channelLabel(conversation.channel),
      unread: 0,
      messages: conversation.messages.map((message) => ({
        id: message.id,
        author: message.authorName,
        channel: channelLabel(message.channel),
        text: message.body,
        sentAt: message.sentAt.toISOString(),
      })),
    })),
  };
};

export const channelLabel = (channel: string): string => (channel === "Email" ? "E-mail" : channel);
