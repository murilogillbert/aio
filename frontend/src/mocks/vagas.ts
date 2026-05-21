import type { Application, Job } from "../types";

export const jobsMock: Job[] = [
  {
    id: "job-1",
    title: "Recepcionista bilíngue",
    department: "Recepção",
    description: "Atendimento premium, organização de agenda e experiência do paciente.",
    status: "aberta",
  },
  {
    id: "job-2",
    title: "Consultor comercial de saúde",
    department: "Relacionamento",
    description: "Acompanhamento de leads, propostas e conversão de planos de tratamento.",
    status: "aberta",
  },
  {
    id: "job-3",
    title: "Auxiliar de sala",
    department: "Operação clínica",
    description: "Preparo de sala, materiais, equipamentos e suporte aos profissionais.",
    status: "aberta",
  },
  {
    id: "job-4",
    title: "Analista administrativo",
    department: "Administração",
    description: "Controle financeiro, fornecedores e indicadores operacionais.",
    status: "encerrada",
  },
];

export const applicationsMock: Application[] = [
  { id: "app-1", jobId: "job-1", candidate: "Ana Lima", email: "ana@example.com", message: "Tenho experiência com atendimento premium.", createdAt: "2026-05-01" },
  { id: "app-2", jobId: "job-1", candidate: "Julia Reis", email: "julia@example.com", message: "Atuei em clínica odontológica por três anos.", createdAt: "2026-05-04" },
  { id: "app-3", jobId: "job-2", candidate: "Pedro Martins", email: "pedro@example.com", message: "Tenho histórico em vendas consultivas.", createdAt: "2026-05-07" },
  { id: "app-4", candidate: "Carla Souza", email: "carla@example.com", message: "Gostaria de entrar no banco de talentos.", createdAt: "2026-05-09" },
  { id: "app-5", jobId: "job-3", candidate: "Renata Alves", email: "renata@example.com", message: "Tenho disponibilidade integral.", createdAt: "2026-05-11" },
];
