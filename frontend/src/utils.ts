import type { Appointment, Professional, Service } from "./types";

export const currency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export const dateLabel = (date: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00`));

export const getService = (services: Service[], id?: string) => services.find((service) => service.id === id);

export const getProfessional = (professionals: Professional[], id?: string) =>
  professionals.find((professional) => professional.id === id);

export const appointmentTitle = (appointment: Appointment, services: Service[], professionals: Professional[]) => {
  const service = getService(services, appointment.serviceId)?.name ?? "Serviço";
  const professional = getProfessional(professionals, appointment.professionalId)?.name ?? "Profissional";
  return `${service} com ${professional}`;
};

export const roleLabel = (role: string) => {
  const labels: Record<string, string> = {
    paciente: "Paciente",
    profissional: "Profissional",
    recepcao: "Recepção",
    admin: "Admin",
    atendente: "Atendente",
    administrativo: "Administrativo",
  };
  return labels[role] ?? role;
};
