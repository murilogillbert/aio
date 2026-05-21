using System.Text.Json.Serialization;
using Aio.Domain.Entities;

namespace Aio.Api.Dtos;

public sealed record AuthRequest(string Email, string Senha);
public sealed record RegisterRequest(string FullName, string Email, string Phone, string Password);
public sealed record RefreshRequest(string RefreshToken);
public sealed record AuthResponse(string Token, string RefreshToken, SafeUserDto User);

public sealed record SafeUserDto(
    string Id,
    string FullName,
    string Email,
    string Phone,
    string Role,
    IReadOnlyList<DependentDto>? Dependents = null,
    IReadOnlyList<AppointmentDto>? Appointments = null,
    IReadOnlyList<ConversationDto>? Conversations = null);

public sealed record DependentDto(string Id, string FullName, string BirthDate, string Relationship);

public sealed record ServiceDto(
    string Id,
    string Name,
    string Category,
    string ShortDescription,
    string Description,
    int DurationMinutes,
    decimal PriceFrom,
    IReadOnlyList<string> ProfessionalIds,
    IReadOnlyList<string> RoomIds,
    IReadOnlyList<string> EquipmentIds);

public sealed record ProfessionalDto(
    string Id,
    string Name,
    string Role,
    string PhotoUrl,
    string Bio,
    string Specialty,
    IReadOnlyList<string> Categories,
    decimal DefaultCommission,
    IReadOnlyList<string> Services,
    IReadOnlyList<WorkingHourDto> WorkingHours,
    decimal? MonthlyFixedPayment);

public sealed record WorkingHourDto(int Weekday, string Start, string End);

public sealed record AgendaSlotDto(string Id, string ProfessionalId, string Date, string Time, bool Available, string? AppointmentId);

public sealed record BookingRequest(
    string? ServiceId,
    string? ProfessionalId,
    string? Date,
    string? Time,
    string? PatientTarget,
    string? PatientId);

public sealed record AppointmentDto(
    string Id,
    string PatientId,
    string? DependentId,
    string ProfessionalId,
    string ServiceId,
    string Date,
    string Time,
    string Status);

public sealed record ConversationDto(string Id, string Title, string Channel, int Unread, IReadOnlyList<ChatMessageDto> Messages);
public sealed record ChatMessageDto(string Id, string Author, string Channel, string Text, string SentAt);

public sealed record MetricsDto(string Month, decimal Revenue, decimal Profit, int Appointments, decimal TicketAverage, decimal Occupancy, decimal CancellationRate, int NewPatients);
public sealed record CostDto(string Id, string Month, string Type, string Name, decimal Value);
public sealed record JobDto(string Id, string Title, string Department, string Description, string Status);
public sealed record ApplicationDto(string Id, string? JobId, string Candidate, string Email, string Message, string CreatedAt);

public sealed record ClinicConfigDto(
    string ClinicName,
    string LogoUrl,
    ThemeConfigDto Theme,
    string Address,
    CoordinatesDto Coordinates,
    string WhatsappUrl,
    string InstagramUrl,
    string OpeningHours,
    IReadOnlyList<BannerDto> Banners,
    AboutContentDto About,
    IReadOnlyList<MessageTemplateDto> MessageTemplates,
    IReadOnlyList<NotificationRuleDto> NotificationRules,
    IReadOnlyList<IntegrationDto> Integrations);

public sealed record ThemeConfigDto(
    string Primary,
    string PrimaryLight,
    string BgBase,
    string BgSecondary,
    string BrownDark,
    string BrownMid,
    string Surface,
    string HeadingFont,
    string BodyFont);

public sealed record CoordinatesDto(decimal Lat, decimal Lng);
public sealed record BannerDto(string Id, string Title, string Subtitle, string CtaText, string CtaUrl, string ImageUrl, int Order, bool Active);
public sealed record AboutContentDto(string Text, IReadOnlyList<MilestoneDto> Milestones, MvvDto Mvv, IReadOnlyList<string> Gallery);
public sealed record MilestoneDto(string Date, string Title, string Description);
public sealed record MvvDto(string Mission, string Vision, string Values);
public sealed record MessageTemplateDto(string Id, string Occasion, string Channel, string Body);
public sealed record NotificationRuleDto(string Id, string Trigger, string LeadTime, string Channel, string TemplateId, bool Active);
public sealed record IntegrationDto(string Id, string Name, string Status, string Description);

public sealed record ExternalIntegrationDto(string Id, string Name, string Status, string Description);
public sealed record JobStatusDto(string Name, string Status, DateTime LastRunAt);

public sealed record ServiceDetailDto(
    string Id,
    string Name,
    string ShortDescription,
    string Description,
    string Preparation,
    string Color,
    int DurationMinutes,
    decimal BasePrice,
    bool RequiresRoom,
    string? DefaultRoomId,
    bool OnlineBooking,
    bool ShowPrice,
    bool ShowDuration,
    bool IsActive,
    IReadOnlyList<string> CategoryIds,
    IReadOnlyList<ServiceProfessionalDto> Professionals,
    IReadOnlyList<string> RoomIds,
    IReadOnlyList<ServiceEquipmentDto> Equipments,
    IReadOnlyList<ServiceTaxDto> Taxes,
    IReadOnlyList<ServicePlanDto> Plans);

public sealed record ServiceProfessionalDto(
    string ProfessionalId,
    string CompensationType,
    decimal? CompensationValue);

public sealed record ServiceEquipmentDto(string EquipmentId, bool Required);
public sealed record ServiceTaxDto(string Id, string Name, decimal Percent);
public sealed record ServicePlanDto(string PlanId, string CoverageRule, decimal? CustomPrice, bool ShowPrice);

public sealed record ServiceUpsertDto(
    string Name,
    string ShortDescription,
    string Description,
    string Preparation,
    string Color,
    int DurationMinutes,
    decimal BasePrice,
    bool RequiresRoom,
    string? DefaultRoomId,
    bool OnlineBooking,
    bool ShowPrice,
    bool ShowDuration,
    bool IsActive,
    IReadOnlyList<string> CategoryIds,
    IReadOnlyList<ServiceProfessionalDto> Professionals,
    IReadOnlyList<string> RoomIds,
    IReadOnlyList<ServiceEquipmentDto> Equipments,
    IReadOnlyList<ServiceTaxDto> Taxes,
    IReadOnlyList<ServicePlanDto> Plans);

public sealed record ServiceSummaryDto(
    string Id,
    string Name,
    string ShortDescription,
    int DurationMinutes,
    decimal BasePrice,
    string Color,
    bool IsActive,
    int ProfessionalCount);

public sealed record CatalogReferenceDto(string Id, string Label);

public sealed record IntegrationsDto(
    GmailIntegrationDto Gmail,
    PubSubIntegrationDto PubSub,
    WhatsAppIntegrationDto WhatsApp,
    MercadoPagoIntegrationDto MercadoPago,
    ResendIntegrationDto Resend,
    SmtpIntegrationDto Smtp,
    InstagramIntegrationDto Instagram,
    bool RemindersEnabled);

public sealed record GmailIntegrationDto(string? ClientId, string? ClientSecretMasked, string? AccessTokenMasked, DateTime? TokenExpiresAt, bool Connected);
public sealed record PubSubIntegrationDto(string? ProjectId, string? TopicName, string? ServiceAccountMasked, bool Connected);
public sealed record WhatsAppIntegrationDto(string? PhoneNumberId, string? WabaId, string? AccessTokenMasked, string? VerifyTokenMasked, string? AppSecretMasked, bool Connected);
public sealed record MercadoPagoIntegrationDto(string? AccessTokenProdMasked, string? AccessTokenSandboxMasked, string? PublicKey, bool SandboxMode, bool Connected);
public sealed record ResendIntegrationDto(string? ApiKeyMasked, string? FromEmail, string? FromName, bool Connected);
public sealed record SmtpIntegrationDto(string? Host, int? Port, string? Username, string? PasswordMasked, string? From, bool Connected);
public sealed record InstagramIntegrationDto(string? AccountId, string? PageId, string? AccessTokenMasked, string? AppSecretMasked, string? VerifyTokenMasked, bool Connected);

public sealed record IntegrationsPatchDto(
    GmailPatchDto? Gmail,
    PubSubPatchDto? PubSub,
    WhatsAppPatchDto? WhatsApp,
    MercadoPagoPatchDto? MercadoPago,
    ResendPatchDto? Resend,
    SmtpPatchDto? Smtp,
    InstagramPatchDto? Instagram,
    bool? RemindersEnabled);

public sealed record GmailPatchDto(string? ClientId, string? ClientSecret);
public sealed record PubSubPatchDto(string? ProjectId, string? TopicName, string? ServiceAccount);
public sealed record WhatsAppPatchDto(string? PhoneNumberId, string? WabaId, string? AccessToken, string? VerifyToken, string? AppSecret);
public sealed record MercadoPagoPatchDto(string? AccessTokenProd, string? AccessTokenSandbox, string? PublicKey, bool? SandboxMode);
public sealed record ResendPatchDto(string? ApiKey, string? FromEmail, string? FromName);
public sealed record SmtpPatchDto(string? Host, int? Port, string? Username, string? Password, string? From);
public sealed record InstagramPatchDto(string? AccountId, string? PageId, string? AccessToken, string? AppSecret, string? VerifyToken);

public sealed record TestResultDto(bool Ok, string Message, string? Detail = null);
public sealed record TestResendDto(string? TestEmail);

public sealed record DashboardMetricsDto(
    decimal Revenue,
    decimal Profit,
    int Appointments,
    decimal TicketAverage,
    decimal Occupancy,
    decimal CancellationRate,
    int NewPatients,
    decimal RevenueTrend,
    decimal AppointmentsTrend,
    decimal ProfitTrend,
    IReadOnlyList<MetricsPointDto> MonthlySeries,
    IReadOnlyList<WaitingPatientDto> WaitingList,
    IReadOnlyList<UpcomingDto> Upcoming);

public sealed record MetricsPointDto(string Month, decimal Revenue, decimal Profit, int Appointments);
public sealed record WaitingPatientDto(string AppointmentId, string PatientName, string ProfessionalName, string Service, string StartTime, int WaitMinutes);
public sealed record UpcomingDto(string AppointmentId, string PatientName, string ProfessionalName, string Service, string StartTime);

public sealed record FaturamentoDto(
    decimal TotalRevenue,
    decimal TotalPayout,
    decimal TotalCustos,
    int CustosCount,
    decimal NetRevenue,
    decimal MargemLiquida,
    decimal RevenueTrend,
    int TotalAppointments,
    int CompletedAppointments,
    decimal TicketMedio,
    decimal Delinquency,
    IReadOnlyList<DistributionDto> ByMethod,
    IReadOnlyList<DistributionDto> ByPlan,
    IReadOnlyList<DistributionDto> CustosByCategory,
    IReadOnlyList<PayoutDto> Payouts,
    IReadOnlyList<MonthlyRevenueDto> MonthlyRevenue);

public sealed record DistributionDto(string Label, decimal Value);
public sealed record PayoutDto(string ProfessionalId, string Name, string Specialty, int Appointments, decimal Gross, decimal CommissionPct, decimal Net);
public sealed record MonthlyRevenueDto(string Month, decimal Revenue, decimal Payout, decimal Custos, decimal NetRevenue);

public sealed record ProfessionalMetricDto(
    string ProfessionalId,
    string Name,
    string Specialty,
    int Appointments,
    int CompletedCount,
    int CancelledCount,
    int NoShowCount,
    decimal Occupancy,
    decimal Revenue,
    decimal NetPayout,
    decimal CommissionPct,
    decimal Ticket,
    decimal CancellationRate,
    int NewPatients,
    int ReturningPatients,
    decimal Rating,
    decimal RevenueTrend,
    string Status);

public sealed record ServiceMetricDto(
    string ServiceId,
    string Name,
    int Volume,
    decimal Revenue,
    int CompletedCount,
    int CancelledCount,
    decimal AvgDurationMinutes,
    int EstimatedDurationMinutes,
    decimal CancellationRate,
    decimal ConversionRate);

public sealed record MovimentoDto(
    int TotalAppointments,
    int Scheduled,
    int Confirmed,
    int InProgress,
    int Completed,
    int Cancelled,
    int NoShow,
    decimal ShowRate,
    decimal RevenueToday,
    decimal PendingToday,
    int NewPatients,
    int MessagesCount,
    decimal AppointmentsTrend,
    decimal RevenueTrend,
    decimal CompletedTrend,
    IReadOnlyList<DistributionDto> StatusBreakdown,
    IReadOnlyList<DistributionDto> RevenueByMethod,
    IReadOnlyList<HourlyDto> HourlyDistribution,
    IReadOnlyList<DistributionDto> ByProfessional,
    IReadOnlyList<MovementEventDto> Events,
    IReadOnlyList<UpcomingDto> Upcoming);

public sealed record HourlyDto(int Hour, int Count);
public sealed record MovementEventDto(string Id, string Type, string Description, string? Professional, string? Patient, decimal? Amount, string CreatedAt);

public sealed record AppointmentRichDto(
    string Id,
    string PatientId,
    string PatientName,
    string ProfessionalId,
    string ProfessionalName,
    string ServiceId,
    string ServiceName,
    string? RoomId,
    string? RoomName,
    string? PlanId,
    string StartTime,
    string EndTime,
    string Status,
    string PatientConfirmation,
    string AppointmentType,
    string? CancellationSource,
    string? RecurrenceGroupId,
    string Notes,
    string ServiceColor,
    string? PaymentStatus,
    decimal? PaymentAmount);

public sealed record AppointmentCreateDto(
    string PatientId,
    string ProfessionalId,
    string ServiceId,
    string? RoomId,
    string? PlanId,
    string StartTime,
    int? DurationMinutes,
    string? Notes,
    string AppointmentType,
    IReadOnlyList<string>? EquipmentIds,
    RecurrenceDto? Recurrence);

public sealed record RecurrenceDto(bool Weekly, int DurationDays);

public sealed record AppointmentUpdateDto(
    string? PatientId,
    string? ProfessionalId,
    string? ServiceId,
    string? RoomId,
    string? PlanId,
    string? StartTime,
    int? DurationMinutes,
    string? Notes,
    string? AppointmentType);

public sealed record StatusPatchDto(string Status, string? CancellationSource);
public sealed record ConfirmationPatchDto(string Value);
public sealed record CheckinResultDto(bool Ok, string Message);
public sealed record PaymentRequestDto(decimal Amount, string Method, bool PaidBeforeCompletion);
public sealed record RecurrenceResultDto(int Created, int Skipped, IReadOnlyList<string> SkippedDates, string Message);

public sealed record PatientRichDto(
    string Id,
    string UserId,
    string Name,
    string Email,
    string Phone,
    string Cpf,
    string? BirthDate,
    string Address,
    string City,
    string State,
    string PostalCode,
    string Notes,
    bool IsActive,
    int Dependents);

public sealed record PatientUpsertDto(
    string Name,
    string Email,
    string Phone,
    string Cpf,
    string? BirthDate,
    string Address,
    string City,
    string State,
    string PostalCode,
    string Notes);

public sealed record PatientCreateResultDto(PatientRichDto Patient, string? GeneratedPassword);
public sealed record DuplicateMatchDto(IReadOnlyList<PatientRichDto> Matches);

public sealed record BlockDto(string Id, string ProfessionalId, string StartAt, string EndAt, string Reason);
public sealed record BlockUpsertDto(string ProfessionalId, string StartAt, string EndAt, string Reason);

public sealed record MedicalRecordDto(
    string Id,
    string PatientId,
    string PatientName,
    string? BloodType,
    string? Allergies,
    string? ChronicConditions,
    string? CurrentMedications,
    string? FamilyHistory,
    string? SurgicalHistory,
    string? Habits,
    decimal? HeightCm,
    decimal? WeightKg,
    string CreatedAt,
    string? UpdatedAt,
    bool IsRestrictedView);

public sealed record MedicalRecordUpsertDto(
    string? BloodType,
    string? Allergies,
    string? ChronicConditions,
    string? CurrentMedications,
    string? FamilyHistory,
    string? SurgicalHistory,
    string? Habits,
    decimal? HeightCm,
    decimal? WeightKg);

public sealed record SessionNoteDto(
    string Id,
    string AppointmentId,
    string PatientId,
    string ProfessionalId,
    string ProfessionalName,
    string ServiceName,
    string AppointmentStartTime,
    string AppointmentStatus,
    string? ChiefComplaint,
    string? Subjective,
    string? Objective,
    string? Assessment,
    string? Plan,
    string? Diagnosis,
    string? DiagnosisCode,
    string? Prescription,
    string? VitalSignsJson,
    bool IsSigned,
    string? SignedAt,
    string CreatedAt,
    string? UpdatedAt,
    bool IsRestrictedView);

public sealed record SessionNoteUpsertDto(
    string? ChiefComplaint,
    string? Subjective,
    string? Objective,
    string? Assessment,
    string? Plan,
    string? Diagnosis,
    string? DiagnosisCode,
    string? Prescription,
    string? VitalSignsJson);

public sealed record MedicalAttachmentDto(
    string Id,
    string PatientId,
    string Title,
    string FileUrl,
    string FileType,
    string CreatedAt);

public sealed record MedicalAttachmentUpsertDto(string Title, string FileUrl, string FileType);

public static class ApiIds
{
    private static readonly Dictionary<string, Guid> ServiceIds = new()
    {
        ["svc-1"] = Guid.Parse("20000000-0000-0000-0000-000000000001"),
        ["svc-2"] = Guid.Parse("20000000-0000-0000-0000-000000000002"),
        ["svc-3"] = Guid.Parse("20000000-0000-0000-0000-000000000003"),
        ["svc-4"] = Guid.Parse("20000000-0000-0000-0000-000000000004"),
        ["svc-5"] = Guid.Parse("20000000-0000-0000-0000-000000000005"),
        ["svc-6"] = Guid.Parse("20000000-0000-0000-0000-000000000006"),
        ["svc-7"] = Guid.Parse("20000000-0000-0000-0000-000000000007"),
        ["svc-8"] = Guid.Parse("20000000-0000-0000-0000-000000000008"),
    };

    private static readonly Dictionary<string, Guid> ProfessionalIds = new()
    {
        ["pro-1"] = Guid.Parse("43000000-0000-0000-0000-000000000001"),
        ["pro-2"] = Guid.Parse("43000000-0000-0000-0000-000000000002"),
        ["pro-3"] = Guid.Parse("43000000-0000-0000-0000-000000000003"),
        ["pro-4"] = Guid.Parse("43000000-0000-0000-0000-000000000004"),
        ["pro-5"] = Guid.Parse("43000000-0000-0000-0000-000000000005"),
        ["fun-1"] = Guid.Parse("43000000-0000-0000-0000-000000000006"),
        ["fun-2"] = Guid.Parse("43000000-0000-0000-0000-000000000007"),
    };

    private static readonly Dictionary<string, Guid> UserIds = new()
    {
        ["usr-paciente"] = Guid.Parse("41000000-0000-0000-0000-000000000001"),
        ["usr-profissional"] = Guid.Parse("41000000-0000-0000-0000-000000000002"),
        ["usr-recepcao"] = Guid.Parse("41000000-0000-0000-0000-000000000003"),
        ["usr-admin"] = Guid.Parse("41000000-0000-0000-0000-000000000004"),
    };

    public static string Service(Guid id) => ServiceIds.FirstOrDefault(x => x.Value == id).Key ?? id.ToString();
    public static Guid Service(string id) => ServiceIds.GetValueOrDefault(id, Guid.TryParse(id, out var guid) ? guid : Guid.Empty);
    public static string Professional(Guid id) => ProfessionalIds.FirstOrDefault(x => x.Value == id).Key ?? id.ToString();
    public static Guid Professional(string id) => ProfessionalIds.GetValueOrDefault(id, Guid.TryParse(id, out var guid) ? guid : Guid.Empty);
    public static string User(Guid id) => UserIds.FirstOrDefault(x => x.Value == id).Key ?? id.ToString();
    public static Guid User(string id) => UserIds.GetValueOrDefault(id, Guid.TryParse(id, out var guid) ? guid : Guid.Empty);
    public static string Any(Guid id, string prefix) => prefix switch
    {
        "svc" => Service(id),
        "pro" => Professional(id),
        "usr" => User(id),
        _ => id.ToString()
    };
}

public static class DtoMapper
{
    public static AppointmentDto ToDto(this Appointment appointment) => new(
        appointment.Id.ToString(),
        ApiIds.User(appointment.Patient.UserId),
        appointment.DependentId?.ToString(),
        ApiIds.Professional(appointment.ProfessionalId),
        ApiIds.Service(appointment.ServiceId),
        appointment.Date.ToString("yyyy-MM-dd"),
        appointment.Time.ToString("HH:mm"),
        appointment.Status.ToString().ToLowerInvariant());

    public static ChatMessageDto ToDto(this Message message) => new(
        message.Id.ToString(),
        message.AuthorName,
        JsonNamingPolicy.CamelCaseLower(message.Channel.ToString()),
        message.Body,
        message.SentAt.ToString("O"));
}

internal static class JsonNamingPolicy
{
    public static string CamelCaseLower(string value) => value switch
    {
        "Aplicacao" => "Aplicacao",
        "Email" => "E-mail",
        _ => value
    };
}
