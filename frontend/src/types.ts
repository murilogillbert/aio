export type Role = "paciente" | "profissional" | "recepcao" | "admin";

export type ThemeConfig = {
  primary: string;
  primaryLight: string;
  bgBase: string;
  bgSecondary: string;
  brownDark: string;
  brownMid: string;
  surface: string;
  headingFont: string;
  bodyFont: string;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  imageUrl: string;
  order: number;
  active: boolean;
};

export type AboutContent = {
  text: string;
  milestones: { date: string; title: string; description: string }[];
  mvv: { mission: string; vision: string; values: string };
  gallery: string[];
};

export type ClinicConfig = {
  clinicName: string;
  logoUrl: string;
  theme: ThemeConfig;
  address: string;
  coordinates: { lat: number; lng: number };
  whatsappUrl: string;
  instagramUrl: string;
  openingHours: string;
  banners: Banner[];
  about: AboutContent;
  messageTemplates: MessageTemplate[];
  notificationRules: NotificationRule[];
  integrations: Integration[];
};

export type Service = {
  id: string;
  name: string;
  category: string;
  shortDescription: string;
  description: string;
  durationMinutes: number;
  priceFrom: number;
  professionalIds: string[];
  roomIds: string[];
  equipmentIds: string[];
};

export type Professional = {
  id: string;
  name: string;
  role: Role | "atendente" | "administrativo";
  photoUrl: string;
  bio: string;
  specialty: string;
  categories: string[];
  defaultCommission: number;
  services: string[];
  workingHours: { weekday: number; start: string; end: string }[];
  monthlyFixedPayment?: number;
};

export type Dependent = {
  id: string;
  fullName: string;
  birthDate: string;
  relationship: string;
};

export type AppointmentStatus = "agendado" | "confirmado" | "cancelado" | "realizado" | "pendente";

export type Appointment = {
  id: string;
  patientId: string;
  dependentId?: string;
  professionalId: string;
  serviceId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
};

export type ChatMessage = {
  id: string;
  author: string;
  channel: "Aplicacao" | "WhatsApp" | "E-mail" | "Interno";
  text: string;
  sentAt: string;
};

export type Conversation = {
  id: string;
  title: string;
  channel: ChatMessage["channel"];
  unread: number;
  messages: ChatMessage[];
};

export type User = {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  dependents?: Dependent[];
  appointments?: Appointment[];
  conversations?: Conversation[];
};

export type AgendaSlot = {
  id: string;
  professionalId: string;
  date: string;
  time: string;
  available: boolean;
  appointmentId?: string;
};

export type MetricsPoint = {
  month: string;
  revenue: number;
  profit: number;
  appointments: number;
  ticketAverage: number;
  occupancy: number;
  cancellationRate: number;
  newPatients: number;
};

export type Job = {
  id: string;
  title: string;
  department: string;
  description: string;
  status: "aberta" | "encerrada";
};

export type Application = {
  id: string;
  jobId?: string;
  candidate: string;
  email: string;
  message: string;
  createdAt: string;
};

export type Cost = {
  id: string;
  month: string;
  type: "fixo" | "variavel";
  name: string;
  value: number;
};

export type MessageTemplate = {
  id: string;
  occasion: string;
  channel: "WhatsApp" | "E-mail";
  body: string;
};

export type NotificationRule = {
  id: string;
  trigger: string;
  leadTime: string;
  channel: "WhatsApp" | "E-mail" | "Ambos";
  templateId: string;
  active: boolean;
};

export type Integration = {
  id: string;
  name: string;
  status: "mock" | "conectado" | "desconectado";
  description: string;
};

export type BookingDraft = {
  serviceId?: string;
  professionalId?: string;
  date?: string;
  time?: string;
  patientTarget?: "self" | string;
};

export type AdminCrudItem = {
  id: string;
  title: string;
  subtitle: string;
  status: string;
  fields: Record<string, string>;
};

export type AdminCrudField = {
  key: string;
  label: string;
  type?: "text" | "number" | "textarea" | "select" | "datetime-local";
  options?: string[];
};

export type ServiceCompensationType = "default_commission" | "custom_percent" | "fixed_value";

export type ServiceProfessional = {
  professionalId: string;
  compensationType: ServiceCompensationType;
  compensationValue?: number | null;
};

export type ServiceEquipmentLink = {
  equipmentId: string;
  required: boolean;
};

export type ServiceTaxItem = {
  id: string;
  name: string;
  percent: number;
};

export type ServicePlanLink = {
  planId: string;
  coverageRule: string;
  customPrice?: number | null;
  showPrice: boolean;
};

export type ServiceDetail = {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  preparation: string;
  color: string;
  durationMinutes: number;
  basePrice: number;
  requiresRoom: boolean;
  defaultRoomId?: string | null;
  onlineBooking: boolean;
  showPrice: boolean;
  showDuration: boolean;
  isActive: boolean;
  categoryIds: string[];
  professionals: ServiceProfessional[];
  roomIds: string[];
  equipments: ServiceEquipmentLink[];
  taxes: ServiceTaxItem[];
  plans: ServicePlanLink[];
};

export type ServiceSummary = {
  id: string;
  name: string;
  shortDescription: string;
  durationMinutes: number;
  basePrice: number;
  color: string;
  isActive: boolean;
  professionalCount: number;
};

export type CatalogReference = {
  id: string;
  label: string;
};

export type ServiceReferences = {
  categories: CatalogReference[];
  rooms: CatalogReference[];
  equipments: CatalogReference[];
  plans: CatalogReference[];
  professionals: { id: string; name: string; defaultCommissionPercent: number; specialty: string }[];
};

export type IntegrationsDto = {
  gmail: { clientId: string | null; clientSecretMasked: string | null; accessTokenMasked: string | null; tokenExpiresAt: string | null; connected: boolean };
  pubSub: { projectId: string | null; topicName: string | null; serviceAccountMasked: string | null; connected: boolean };
  whatsApp: { phoneNumberId: string | null; wabaId: string | null; accessTokenMasked: string | null; verifyTokenMasked: string | null; appSecretMasked: string | null; connected: boolean };
  mercadoPago: { accessTokenProdMasked: string | null; accessTokenSandboxMasked: string | null; publicKey: string | null; sandboxMode: boolean; connected: boolean };
  resend: { apiKeyMasked: string | null; fromEmail: string | null; fromName: string | null; connected: boolean };
  smtp: { host: string | null; port: number | null; username: string | null; passwordMasked: string | null; from: string | null; connected: boolean };
  instagram: { accountId: string | null; pageId: string | null; accessTokenMasked: string | null; appSecretMasked: string | null; verifyTokenMasked: string | null; connected: boolean };
  remindersEnabled: boolean;
};

export type IntegrationsPatch = Partial<{
  gmail: Partial<{ clientId: string; clientSecret: string }>;
  pubSub: Partial<{ projectId: string; topicName: string; serviceAccount: string }>;
  whatsApp: Partial<{ phoneNumberId: string; wabaId: string; accessToken: string; verifyToken: string; appSecret: string }>;
  mercadoPago: Partial<{ accessTokenProd: string; accessTokenSandbox: string; publicKey: string; sandboxMode: boolean }>;
  resend: Partial<{ apiKey: string; fromEmail: string; fromName: string }>;
  smtp: Partial<{ host: string; port: number; username: string; password: string; from: string }>;
  instagram: Partial<{ accountId: string; pageId: string; accessToken: string; appSecret: string; verifyToken: string }>;
  remindersEnabled: boolean;
}>;

export type TestResult = { ok: boolean; message: string; detail?: string | null };

export type MetricsDashboard = {
  revenue: number;
  profit: number;
  appointments: number;
  ticketAverage: number;
  occupancy: number;
  cancellationRate: number;
  newPatients: number;
  revenueTrend: number;
  appointmentsTrend: number;
  profitTrend: number;
  monthlySeries: { month: string; revenue: number; profit: number; appointments: number }[];
  waitingList: { appointmentId: string; patientName: string; professionalName: string; service: string; startTime: string; waitMinutes: number }[];
  upcoming: { appointmentId: string; patientName: string; professionalName: string; service: string; startTime: string }[];
};

export type MetricsFaturamento = {
  totalRevenue: number;
  totalPayout: number;
  totalCustos: number;
  custosCount: number;
  netRevenue: number;
  margemLiquida: number;
  revenueTrend: number;
  totalAppointments: number;
  completedAppointments: number;
  ticketMedio: number;
  delinquency: number;
  byMethod: { label: string; value: number }[];
  byPlan: { label: string; value: number }[];
  custosByCategory: { label: string; value: number }[];
  payouts: { professionalId: string; name: string; specialty: string; appointments: number; gross: number; commissionPct: number; net: number }[];
  monthlyRevenue: { month: string; revenue: number; payout: number; custos: number; netRevenue: number }[];
};

export type ProfessionalMetric = {
  professionalId: string;
  name: string;
  specialty: string;
  appointments: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  occupancy: number;
  revenue: number;
  netPayout: number;
  commissionPct: number;
  ticket: number;
  cancellationRate: number;
  newPatients: number;
  returningPatients: number;
  rating: number;
  revenueTrend: number;
  status: string;
};

export type ServiceMetric = {
  serviceId: string;
  name: string;
  volume: number;
  revenue: number;
  completedCount: number;
  cancelledCount: number;
  avgDurationMinutes: number;
  estimatedDurationMinutes: number;
  cancellationRate: number;
  conversionRate: number;
};

export type MetricsMovimento = {
  totalAppointments: number;
  scheduled: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  noShow: number;
  showRate: number;
  revenueToday: number;
  pendingToday: number;
  newPatients: number;
  messagesCount: number;
  appointmentsTrend: number;
  revenueTrend: number;
  completedTrend: number;
  statusBreakdown: { label: string; value: number }[];
  revenueByMethod: { label: string; value: number }[];
  hourlyDistribution: { hour: number; count: number }[];
  byProfessional: { label: string; value: number }[];
  events: { id: string; type: string; description: string; professional: string | null; patient: string | null; amount: number | null; createdAt: string }[];
  upcoming: { appointmentId: string; patientName: string; professionalName: string; service: string; startTime: string }[];
};

export type AppointmentRich = {
  id: string;
  patientId: string;
  patientName: string;
  professionalId: string;
  professionalName: string;
  serviceId: string;
  serviceName: string;
  roomId: string | null;
  roomName: string | null;
  planId: string | null;
  startTime: string;
  endTime: string;
  status: string;
  patientConfirmation: string;
  appointmentType: string;
  cancellationSource: string | null;
  recurrenceGroupId: string | null;
  notes: string;
  serviceColor: string;
  paymentStatus: string | null;
  paymentAmount: number | null;
};

export type AppointmentCreate = {
  patientId: string;
  professionalId: string;
  serviceId: string;
  roomId?: string | null;
  planId?: string | null;
  startTime: string;
  durationMinutes?: number;
  notes?: string;
  appointmentType: "Presencial" | "Online";
  equipmentIds?: string[];
  recurrence?: { weekly: boolean; durationDays: number };
};

export type AppointmentUpdate = Partial<{
  patientId: string;
  professionalId: string;
  serviceId: string;
  roomId: string | null;
  planId: string | null;
  startTime: string;
  durationMinutes: number;
  notes: string;
  appointmentType: "Presencial" | "Online";
}>;

export type RecurrenceResult = { created: number; skipped: number; skippedDates: string[]; message: string };

export type PatientRich = {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string | null;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  notes: string;
  isActive: boolean;
  dependents: number;
};

export type PatientUpsert = {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate?: string | null;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  notes: string;
};

export type PatientCreateResult = { patient: PatientRich; generatedPassword: string | null };

export type Block = { id: string; professionalId: string; startAt: string; endAt: string; reason: string };
export type BlockUpsert = { professionalId: string; startAt: string; endAt: string; reason: string };
