BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [servicos] ADD [Color] nvarchar(16) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [servicos] ADD [DefaultRoomId] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [servicos] ADD [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [servicos] ADD [OnlineBooking] bit NOT NULL DEFAULT CAST(1 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [servicos] ADD [Preparation] nvarchar(250) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [servicos] ADD [RequiresRoom] bit NOT NULL DEFAULT CAST(0 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [servicos] ADD [ShowDuration] bit NOT NULL DEFAULT CAST(1 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [servicos] ADD [ShowPrice] bit NOT NULL DEFAULT CAST(1 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [salas] ADD [Description] nvarchar(4000) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [salas] ADD [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [salas] ADD [Location] nvarchar(250) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    DECLARE @var nvarchar(max);
    SELECT @var = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[profissional_servicos]') AND [c].[name] = N'CompensationValue');
    IF @var IS NOT NULL EXEC(N'ALTER TABLE [profissional_servicos] DROP CONSTRAINT ' + @var + ';');
    ALTER TABLE [profissional_servicos] ALTER COLUMN [CompensationValue] decimal(12,2) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [profissionais] ADD [CouncilType] nvarchar(250) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [profissionais] ADD [Email] nvarchar(250) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [profissionais] ADD [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [profissionais] ADD [Languages] nvarchar(250) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [profissionais] ADD [LicenseNumber] nvarchar(250) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [profissionais] ADD [Phone] nvarchar(250) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [plano_servicos] ADD [CustomPrice] decimal(12,2) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [plano_servicos] ADD [ShowPrice] bit NOT NULL DEFAULT CAST(1 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [pacientes] ADD [Address] nvarchar(250) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [pacientes] ADD [City] nvarchar(250) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [pacientes] ADD [Cpf] nvarchar(20) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [pacientes] ADD [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [pacientes] ADD [Notes] nvarchar(4000) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [pacientes] ADD [PostalCode] nvarchar(20) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [pacientes] ADD [State] nvarchar(40) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [equipamentos] ADD [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [equipamentos] ADD [Location] nvarchar(250) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [equipamentos] ADD [MaintenanceDate] datetime2 NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [equipamentos] ADD [SerialNumber] nvarchar(250) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [equipamentos] ADD [Status] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [categorias] ADD [Description] nvarchar(4000) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [categorias] ADD [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [categorias] ADD [ParentId] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [agendamentos] ADD [CancellationSource] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [agendamentos] ADD [CancelledAt] datetime2 NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [agendamentos] ADD [CreatedAt] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [agendamentos] ADD [Notes] nvarchar(250) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [agendamentos] ADD [PatientConfirmation] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [agendamentos] ADD [PlanId] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [agendamentos] ADD [RecurrenceGroupId] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [agendamentos] ADD [RoomId] uniqueidentifier NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [agendamentos] ADD [Type] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE TABLE [agendamento_equipamentos] (
        [AppointmentId] uniqueidentifier NOT NULL,
        [EquipmentId] uniqueidentifier NOT NULL,
        CONSTRAINT [PK_agendamento_equipamentos] PRIMARY KEY ([AppointmentId], [EquipmentId]),
        CONSTRAINT [FK_agendamento_equipamentos_agendamentos_AppointmentId] FOREIGN KEY ([AppointmentId]) REFERENCES [agendamentos] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_agendamento_equipamentos_equipamentos_EquipmentId] FOREIGN KEY ([EquipmentId]) REFERENCES [equipamentos] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE TABLE [clinica] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(250) NOT NULL,
        [Cnpj] nvarchar(250) NOT NULL,
        [Email] nvarchar(250) NOT NULL,
        [Phone] nvarchar(250) NOT NULL,
        [GmailClientId] nvarchar(250) NULL,
        [GmailClientSecret] nvarchar(250) NULL,
        [GmailAccessToken] nvarchar(2000) NULL,
        [GmailRefreshToken] nvarchar(2000) NULL,
        [GmailTokenExpiresAt] datetime2 NULL,
        [GmailConnected] bit NOT NULL,
        [PubSubProjectId] nvarchar(250) NULL,
        [PubSubTopicName] nvarchar(250) NULL,
        [PubSubServiceAccount] nvarchar(250) NULL,
        [PubSubConnected] bit NOT NULL,
        [MpAccessTokenProd] nvarchar(500) NULL,
        [MpAccessTokenSandbox] nvarchar(500) NULL,
        [MpPublicKey] nvarchar(250) NULL,
        [MpWebhookSecret] nvarchar(250) NULL,
        [MpSandboxMode] bit NOT NULL,
        [MpConnected] bit NOT NULL,
        [WaPhoneNumberId] nvarchar(250) NULL,
        [WaWabaId] nvarchar(250) NULL,
        [WaAccessToken] nvarchar(2000) NULL,
        [WaVerifyToken] nvarchar(250) NULL,
        [WaAppSecret] nvarchar(250) NULL,
        [WaConnected] bit NOT NULL,
        [SmtpHost] nvarchar(250) NULL,
        [SmtpPort] int NULL,
        [SmtpUsername] nvarchar(250) NULL,
        [SmtpPassword] nvarchar(250) NULL,
        [SmtpFrom] nvarchar(250) NULL,
        [SmtpConnected] bit NOT NULL,
        [ResendApiKey] nvarchar(500) NULL,
        [ResendFromEmail] nvarchar(250) NULL,
        [ResendFromName] nvarchar(250) NULL,
        [ResendConnected] bit NOT NULL,
        [IgAccountId] nvarchar(250) NULL,
        [IgPageId] nvarchar(250) NULL,
        [IgAccessToken] nvarchar(2000) NULL,
        [IgAppSecret] nvarchar(250) NULL,
        [IgVerifyToken] nvarchar(250) NULL,
        [IgConnected] bit NOT NULL,
        [RemindersEnabled] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_clinica] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE TABLE [profissional_bloqueios] (
        [Id] uniqueidentifier NOT NULL,
        [ProfessionalId] uniqueidentifier NOT NULL,
        [StartAt] datetime2 NOT NULL,
        [EndAt] datetime2 NOT NULL,
        [Reason] nvarchar(250) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_profissional_bloqueios] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_profissional_bloqueios_profissionais_ProfessionalId] FOREIGN KEY ([ProfessionalId]) REFERENCES [profissionais] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE TABLE [profissional_categorias] (
        [ProfessionalId] uniqueidentifier NOT NULL,
        [CategoryId] uniqueidentifier NOT NULL,
        CONSTRAINT [PK_profissional_categorias] PRIMARY KEY ([ProfessionalId], [CategoryId]),
        CONSTRAINT [FK_profissional_categorias_categorias_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [categorias] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_profissional_categorias_profissionais_ProfessionalId] FOREIGN KEY ([ProfessionalId]) REFERENCES [profissionais] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE TABLE [prontuarios] (
        [Id] uniqueidentifier NOT NULL,
        [PatientId] uniqueidentifier NOT NULL,
        [BloodType] nvarchar(250) NOT NULL,
        [Allergies] nvarchar(4000) NOT NULL,
        [ChronicConditions] nvarchar(4000) NOT NULL,
        [CurrentMedications] nvarchar(4000) NOT NULL,
        [FamilyHistory] nvarchar(4000) NOT NULL,
        [SurgicalHistory] nvarchar(4000) NOT NULL,
        [Habits] nvarchar(4000) NOT NULL,
        [HeightCm] decimal(5,2) NULL,
        [WeightKg] decimal(5,2) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [UpdatedByUserId] uniqueidentifier NULL,
        CONSTRAINT [PK_prontuarios] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_prontuarios_pacientes_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [pacientes] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE TABLE [servico_equipamentos] (
        [ServiceId] uniqueidentifier NOT NULL,
        [EquipmentId] uniqueidentifier NOT NULL,
        [Required] bit NOT NULL,
        CONSTRAINT [PK_servico_equipamentos] PRIMARY KEY ([ServiceId], [EquipmentId]),
        CONSTRAINT [FK_servico_equipamentos_equipamentos_EquipmentId] FOREIGN KEY ([EquipmentId]) REFERENCES [equipamentos] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_servico_equipamentos_servicos_ServiceId] FOREIGN KEY ([ServiceId]) REFERENCES [servicos] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE TABLE [evolucoes] (
        [Id] uniqueidentifier NOT NULL,
        [MedicalRecordId] uniqueidentifier NOT NULL,
        [AppointmentId] uniqueidentifier NOT NULL,
        [ProfessionalId] uniqueidentifier NOT NULL,
        [ChiefComplaint] nvarchar(250) NOT NULL,
        [Subjective] nvarchar(4000) NOT NULL,
        [Objective] nvarchar(4000) NOT NULL,
        [Assessment] nvarchar(4000) NOT NULL,
        [Plan] nvarchar(4000) NOT NULL,
        [Diagnosis] nvarchar(250) NOT NULL,
        [DiagnosisCode] nvarchar(250) NOT NULL,
        [Prescription] nvarchar(4000) NOT NULL,
        [VitalSignsJson] nvarchar(4000) NOT NULL,
        [IsSigned] bit NOT NULL,
        [SignedAt] datetime2 NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_evolucoes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_evolucoes_agendamentos_AppointmentId] FOREIGN KEY ([AppointmentId]) REFERENCES [agendamentos] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_evolucoes_profissionais_ProfessionalId] FOREIGN KEY ([ProfessionalId]) REFERENCES [profissionais] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_evolucoes_prontuarios_MedicalRecordId] FOREIGN KEY ([MedicalRecordId]) REFERENCES [prontuarios] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE TABLE [prontuario_anexos] (
        [Id] uniqueidentifier NOT NULL,
        [MedicalRecordId] uniqueidentifier NOT NULL,
        [Title] nvarchar(250) NOT NULL,
        [FileUrl] nvarchar(250) NOT NULL,
        [FileType] nvarchar(250) NOT NULL,
        [UploadedByUserId] uniqueidentifier NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_prontuario_anexos] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_prontuario_anexos_prontuarios_MedicalRecordId] FOREIGN KEY ([MedicalRecordId]) REFERENCES [prontuarios] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [agendamentos] SET [CancellationSource] = NULL, [CancelledAt] = NULL, [CreatedAt] = ''0001-01-01T00:00:00.0000000'', [Notes] = N'''', [PatientConfirmation] = 0, [PlanId] = NULL, [RecurrenceGroupId] = NULL, [RoomId] = NULL, [Type] = 0
    WHERE [Id] = ''50000000-0000-0000-0000-000000000001'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [agendamentos] SET [CancellationSource] = NULL, [CancelledAt] = NULL, [CreatedAt] = ''0001-01-01T00:00:00.0000000'', [Notes] = N'''', [PatientConfirmation] = 0, [PlanId] = NULL, [RecurrenceGroupId] = NULL, [RoomId] = NULL, [Type] = 0
    WHERE [Id] = ''50000000-0000-0000-0000-000000000002'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [agendamentos] SET [CancellationSource] = NULL, [CancelledAt] = NULL, [CreatedAt] = ''0001-01-01T00:00:00.0000000'', [Notes] = N'''', [PatientConfirmation] = 0, [PlanId] = NULL, [RecurrenceGroupId] = NULL, [RoomId] = NULL, [Type] = 0
    WHERE [Id] = ''50000000-0000-0000-0000-000000000003'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [agendamentos] SET [CancellationSource] = NULL, [CancelledAt] = NULL, [CreatedAt] = ''0001-01-01T00:00:00.0000000'', [Notes] = N'''', [PatientConfirmation] = 0, [PlanId] = NULL, [RecurrenceGroupId] = NULL, [RoomId] = NULL, [Type] = 0
    WHERE [Id] = ''50000000-0000-0000-0000-000000000004'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [agendamentos] SET [CancellationSource] = NULL, [CancelledAt] = NULL, [CreatedAt] = ''0001-01-01T00:00:00.0000000'', [Notes] = N'''', [PatientConfirmation] = 0, [PlanId] = NULL, [RecurrenceGroupId] = NULL, [RoomId] = NULL, [Type] = 0
    WHERE [Id] = ''50000000-0000-0000-0000-000000000005'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [categorias] SET [Description] = N'''', [IsActive] = CAST(1 AS bit), [ParentId] = NULL
    WHERE [Id] = ''10000000-0000-0000-0000-000000000001'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [categorias] SET [Description] = N'''', [IsActive] = CAST(1 AS bit), [ParentId] = NULL
    WHERE [Id] = ''10000000-0000-0000-0000-000000000002'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [categorias] SET [Description] = N'''', [IsActive] = CAST(1 AS bit), [ParentId] = NULL
    WHERE [Id] = ''10000000-0000-0000-0000-000000000003'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [categorias] SET [Description] = N'''', [IsActive] = CAST(1 AS bit), [ParentId] = NULL
    WHERE [Id] = ''10000000-0000-0000-0000-000000000004'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [categorias] SET [Description] = N'''', [IsActive] = CAST(1 AS bit), [ParentId] = NULL
    WHERE [Id] = ''10000000-0000-0000-0000-000000000005'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [categorias] SET [Description] = N'''', [IsActive] = CAST(1 AS bit), [ParentId] = NULL
    WHERE [Id] = ''10000000-0000-0000-0000-000000000006'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Cnpj', N'CreatedAt', N'Email', N'GmailAccessToken', N'GmailClientId', N'GmailClientSecret', N'GmailConnected', N'GmailRefreshToken', N'GmailTokenExpiresAt', N'IgAccessToken', N'IgAccountId', N'IgAppSecret', N'IgConnected', N'IgPageId', N'IgVerifyToken', N'MpAccessTokenProd', N'MpAccessTokenSandbox', N'MpConnected', N'MpPublicKey', N'MpSandboxMode', N'MpWebhookSecret', N'Name', N'Phone', N'PubSubConnected', N'PubSubProjectId', N'PubSubServiceAccount', N'PubSubTopicName', N'RemindersEnabled', N'ResendApiKey', N'ResendConnected', N'ResendFromEmail', N'ResendFromName', N'SmtpConnected', N'SmtpFrom', N'SmtpHost', N'SmtpPassword', N'SmtpPort', N'SmtpUsername', N'UpdatedAt', N'WaAccessToken', N'WaAppSecret', N'WaConnected', N'WaPhoneNumberId', N'WaVerifyToken', N'WaWabaId') AND [object_id] = OBJECT_ID(N'[clinica]'))
        SET IDENTITY_INSERT [clinica] ON;
    EXEC(N'INSERT INTO [clinica] ([Id], [Cnpj], [CreatedAt], [Email], [GmailAccessToken], [GmailClientId], [GmailClientSecret], [GmailConnected], [GmailRefreshToken], [GmailTokenExpiresAt], [IgAccessToken], [IgAccountId], [IgAppSecret], [IgConnected], [IgPageId], [IgVerifyToken], [MpAccessTokenProd], [MpAccessTokenSandbox], [MpConnected], [MpPublicKey], [MpSandboxMode], [MpWebhookSecret], [Name], [Phone], [PubSubConnected], [PubSubProjectId], [PubSubServiceAccount], [PubSubTopicName], [RemindersEnabled], [ResendApiKey], [ResendConnected], [ResendFromEmail], [ResendFromName], [SmtpConnected], [SmtpFrom], [SmtpHost], [SmtpPassword], [SmtpPort], [SmtpUsername], [UpdatedAt], [WaAccessToken], [WaAppSecret], [WaConnected], [WaPhoneNumberId], [WaVerifyToken], [WaWabaId])
    VALUES (''65000000-0000-0000-0000-000000000001'', N'''', ''2026-05-01T00:00:00.0000000'', N''contato@aio.com'', NULL, NULL, NULL, CAST(0 AS bit), NULL, NULL, NULL, NULL, NULL, CAST(0 AS bit), NULL, NULL, NULL, NULL, CAST(0 AS bit), NULL, CAST(1 AS bit), NULL, N''Clínica Aurora'', N''(11) 99999-0000'', CAST(0 AS bit), NULL, NULL, NULL, CAST(1 AS bit), NULL, CAST(0 AS bit), NULL, NULL, CAST(0 AS bit), NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, CAST(0 AS bit), NULL, NULL, NULL)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Cnpj', N'CreatedAt', N'Email', N'GmailAccessToken', N'GmailClientId', N'GmailClientSecret', N'GmailConnected', N'GmailRefreshToken', N'GmailTokenExpiresAt', N'IgAccessToken', N'IgAccountId', N'IgAppSecret', N'IgConnected', N'IgPageId', N'IgVerifyToken', N'MpAccessTokenProd', N'MpAccessTokenSandbox', N'MpConnected', N'MpPublicKey', N'MpSandboxMode', N'MpWebhookSecret', N'Name', N'Phone', N'PubSubConnected', N'PubSubProjectId', N'PubSubServiceAccount', N'PubSubTopicName', N'RemindersEnabled', N'ResendApiKey', N'ResendConnected', N'ResendFromEmail', N'ResendFromName', N'SmtpConnected', N'SmtpFrom', N'SmtpHost', N'SmtpPassword', N'SmtpPort', N'SmtpUsername', N'UpdatedAt', N'WaAccessToken', N'WaAppSecret', N'WaConnected', N'WaPhoneNumberId', N'WaVerifyToken', N'WaWabaId') AND [object_id] = OBJECT_ID(N'[clinica]'))
        SET IDENTITY_INSERT [clinica] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [equipamentos] SET [IsActive] = CAST(1 AS bit), [Location] = N'''', [MaintenanceDate] = NULL, [SerialNumber] = N'''', [Status] = 0
    WHERE [Id] = ''31000000-0000-0000-0000-000000000001'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [equipamentos] SET [IsActive] = CAST(1 AS bit), [Location] = N'''', [MaintenanceDate] = NULL, [SerialNumber] = N'''', [Status] = 0
    WHERE [Id] = ''31000000-0000-0000-0000-000000000002'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [equipamentos] SET [IsActive] = CAST(1 AS bit), [Location] = N'''', [MaintenanceDate] = NULL, [SerialNumber] = N'''', [Status] = 0
    WHERE [Id] = ''31000000-0000-0000-0000-000000000003'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [equipamentos] SET [IsActive] = CAST(1 AS bit), [Location] = N'''', [MaintenanceDate] = NULL, [SerialNumber] = N'''', [Status] = 0
    WHERE [Id] = ''31000000-0000-0000-0000-000000000004'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [pacientes] SET [Address] = N'''', [City] = N'''', [Cpf] = N'''', [IsActive] = CAST(1 AS bit), [Notes] = N'''', [PostalCode] = N'''', [State] = N''''
    WHERE [Id] = ''42000000-0000-0000-0000-000000000001'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [plano_servicos] SET [CustomPrice] = NULL, [ShowPrice] = CAST(1 AS bit)
    WHERE [PlanId] = ''59000000-0000-0000-0000-000000000001'' AND [ServiceId] = ''20000000-0000-0000-0000-000000000001'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [plano_servicos] SET [CustomPrice] = NULL, [ShowPrice] = CAST(1 AS bit)
    WHERE [PlanId] = ''59000000-0000-0000-0000-000000000001'' AND [ServiceId] = ''20000000-0000-0000-0000-000000000006'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [profissionais] SET [CouncilType] = N'''', [Email] = N'''', [IsActive] = CAST(1 AS bit), [Languages] = N'''', [LicenseNumber] = N'''', [Phone] = N''''
    WHERE [Id] = ''43000000-0000-0000-0000-000000000001'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [profissionais] SET [CouncilType] = N'''', [Email] = N'''', [IsActive] = CAST(1 AS bit), [Languages] = N'''', [LicenseNumber] = N'''', [Phone] = N''''
    WHERE [Id] = ''43000000-0000-0000-0000-000000000002'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [profissionais] SET [CouncilType] = N'''', [Email] = N'''', [IsActive] = CAST(1 AS bit), [Languages] = N'''', [LicenseNumber] = N'''', [Phone] = N''''
    WHERE [Id] = ''43000000-0000-0000-0000-000000000003'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [profissionais] SET [CouncilType] = N'''', [Email] = N'''', [IsActive] = CAST(1 AS bit), [Languages] = N'''', [LicenseNumber] = N'''', [Phone] = N''''
    WHERE [Id] = ''43000000-0000-0000-0000-000000000004'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [profissionais] SET [CouncilType] = N'''', [Email] = N'''', [IsActive] = CAST(1 AS bit), [Languages] = N'''', [LicenseNumber] = N'''', [Phone] = N''''
    WHERE [Id] = ''43000000-0000-0000-0000-000000000005'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [profissionais] SET [CouncilType] = N'''', [Email] = N'''', [IsActive] = CAST(1 AS bit), [Languages] = N'''', [LicenseNumber] = N'''', [Phone] = N''''
    WHERE [Id] = ''43000000-0000-0000-0000-000000000006'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [profissionais] SET [CouncilType] = N'''', [Email] = N'''', [IsActive] = CAST(1 AS bit), [Languages] = N'''', [LicenseNumber] = N'''', [Phone] = N''''
    WHERE [Id] = ''43000000-0000-0000-0000-000000000007'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [salas] SET [Description] = N'''', [IsActive] = CAST(1 AS bit), [Location] = N''''
    WHERE [Id] = ''30000000-0000-0000-0000-000000000001'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [salas] SET [Description] = N'''', [IsActive] = CAST(1 AS bit), [Location] = N''''
    WHERE [Id] = ''30000000-0000-0000-0000-000000000002'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [salas] SET [Description] = N'''', [IsActive] = CAST(1 AS bit), [Location] = N''''
    WHERE [Id] = ''30000000-0000-0000-0000-000000000003'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [salas] SET [Description] = N'''', [IsActive] = CAST(1 AS bit), [Location] = N''''
    WHERE [Id] = ''30000000-0000-0000-0000-000000000004'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'EquipmentId', N'ServiceId', N'Required') AND [object_id] = OBJECT_ID(N'[servico_equipamentos]'))
        SET IDENTITY_INSERT [servico_equipamentos] ON;
    EXEC(N'INSERT INTO [servico_equipamentos] ([EquipmentId], [ServiceId], [Required])
    VALUES (''31000000-0000-0000-0000-000000000001'', ''20000000-0000-0000-0000-000000000001'', CAST(1 AS bit)),
    (''31000000-0000-0000-0000-000000000002'', ''20000000-0000-0000-0000-000000000002'', CAST(1 AS bit)),
    (''31000000-0000-0000-0000-000000000003'', ''20000000-0000-0000-0000-000000000003'', CAST(1 AS bit)),
    (''31000000-0000-0000-0000-000000000004'', ''20000000-0000-0000-0000-000000000004'', CAST(1 AS bit))');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'EquipmentId', N'ServiceId', N'Required') AND [object_id] = OBJECT_ID(N'[servico_equipamentos]'))
        SET IDENTITY_INSERT [servico_equipamentos] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [servicos] SET [Color] = N''#C2410C'', [DefaultRoomId] = NULL, [IsActive] = CAST(1 AS bit), [OnlineBooking] = CAST(1 AS bit), [Preparation] = N'''', [RequiresRoom] = CAST(0 AS bit), [ShowDuration] = CAST(1 AS bit), [ShowPrice] = CAST(1 AS bit)
    WHERE [Id] = ''20000000-0000-0000-0000-000000000001'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [servicos] SET [Color] = N''#C2410C'', [DefaultRoomId] = NULL, [IsActive] = CAST(1 AS bit), [OnlineBooking] = CAST(1 AS bit), [Preparation] = N'''', [RequiresRoom] = CAST(0 AS bit), [ShowDuration] = CAST(1 AS bit), [ShowPrice] = CAST(1 AS bit)
    WHERE [Id] = ''20000000-0000-0000-0000-000000000002'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [servicos] SET [Color] = N''#C2410C'', [DefaultRoomId] = NULL, [IsActive] = CAST(1 AS bit), [OnlineBooking] = CAST(1 AS bit), [Preparation] = N'''', [RequiresRoom] = CAST(0 AS bit), [ShowDuration] = CAST(1 AS bit), [ShowPrice] = CAST(1 AS bit)
    WHERE [Id] = ''20000000-0000-0000-0000-000000000003'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [servicos] SET [Color] = N''#C2410C'', [DefaultRoomId] = NULL, [IsActive] = CAST(1 AS bit), [OnlineBooking] = CAST(1 AS bit), [Preparation] = N'''', [RequiresRoom] = CAST(0 AS bit), [ShowDuration] = CAST(1 AS bit), [ShowPrice] = CAST(1 AS bit)
    WHERE [Id] = ''20000000-0000-0000-0000-000000000004'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [servicos] SET [Color] = N''#C2410C'', [DefaultRoomId] = NULL, [IsActive] = CAST(1 AS bit), [OnlineBooking] = CAST(1 AS bit), [Preparation] = N'''', [RequiresRoom] = CAST(0 AS bit), [ShowDuration] = CAST(1 AS bit), [ShowPrice] = CAST(1 AS bit)
    WHERE [Id] = ''20000000-0000-0000-0000-000000000005'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [servicos] SET [Color] = N''#C2410C'', [DefaultRoomId] = NULL, [IsActive] = CAST(1 AS bit), [OnlineBooking] = CAST(1 AS bit), [Preparation] = N'''', [RequiresRoom] = CAST(0 AS bit), [ShowDuration] = CAST(1 AS bit), [ShowPrice] = CAST(1 AS bit)
    WHERE [Id] = ''20000000-0000-0000-0000-000000000006'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [servicos] SET [Color] = N''#C2410C'', [DefaultRoomId] = NULL, [IsActive] = CAST(1 AS bit), [OnlineBooking] = CAST(1 AS bit), [Preparation] = N'''', [RequiresRoom] = CAST(0 AS bit), [ShowDuration] = CAST(1 AS bit), [ShowPrice] = CAST(1 AS bit)
    WHERE [Id] = ''20000000-0000-0000-0000-000000000007'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    EXEC(N'UPDATE [servicos] SET [Color] = N''#C2410C'', [DefaultRoomId] = NULL, [IsActive] = CAST(1 AS bit), [OnlineBooking] = CAST(1 AS bit), [Preparation] = N'''', [RequiresRoom] = CAST(0 AS bit), [ShowDuration] = CAST(1 AS bit), [ShowPrice] = CAST(1 AS bit)
    WHERE [Id] = ''20000000-0000-0000-0000-000000000008'';
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE INDEX [IX_servicos_DefaultRoomId] ON [servicos] ([DefaultRoomId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE INDEX [IX_pacientes_Cpf] ON [pacientes] ([Cpf]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE INDEX [IX_categorias_ParentId] ON [categorias] ([ParentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE INDEX [IX_agendamentos_PlanId] ON [agendamentos] ([PlanId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE INDEX [IX_agendamentos_RecurrenceGroupId] ON [agendamentos] ([RecurrenceGroupId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE INDEX [IX_agendamentos_RoomId] ON [agendamentos] ([RoomId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE INDEX [IX_agendamento_equipamentos_EquipmentId] ON [agendamento_equipamentos] ([EquipmentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE UNIQUE INDEX [IX_evolucoes_AppointmentId] ON [evolucoes] ([AppointmentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE INDEX [IX_evolucoes_MedicalRecordId] ON [evolucoes] ([MedicalRecordId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE INDEX [IX_evolucoes_ProfessionalId] ON [evolucoes] ([ProfessionalId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE INDEX [IX_profissional_bloqueios_ProfessionalId_StartAt_EndAt] ON [profissional_bloqueios] ([ProfessionalId], [StartAt], [EndAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE INDEX [IX_profissional_categorias_CategoryId] ON [profissional_categorias] ([CategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE INDEX [IX_prontuario_anexos_MedicalRecordId] ON [prontuario_anexos] ([MedicalRecordId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE UNIQUE INDEX [IX_prontuarios_PatientId] ON [prontuarios] ([PatientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    CREATE INDEX [IX_servico_equipamentos_EquipmentId] ON [servico_equipamentos] ([EquipmentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [agendamentos] ADD CONSTRAINT [FK_agendamentos_planos_PlanId] FOREIGN KEY ([PlanId]) REFERENCES [planos] ([Id]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [agendamentos] ADD CONSTRAINT [FK_agendamentos_salas_RoomId] FOREIGN KEY ([RoomId]) REFERENCES [salas] ([Id]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [categorias] ADD CONSTRAINT [FK_categorias_categorias_ParentId] FOREIGN KEY ([ParentId]) REFERENCES [categorias] ([Id]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    ALTER TABLE [servicos] ADD CONSTRAINT [FK_servicos_salas_DefaultRoomId] FOREIGN KEY ([DefaultRoomId]) REFERENCES [salas] ([Id]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260521014227_Phase4ServicesProsAgendaClinic'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260521014227_Phase4ServicesProsAgendaClinic', N'10.0.8');
END;

COMMIT;
GO

