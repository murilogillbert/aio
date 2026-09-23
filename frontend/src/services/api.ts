import type {
  Appointment,
  AppointmentCreate,
  AppointmentRich,
  AppointmentUpdate,
  AgendaSlot,
  Block,
  BlockUpsert,
  BookingDraft,
  ClinicConfig,
  Cost,
  Dependent,
  IntegrationsDto,
  IntegrationsPatch,
  Job,
  MetricsDashboard,
  MetricsFaturamento,
  MetricsMovimento,
  MetricsPoint,
  MedicalAttachment,
  MedicalAttachmentUpsert,
  MedicalRecord,
  MedicalRecordUpsert,
  PatientCreateResult,
  PatientRich,
  PatientUpsert,
  Professional,
  ProfessionalMetric,
  ProfessionalScheduleSlot,
  ProfessionalScheduleUpsert,
  RecurrenceResult,
  Service,
  ServiceDetail,
  ServiceMetric,
  ServiceReferences,
  ServiceSummary,
  SessionNote,
  SessionNoteUpsert,
  TestResult,
  User,
  AdminCrudItem,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5088/api";

type AuthPayload = {
  token: string;
  refreshToken: string;
  user: Omit<User, "password">;
};

const getToken = () => {
  const raw = localStorage.getItem("aio-auth");
  if (!raw) return null;
  try {
    return (JSON.parse(raw) as { token?: string }).token ?? null;
  } catch {
    return null;
  }
};

// Erros com corpo JSON (ex.: exclusão bloqueada por vínculos) chegam aqui com `details`
// preenchido, permitindo que a UI ofereça uma ação específica em vez de um toast genérico.
export class ApiError extends Error {
  status: number;
  details?: Record<string, unknown>;

  constructor(status: number, message: string, details?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const isJson = response.headers.get("content-type")?.includes("application/json");
    if (isJson) {
      const body = (await response.json().catch(() => null)) as { message?: string } | null;
      const { message, ...details } = body ?? {};
      throw new ApiError(response.status, message || `HTTP ${response.status}`, details);
    }
    const message = await response.text();
    throw new ApiError(response.status, message || `HTTP ${response.status}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

export const getConfig = () => request<ClinicConfig>("/configuracoes");

export const saveConfig = (config: ClinicConfig) =>
  request<ClinicConfig>("/configuracoes", {
    method: "PUT",
    body: JSON.stringify(config),
  });

export const getServicos = () => request<Service[]>("/catalogo/servicos");

export const getServico = (id: string) => request<Service>(`/catalogo/servicos/${id}`);

export const getProfissionais = () => request<Professional[]>("/catalogo/profissionais");

export const getProfessional = (id: string) => request<Professional>(`/catalogo/profissionais/${id}`);

export const getProfissionaisPorServico = (id: string) =>
  request<Professional[]>(`/catalogo/profissionais/por-servico/${id}`);

export const getAgenda = (professionalId?: string, month?: string) => {
  const params = new URLSearchParams();
  if (professionalId) params.set("profissionalId", professionalId);
  if (month) params.set("mes", month);
  const query = params.toString();
  return request<AgendaSlot[]>(`/agenda${query ? `?${query}` : ""}`);
};

export const criarAgendamento = (payload: BookingDraft & { patientId: string }) =>
  request<Appointment>("/agenda/agendamentos", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const login = (email: string, senha: string) =>
  request<AuthPayload>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });

export const register = (payload: Pick<User, "fullName" | "email" | "phone"> & { password: string }) =>
  request<AuthPayload>("/auth/cadastro", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const refreshToken = (refreshTokenValue: string) =>
  request<AuthPayload>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  });

export const forgotPassword = (email: string) =>
  request<{ ok: boolean }>("/auth/esqueci-senha", { method: "POST", body: JSON.stringify({ email }) });

export const resetPassword = (token: string, novaSenha: string) =>
  request<{ ok: boolean }>("/auth/redefinir-senha", { method: "POST", body: JSON.stringify({ token, novaSenha }) });

export const changePassword = (senhaAtual: string, novaSenha: string) =>
  request<{ ok: boolean }>("/auth/senha", { method: "PATCH", body: JSON.stringify({ senhaAtual, novaSenha }) });

export const getMe = () => request<Omit<User, "password">>("/auth/me");

export const updateMe = (body: { fullName?: string; phone?: string; bio?: string; specialty?: string; photoUrl?: string }) =>
  request<Omit<User, "password">>("/auth/me", { method: "PATCH", body: JSON.stringify(body) });

export const uploadFile = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE_URL}/uploads`, { method: "POST", body: formData, headers });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};

export const getMetricasGerais = (_periodo = "6m") => request<MetricsPoint[]>("/metricas");

export const getMetricBreakdowns = () =>
  request<{ serviceRankingMock: { label: string; value: number }[]; professionalRankingMock: { label: string; value: number }[] }>(
    "/metricas/breakdowns",
  );

export const getCustos = (_periodo = "6m"): Promise<Cost[]> => request<Cost[]>("/metricas/custos");

export const getVagas = (): Promise<Job[]> => request<Job[]>("/recrutamento/vagas");

export const getCandidaturas = () => request("/recrutamento/candidaturas");

export const getUsuarios = () => request<Omit<User, "password">[]>("/admin/usuarios");

export const listAdminCrud = (resource: string) => request<AdminCrudItem[]>(`/admin/crud/${resource}`);

export const createAdminCrud = (resource: string, fields: Record<string, string>) =>
  request<AdminCrudItem>(`/admin/crud/${resource}`, {
    method: "POST",
    body: JSON.stringify({ fields }),
  });

export const updateAdminCrud = (resource: string, id: string, fields: Record<string, string>) =>
  request<void>(`/admin/crud/${resource}/${id}`, {
    method: "PUT",
    body: JSON.stringify({ fields }),
  });

export const deleteAdminCrud = (resource: string, id: string, cascade = false) =>
  request<void>(`/admin/crud/${resource}/${id}${cascade ? "?cascade=true" : ""}`, {
    method: "DELETE",
  });

export const listAdminServices = () => request<ServiceSummary[]>("/admin/servicos");
export const getAdminService = (id: string) => request<ServiceDetail>(`/admin/servicos/${id}`);
export const getServiceReferences = () => request<ServiceReferences>("/admin/servicos/referencias");
export const createAdminService = (body: Omit<ServiceDetail, "id">) =>
  request<ServiceDetail>("/admin/servicos", {
    method: "POST",
    body: JSON.stringify(body),
  });
export const updateAdminService = (id: string, body: Omit<ServiceDetail, "id">) =>
  request<ServiceDetail>(`/admin/servicos/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
export const deleteAdminService = (id: string, cascade = false) =>
  request<void>(`/admin/servicos/${id}${cascade ? "?cascade=true" : ""}`, { method: "DELETE" });

// ─── Clinic / Integrations ──────────────────────────────────────────────────
export const getClinicIntegrations = () => request<IntegrationsDto>("/admin/clinica/integracoes");
export const updateClinicIntegrations = (patch: IntegrationsPatch) =>
  request<IntegrationsDto>("/admin/clinica/integracoes", { method: "PUT", body: JSON.stringify(patch) });

export type IntegrationType = "gmail" | "pubsub" | "whatsapp" | "mercadopago" | "resend" | "asaas" | "smtp" | "instagram";
export const testIntegration = (type: IntegrationType, payload?: Record<string, unknown>) =>
  request<TestResult>(`/admin/clinica/integracoes/${type}/test`, {
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });

// ─── Metrics ────────────────────────────────────────────────────────────────
export const getDashboard = (periodo = "30d") => request<MetricsDashboard>(`/metricas/dashboard?periodo=${periodo}`);
export const getFaturamento = (periodo = "30d") => request<MetricsFaturamento>(`/metricas/faturamento?periodo=${periodo}`);
export const getProfessionalMetrics = (periodo = "30d") => request<ProfessionalMetric[]>(`/metricas/profissionais?periodo=${periodo}`);
export const getMyProfessionalMetrics = (periodo = "30d", offset = 0) =>
  request<ProfessionalMetric | null>(`/metricas/profissionais/me?periodo=${periodo}&offset=${offset}`);
export const getServiceMetrics = (periodo = "30d") => request<ServiceMetric[]>(`/metricas/servicos?periodo=${periodo}`);
export const getMovimento = (data?: string) => request<MetricsMovimento>(`/metricas/movimento${data ? `?data=${data}` : ""}`);

// ─── Appointments ───────────────────────────────────────────────────────────
export const listAppointments = (start: string, end: string, professionalId?: string) => {
  const params = new URLSearchParams({ start, end });
  if (professionalId) params.set("professionalId", professionalId);
  return request<AppointmentRich[]>(`/agendamentos?${params}`);
};
export const getAppointment = (id: string) => request<AppointmentRich>(`/agendamentos/${id}`);
export const createAppointment = (body: AppointmentCreate) =>
  request<AppointmentRich | RecurrenceResult>("/agendamentos", { method: "POST", body: JSON.stringify(body) });
export const updateAppointment = (id: string, body: AppointmentUpdate) =>
  request<AppointmentRich>(`/agendamentos/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const patchAppointmentStatus = (id: string, status: string, cancellationSource?: string) =>
  request<AppointmentRich>(`/agendamentos/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, cancellationSource }) });
export const patchAppointmentConfirmation = (id: string, value: string) =>
  request<AppointmentRich>(`/agendamentos/${id}/confirmacao`, { method: "PATCH", body: JSON.stringify({ value }) });
export const deleteAppointment = (id: string, cascade = false) =>
  request<void>(`/agendamentos/${id}${cascade ? "?cascade=true" : ""}`, { method: "DELETE" });
export const deleteFutureAppointments = (id: string, cascade = false) =>
  request<{ count: number; message: string }>(`/agendamentos/${id}/futuros${cascade ? "?cascade=true" : ""}`, { method: "DELETE" });
export const checkinAppointment = (id: string) =>
  request<{ ok: boolean; message: string }>(`/agendamentos/${id}/checkin`, { method: "POST" });
export const payAppointment = (id: string, amount: number, method: string, methodDetail?: string, paidBeforeCompletion = false) =>
  request<{ paymentId: string; commissionAmount: number; commissionPct: number; taxPercent: number; netAmount: number; message: string }>(`/agendamentos/${id}/pagamento`, {
    method: "POST",
    body: JSON.stringify({ amount, method, methodDetail, paidBeforeCompletion }),
  });

// ─── Patients ───────────────────────────────────────────────────────────────
export const searchPatients = (search?: string, includeInactive = false) => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (includeInactive) params.set("includeInactive", "true");
  return request<PatientRich[]>(`/pacientes${params.toString() ? `?${params}` : ""}`);
};
export const getPatient = (id: string) => request<PatientRich>(`/pacientes/${id}`);
export const createPatient = (body: PatientUpsert, force = false) =>
  request<PatientCreateResult>(`/pacientes${force ? "?force=true" : ""}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
export const updatePatient = (id: string, body: PatientUpsert) =>
  request<PatientRich>(`/pacientes/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deletePatient = (id: string) => request<void>(`/pacientes/${id}`, { method: "DELETE" });

// ─── Blocks ─────────────────────────────────────────────────────────────────
export const listBlocks = (professionalId?: string, start?: string, end?: string) => {
  const params = new URLSearchParams();
  if (professionalId) params.set("professionalId", professionalId);
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  return request<Block[]>(`/bloqueios${params.toString() ? `?${params}` : ""}`);
};
export const createBlock = (body: BlockUpsert) =>
  request<Block>("/bloqueios", { method: "POST", body: JSON.stringify(body) });
export const deleteBlock = (id: string) => request<void>(`/bloqueios/${id}`, { method: "DELETE" });

// ─── Horários de atendimento ──────────────────────────────────────────────────
export const listProfessionalSchedules = (professionalId?: string) => {
  const params = new URLSearchParams();
  if (professionalId) params.set("professionalId", professionalId);
  return request<ProfessionalScheduleSlot[]>(`/horarios${params.toString() ? `?${params}` : ""}`);
};
export const createProfessionalSchedule = (body: ProfessionalScheduleUpsert) =>
  request<ProfessionalScheduleSlot>("/horarios", { method: "POST", body: JSON.stringify(body) });
export const deleteProfessionalSchedule = (id: string) => request<void>(`/horarios/${id}`, { method: "DELETE" });

// Medical records
export const getMedicalRecord = (patientId: string) =>
  request<MedicalRecord>(`/prontuarios/pacientes/${patientId}`);
export const updateMedicalRecord = (patientId: string, body: MedicalRecordUpsert) =>
  request<MedicalRecord>(`/prontuarios/pacientes/${patientId}`, { method: "PUT", body: JSON.stringify(body) });
export const listSessionNotes = (patientId: string) =>
  request<SessionNote[]>(`/prontuarios/pacientes/${patientId}/evolucoes`);
export const getSessionNoteByAppointment = (appointmentId: string) =>
  request<SessionNote>(`/prontuarios/agendamentos/${appointmentId}/evolucao`);
export const createSessionNote = (appointmentId: string, body: SessionNoteUpsert) =>
  request<SessionNote>(`/prontuarios/agendamentos/${appointmentId}/evolucao`, { method: "POST", body: JSON.stringify(body) });
export const updateSessionNote = (id: string, body: SessionNoteUpsert) =>
  request<SessionNote>(`/prontuarios/evolucoes/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const signSessionNote = (id: string) =>
  request<SessionNote>(`/prontuarios/evolucoes/${id}/assinar`, { method: "POST" });
export const listMedicalAttachments = (patientId: string) =>
  request<MedicalAttachment[]>(`/prontuarios/pacientes/${patientId}/anexos`);
export const createMedicalAttachment = (patientId: string, body: MedicalAttachmentUpsert) =>
  request<MedicalAttachment>(`/prontuarios/pacientes/${patientId}/anexos`, { method: "POST", body: JSON.stringify(body) });
export const deleteMedicalAttachment = (id: string) =>
  request<void>(`/prontuarios/anexos/${id}`, { method: "DELETE" });

// ─── Meus pacientes (profissional) ──────────────────────────────────────────
export const listMyPatients = () => request<{ id: string; fullName: string }[]>("/pacientes/meus");

// ─── Documentos do paciente ─────────────────────────────────────────────────
export type PatientDocument = { id: string; title: string; fileUrl: string; fileType: string; createdAt: string };
export const listMyDocuments = () => request<PatientDocument[]>("/documentos");

// ─── Dependentes (self-service do paciente) ─────────────────────────────────
export const createDependent = (body: { fullName: string; birthDate: string; relationship?: string }) =>
  request<Dependent>("/dependentes", { method: "POST", body: JSON.stringify(body) });
export const updateDependent = (id: string, body: { fullName?: string; birthDate?: string; relationship?: string }) =>
  request<Dependent>(`/dependentes/${id}`, { method: "PUT", body: JSON.stringify(body) });
export const deleteDependent = (id: string) => request<void>(`/dependentes/${id}`, { method: "DELETE" });

// ─── Pagamento online (Asaas) ────────────────────────────────────────────────
export type SavedCard = { id: string; brand: string; last4: string; expiryMonth: number | null; expiryYear: number | null };
export type PixCheckout = { encodedImage: string; payload: string; expirationDate: string };
export type CheckoutResult = { status: string; pix?: PixCheckout; paymentId?: string };
export type CardInput = { holderName: string; number: string; expiryMonth: string; expiryYear: string; ccv: string; cpfCnpj: string; postalCode: string; addressNumber: string; phone: string };

export const listSavedCards = () => request<SavedCard[]>("/pagamentos/cartoes");
export const deleteSavedCard = (id: string) => request<void>(`/pagamentos/cartoes/${id}`, { method: "DELETE" });
export const checkoutPix = (appointmentId: string) =>
  request<CheckoutResult>("/pagamentos/checkout", { method: "POST", body: JSON.stringify({ appointmentId, method: "PIX" }) });
export const checkoutCard = (appointmentId: string, options: { card?: CardInput; savedCardId?: string; saveCard?: boolean }) =>
  request<CheckoutResult>("/pagamentos/checkout", { method: "POST", body: JSON.stringify({ appointmentId, method: "CARTAO", ...options }) });
export const getPaymentStatus = (appointmentId: string) => request<{ status: string | null }>(`/pagamentos/${appointmentId}/status`);

// ─── Mensageria (chat) ────────────────────────────────────────────────────
export type ConversationSummary = {
  id: string;
  title: string;
  participants: { id: string; fullName: string; role: string }[];
  lastMessage: { body: string; sentAt: string; authorName: string } | null;
};
export type ChatMessage = { id: string; authorUserId: string | null; authorName: string; body: string; sentAt: string; mine: boolean };
export type MessageRecipient = { id: string; fullName: string; role: string };

export const listConversations = () => request<ConversationSummary[]>("/conversas");
export const listMessageRecipients = () => request<MessageRecipient[]>("/conversas/destinatarios");
export const createConversation = (participantUserIds: string[], title?: string) =>
  request<ConversationSummary>("/conversas", { method: "POST", body: JSON.stringify({ participantUserIds, title }) });
export const listConversationMessages = (conversationId: string) =>
  request<ChatMessage[]>(`/conversas/${conversationId}/mensagens`);
export const sendConversationMessage = (conversationId: string, body: string) =>
  request<ChatMessage>(`/conversas/${conversationId}/mensagens`, { method: "POST", body: JSON.stringify({ body }) });
