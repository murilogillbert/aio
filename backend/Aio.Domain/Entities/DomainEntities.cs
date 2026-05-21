namespace Aio.Domain.Entities;

public enum AppointmentStatus
{
    Pendente = 0,
    Agendado = 1,
    Confirmado = 2,
    Cancelado = 3,
    Realizado = 4,
    EmAndamento = 5,
    NaoCompareceu = 6
}

public enum AppointmentType
{
    Presencial = 0,
    Online = 1
}

public enum PatientConfirmation
{
    Pendente = 0,
    Confirmado = 1,
    NaoConfirmado = 2
}

public enum CancellationSource
{
    Paciente = 0,
    Recepcao = 1,
    Profissional = 2,
    Sistema = 3
}

public enum EquipmentStatus
{
    Operacional = 0,
    Manutencao = 1,
    Quebrado = 2,
    Inativo = 3
}

public enum ChannelKind
{
    Aplicacao = 0,
    WhatsApp = 1,
    Email = 2,
    Interno = 3
}

public enum CostType
{
    Fixo = 0,
    Variavel = 1
}

public sealed class User
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Phone { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public Patient? Patient { get; set; }
    public Professional? Professional { get; set; }
    public Employee? Employee { get; set; }
    public ICollection<UserRole> UserRoles { get; set; } = [];
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}

public sealed class RefreshToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string TokenHash { get; set; } = "";
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? ReplacedByTokenHash { get; set; }
}

public sealed class Role
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public ICollection<UserRole> UserRoles { get; set; } = [];
}

public sealed class UserRole
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;
}

public sealed class Patient
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public DateTime? BirthDate { get; set; }
    public string Cpf { get; set; } = "";
    public string Address { get; set; } = "";
    public string City { get; set; } = "";
    public string State { get; set; } = "";
    public string PostalCode { get; set; } = "";
    public string Notes { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public ICollection<Dependent> Dependents { get; set; } = [];
    public ICollection<Appointment> Appointments { get; set; } = [];
    public MedicalRecord? MedicalRecord { get; set; }
}

public sealed class Dependent
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public string FullName { get; set; } = "";
    public DateTime BirthDate { get; set; }
    public string Relationship { get; set; } = "";
}

public sealed class Professional
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public User? User { get; set; }
    public string Name { get; set; } = "";
    public string PhotoUrl { get; set; } = "";
    public string Bio { get; set; } = "";
    public string Specialty { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    public string LicenseNumber { get; set; } = "";
    public string CouncilType { get; set; } = "";
    public string Languages { get; set; } = "";
    public decimal DefaultCommissionPercent { get; set; }
    public decimal? MonthlyFixedPayment { get; set; }
    public bool ProvidesCare { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<ProfessionalService> ProfessionalServices { get; set; } = [];
    public ICollection<ProfessionalSchedule> Schedules { get; set; } = [];
    public ICollection<ProfessionalBlock> Blocks { get; set; } = [];
    public ICollection<ProfessionalCategory> Categories { get; set; } = [];
}

public sealed class ProfessionalBlock
{
    public Guid Id { get; set; }
    public Guid ProfessionalId { get; set; }
    public Professional Professional { get; set; } = null!;
    public DateTime StartAt { get; set; }
    public DateTime EndAt { get; set; }
    public string Reason { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

public sealed class ProfessionalCategory
{
    public Guid ProfessionalId { get; set; }
    public Professional Professional { get; set; } = null!;
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}

public sealed class ProfessionalSchedule
{
    public Guid Id { get; set; }
    public Guid ProfessionalId { get; set; }
    public Professional Professional { get; set; } = null!;
    public int Weekday { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
}

public sealed class Employee
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Department { get; set; } = "";
    public decimal? MonthlySalary { get; set; }
}

public sealed class Service
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string ShortDescription { get; set; } = "";
    public string Description { get; set; } = "";
    public string Preparation { get; set; } = "";
    public string Color { get; set; } = "#C2410C";
    public int DurationMinutes { get; set; }
    public decimal BasePrice { get; set; }
    public bool RequiresRoom { get; set; }
    public Guid? DefaultRoomId { get; set; }
    public Room? DefaultRoom { get; set; }
    public bool OnlineBooking { get; set; } = true;
    public bool ShowPrice { get; set; } = true;
    public bool ShowDuration { get; set; } = true;
    public bool IsActive { get; set; } = true;
    public ICollection<ServiceCategory> ServiceCategories { get; set; } = [];
    public ICollection<ProfessionalService> ProfessionalServices { get; set; } = [];
    public ICollection<RoomService> RoomServices { get; set; } = [];
    public ICollection<ServiceEquipment> ServiceEquipments { get; set; } = [];
    public ICollection<ServiceTax> Taxes { get; set; } = [];
    public ICollection<PlanService> PlanServices { get; set; } = [];
}

public sealed class Category
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string Type { get; set; } = "";
    public string Description { get; set; } = "";
    public Guid? ParentId { get; set; }
    public Category? Parent { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<Category> Children { get; set; } = [];
    public ICollection<ServiceCategory> ServiceCategories { get; set; } = [];
    public ICollection<ProfessionalCategory> ProfessionalCategories { get; set; } = [];
}

public sealed class ServiceEquipment
{
    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = null!;
    public Guid EquipmentId { get; set; }
    public Equipment Equipment { get; set; } = null!;
    public bool Required { get; set; } = true;
}

public sealed class ServiceCategory
{
    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = null!;
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}

public sealed class ProfessionalService
{
    public Guid ProfessionalId { get; set; }
    public Professional Professional { get; set; } = null!;
    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = null!;
    public string CompensationType { get; set; } = "default_commission";
    public decimal? CompensationValue { get; set; }
}

public sealed class Room
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public int Capacity { get; set; }
    public string Notes { get; set; } = "";
    public string Description { get; set; } = "";
    public string Location { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public ICollection<RoomService> RoomServices { get; set; } = [];
    public ICollection<RoomEquipment> RoomEquipments { get; set; } = [];
}

public sealed class RoomService
{
    public Guid RoomId { get; set; }
    public Room Room { get; set; } = null!;
    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = null!;
}

public sealed class Equipment
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
    public int Quantity { get; set; }
    public decimal UnitValue { get; set; }
    public string SerialNumber { get; set; } = "";
    public string Location { get; set; } = "";
    public EquipmentStatus Status { get; set; } = EquipmentStatus.Operacional;
    public DateTime? MaintenanceDate { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<RoomEquipment> RoomEquipments { get; set; } = [];
    public ICollection<ServiceEquipment> ServiceEquipments { get; set; } = [];
}

public sealed class RoomEquipment
{
    public Guid RoomId { get; set; }
    public Room Room { get; set; } = null!;
    public Guid EquipmentId { get; set; }
    public Equipment Equipment { get; set; } = null!;
}

public sealed class Appointment
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public Guid? DependentId { get; set; }
    public Dependent? Dependent { get; set; }
    public Guid ProfessionalId { get; set; }
    public Professional Professional { get; set; } = null!;
    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = null!;
    public Guid? RoomId { get; set; }
    public Room? Room { get; set; }
    public Guid? PlanId { get; set; }
    public Plan? Plan { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly Time { get; set; }
    public AppointmentStatus Status { get; set; }
    public AppointmentType Type { get; set; } = AppointmentType.Presencial;
    public PatientConfirmation PatientConfirmation { get; set; } = PatientConfirmation.Pendente;
    public CancellationSource? CancellationSource { get; set; }
    public DateTime? CancelledAt { get; set; }
    public Guid? RecurrenceGroupId { get; set; }
    public string Notes { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public ICollection<AppointmentStatusLog> StatusLogs { get; set; } = [];
    public ICollection<AppointmentEquipment> EquipmentsUsed { get; set; } = [];
    public SessionNote? SessionNote { get; set; }
}

public sealed class AppointmentEquipment
{
    public Guid AppointmentId { get; set; }
    public Appointment Appointment { get; set; } = null!;
    public Guid EquipmentId { get; set; }
    public Equipment Equipment { get; set; } = null!;
}

public sealed class AppointmentStatusLog
{
    public Guid Id { get; set; }
    public Guid AppointmentId { get; set; }
    public Appointment Appointment { get; set; } = null!;
    public AppointmentStatus Status { get; set; }
    public DateTime ChangedAt { get; set; }
    public Guid? ChangedByUserId { get; set; }
}

public sealed class Conversation
{
    public Guid Id { get; set; }
    public string Title { get; set; } = "";
    public ChannelKind Channel { get; set; }
    public ICollection<ConversationParticipant> Participants { get; set; } = [];
    public ICollection<Message> Messages { get; set; } = [];
}

public sealed class ConversationParticipant
{
    public Guid ConversationId { get; set; }
    public Conversation Conversation { get; set; } = null!;
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}

public sealed class Message
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Conversation Conversation { get; set; } = null!;
    public Guid? AuthorUserId { get; set; }
    public string AuthorName { get; set; } = "";
    public ChannelKind Channel { get; set; }
    public string Body { get; set; } = "";
    public DateTime SentAt { get; set; }
}

public sealed class MessagingChannel
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string ParticipantRule { get; set; } = "";
}

public sealed class NotificationRule
{
    public Guid Id { get; set; }
    public string Trigger { get; set; } = "";
    public string LeadTime { get; set; } = "";
    public string Channel { get; set; } = "";
    public Guid TemplateId { get; set; }
    public MessageTemplate Template { get; set; } = null!;
    public bool Active { get; set; }
}

public sealed class MessageTemplate
{
    public Guid Id { get; set; }
    public string Occasion { get; set; } = "";
    public string Channel { get; set; } = "";
    public string Body { get; set; } = "";
    public ICollection<NotificationRule> NotificationRules { get; set; } = [];
}

public sealed class Plan
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public ICollection<PlanService> PlanServices { get; set; } = [];
}

public sealed class PlanService
{
    public Guid PlanId { get; set; }
    public Plan Plan { get; set; } = null!;
    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = null!;
    public string CoverageRule { get; set; } = "";
    public decimal? CustomPrice { get; set; }
    public bool ShowPrice { get; set; } = true;
}

public sealed class JobOpening
{
    public Guid Id { get; set; }
    public string Title { get; set; } = "";
    public string Department { get; set; } = "";
    public string Description { get; set; } = "";
    public string Status { get; set; } = "";
    public ICollection<JobApplication> Applications { get; set; } = [];
}

public sealed class JobApplication
{
    public Guid Id { get; set; }
    public Guid? JobOpeningId { get; set; }
    public JobOpening? JobOpening { get; set; }
    public string Candidate { get; set; } = "";
    public string Email { get; set; } = "";
    public string Message { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

public sealed class TalentPoolEntry
{
    public Guid Id { get; set; }
    public string Candidate { get; set; } = "";
    public string Email { get; set; } = "";
    public string Message { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

public sealed class Banner
{
    public Guid Id { get; set; }
    public string Title { get; set; } = "";
    public string Subtitle { get; set; } = "";
    public string CtaText { get; set; } = "";
    public string CtaUrl { get; set; } = "";
    public string ImageUrl { get; set; } = "";
    public int SortOrder { get; set; }
    public bool Active { get; set; }
}

public sealed class AppSetting
{
    public Guid Id { get; set; }
    public string Key { get; set; } = "";
    public string Value { get; set; } = "";
    public string ValueType { get; set; } = "string";
}

public sealed class HistoricMilestone
{
    public Guid Id { get; set; }
    public string YearLabel { get; set; } = "";
    public string Title { get; set; } = "";
    public string Description { get; set; } = "";
    public int SortOrder { get; set; }
}

public sealed class MissionVisionValue
{
    public Guid Id { get; set; }
    public string Mission { get; set; } = "";
    public string Vision { get; set; } = "";
    public string Values { get; set; } = "";
}

public sealed class AboutGalleryItem
{
    public Guid Id { get; set; }
    public string ImageUrl { get; set; } = "";
    public int SortOrder { get; set; }
}

public sealed class Cost
{
    public Guid Id { get; set; }
    public string MonthLabel { get; set; } = "";
    public CostType Type { get; set; }
    public string Name { get; set; } = "";
    public decimal Value { get; set; }
}

public sealed class Payment
{
    public Guid Id { get; set; }
    public Guid AppointmentId { get; set; }
    public Appointment Appointment { get; set; } = null!;
    public decimal GrossAmount { get; set; }
    public string Method { get; set; } = "";
    public DateTime PaidAt { get; set; }
}

public sealed class Commission
{
    public Guid Id { get; set; }
    public Guid AppointmentId { get; set; }
    public Appointment Appointment { get; set; } = null!;
    public Guid ProfessionalId { get; set; }
    public Professional Professional { get; set; } = null!;
    public decimal Amount { get; set; }
    public decimal Percent { get; set; }
}

public sealed class ServiceTax
{
    public Guid Id { get; set; }
    public Guid ServiceId { get; set; }
    public Service Service { get; set; } = null!;
    public string Name { get; set; } = "";
    public decimal Percent { get; set; }
}

public sealed class MetricsSnapshot
{
    public Guid Id { get; set; }
    public string MonthLabel { get; set; } = "";
    public decimal Revenue { get; set; }
    public decimal Profit { get; set; }
    public int Appointments { get; set; }
    public decimal TicketAverage { get; set; }
    public decimal OccupancyRate { get; set; }
    public decimal CancellationRate { get; set; }
    public int NewPatients { get; set; }
}

public sealed class MovementLog
{
    public Guid Id { get; set; }
    public string EventType { get; set; } = "";
    public string Description { get; set; } = "";
    public Guid? UserId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class MedicalRecord
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;
    public string BloodType { get; set; } = "";
    public string Allergies { get; set; } = "";
    public string ChronicConditions { get; set; } = "";
    public string CurrentMedications { get; set; } = "";
    public string FamilyHistory { get; set; } = "";
    public string SurgicalHistory { get; set; } = "";
    public string Habits { get; set; } = "";
    public decimal? HeightCm { get; set; }
    public decimal? WeightKg { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? UpdatedByUserId { get; set; }
    public ICollection<SessionNote> SessionNotes { get; set; } = [];
    public ICollection<MedicalAttachment> Attachments { get; set; } = [];
}

public sealed class SessionNote
{
    public Guid Id { get; set; }
    public Guid MedicalRecordId { get; set; }
    public MedicalRecord MedicalRecord { get; set; } = null!;
    public Guid AppointmentId { get; set; }
    public Appointment Appointment { get; set; } = null!;
    public Guid ProfessionalId { get; set; }
    public Professional Professional { get; set; } = null!;
    public string ChiefComplaint { get; set; } = "";
    public string Subjective { get; set; } = "";
    public string Objective { get; set; } = "";
    public string Assessment { get; set; } = "";
    public string Plan { get; set; } = "";
    public string Diagnosis { get; set; } = "";
    public string DiagnosisCode { get; set; } = "";
    public string Prescription { get; set; } = "";
    public string VitalSignsJson { get; set; } = "";
    public bool IsSigned { get; set; }
    public DateTime? SignedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public sealed class MedicalAttachment
{
    public Guid Id { get; set; }
    public Guid MedicalRecordId { get; set; }
    public MedicalRecord MedicalRecord { get; set; } = null!;
    public string Title { get; set; } = "";
    public string FileUrl { get; set; } = "";
    public string FileType { get; set; } = "";
    public Guid? UploadedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class Clinic
{
    public Guid Id { get; set; }
    public string Name { get; set; } = "";
    public string Cnpj { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";

    public string? GmailClientId { get; set; }
    public string? GmailClientSecret { get; set; }
    public string? GmailAccessToken { get; set; }
    public string? GmailRefreshToken { get; set; }
    public DateTime? GmailTokenExpiresAt { get; set; }
    public bool GmailConnected { get; set; }

    public string? PubSubProjectId { get; set; }
    public string? PubSubTopicName { get; set; }
    public string? PubSubServiceAccount { get; set; }
    public bool PubSubConnected { get; set; }

    public string? MpAccessTokenProd { get; set; }
    public string? MpAccessTokenSandbox { get; set; }
    public string? MpPublicKey { get; set; }
    public string? MpWebhookSecret { get; set; }
    public bool MpSandboxMode { get; set; } = true;
    public bool MpConnected { get; set; }

    public string? WaPhoneNumberId { get; set; }
    public string? WaWabaId { get; set; }
    public string? WaAccessToken { get; set; }
    public string? WaVerifyToken { get; set; }
    public string? WaAppSecret { get; set; }
    public bool WaConnected { get; set; }

    public string? SmtpHost { get; set; }
    public int? SmtpPort { get; set; }
    public string? SmtpUsername { get; set; }
    public string? SmtpPassword { get; set; }
    public string? SmtpFrom { get; set; }
    public bool SmtpConnected { get; set; }

    public string? ResendApiKey { get; set; }
    public string? ResendFromEmail { get; set; }
    public string? ResendFromName { get; set; }
    public bool ResendConnected { get; set; }

    public string? IgAccountId { get; set; }
    public string? IgPageId { get; set; }
    public string? IgAccessToken { get; set; }
    public string? IgAppSecret { get; set; }
    public string? IgVerifyToken { get; set; }
    public bool IgConnected { get; set; }

    public bool RemindersEnabled { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
