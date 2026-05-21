import type { MetricsPoint } from "../types";

export const metricsMock: MetricsPoint[] = [
  { month: "Dez/25", revenue: 118000, profit: 42000, appointments: 132, ticketAverage: 894, occupancy: 64, cancellationRate: 7, newPatients: 38 },
  { month: "Jan/26", revenue: 126500, profit: 48500, appointments: 141, ticketAverage: 897, occupancy: 69, cancellationRate: 6, newPatients: 42 },
  { month: "Fev/26", revenue: 121800, profit: 45200, appointments: 136, ticketAverage: 895, occupancy: 67, cancellationRate: 8, newPatients: 36 },
  { month: "Mar/26", revenue: 139400, profit: 54800, appointments: 151, ticketAverage: 923, occupancy: 73, cancellationRate: 5, newPatients: 47 },
  { month: "Abr/26", revenue: 146200, profit: 59200, appointments: 158, ticketAverage: 925, occupancy: 76, cancellationRate: 5, newPatients: 51 },
  { month: "Mai/26", revenue: 154900, profit: 63800, appointments: 164, ticketAverage: 944, occupancy: 79, cancellationRate: 4, newPatients: 54 },
];

export const serviceRankingMock = [
  { label: "Bioestimulador", value: 42800 },
  { label: "Implantodontia", value: 38500 },
  { label: "Consulta médica", value: 24800 },
  { label: "Clareamento", value: 18100 },
];

export const professionalRankingMock = [
  { label: "Dra. Helena", value: 51200 },
  { label: "Dra. Camila", value: 46600 },
  { label: "Dr. Marcos", value: 30800 },
  { label: "Dra. Laura", value: 20400 },
];
