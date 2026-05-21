import type { Cost } from "../types";

export const costsMock: Cost[] = [
  { id: "cost-1", month: "Dez/25", type: "fixo", name: "Aluguel", value: 18000 },
  { id: "cost-2", month: "Jan/26", type: "fixo", name: "Salários fixos", value: 34000 },
  { id: "cost-3", month: "Fev/26", type: "variavel", name: "Insumos estéticos", value: 13200 },
  { id: "cost-4", month: "Mar/26", type: "fixo", name: "Assinaturas", value: 4200 },
  { id: "cost-5", month: "Abr/26", type: "variavel", name: "Materiais odontológicos", value: 9700 },
  { id: "cost-6", month: "Mai/26", type: "fixo", name: "Energia e utilidades", value: 6800 },
];
