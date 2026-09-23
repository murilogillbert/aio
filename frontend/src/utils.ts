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

// "Hoje" no fuso local do navegador, como YYYY-MM-DD. NUNCA usar `new Date().toISOString().slice(0,10)`
// para isso: perto da virada do dia (ex.: 21h-23h59 no Brasil, UTC-3), toISOString() já converteu
// para o dia seguinte em UTC, fazendo o dashboard consultar a data errada bem no horário de pico.
export const todayLocalDate = (): string => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

// Agendamentos guardam data/hora "naive" (hora de parede, sem fuso real) mas serializados como
// ISO com sufixo "Z" (ex.: combineIso() no backend) — ou seja, "startTime" não é um instante UTC
// de verdade. Para comparar com "agora" corretamente (sem deslocar pelo fuso do navegador),
// construímos um "agora" na mesma convenção: os componentes do relógio local, rotulados como Z.
export const naiveNowIso = (): string => {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.000Z`;
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
