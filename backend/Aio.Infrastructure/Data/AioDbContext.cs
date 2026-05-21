using Aio.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Aio.Infrastructure.Data;

public sealed class AioDbContext(DbContextOptions<AioDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Dependent> Dependents => Set<Dependent>();
    public DbSet<Professional> Professionals => Set<Professional>();
    public DbSet<ProfessionalSchedule> ProfessionalSchedules => Set<ProfessionalSchedule>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<ServiceCategory> ServiceCategories => Set<ServiceCategory>();
    public DbSet<ProfessionalService> ProfessionalServices => Set<ProfessionalService>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<RoomService> RoomServices => Set<RoomService>();
    public DbSet<Equipment> Equipments => Set<Equipment>();
    public DbSet<RoomEquipment> RoomEquipments => Set<RoomEquipment>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<AppointmentStatusLog> AppointmentStatusLogs => Set<AppointmentStatusLog>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<ConversationParticipant> ConversationParticipants => Set<ConversationParticipant>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<MessagingChannel> MessagingChannels => Set<MessagingChannel>();
    public DbSet<NotificationRule> NotificationRules => Set<NotificationRule>();
    public DbSet<MessageTemplate> MessageTemplates => Set<MessageTemplate>();
    public DbSet<Plan> Plans => Set<Plan>();
    public DbSet<PlanService> PlanServices => Set<PlanService>();
    public DbSet<JobOpening> JobOpenings => Set<JobOpening>();
    public DbSet<JobApplication> JobApplications => Set<JobApplication>();
    public DbSet<TalentPoolEntry> TalentPoolEntries => Set<TalentPoolEntry>();
    public DbSet<Banner> Banners => Set<Banner>();
    public DbSet<AppSetting> AppSettings => Set<AppSetting>();
    public DbSet<HistoricMilestone> HistoricMilestones => Set<HistoricMilestone>();
    public DbSet<MissionVisionValue> MissionVisionValues => Set<MissionVisionValue>();
    public DbSet<AboutGalleryItem> AboutGalleryItems => Set<AboutGalleryItem>();
    public DbSet<Cost> Costs => Set<Cost>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Commission> Commissions => Set<Commission>();
    public DbSet<ServiceTax> ServiceTaxes => Set<ServiceTax>();
    public DbSet<MetricsSnapshot> MetricsSnapshots => Set<MetricsSnapshot>();
    public DbSet<MovementLog> MovementLogs => Set<MovementLog>();
    public DbSet<ServiceEquipment> ServiceEquipments => Set<ServiceEquipment>();
    public DbSet<ProfessionalBlock> ProfessionalBlocks => Set<ProfessionalBlock>();
    public DbSet<ProfessionalCategory> ProfessionalCategories => Set<ProfessionalCategory>();
    public DbSet<AppointmentEquipment> AppointmentEquipments => Set<AppointmentEquipment>();
    public DbSet<MedicalRecord> MedicalRecords => Set<MedicalRecord>();
    public DbSet<SessionNote> SessionNotes => Set<SessionNote>();
    public DbSet<MedicalAttachment> MedicalAttachments => Set<MedicalAttachment>();
    public DbSet<Clinic> Clinics => Set<Clinic>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ConfigureTables(modelBuilder);
        ConfigureKeys(modelBuilder);
        ConfigureColumns(modelBuilder);
        ConfigureIndexes(modelBuilder);
        ConfigureDeleteBehavior(modelBuilder);
        ConfigureSeeds(modelBuilder);
    }

    private static void ConfigureTables(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().ToTable("usuarios");
        modelBuilder.Entity<RefreshToken>().ToTable("refresh_tokens");
        modelBuilder.Entity<Role>().ToTable("roles");
        modelBuilder.Entity<UserRole>().ToTable("usuario_roles");
        modelBuilder.Entity<Patient>().ToTable("pacientes");
        modelBuilder.Entity<Dependent>().ToTable("dependentes");
        modelBuilder.Entity<Professional>().ToTable("profissionais");
        modelBuilder.Entity<ProfessionalSchedule>().ToTable("profissional_horarios");
        modelBuilder.Entity<Employee>().ToTable("funcionarios");
        modelBuilder.Entity<Service>().ToTable("servicos");
        modelBuilder.Entity<Category>().ToTable("categorias");
        modelBuilder.Entity<ServiceCategory>().ToTable("servico_categorias");
        modelBuilder.Entity<ProfessionalService>().ToTable("profissional_servicos");
        modelBuilder.Entity<Room>().ToTable("salas");
        modelBuilder.Entity<RoomService>().ToTable("sala_servicos");
        modelBuilder.Entity<Equipment>().ToTable("equipamentos");
        modelBuilder.Entity<RoomEquipment>().ToTable("sala_equipamentos");
        modelBuilder.Entity<Appointment>().ToTable("agendamentos");
        modelBuilder.Entity<AppointmentStatusLog>().ToTable("agendamento_status_log");
        modelBuilder.Entity<Conversation>().ToTable("conversas");
        modelBuilder.Entity<ConversationParticipant>().ToTable("conversa_participantes");
        modelBuilder.Entity<Message>().ToTable("mensagens");
        modelBuilder.Entity<MessagingChannel>().ToTable("canais_mensageria");
        modelBuilder.Entity<NotificationRule>().ToTable("notificacao_regras");
        modelBuilder.Entity<MessageTemplate>().ToTable("templates_mensagem");
        modelBuilder.Entity<Plan>().ToTable("planos");
        modelBuilder.Entity<PlanService>().ToTable("plano_servicos");
        modelBuilder.Entity<JobOpening>().ToTable("vagas");
        modelBuilder.Entity<JobApplication>().ToTable("candidaturas");
        modelBuilder.Entity<TalentPoolEntry>().ToTable("banco_talentos");
        modelBuilder.Entity<Banner>().ToTable("banners");
        modelBuilder.Entity<AppSetting>().ToTable("configuracoes");
        modelBuilder.Entity<HistoricMilestone>().ToTable("marcos_historicos");
        modelBuilder.Entity<MissionVisionValue>().ToTable("mvv");
        modelBuilder.Entity<AboutGalleryItem>().ToTable("galeria_sobre");
        modelBuilder.Entity<Cost>().ToTable("custos");
        modelBuilder.Entity<Payment>().ToTable("pagamentos");
        modelBuilder.Entity<Commission>().ToTable("comissoes");
        modelBuilder.Entity<ServiceTax>().ToTable("impostos_servico");
        modelBuilder.Entity<MetricsSnapshot>().ToTable("metricas_snapshot");
        modelBuilder.Entity<MovementLog>().ToTable("log_movimento");
        modelBuilder.Entity<ServiceEquipment>().ToTable("servico_equipamentos");
        modelBuilder.Entity<ProfessionalBlock>().ToTable("profissional_bloqueios");
        modelBuilder.Entity<ProfessionalCategory>().ToTable("profissional_categorias");
        modelBuilder.Entity<AppointmentEquipment>().ToTable("agendamento_equipamentos");
        modelBuilder.Entity<MedicalRecord>().ToTable("prontuarios");
        modelBuilder.Entity<SessionNote>().ToTable("evolucoes");
        modelBuilder.Entity<MedicalAttachment>().ToTable("prontuario_anexos");
        modelBuilder.Entity<Clinic>().ToTable("clinica");
    }

    private static void ConfigureKeys(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserRole>().HasKey(x => new { x.UserId, x.RoleId });
        modelBuilder.Entity<ServiceCategory>().HasKey(x => new { x.ServiceId, x.CategoryId });
        modelBuilder.Entity<ProfessionalService>().HasKey(x => new { x.ProfessionalId, x.ServiceId });
        modelBuilder.Entity<RoomService>().HasKey(x => new { x.RoomId, x.ServiceId });
        modelBuilder.Entity<RoomEquipment>().HasKey(x => new { x.RoomId, x.EquipmentId });
        modelBuilder.Entity<ConversationParticipant>().HasKey(x => new { x.ConversationId, x.UserId });
        modelBuilder.Entity<PlanService>().HasKey(x => new { x.PlanId, x.ServiceId });
        modelBuilder.Entity<ServiceEquipment>().HasKey(x => new { x.ServiceId, x.EquipmentId });
        modelBuilder.Entity<ProfessionalCategory>().HasKey(x => new { x.ProfessionalId, x.CategoryId });
        modelBuilder.Entity<AppointmentEquipment>().HasKey(x => new { x.AppointmentId, x.EquipmentId });
    }

    private static void ConfigureColumns(ModelBuilder modelBuilder)
    {
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entity.GetProperties().Where(p => p.ClrType == typeof(string)))
            {
                property.SetMaxLength(property.Name.Contains("Description") || property.Name.Contains("Body") || property.Name.Contains("Value") ? 4000 : 250);
            }
        }

        modelBuilder.Entity<User>().Property(x => x.Email).HasMaxLength(180);
        modelBuilder.Entity<User>().Property(x => x.PasswordHash).HasMaxLength(500);
        modelBuilder.Entity<RefreshToken>().Property(x => x.TokenHash).HasMaxLength(500);
        modelBuilder.Entity<RefreshToken>().Property(x => x.ReplacedByTokenHash).HasMaxLength(500);
        modelBuilder.Entity<Service>().Property(x => x.BasePrice).HasPrecision(12, 2);
        modelBuilder.Entity<Professional>().Property(x => x.DefaultCommissionPercent).HasPrecision(5, 2);
        modelBuilder.Entity<Professional>().Property(x => x.MonthlyFixedPayment).HasPrecision(12, 2);
        modelBuilder.Entity<Equipment>().Property(x => x.UnitValue).HasPrecision(12, 2);
        modelBuilder.Entity<Cost>().Property(x => x.Value).HasPrecision(12, 2);
        modelBuilder.Entity<Payment>().Property(x => x.GrossAmount).HasPrecision(12, 2);
        modelBuilder.Entity<Commission>().Property(x => x.Amount).HasPrecision(12, 2);
        modelBuilder.Entity<Commission>().Property(x => x.Percent).HasPrecision(5, 2);
        modelBuilder.Entity<ServiceTax>().Property(x => x.Percent).HasPrecision(5, 2);
        modelBuilder.Entity<MetricsSnapshot>().Property(x => x.Revenue).HasPrecision(12, 2);
        modelBuilder.Entity<MetricsSnapshot>().Property(x => x.Profit).HasPrecision(12, 2);
        modelBuilder.Entity<MetricsSnapshot>().Property(x => x.TicketAverage).HasPrecision(12, 2);
        modelBuilder.Entity<MetricsSnapshot>().Property(x => x.OccupancyRate).HasPrecision(5, 2);
        modelBuilder.Entity<MetricsSnapshot>().Property(x => x.CancellationRate).HasPrecision(5, 2);
        modelBuilder.Entity<ProfessionalService>().Property(x => x.CompensationValue).HasPrecision(12, 2);
        modelBuilder.Entity<PlanService>().Property(x => x.CustomPrice).HasPrecision(12, 2);
        modelBuilder.Entity<MedicalRecord>().Property(x => x.HeightCm).HasPrecision(5, 2);
        modelBuilder.Entity<MedicalRecord>().Property(x => x.WeightKg).HasPrecision(5, 2);
        modelBuilder.Entity<Service>().Property(x => x.Color).HasMaxLength(16);
        modelBuilder.Entity<Patient>().Property(x => x.Cpf).HasMaxLength(20);
        modelBuilder.Entity<Patient>().Property(x => x.PostalCode).HasMaxLength(20);
        modelBuilder.Entity<Patient>().Property(x => x.State).HasMaxLength(40);
        modelBuilder.Entity<Patient>().Property(x => x.Notes).HasMaxLength(4000);
        modelBuilder.Entity<MedicalRecord>().Property(x => x.Allergies).HasMaxLength(4000);
        modelBuilder.Entity<MedicalRecord>().Property(x => x.ChronicConditions).HasMaxLength(4000);
        modelBuilder.Entity<MedicalRecord>().Property(x => x.CurrentMedications).HasMaxLength(4000);
        modelBuilder.Entity<MedicalRecord>().Property(x => x.FamilyHistory).HasMaxLength(4000);
        modelBuilder.Entity<MedicalRecord>().Property(x => x.SurgicalHistory).HasMaxLength(4000);
        modelBuilder.Entity<MedicalRecord>().Property(x => x.Habits).HasMaxLength(4000);
        modelBuilder.Entity<SessionNote>().Property(x => x.Subjective).HasMaxLength(4000);
        modelBuilder.Entity<SessionNote>().Property(x => x.Objective).HasMaxLength(4000);
        modelBuilder.Entity<SessionNote>().Property(x => x.Assessment).HasMaxLength(4000);
        modelBuilder.Entity<SessionNote>().Property(x => x.Plan).HasMaxLength(4000);
        modelBuilder.Entity<SessionNote>().Property(x => x.Prescription).HasMaxLength(4000);
        modelBuilder.Entity<SessionNote>().Property(x => x.VitalSignsJson).HasMaxLength(4000);
        modelBuilder.Entity<Clinic>().Property(x => x.MpAccessTokenProd).HasMaxLength(500);
        modelBuilder.Entity<Clinic>().Property(x => x.MpAccessTokenSandbox).HasMaxLength(500);
        modelBuilder.Entity<Clinic>().Property(x => x.GmailAccessToken).HasMaxLength(2000);
        modelBuilder.Entity<Clinic>().Property(x => x.GmailRefreshToken).HasMaxLength(2000);
        modelBuilder.Entity<Clinic>().Property(x => x.WaAccessToken).HasMaxLength(2000);
        modelBuilder.Entity<Clinic>().Property(x => x.ResendApiKey).HasMaxLength(500);
        modelBuilder.Entity<Clinic>().Property(x => x.IgAccessToken).HasMaxLength(2000);
        modelBuilder.Entity<Patient>().HasOne(x => x.MedicalRecord).WithOne(x => x.Patient).HasForeignKey<MedicalRecord>(x => x.PatientId);
        modelBuilder.Entity<Appointment>().HasOne(x => x.SessionNote).WithOne(x => x.Appointment).HasForeignKey<SessionNote>(x => x.AppointmentId);
        modelBuilder.Entity<Category>().HasOne(x => x.Parent).WithMany(x => x.Children).HasForeignKey(x => x.ParentId);
    }

    private static void ConfigureIndexes(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>().HasIndex(x => x.Email).IsUnique();
        modelBuilder.Entity<RefreshToken>().HasIndex(x => x.TokenHash).IsUnique();
        modelBuilder.Entity<RefreshToken>().HasIndex(x => new { x.UserId, x.ExpiresAt });
        modelBuilder.Entity<Role>().HasIndex(x => x.Name).IsUnique();
        modelBuilder.Entity<AppSetting>().HasIndex(x => x.Key).IsUnique();
        modelBuilder.Entity<Appointment>().HasIndex(x => new { x.ProfessionalId, x.Date, x.Time }).IsUnique();
        modelBuilder.Entity<ProfessionalSchedule>().HasIndex(x => new { x.ProfessionalId, x.Weekday });
        modelBuilder.Entity<Message>().HasIndex(x => new { x.ConversationId, x.SentAt });
        modelBuilder.Entity<MovementLog>().HasIndex(x => new { x.EventType, x.CreatedAt });
        modelBuilder.Entity<ProfessionalBlock>().HasIndex(x => new { x.ProfessionalId, x.StartAt, x.EndAt });
        modelBuilder.Entity<Patient>().HasIndex(x => x.Cpf);
        modelBuilder.Entity<Appointment>().HasIndex(x => x.RecurrenceGroupId);
        modelBuilder.Entity<SessionNote>().HasIndex(x => x.AppointmentId).IsUnique();
    }

    private static void ConfigureDeleteBehavior(ModelBuilder modelBuilder)
    {
        foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(entity => entity.GetForeignKeys()))
        {
            relationship.DeleteBehavior = DeleteBehavior.Restrict;
        }
    }

    private static void ConfigureSeeds(ModelBuilder modelBuilder)
    {
        SeedCatalog(modelBuilder);
        SeedPeople(modelBuilder);
        SeedOperations(modelBuilder);
        SeedWhiteLabel(modelBuilder);
        SeedMetrics(modelBuilder);
    }

    private static Guid Id(string value) => Guid.Parse(value);

    private static void SeedCatalog(ModelBuilder modelBuilder)
    {
        var catEstetica = Id("10000000-0000-0000-0000-000000000001");
        var catOdonto = Id("10000000-0000-0000-0000-000000000002");
        var catMedicina = Id("10000000-0000-0000-0000-000000000003");
        var catTerapias = Id("10000000-0000-0000-0000-000000000004");

        modelBuilder.Entity<Category>().HasData(
            new Category { Id = catEstetica, Name = "Estética avançada", Type = "servico" },
            new Category { Id = catOdonto, Name = "Odontologia", Type = "servico" },
            new Category { Id = catMedicina, Name = "Medicina particular", Type = "servico" },
            new Category { Id = catTerapias, Name = "Terapias", Type = "servico" },
            new Category { Id = Id("10000000-0000-0000-0000-000000000005"), Name = "Operação", Type = "equipe" },
            new Category { Id = Id("10000000-0000-0000-0000-000000000006"), Name = "Administrativo", Type = "equipe" });

        var services = new[]
        {
            new Service { Id = Id("20000000-0000-0000-0000-000000000001"), Name = "Avaliação Facial Integrada", ShortDescription = "Plano personalizado com análise facial, histórico e metas de tratamento.", Description = "Consulta completa para mapear necessidades, contraindicações, objetivos e sequência ideal de procedimentos.", DurationMinutes = 60, BasePrice = 380 },
            new Service { Id = Id("20000000-0000-0000-0000-000000000002"), Name = "Bioestimulador de Colágeno", ShortDescription = "Tratamento para melhora gradual de firmeza e textura da pele.", Description = "Procedimento injetável com planejamento por região, revisão de fotos e acompanhamento de evolução.", DurationMinutes = 75, BasePrice = 1800 },
            new Service { Id = Id("20000000-0000-0000-0000-000000000003"), Name = "Clareamento Dental Premium", ShortDescription = "Protocolo supervisionado com controle de sensibilidade.", Description = "Clareamento conduzido por especialista, com registro de cor, proteção gengival e orientações pós-atendimento.", DurationMinutes = 90, BasePrice = 950 },
            new Service { Id = Id("20000000-0000-0000-0000-000000000004"), Name = "Implantodontia Planejada", ShortDescription = "Planejamento de implantes com avaliação de exames e cronograma.", Description = "Consulta especializada para diagnóstico, indicação, etapas cirúrgicas e previsibilidade do investimento.", DurationMinutes = 80, BasePrice = 2500 },
            new Service { Id = Id("20000000-0000-0000-0000-000000000005"), Name = "Consulta Médica Particular", ShortDescription = "Atendimento clínico com escuta ampliada e plano de acompanhamento.", Description = "Consulta individual com anamnese, revisão de exames, hipóteses diagnósticas e orientações documentadas.", DurationMinutes = 50, BasePrice = 620 },
            new Service { Id = Id("20000000-0000-0000-0000-000000000006"), Name = "Retorno Médico", ShortDescription = "Revisão de exames e ajuste de conduta.", Description = "Atendimento de continuidade para revisar evolução, exames e adequar o plano de cuidado.", DurationMinutes = 35, BasePrice = 320 },
            new Service { Id = Id("20000000-0000-0000-0000-000000000007"), Name = "Terapia de Performance", ShortDescription = "Sessão focada em performance, autocuidado e rotina.", Description = "Abordagem terapêutica para construir repertório emocional, metas realistas e acompanhamento entre sessões.", DurationMinutes = 55, BasePrice = 420 },
            new Service { Id = Id("20000000-0000-0000-0000-000000000008"), Name = "Sessão de Manutenção", ShortDescription = "Acompanhamento periódico para pacientes em plano ativo.", Description = "Sessão de continuidade com revisão de evolução, ajustes e próximos passos do plano terapêutico.", DurationMinutes = 45, BasePrice = 340 }
        };
        modelBuilder.Entity<Service>().HasData(services);

        modelBuilder.Entity<ServiceCategory>().HasData(
            new ServiceCategory { ServiceId = services[0].Id, CategoryId = catEstetica },
            new ServiceCategory { ServiceId = services[1].Id, CategoryId = catEstetica },
            new ServiceCategory { ServiceId = services[2].Id, CategoryId = catOdonto },
            new ServiceCategory { ServiceId = services[3].Id, CategoryId = catOdonto },
            new ServiceCategory { ServiceId = services[4].Id, CategoryId = catMedicina },
            new ServiceCategory { ServiceId = services[5].Id, CategoryId = catMedicina },
            new ServiceCategory { ServiceId = services[6].Id, CategoryId = catTerapias },
            new ServiceCategory { ServiceId = services[7].Id, CategoryId = catTerapias });

        modelBuilder.Entity<Room>().HasData(
            new Room { Id = Id("30000000-0000-0000-0000-000000000001"), Name = "Sala de avaliação", Capacity = 3, Notes = "Consultas e avaliações." },
            new Room { Id = Id("30000000-0000-0000-0000-000000000002"), Name = "Sala de procedimentos", Capacity = 2, Notes = "Procedimentos estéticos avançados." },
            new Room { Id = Id("30000000-0000-0000-0000-000000000003"), Name = "Consultório odontológico", Capacity = 2, Notes = "Odontologia especializada." },
            new Room { Id = Id("30000000-0000-0000-0000-000000000004"), Name = "Sala terapêutica", Capacity = 2, Notes = "Ambiente reservado para terapias." });

        modelBuilder.Entity<Equipment>().HasData(
            new Equipment { Id = Id("31000000-0000-0000-0000-000000000001"), Name = "Scanner facial", Category = "Diagnóstico", Quantity = 1, UnitValue = 28000 },
            new Equipment { Id = Id("31000000-0000-0000-0000-000000000002"), Name = "Dermatoscópio", Category = "Estética", Quantity = 2, UnitValue = 9500 },
            new Equipment { Id = Id("31000000-0000-0000-0000-000000000003"), Name = "LED clareador", Category = "Odontologia", Quantity = 1, UnitValue = 7200 },
            new Equipment { Id = Id("31000000-0000-0000-0000-000000000004"), Name = "Motor cirúrgico", Category = "Odontologia", Quantity = 1, UnitValue = 18000 });

        modelBuilder.Entity<RoomService>().HasData(
            new RoomService { RoomId = Id("30000000-0000-0000-0000-000000000001"), ServiceId = services[0].Id },
            new RoomService { RoomId = Id("30000000-0000-0000-0000-000000000002"), ServiceId = services[1].Id },
            new RoomService { RoomId = Id("30000000-0000-0000-0000-000000000003"), ServiceId = services[2].Id },
            new RoomService { RoomId = Id("30000000-0000-0000-0000-000000000003"), ServiceId = services[3].Id },
            new RoomService { RoomId = Id("30000000-0000-0000-0000-000000000001"), ServiceId = services[4].Id },
            new RoomService { RoomId = Id("30000000-0000-0000-0000-000000000001"), ServiceId = services[5].Id },
            new RoomService { RoomId = Id("30000000-0000-0000-0000-000000000004"), ServiceId = services[6].Id },
            new RoomService { RoomId = Id("30000000-0000-0000-0000-000000000004"), ServiceId = services[7].Id });

        modelBuilder.Entity<RoomEquipment>().HasData(
            new RoomEquipment { RoomId = Id("30000000-0000-0000-0000-000000000001"), EquipmentId = Id("31000000-0000-0000-0000-000000000001") },
            new RoomEquipment { RoomId = Id("30000000-0000-0000-0000-000000000002"), EquipmentId = Id("31000000-0000-0000-0000-000000000002") },
            new RoomEquipment { RoomId = Id("30000000-0000-0000-0000-000000000003"), EquipmentId = Id("31000000-0000-0000-0000-000000000003") },
            new RoomEquipment { RoomId = Id("30000000-0000-0000-0000-000000000003"), EquipmentId = Id("31000000-0000-0000-0000-000000000004") });

        modelBuilder.Entity<ServiceTax>().HasData(
            new ServiceTax { Id = Id("32000000-0000-0000-0000-000000000001"), ServiceId = services[1].Id, Name = "ISS", Percent = 5 },
            new ServiceTax { Id = Id("32000000-0000-0000-0000-000000000002"), ServiceId = services[3].Id, Name = "ISS", Percent = 5 },
            new ServiceTax { Id = Id("32000000-0000-0000-0000-000000000003"), ServiceId = services[4].Id, Name = "ISS", Percent = 3 });

        modelBuilder.Entity<ServiceEquipment>().HasData(
            new ServiceEquipment { ServiceId = services[0].Id, EquipmentId = Id("31000000-0000-0000-0000-000000000001"), Required = true },
            new ServiceEquipment { ServiceId = services[1].Id, EquipmentId = Id("31000000-0000-0000-0000-000000000002"), Required = true },
            new ServiceEquipment { ServiceId = services[2].Id, EquipmentId = Id("31000000-0000-0000-0000-000000000003"), Required = true },
            new ServiceEquipment { ServiceId = services[3].Id, EquipmentId = Id("31000000-0000-0000-0000-000000000004"), Required = true });
    }

    private static void SeedPeople(ModelBuilder modelBuilder)
    {
        var pacienteRole = Id("40000000-0000-0000-0000-000000000001");
        var profissionalRole = Id("40000000-0000-0000-0000-000000000002");
        var recepcaoRole = Id("40000000-0000-0000-0000-000000000003");
        var adminRole = Id("40000000-0000-0000-0000-000000000004");
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = pacienteRole, Name = "paciente" },
            new Role { Id = profissionalRole, Name = "profissional" },
            new Role { Id = recepcaoRole, Name = "recepcao" },
            new Role { Id = adminRole, Name = "admin" });

        var patientUser = Id("41000000-0000-0000-0000-000000000001");
        var professionalUser = Id("41000000-0000-0000-0000-000000000002");
        var receptionUser = Id("41000000-0000-0000-0000-000000000003");
        var adminUser = Id("41000000-0000-0000-0000-000000000004");
        modelBuilder.Entity<User>().HasData(
            new User { Id = patientUser, FullName = "Marina Pires", Email = "paciente@aio.com", PasswordHash = "seed:senha123", Phone = "(11) 98888-1111", CreatedAt = new DateTime(2026, 5, 1, 9, 0, 0) },
            new User { Id = professionalUser, FullName = "Dra. Helena Prado", Email = "profissional@aio.com", PasswordHash = "seed:senha123", Phone = "(11) 97777-2222", CreatedAt = new DateTime(2026, 5, 1, 9, 0, 0) },
            new User { Id = receptionUser, FullName = "Sofia Almeida", Email = "recepcao@aio.com", PasswordHash = "seed:senha123", Phone = "(11) 96666-3333", CreatedAt = new DateTime(2026, 5, 1, 9, 0, 0) },
            new User { Id = adminUser, FullName = "Bruno Castro", Email = "admin@aio.com", PasswordHash = "seed:senha123", Phone = "(11) 95555-4444", CreatedAt = new DateTime(2026, 5, 1, 9, 0, 0) });

        modelBuilder.Entity<UserRole>().HasData(
            new UserRole { UserId = patientUser, RoleId = pacienteRole },
            new UserRole { UserId = professionalUser, RoleId = profissionalRole },
            new UserRole { UserId = receptionUser, RoleId = recepcaoRole },
            new UserRole { UserId = adminUser, RoleId = adminRole });

        var patient = Id("42000000-0000-0000-0000-000000000001");
        modelBuilder.Entity<Patient>().HasData(new Patient { Id = patient, UserId = patientUser, BirthDate = new DateTime(1988, 9, 14) });
        modelBuilder.Entity<Dependent>().HasData(
            new Dependent { Id = Id("42100000-0000-0000-0000-000000000001"), PatientId = patient, FullName = "Lia Pires", BirthDate = new DateTime(2016, 8, 12), Relationship = "Filha" },
            new Dependent { Id = Id("42100000-0000-0000-0000-000000000002"), PatientId = patient, FullName = "Theo Pires", BirthDate = new DateTime(2019, 3, 20), Relationship = "Filho" });

        var professionals = new[]
        {
            new Professional { Id = Id("43000000-0000-0000-0000-000000000001"), UserId = professionalUser, Name = "Dra. Helena Prado", PhotoUrl = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80", Bio = "Especialista em estética avançada, com foco em planos graduais, naturalidade e segurança técnica.", Specialty = "Dermatologia estética", DefaultCommissionPercent = 35, ProvidesCare = true },
            new Professional { Id = Id("43000000-0000-0000-0000-000000000002"), Name = "Dr. Rafael Nogueira", PhotoUrl = "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80", Bio = "Atua em avaliação facial e protocolos conservadores para pacientes que buscam evolução mensurável.", Specialty = "Harmonização facial", DefaultCommissionPercent = 30, ProvidesCare = true },
            new Professional { Id = Id("43000000-0000-0000-0000-000000000003"), Name = "Dra. Camila Torres", PhotoUrl = "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80", Bio = "Cirurgiã-dentista com experiência em implantodontia, estética dental e planejamento multidisciplinar.", Specialty = "Odontologia especializada", DefaultCommissionPercent = 40, ProvidesCare = true },
            new Professional { Id = Id("43000000-0000-0000-0000-000000000004"), Name = "Dr. Marcos Vidal", PhotoUrl = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80", Bio = "Médico clínico com atendimento particular, acompanhamento longitudinal e análise detalhada de exames.", Specialty = "Clínica médica", DefaultCommissionPercent = 45, ProvidesCare = true },
            new Professional { Id = Id("43000000-0000-0000-0000-000000000005"), Name = "Dra. Laura Menezes", PhotoUrl = "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&w=600&q=80", Bio = "Terapeuta focada em performance, autocuidado e criação de rotinas sustentáveis.", Specialty = "Terapias integrativas", DefaultCommissionPercent = 32, ProvidesCare = true },
            new Professional { Id = Id("43000000-0000-0000-0000-000000000006"), UserId = receptionUser, Name = "Sofia Almeida", PhotoUrl = "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80", Bio = "Responsável por acolhimento, agenda compartilhada e central de comunicação.", Specialty = "Recepção premium", DefaultCommissionPercent = 0, ProvidesCare = false },
            new Professional { Id = Id("43000000-0000-0000-0000-000000000007"), UserId = adminUser, Name = "Bruno Castro", PhotoUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80", Bio = "Administração, indicadores executivos e configurações white label.", Specialty = "Gestão administrativa", DefaultCommissionPercent = 0, MonthlyFixedPayment = 7200, ProvidesCare = false }
        };
        modelBuilder.Entity<Professional>().HasData(professionals);
        modelBuilder.Entity<Employee>().HasData(
            new Employee { Id = Id("44000000-0000-0000-0000-000000000001"), UserId = receptionUser, Department = "Recepção", MonthlySalary = 4200 },
            new Employee { Id = Id("44000000-0000-0000-0000-000000000002"), UserId = adminUser, Department = "Administração", MonthlySalary = 7200 });

        modelBuilder.Entity<ProfessionalService>().HasData(
            new ProfessionalService { ProfessionalId = professionals[0].Id, ServiceId = Id("20000000-0000-0000-0000-000000000001"), CompensationType = "default_commission" },
            new ProfessionalService { ProfessionalId = professionals[0].Id, ServiceId = Id("20000000-0000-0000-0000-000000000002"), CompensationType = "custom_percent", CompensationValue = 38 },
            new ProfessionalService { ProfessionalId = professionals[1].Id, ServiceId = Id("20000000-0000-0000-0000-000000000001"), CompensationType = "default_commission" },
            new ProfessionalService { ProfessionalId = professionals[2].Id, ServiceId = Id("20000000-0000-0000-0000-000000000003"), CompensationType = "default_commission" },
            new ProfessionalService { ProfessionalId = professionals[2].Id, ServiceId = Id("20000000-0000-0000-0000-000000000004"), CompensationType = "fixed_value", CompensationValue = 900 },
            new ProfessionalService { ProfessionalId = professionals[3].Id, ServiceId = Id("20000000-0000-0000-0000-000000000005"), CompensationType = "default_commission" },
            new ProfessionalService { ProfessionalId = professionals[3].Id, ServiceId = Id("20000000-0000-0000-0000-000000000006"), CompensationType = "default_commission" },
            new ProfessionalService { ProfessionalId = professionals[4].Id, ServiceId = Id("20000000-0000-0000-0000-000000000007"), CompensationType = "default_commission" },
            new ProfessionalService { ProfessionalId = professionals[4].Id, ServiceId = Id("20000000-0000-0000-0000-000000000008"), CompensationType = "default_commission" });

        modelBuilder.Entity<ProfessionalSchedule>().HasData(
            new ProfessionalSchedule { Id = Id("45000000-0000-0000-0000-000000000001"), ProfessionalId = professionals[0].Id, Weekday = 1, StartTime = new TimeOnly(9, 0), EndTime = new TimeOnly(17, 0) },
            new ProfessionalSchedule { Id = Id("45000000-0000-0000-0000-000000000002"), ProfessionalId = professionals[0].Id, Weekday = 3, StartTime = new TimeOnly(9, 0), EndTime = new TimeOnly(17, 0) },
            new ProfessionalSchedule { Id = Id("45000000-0000-0000-0000-000000000003"), ProfessionalId = professionals[0].Id, Weekday = 5, StartTime = new TimeOnly(9, 0), EndTime = new TimeOnly(13, 0) },
            new ProfessionalSchedule { Id = Id("45000000-0000-0000-0000-000000000004"), ProfessionalId = professionals[1].Id, Weekday = 2, StartTime = new TimeOnly(10, 0), EndTime = new TimeOnly(18, 0) },
            new ProfessionalSchedule { Id = Id("45000000-0000-0000-0000-000000000005"), ProfessionalId = professionals[2].Id, Weekday = 1, StartTime = new TimeOnly(8, 0), EndTime = new TimeOnly(16, 0) },
            new ProfessionalSchedule { Id = Id("45000000-0000-0000-0000-000000000006"), ProfessionalId = professionals[3].Id, Weekday = 3, StartTime = new TimeOnly(13, 0), EndTime = new TimeOnly(20, 0) },
            new ProfessionalSchedule { Id = Id("45000000-0000-0000-0000-000000000007"), ProfessionalId = professionals[4].Id, Weekday = 5, StartTime = new TimeOnly(9, 0), EndTime = new TimeOnly(17, 0) });
    }

    private static void SeedOperations(ModelBuilder modelBuilder)
    {
        var patient = Id("42000000-0000-0000-0000-000000000001");
        var appointments = new[]
        {
            new Appointment { Id = Id("50000000-0000-0000-0000-000000000001"), PatientId = patient, ProfessionalId = Id("43000000-0000-0000-0000-000000000001"), ServiceId = Id("20000000-0000-0000-0000-000000000001"), Date = new DateOnly(2026, 3, 12), Time = new TimeOnly(10, 0), Status = AppointmentStatus.Realizado },
            new Appointment { Id = Id("50000000-0000-0000-0000-000000000002"), PatientId = patient, ProfessionalId = Id("43000000-0000-0000-0000-000000000003"), ServiceId = Id("20000000-0000-0000-0000-000000000003"), Date = new DateOnly(2026, 4, 3), Time = new TimeOnly(14, 0), Status = AppointmentStatus.Realizado },
            new Appointment { Id = Id("50000000-0000-0000-0000-000000000003"), PatientId = patient, DependentId = Id("42100000-0000-0000-0000-000000000001"), ProfessionalId = Id("43000000-0000-0000-0000-000000000005"), ServiceId = Id("20000000-0000-0000-0000-000000000007"), Date = new DateOnly(2026, 4, 18), Time = new TimeOnly(9, 0), Status = AppointmentStatus.Realizado },
            new Appointment { Id = Id("50000000-0000-0000-0000-000000000004"), PatientId = patient, ProfessionalId = Id("43000000-0000-0000-0000-000000000004"), ServiceId = Id("20000000-0000-0000-0000-000000000005"), Date = new DateOnly(2026, 5, 27), Time = new TimeOnly(15, 0), Status = AppointmentStatus.Confirmado },
            new Appointment { Id = Id("50000000-0000-0000-0000-000000000005"), PatientId = patient, DependentId = Id("42100000-0000-0000-0000-000000000002"), ProfessionalId = Id("43000000-0000-0000-0000-000000000005"), ServiceId = Id("20000000-0000-0000-0000-000000000008"), Date = new DateOnly(2026, 6, 2), Time = new TimeOnly(11, 0), Status = AppointmentStatus.Agendado }
        };
        modelBuilder.Entity<Appointment>().HasData(appointments);
        modelBuilder.Entity<AppointmentStatusLog>().HasData(appointments.Select((appointment, index) =>
            new AppointmentStatusLog
            {
                Id = Id($"51000000-0000-0000-0000-00000000000{index + 1}"),
                AppointmentId = appointment.Id,
                Status = appointment.Status,
                ChangedAt = new DateTime(2026, 5, 1 + index, 10, 0, 0),
                ChangedByUserId = Id("41000000-0000-0000-0000-000000000003")
            }).ToArray());

        modelBuilder.Entity<Payment>().HasData(
            new Payment { Id = Id("52000000-0000-0000-0000-000000000001"), AppointmentId = appointments[0].Id, GrossAmount = 380, Method = "Mercado Pago", PaidAt = new DateTime(2026, 3, 12, 10, 45, 0) },
            new Payment { Id = Id("52000000-0000-0000-0000-000000000002"), AppointmentId = appointments[1].Id, GrossAmount = 950, Method = "Cartão", PaidAt = new DateTime(2026, 4, 3, 15, 30, 0) });
        modelBuilder.Entity<Commission>().HasData(
            new Commission { Id = Id("53000000-0000-0000-0000-000000000001"), AppointmentId = appointments[0].Id, ProfessionalId = Id("43000000-0000-0000-0000-000000000001"), Amount = 133, Percent = 35 },
            new Commission { Id = Id("53000000-0000-0000-0000-000000000002"), AppointmentId = appointments[1].Id, ProfessionalId = Id("43000000-0000-0000-0000-000000000003"), Amount = 380, Percent = 40 });

        var conversationOne = Id("54000000-0000-0000-0000-000000000001");
        var conversationTwo = Id("54000000-0000-0000-0000-000000000002");
        modelBuilder.Entity<Conversation>().HasData(
            new Conversation { Id = conversationOne, Title = "Dúvida sobre preparo", Channel = ChannelKind.Aplicacao },
            new Conversation { Id = conversationTwo, Title = "Remarcação de retorno", Channel = ChannelKind.WhatsApp });
        modelBuilder.Entity<ConversationParticipant>().HasData(
            new ConversationParticipant { ConversationId = conversationOne, UserId = Id("41000000-0000-0000-0000-000000000001") },
            new ConversationParticipant { ConversationId = conversationOne, UserId = Id("41000000-0000-0000-0000-000000000003") },
            new ConversationParticipant { ConversationId = conversationTwo, UserId = Id("41000000-0000-0000-0000-000000000001") },
            new ConversationParticipant { ConversationId = conversationTwo, UserId = Id("41000000-0000-0000-0000-000000000003") });
        modelBuilder.Entity<Message>().HasData(
            new Message { Id = Id("55000000-0000-0000-0000-000000000001"), ConversationId = conversationOne, AuthorUserId = Id("41000000-0000-0000-0000-000000000001"), AuthorName = "Marina Pires", Channel = ChannelKind.Aplicacao, Body = "Preciso fazer algum preparo antes da avaliação?", SentAt = new DateTime(2026, 5, 19, 10, 20, 0) },
            new Message { Id = Id("55000000-0000-0000-0000-000000000002"), ConversationId = conversationOne, AuthorUserId = Id("41000000-0000-0000-0000-000000000003"), AuthorName = "Recepção", Channel = ChannelKind.Aplicacao, Body = "Recomendamos chegar 10 minutos antes e trazer exames recentes, se houver.", SentAt = new DateTime(2026, 5, 19, 10, 25, 0) },
            new Message { Id = Id("55000000-0000-0000-0000-000000000003"), ConversationId = conversationTwo, AuthorUserId = Id("41000000-0000-0000-0000-000000000003"), AuthorName = "Recepção", Channel = ChannelKind.WhatsApp, Body = "Temos disponibilidade na terça às 11h ou quarta às 15h.", SentAt = new DateTime(2026, 5, 18, 16, 40, 0) });

        modelBuilder.Entity<MessagingChannel>().HasData(
            new MessagingChannel { Id = Id("56000000-0000-0000-0000-000000000001"), Name = "Recepção e profissionais", ParticipantRule = "role:recepcao,role:profissional" },
            new MessagingChannel { Id = Id("56000000-0000-0000-0000-000000000002"), Name = "Administrativo", ParticipantRule = "role:admin,role:recepcao" });

        var tplConfirm = Id("57000000-0000-0000-0000-000000000001");
        var tplReminder = Id("57000000-0000-0000-0000-000000000002");
        var tplCancel = Id("57000000-0000-0000-0000-000000000003");
        modelBuilder.Entity<MessageTemplate>().HasData(
            new MessageTemplate { Id = tplConfirm, Occasion = "Confirmação", Channel = "WhatsApp", Body = "Olá, {{nome_paciente}}. Sua consulta de {{servico}} com {{profissional}} está agendada para {{data}} às {{horario}}. {{nome_clinica}}" },
            new MessageTemplate { Id = tplReminder, Occasion = "Lembrete", Channel = "E-mail", Body = "Lembramos sua consulta em {{data}} às {{horario}}. Em caso de dúvidas, responda este e-mail." },
            new MessageTemplate { Id = tplCancel, Occasion = "Cancelamento", Channel = "WhatsApp", Body = "{{nome_paciente}}, seu agendamento foi cancelado. Podemos ajudar com uma nova data?" });
        modelBuilder.Entity<NotificationRule>().HasData(
            new NotificationRule { Id = Id("58000000-0000-0000-0000-000000000001"), Trigger = "Confirmação", LeadTime = "Imediatamente após agendar", Channel = "WhatsApp", TemplateId = tplConfirm, Active = true },
            new NotificationRule { Id = Id("58000000-0000-0000-0000-000000000002"), Trigger = "Lembrete", LeadTime = "24h antes", Channel = "Ambos", TemplateId = tplReminder, Active = true });

        modelBuilder.Entity<Plan>().HasData(new Plan { Id = Id("59000000-0000-0000-0000-000000000001"), Name = "Plano premium preventivo", Description = "Pacote de acompanhamento com descontos progressivos." });
        modelBuilder.Entity<PlanService>().HasData(
            new PlanService { PlanId = Id("59000000-0000-0000-0000-000000000001"), ServiceId = Id("20000000-0000-0000-0000-000000000001"), CoverageRule = "100% da avaliação inclusa" },
            new PlanService { PlanId = Id("59000000-0000-0000-0000-000000000001"), ServiceId = Id("20000000-0000-0000-0000-000000000006"), CoverageRule = "50% de desconto em retornos" });

        modelBuilder.Entity<JobOpening>().HasData(
            new JobOpening { Id = Id("5a000000-0000-0000-0000-000000000001"), Title = "Recepcionista bilíngue", Department = "Recepção", Description = "Atendimento premium, organização de agenda e experiência do paciente.", Status = "aberta" },
            new JobOpening { Id = Id("5a000000-0000-0000-0000-000000000002"), Title = "Consultor comercial de saúde", Department = "Relacionamento", Description = "Acompanhamento de leads, propostas e conversão de planos de tratamento.", Status = "aberta" },
            new JobOpening { Id = Id("5a000000-0000-0000-0000-000000000003"), Title = "Auxiliar de sala", Department = "Operação clínica", Description = "Preparo de sala, materiais, equipamentos e suporte aos profissionais.", Status = "aberta" },
            new JobOpening { Id = Id("5a000000-0000-0000-0000-000000000004"), Title = "Analista administrativo", Department = "Administração", Description = "Controle financeiro, fornecedores e indicadores operacionais.", Status = "encerrada" });
        modelBuilder.Entity<JobApplication>().HasData(
            new JobApplication { Id = Id("5b000000-0000-0000-0000-000000000001"), JobOpeningId = Id("5a000000-0000-0000-0000-000000000001"), Candidate = "Ana Lima", Email = "ana@example.com", Message = "Tenho experiência com atendimento premium.", CreatedAt = new DateTime(2026, 5, 1) },
            new JobApplication { Id = Id("5b000000-0000-0000-0000-000000000002"), JobOpeningId = Id("5a000000-0000-0000-0000-000000000001"), Candidate = "Julia Reis", Email = "julia@example.com", Message = "Atuei em clínica odontológica por três anos.", CreatedAt = new DateTime(2026, 5, 4) },
            new JobApplication { Id = Id("5b000000-0000-0000-0000-000000000003"), JobOpeningId = Id("5a000000-0000-0000-0000-000000000002"), Candidate = "Pedro Martins", Email = "pedro@example.com", Message = "Tenho histórico em vendas consultivas.", CreatedAt = new DateTime(2026, 5, 7) },
            new JobApplication { Id = Id("5b000000-0000-0000-0000-000000000004"), JobOpeningId = Id("5a000000-0000-0000-0000-000000000003"), Candidate = "Renata Alves", Email = "renata@example.com", Message = "Tenho disponibilidade integral.", CreatedAt = new DateTime(2026, 5, 11) });
        modelBuilder.Entity<TalentPoolEntry>().HasData(new TalentPoolEntry { Id = Id("5c000000-0000-0000-0000-000000000001"), Candidate = "Carla Souza", Email = "carla@example.com", Message = "Gostaria de entrar no banco de talentos.", CreatedAt = new DateTime(2026, 5, 9) });
    }

    private static void SeedWhiteLabel(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AppSetting>().HasData(
            new AppSetting { Id = Id("60000000-0000-0000-0000-000000000001"), Key = "clinicName", Value = "Clínica Aurora", ValueType = "string" },
            new AppSetting { Id = Id("60000000-0000-0000-0000-000000000002"), Key = "logoUrl", Value = "data:image/svg+xml,%3Csvg width='96' height='96' viewBox='0 0 96 96' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='96' height='96' rx='22' fill='%23C2410C'/%3E%3Cpath d='M48 18c10 16 20 24 20 38 0 11-9 20-20 20s-20-9-20-20c0-14 10-22 20-38Z' fill='white' fill-opacity='.92'/%3E%3C/svg%3E", ValueType = "string" },
            new AppSetting { Id = Id("60000000-0000-0000-0000-000000000003"), Key = "theme.primary", Value = "#C2410C", ValueType = "color" },
            new AppSetting { Id = Id("60000000-0000-0000-0000-000000000004"), Key = "theme.primaryLight", Value = "#F59E0B", ValueType = "color" },
            new AppSetting { Id = Id("60000000-0000-0000-0000-000000000005"), Key = "theme.bgBase", Value = "#FAF7F2", ValueType = "color" },
            new AppSetting { Id = Id("60000000-0000-0000-0000-000000000006"), Key = "theme.bgSecondary", Value = "#EFE7D8", ValueType = "color" },
            new AppSetting { Id = Id("60000000-0000-0000-0000-000000000007"), Key = "theme.brownDark", Value = "#3D2817", ValueType = "color" },
            new AppSetting { Id = Id("60000000-0000-0000-0000-000000000008"), Key = "theme.brownMid", Value = "#7A5C3E", ValueType = "color" },
            new AppSetting { Id = Id("60000000-0000-0000-0000-000000000009"), Key = "theme.surface", Value = "#FFFFFF", ValueType = "color" },
            new AppSetting { Id = Id("60000000-0000-0000-0000-000000000010"), Key = "theme.headingFont", Value = "Playfair Display", ValueType = "font" },
            new AppSetting { Id = Id("60000000-0000-0000-0000-000000000011"), Key = "theme.bodyFont", Value = "Inter", ValueType = "font" },
            new AppSetting { Id = Id("60000000-0000-0000-0000-000000000012"), Key = "address", Value = "Av. Paulista, 1578, Bela Vista, São Paulo - SP", ValueType = "string" },
            new AppSetting { Id = Id("60000000-0000-0000-0000-000000000013"), Key = "coordinates.lat", Value = "-23.561414", ValueType = "decimal" },
            new AppSetting { Id = Id("60000000-0000-0000-0000-000000000014"), Key = "coordinates.lng", Value = "-46.655881", ValueType = "decimal" },
            new AppSetting { Id = Id("60000000-0000-0000-0000-000000000015"), Key = "whatsappUrl", Value = "https://wa.me/5511999999999", ValueType = "url" },
            new AppSetting { Id = Id("60000000-0000-0000-0000-000000000016"), Key = "instagramUrl", Value = "https://instagram.com/clinicaaurora", ValueType = "url" },
            new AppSetting { Id = Id("60000000-0000-0000-0000-000000000017"), Key = "openingHours", Value = "Segunda a sexta, 8h às 20h. Sábado, 8h às 14h.", ValueType = "string" },
            new AppSetting { Id = Id("60000000-0000-0000-0000-000000000018"), Key = "about.text", Value = "Nossa clínica nasceu para oferecer uma jornada de cuidado particular, precisa e acolhedora. Unimos tecnologia, escuta clínica e ambientes preparados para atendimentos de alto valor.", ValueType = "text" });

        modelBuilder.Entity<Banner>().HasData(
            new Banner { Id = Id("61000000-0000-0000-0000-000000000001"), Title = "Cuidado premium com agenda inteligente", Subtitle = "Serviços especializados, profissionais selecionados e acompanhamento próximo em cada etapa.", CtaText = "Agendar avaliação", CtaUrl = "/agendar", ImageUrl = "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=80", SortOrder = 1, Active = true },
            new Banner { Id = Id("61000000-0000-0000-0000-000000000002"), Title = "Experiência acolhedora do primeiro contato ao retorno", Subtitle = "Fluxos pensados para reduzir espera, organizar mensagens e manter seu plano de cuidado visível.", CtaText = "Conhecer serviços", CtaUrl = "/servicos", ImageUrl = "https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=1600&q=80", SortOrder = 2, Active = true },
            new Banner { Id = Id("61000000-0000-0000-0000-000000000003"), Title = "Equipe multidisciplinar em um só lugar", Subtitle = "Profissionais habilitados para tratamentos avançados, com agenda integrada e métricas claras.", CtaText = "Ver profissionais", CtaUrl = "/profissionais", ImageUrl = "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=1600&q=80", SortOrder = 3, Active = true });

        modelBuilder.Entity<HistoricMilestone>().HasData(
            new HistoricMilestone { Id = Id("62000000-0000-0000-0000-000000000001"), YearLabel = "2018", Title = "Primeira unidade", Description = "Início das operações com agenda especializada e atendimento particular.", SortOrder = 1 },
            new HistoricMilestone { Id = Id("62000000-0000-0000-0000-000000000002"), YearLabel = "2020", Title = "Protocolos integrados", Description = "Padronização de jornadas clínicas e acompanhamento digital dos pacientes.", SortOrder = 2 },
            new HistoricMilestone { Id = Id("62000000-0000-0000-0000-000000000003"), YearLabel = "2023", Title = "Expansão da equipe", Description = "Entrada de novos especialistas e ampliação das salas de procedimento.", SortOrder = 3 },
            new HistoricMilestone { Id = Id("62000000-0000-0000-0000-000000000004"), YearLabel = "2025", Title = "Experiência premium", Description = "Renovação da estrutura, canais de relacionamento e indicadores de qualidade.", SortOrder = 4 });

        modelBuilder.Entity<MissionVisionValue>().HasData(new MissionVisionValue
        {
            Id = Id("63000000-0000-0000-0000-000000000001"),
            Mission = "Entregar cuidado especializado com clareza, segurança e atenção aos detalhes.",
            Vision = "Ser referência regional em experiências clínicas premium e gestão orientada por dados.",
            Values = "Ética, acolhimento, precisão técnica, transparência e melhoria contínua."
        });

        modelBuilder.Entity<AboutGalleryItem>().HasData(
            new AboutGalleryItem { Id = Id("64000000-0000-0000-0000-000000000001"), ImageUrl = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80", SortOrder = 1 },
            new AboutGalleryItem { Id = Id("64000000-0000-0000-0000-000000000002"), ImageUrl = "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=900&q=80", SortOrder = 2 },
            new AboutGalleryItem { Id = Id("64000000-0000-0000-0000-000000000003"), ImageUrl = "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=900&q=80", SortOrder = 3 });

        modelBuilder.Entity<Clinic>().HasData(new Clinic
        {
            Id = Id("65000000-0000-0000-0000-000000000001"),
            Name = "Clínica Aurora",
            Cnpj = "",
            Email = "contato@aio.com",
            Phone = "(11) 99999-0000",
            MpSandboxMode = true,
            RemindersEnabled = true,
            CreatedAt = new DateTime(2026, 5, 1)
        });
    }

    private static void SeedMetrics(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Cost>().HasData(
            new Cost { Id = Id("70000000-0000-0000-0000-000000000001"), MonthLabel = "Dez/25", Type = CostType.Fixo, Name = "Aluguel", Value = 18000 },
            new Cost { Id = Id("70000000-0000-0000-0000-000000000002"), MonthLabel = "Jan/26", Type = CostType.Fixo, Name = "Salários fixos", Value = 34000 },
            new Cost { Id = Id("70000000-0000-0000-0000-000000000003"), MonthLabel = "Fev/26", Type = CostType.Variavel, Name = "Insumos estéticos", Value = 13200 },
            new Cost { Id = Id("70000000-0000-0000-0000-000000000004"), MonthLabel = "Mar/26", Type = CostType.Fixo, Name = "Assinaturas", Value = 4200 },
            new Cost { Id = Id("70000000-0000-0000-0000-000000000005"), MonthLabel = "Abr/26", Type = CostType.Variavel, Name = "Materiais odontológicos", Value = 9700 },
            new Cost { Id = Id("70000000-0000-0000-0000-000000000006"), MonthLabel = "Mai/26", Type = CostType.Fixo, Name = "Energia e utilidades", Value = 6800 });

        modelBuilder.Entity<MetricsSnapshot>().HasData(
            new MetricsSnapshot { Id = Id("71000000-0000-0000-0000-000000000001"), MonthLabel = "Dez/25", Revenue = 118000, Profit = 42000, Appointments = 132, TicketAverage = 894, OccupancyRate = 64, CancellationRate = 7, NewPatients = 38 },
            new MetricsSnapshot { Id = Id("71000000-0000-0000-0000-000000000002"), MonthLabel = "Jan/26", Revenue = 126500, Profit = 48500, Appointments = 141, TicketAverage = 897, OccupancyRate = 69, CancellationRate = 6, NewPatients = 42 },
            new MetricsSnapshot { Id = Id("71000000-0000-0000-0000-000000000003"), MonthLabel = "Fev/26", Revenue = 121800, Profit = 45200, Appointments = 136, TicketAverage = 895, OccupancyRate = 67, CancellationRate = 8, NewPatients = 36 },
            new MetricsSnapshot { Id = Id("71000000-0000-0000-0000-000000000004"), MonthLabel = "Mar/26", Revenue = 139400, Profit = 54800, Appointments = 151, TicketAverage = 923, OccupancyRate = 73, CancellationRate = 5, NewPatients = 47 },
            new MetricsSnapshot { Id = Id("71000000-0000-0000-0000-000000000005"), MonthLabel = "Abr/26", Revenue = 146200, Profit = 59200, Appointments = 158, TicketAverage = 925, OccupancyRate = 76, CancellationRate = 5, NewPatients = 51 },
            new MetricsSnapshot { Id = Id("71000000-0000-0000-0000-000000000006"), MonthLabel = "Mai/26", Revenue = 154900, Profit = 63800, Appointments = 164, TicketAverage = 944, OccupancyRate = 79, CancellationRate = 4, NewPatients = 54 });

        modelBuilder.Entity<MovementLog>().HasData(
            new MovementLog { Id = Id("72000000-0000-0000-0000-000000000001"), EventType = "agendamento", Description = "Agendamento confirmado para Marina Pires.", UserId = Id("41000000-0000-0000-0000-000000000003"), CreatedAt = new DateTime(2026, 5, 20, 9, 10, 0) },
            new MovementLog { Id = Id("72000000-0000-0000-0000-000000000002"), EventType = "cadastro", Description = "Novo candidato registrado no banco de talentos.", UserId = Id("41000000-0000-0000-0000-000000000004"), CreatedAt = new DateTime(2026, 5, 20, 10, 30, 0) });
    }
}
