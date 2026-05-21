IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [banco_talentos] (
        [Id] uniqueidentifier NOT NULL,
        [Candidate] nvarchar(250) NOT NULL,
        [Email] nvarchar(250) NOT NULL,
        [Message] nvarchar(250) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_banco_talentos] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [banners] (
        [Id] uniqueidentifier NOT NULL,
        [Title] nvarchar(250) NOT NULL,
        [Subtitle] nvarchar(250) NOT NULL,
        [CtaText] nvarchar(250) NOT NULL,
        [CtaUrl] nvarchar(250) NOT NULL,
        [ImageUrl] nvarchar(250) NOT NULL,
        [SortOrder] int NOT NULL,
        [Active] bit NOT NULL,
        CONSTRAINT [PK_banners] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [canais_mensageria] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(250) NOT NULL,
        [ParticipantRule] nvarchar(250) NOT NULL,
        CONSTRAINT [PK_canais_mensageria] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [categorias] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(250) NOT NULL,
        [Type] nvarchar(250) NOT NULL,
        CONSTRAINT [PK_categorias] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [configuracoes] (
        [Id] uniqueidentifier NOT NULL,
        [Key] nvarchar(250) NOT NULL,
        [Value] nvarchar(4000) NOT NULL,
        [ValueType] nvarchar(4000) NOT NULL,
        CONSTRAINT [PK_configuracoes] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [conversas] (
        [Id] uniqueidentifier NOT NULL,
        [Title] nvarchar(250) NOT NULL,
        [Channel] int NOT NULL,
        CONSTRAINT [PK_conversas] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [custos] (
        [Id] uniqueidentifier NOT NULL,
        [MonthLabel] nvarchar(250) NOT NULL,
        [Type] int NOT NULL,
        [Name] nvarchar(250) NOT NULL,
        [Value] decimal(12,2) NOT NULL,
        CONSTRAINT [PK_custos] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [equipamentos] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(250) NOT NULL,
        [Category] nvarchar(250) NOT NULL,
        [Quantity] int NOT NULL,
        [UnitValue] decimal(12,2) NOT NULL,
        CONSTRAINT [PK_equipamentos] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [galeria_sobre] (
        [Id] uniqueidentifier NOT NULL,
        [ImageUrl] nvarchar(250) NOT NULL,
        [SortOrder] int NOT NULL,
        CONSTRAINT [PK_galeria_sobre] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [log_movimento] (
        [Id] uniqueidentifier NOT NULL,
        [EventType] nvarchar(250) NOT NULL,
        [Description] nvarchar(4000) NOT NULL,
        [UserId] uniqueidentifier NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_log_movimento] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [marcos_historicos] (
        [Id] uniqueidentifier NOT NULL,
        [YearLabel] nvarchar(250) NOT NULL,
        [Title] nvarchar(250) NOT NULL,
        [Description] nvarchar(4000) NOT NULL,
        [SortOrder] int NOT NULL,
        CONSTRAINT [PK_marcos_historicos] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [metricas_snapshot] (
        [Id] uniqueidentifier NOT NULL,
        [MonthLabel] nvarchar(250) NOT NULL,
        [Revenue] decimal(12,2) NOT NULL,
        [Profit] decimal(12,2) NOT NULL,
        [Appointments] int NOT NULL,
        [TicketAverage] decimal(12,2) NOT NULL,
        [OccupancyRate] decimal(5,2) NOT NULL,
        [CancellationRate] decimal(5,2) NOT NULL,
        [NewPatients] int NOT NULL,
        CONSTRAINT [PK_metricas_snapshot] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [mvv] (
        [Id] uniqueidentifier NOT NULL,
        [Mission] nvarchar(250) NOT NULL,
        [Vision] nvarchar(250) NOT NULL,
        [Values] nvarchar(4000) NOT NULL,
        CONSTRAINT [PK_mvv] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [planos] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(250) NOT NULL,
        [Description] nvarchar(4000) NOT NULL,
        CONSTRAINT [PK_planos] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [roles] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(250) NOT NULL,
        CONSTRAINT [PK_roles] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [salas] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(250) NOT NULL,
        [Capacity] int NOT NULL,
        [Notes] nvarchar(250) NOT NULL,
        CONSTRAINT [PK_salas] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [servicos] (
        [Id] uniqueidentifier NOT NULL,
        [Name] nvarchar(250) NOT NULL,
        [ShortDescription] nvarchar(4000) NOT NULL,
        [Description] nvarchar(4000) NOT NULL,
        [DurationMinutes] int NOT NULL,
        [BasePrice] decimal(12,2) NOT NULL,
        CONSTRAINT [PK_servicos] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [templates_mensagem] (
        [Id] uniqueidentifier NOT NULL,
        [Occasion] nvarchar(250) NOT NULL,
        [Channel] nvarchar(250) NOT NULL,
        [Body] nvarchar(4000) NOT NULL,
        CONSTRAINT [PK_templates_mensagem] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [usuarios] (
        [Id] uniqueidentifier NOT NULL,
        [FullName] nvarchar(250) NOT NULL,
        [Email] nvarchar(180) NOT NULL,
        [PasswordHash] nvarchar(500) NOT NULL,
        [Phone] nvarchar(250) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_usuarios] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [vagas] (
        [Id] uniqueidentifier NOT NULL,
        [Title] nvarchar(250) NOT NULL,
        [Department] nvarchar(250) NOT NULL,
        [Description] nvarchar(4000) NOT NULL,
        [Status] nvarchar(250) NOT NULL,
        CONSTRAINT [PK_vagas] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [mensagens] (
        [Id] uniqueidentifier NOT NULL,
        [ConversationId] uniqueidentifier NOT NULL,
        [AuthorUserId] uniqueidentifier NULL,
        [AuthorName] nvarchar(250) NOT NULL,
        [Channel] int NOT NULL,
        [Body] nvarchar(4000) NOT NULL,
        [SentAt] datetime2 NOT NULL,
        CONSTRAINT [PK_mensagens] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_mensagens_conversas_ConversationId] FOREIGN KEY ([ConversationId]) REFERENCES [conversas] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [sala_equipamentos] (
        [RoomId] uniqueidentifier NOT NULL,
        [EquipmentId] uniqueidentifier NOT NULL,
        CONSTRAINT [PK_sala_equipamentos] PRIMARY KEY ([RoomId], [EquipmentId]),
        CONSTRAINT [FK_sala_equipamentos_equipamentos_EquipmentId] FOREIGN KEY ([EquipmentId]) REFERENCES [equipamentos] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_sala_equipamentos_salas_RoomId] FOREIGN KEY ([RoomId]) REFERENCES [salas] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [impostos_servico] (
        [Id] uniqueidentifier NOT NULL,
        [ServiceId] uniqueidentifier NOT NULL,
        [Name] nvarchar(250) NOT NULL,
        [Percent] decimal(5,2) NOT NULL,
        CONSTRAINT [PK_impostos_servico] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_impostos_servico_servicos_ServiceId] FOREIGN KEY ([ServiceId]) REFERENCES [servicos] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [plano_servicos] (
        [PlanId] uniqueidentifier NOT NULL,
        [ServiceId] uniqueidentifier NOT NULL,
        [CoverageRule] nvarchar(250) NOT NULL,
        CONSTRAINT [PK_plano_servicos] PRIMARY KEY ([PlanId], [ServiceId]),
        CONSTRAINT [FK_plano_servicos_planos_PlanId] FOREIGN KEY ([PlanId]) REFERENCES [planos] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_plano_servicos_servicos_ServiceId] FOREIGN KEY ([ServiceId]) REFERENCES [servicos] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [sala_servicos] (
        [RoomId] uniqueidentifier NOT NULL,
        [ServiceId] uniqueidentifier NOT NULL,
        CONSTRAINT [PK_sala_servicos] PRIMARY KEY ([RoomId], [ServiceId]),
        CONSTRAINT [FK_sala_servicos_salas_RoomId] FOREIGN KEY ([RoomId]) REFERENCES [salas] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_sala_servicos_servicos_ServiceId] FOREIGN KEY ([ServiceId]) REFERENCES [servicos] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [servico_categorias] (
        [ServiceId] uniqueidentifier NOT NULL,
        [CategoryId] uniqueidentifier NOT NULL,
        CONSTRAINT [PK_servico_categorias] PRIMARY KEY ([ServiceId], [CategoryId]),
        CONSTRAINT [FK_servico_categorias_categorias_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [categorias] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_servico_categorias_servicos_ServiceId] FOREIGN KEY ([ServiceId]) REFERENCES [servicos] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [notificacao_regras] (
        [Id] uniqueidentifier NOT NULL,
        [Trigger] nvarchar(250) NOT NULL,
        [LeadTime] nvarchar(250) NOT NULL,
        [Channel] nvarchar(250) NOT NULL,
        [TemplateId] uniqueidentifier NOT NULL,
        [Active] bit NOT NULL,
        CONSTRAINT [PK_notificacao_regras] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_notificacao_regras_templates_mensagem_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [templates_mensagem] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [conversa_participantes] (
        [ConversationId] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        CONSTRAINT [PK_conversa_participantes] PRIMARY KEY ([ConversationId], [UserId]),
        CONSTRAINT [FK_conversa_participantes_conversas_ConversationId] FOREIGN KEY ([ConversationId]) REFERENCES [conversas] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_conversa_participantes_usuarios_UserId] FOREIGN KEY ([UserId]) REFERENCES [usuarios] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [funcionarios] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [Department] nvarchar(250) NOT NULL,
        [MonthlySalary] decimal(18,2) NULL,
        CONSTRAINT [PK_funcionarios] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_funcionarios_usuarios_UserId] FOREIGN KEY ([UserId]) REFERENCES [usuarios] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [pacientes] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [BirthDate] datetime2 NULL,
        CONSTRAINT [PK_pacientes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_pacientes_usuarios_UserId] FOREIGN KEY ([UserId]) REFERENCES [usuarios] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [profissionais] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NULL,
        [Name] nvarchar(250) NOT NULL,
        [PhotoUrl] nvarchar(250) NOT NULL,
        [Bio] nvarchar(250) NOT NULL,
        [Specialty] nvarchar(250) NOT NULL,
        [DefaultCommissionPercent] decimal(5,2) NOT NULL,
        [MonthlyFixedPayment] decimal(12,2) NULL,
        [ProvidesCare] bit NOT NULL,
        CONSTRAINT [PK_profissionais] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_profissionais_usuarios_UserId] FOREIGN KEY ([UserId]) REFERENCES [usuarios] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [usuario_roles] (
        [UserId] uniqueidentifier NOT NULL,
        [RoleId] uniqueidentifier NOT NULL,
        CONSTRAINT [PK_usuario_roles] PRIMARY KEY ([UserId], [RoleId]),
        CONSTRAINT [FK_usuario_roles_roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [roles] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_usuario_roles_usuarios_UserId] FOREIGN KEY ([UserId]) REFERENCES [usuarios] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [candidaturas] (
        [Id] uniqueidentifier NOT NULL,
        [JobOpeningId] uniqueidentifier NULL,
        [Candidate] nvarchar(250) NOT NULL,
        [Email] nvarchar(250) NOT NULL,
        [Message] nvarchar(250) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_candidaturas] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_candidaturas_vagas_JobOpeningId] FOREIGN KEY ([JobOpeningId]) REFERENCES [vagas] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [dependentes] (
        [Id] uniqueidentifier NOT NULL,
        [PatientId] uniqueidentifier NOT NULL,
        [FullName] nvarchar(250) NOT NULL,
        [BirthDate] datetime2 NOT NULL,
        [Relationship] nvarchar(250) NOT NULL,
        CONSTRAINT [PK_dependentes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_dependentes_pacientes_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [pacientes] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [profissional_horarios] (
        [Id] uniqueidentifier NOT NULL,
        [ProfessionalId] uniqueidentifier NOT NULL,
        [Weekday] int NOT NULL,
        [StartTime] time NOT NULL,
        [EndTime] time NOT NULL,
        CONSTRAINT [PK_profissional_horarios] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_profissional_horarios_profissionais_ProfessionalId] FOREIGN KEY ([ProfessionalId]) REFERENCES [profissionais] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [profissional_servicos] (
        [ProfessionalId] uniqueidentifier NOT NULL,
        [ServiceId] uniqueidentifier NOT NULL,
        [CompensationType] nvarchar(250) NOT NULL,
        [CompensationValue] decimal(18,2) NULL,
        CONSTRAINT [PK_profissional_servicos] PRIMARY KEY ([ProfessionalId], [ServiceId]),
        CONSTRAINT [FK_profissional_servicos_profissionais_ProfessionalId] FOREIGN KEY ([ProfessionalId]) REFERENCES [profissionais] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_profissional_servicos_servicos_ServiceId] FOREIGN KEY ([ServiceId]) REFERENCES [servicos] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [agendamentos] (
        [Id] uniqueidentifier NOT NULL,
        [PatientId] uniqueidentifier NOT NULL,
        [DependentId] uniqueidentifier NULL,
        [ProfessionalId] uniqueidentifier NOT NULL,
        [ServiceId] uniqueidentifier NOT NULL,
        [Date] date NOT NULL,
        [Time] time NOT NULL,
        [Status] int NOT NULL,
        CONSTRAINT [PK_agendamentos] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_agendamentos_dependentes_DependentId] FOREIGN KEY ([DependentId]) REFERENCES [dependentes] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_agendamentos_pacientes_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [pacientes] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_agendamentos_profissionais_ProfessionalId] FOREIGN KEY ([ProfessionalId]) REFERENCES [profissionais] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_agendamentos_servicos_ServiceId] FOREIGN KEY ([ServiceId]) REFERENCES [servicos] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [agendamento_status_log] (
        [Id] uniqueidentifier NOT NULL,
        [AppointmentId] uniqueidentifier NOT NULL,
        [Status] int NOT NULL,
        [ChangedAt] datetime2 NOT NULL,
        [ChangedByUserId] uniqueidentifier NULL,
        CONSTRAINT [PK_agendamento_status_log] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_agendamento_status_log_agendamentos_AppointmentId] FOREIGN KEY ([AppointmentId]) REFERENCES [agendamentos] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [comissoes] (
        [Id] uniqueidentifier NOT NULL,
        [AppointmentId] uniqueidentifier NOT NULL,
        [ProfessionalId] uniqueidentifier NOT NULL,
        [Amount] decimal(12,2) NOT NULL,
        [Percent] decimal(5,2) NOT NULL,
        CONSTRAINT [PK_comissoes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_comissoes_agendamentos_AppointmentId] FOREIGN KEY ([AppointmentId]) REFERENCES [agendamentos] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_comissoes_profissionais_ProfessionalId] FOREIGN KEY ([ProfessionalId]) REFERENCES [profissionais] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE TABLE [pagamentos] (
        [Id] uniqueidentifier NOT NULL,
        [AppointmentId] uniqueidentifier NOT NULL,
        [GrossAmount] decimal(12,2) NOT NULL,
        [Method] nvarchar(250) NOT NULL,
        [PaidAt] datetime2 NOT NULL,
        CONSTRAINT [PK_pagamentos] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_pagamentos_agendamentos_AppointmentId] FOREIGN KEY ([AppointmentId]) REFERENCES [agendamentos] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Candidate', N'CreatedAt', N'Email', N'Message') AND [object_id] = OBJECT_ID(N'[banco_talentos]'))
        SET IDENTITY_INSERT [banco_talentos] ON;
    EXEC(N'INSERT INTO [banco_talentos] ([Id], [Candidate], [CreatedAt], [Email], [Message])
    VALUES (''5c000000-0000-0000-0000-000000000001'', N''Carla Souza'', ''2026-05-09T00:00:00.0000000'', N''carla@example.com'', N''Gostaria de entrar no banco de talentos.'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Candidate', N'CreatedAt', N'Email', N'Message') AND [object_id] = OBJECT_ID(N'[banco_talentos]'))
        SET IDENTITY_INSERT [banco_talentos] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Active', N'CtaText', N'CtaUrl', N'ImageUrl', N'SortOrder', N'Subtitle', N'Title') AND [object_id] = OBJECT_ID(N'[banners]'))
        SET IDENTITY_INSERT [banners] ON;
    EXEC(N'INSERT INTO [banners] ([Id], [Active], [CtaText], [CtaUrl], [ImageUrl], [SortOrder], [Subtitle], [Title])
    VALUES (''61000000-0000-0000-0000-000000000001'', CAST(1 AS bit), N''Agendar avaliação'', N''/agendar'', N''https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=80'', 1, N''Serviços especializados, profissionais selecionados e acompanhamento próximo em cada etapa.'', N''Cuidado premium com agenda inteligente''),
    (''61000000-0000-0000-0000-000000000002'', CAST(1 AS bit), N''Conhecer serviços'', N''/servicos'', N''https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=1600&q=80'', 2, N''Fluxos pensados para reduzir espera, organizar mensagens e manter seu plano de cuidado visível.'', N''Experiência acolhedora do primeiro contato ao retorno''),
    (''61000000-0000-0000-0000-000000000003'', CAST(1 AS bit), N''Ver profissionais'', N''/profissionais'', N''https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=1600&q=80'', 3, N''Profissionais habilitados para tratamentos avançados, com agenda integrada e métricas claras.'', N''Equipe multidisciplinar em um só lugar'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Active', N'CtaText', N'CtaUrl', N'ImageUrl', N'SortOrder', N'Subtitle', N'Title') AND [object_id] = OBJECT_ID(N'[banners]'))
        SET IDENTITY_INSERT [banners] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Name', N'ParticipantRule') AND [object_id] = OBJECT_ID(N'[canais_mensageria]'))
        SET IDENTITY_INSERT [canais_mensageria] ON;
    EXEC(N'INSERT INTO [canais_mensageria] ([Id], [Name], [ParticipantRule])
    VALUES (''56000000-0000-0000-0000-000000000001'', N''Recepção e profissionais'', N''role:recepcao,role:profissional''),
    (''56000000-0000-0000-0000-000000000002'', N''Administrativo'', N''role:admin,role:recepcao'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Name', N'ParticipantRule') AND [object_id] = OBJECT_ID(N'[canais_mensageria]'))
        SET IDENTITY_INSERT [canais_mensageria] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Name', N'Type') AND [object_id] = OBJECT_ID(N'[categorias]'))
        SET IDENTITY_INSERT [categorias] ON;
    EXEC(N'INSERT INTO [categorias] ([Id], [Name], [Type])
    VALUES (''10000000-0000-0000-0000-000000000001'', N''Estética avançada'', N''servico''),
    (''10000000-0000-0000-0000-000000000002'', N''Odontologia'', N''servico''),
    (''10000000-0000-0000-0000-000000000003'', N''Medicina particular'', N''servico''),
    (''10000000-0000-0000-0000-000000000004'', N''Terapias'', N''servico''),
    (''10000000-0000-0000-0000-000000000005'', N''Operação'', N''equipe''),
    (''10000000-0000-0000-0000-000000000006'', N''Administrativo'', N''equipe'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Name', N'Type') AND [object_id] = OBJECT_ID(N'[categorias]'))
        SET IDENTITY_INSERT [categorias] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Key', N'Value', N'ValueType') AND [object_id] = OBJECT_ID(N'[configuracoes]'))
        SET IDENTITY_INSERT [configuracoes] ON;
    EXEC(N'INSERT INTO [configuracoes] ([Id], [Key], [Value], [ValueType])
    VALUES (''60000000-0000-0000-0000-000000000001'', N''clinicName'', N''Clínica Aurora'', N''string''),
    (''60000000-0000-0000-0000-000000000002'', N''logoUrl'', N''data:image/svg+xml,%3Csvg width=''''96'''' height=''''96'''' viewBox=''''0 0 96 96'''' xmlns=''''http://www.w3.org/2000/svg''''%3E%3Crect width=''''96'''' height=''''96'''' rx=''''22'''' fill=''''%23C2410C''''/%3E%3Cpath d=''''M48 18c10 16 20 24 20 38 0 11-9 20-20 20s-20-9-20-20c0-14 10-22 20-38Z'''' fill=''''white'''' fill-opacity=''''.92''''/%3E%3C/svg%3E'', N''string''),
    (''60000000-0000-0000-0000-000000000003'', N''theme.primary'', N''#C2410C'', N''color''),
    (''60000000-0000-0000-0000-000000000004'', N''theme.primaryLight'', N''#F59E0B'', N''color''),
    (''60000000-0000-0000-0000-000000000005'', N''theme.bgBase'', N''#FAF7F2'', N''color''),
    (''60000000-0000-0000-0000-000000000006'', N''theme.bgSecondary'', N''#EFE7D8'', N''color''),
    (''60000000-0000-0000-0000-000000000007'', N''theme.brownDark'', N''#3D2817'', N''color''),
    (''60000000-0000-0000-0000-000000000008'', N''theme.brownMid'', N''#7A5C3E'', N''color''),
    (''60000000-0000-0000-0000-000000000009'', N''theme.surface'', N''#FFFFFF'', N''color''),
    (''60000000-0000-0000-0000-000000000010'', N''theme.headingFont'', N''Playfair Display'', N''font''),
    (''60000000-0000-0000-0000-000000000011'', N''theme.bodyFont'', N''Inter'', N''font''),
    (''60000000-0000-0000-0000-000000000012'', N''address'', N''Av. Paulista, 1578, Bela Vista, São Paulo - SP'', N''string''),
    (''60000000-0000-0000-0000-000000000013'', N''coordinates.lat'', N''-23.561414'', N''decimal''),
    (''60000000-0000-0000-0000-000000000014'', N''coordinates.lng'', N''-46.655881'', N''decimal''),
    (''60000000-0000-0000-0000-000000000015'', N''whatsappUrl'', N''https://wa.me/5511999999999'', N''url''),
    (''60000000-0000-0000-0000-000000000016'', N''instagramUrl'', N''https://instagram.com/clinicaaurora'', N''url''),
    (''60000000-0000-0000-0000-000000000017'', N''openingHours'', N''Segunda a sexta, 8h às 20h. Sábado, 8h às 14h.'', N''string''),
    (''60000000-0000-0000-0000-000000000018'', N''about.text'', N''Nossa clínica nasceu para oferecer uma jornada de cuidado particular, precisa e acolhedora. Unimos tecnologia, escuta clínica e ambientes preparados para atendimentos de alto valor.'', N''text'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Key', N'Value', N'ValueType') AND [object_id] = OBJECT_ID(N'[configuracoes]'))
        SET IDENTITY_INSERT [configuracoes] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Channel', N'Title') AND [object_id] = OBJECT_ID(N'[conversas]'))
        SET IDENTITY_INSERT [conversas] ON;
    EXEC(N'INSERT INTO [conversas] ([Id], [Channel], [Title])
    VALUES (''54000000-0000-0000-0000-000000000001'', 0, N''Dúvida sobre preparo''),
    (''54000000-0000-0000-0000-000000000002'', 1, N''Remarcação de retorno'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Channel', N'Title') AND [object_id] = OBJECT_ID(N'[conversas]'))
        SET IDENTITY_INSERT [conversas] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'MonthLabel', N'Name', N'Type', N'Value') AND [object_id] = OBJECT_ID(N'[custos]'))
        SET IDENTITY_INSERT [custos] ON;
    EXEC(N'INSERT INTO [custos] ([Id], [MonthLabel], [Name], [Type], [Value])
    VALUES (''70000000-0000-0000-0000-000000000001'', N''Dez/25'', N''Aluguel'', 0, 18000.0),
    (''70000000-0000-0000-0000-000000000002'', N''Jan/26'', N''Salários fixos'', 0, 34000.0),
    (''70000000-0000-0000-0000-000000000003'', N''Fev/26'', N''Insumos estéticos'', 1, 13200.0),
    (''70000000-0000-0000-0000-000000000004'', N''Mar/26'', N''Assinaturas'', 0, 4200.0),
    (''70000000-0000-0000-0000-000000000005'', N''Abr/26'', N''Materiais odontológicos'', 1, 9700.0),
    (''70000000-0000-0000-0000-000000000006'', N''Mai/26'', N''Energia e utilidades'', 0, 6800.0)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'MonthLabel', N'Name', N'Type', N'Value') AND [object_id] = OBJECT_ID(N'[custos]'))
        SET IDENTITY_INSERT [custos] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'Name', N'Quantity', N'UnitValue') AND [object_id] = OBJECT_ID(N'[equipamentos]'))
        SET IDENTITY_INSERT [equipamentos] ON;
    EXEC(N'INSERT INTO [equipamentos] ([Id], [Category], [Name], [Quantity], [UnitValue])
    VALUES (''31000000-0000-0000-0000-000000000001'', N''Diagnóstico'', N''Scanner facial'', 1, 28000.0),
    (''31000000-0000-0000-0000-000000000002'', N''Estética'', N''Dermatoscópio'', 2, 9500.0),
    (''31000000-0000-0000-0000-000000000003'', N''Odontologia'', N''LED clareador'', 1, 7200.0),
    (''31000000-0000-0000-0000-000000000004'', N''Odontologia'', N''Motor cirúrgico'', 1, 18000.0)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Category', N'Name', N'Quantity', N'UnitValue') AND [object_id] = OBJECT_ID(N'[equipamentos]'))
        SET IDENTITY_INSERT [equipamentos] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ImageUrl', N'SortOrder') AND [object_id] = OBJECT_ID(N'[galeria_sobre]'))
        SET IDENTITY_INSERT [galeria_sobre] ON;
    EXEC(N'INSERT INTO [galeria_sobre] ([Id], [ImageUrl], [SortOrder])
    VALUES (''64000000-0000-0000-0000-000000000001'', N''https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80'', 1),
    (''64000000-0000-0000-0000-000000000002'', N''https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=900&q=80'', 2),
    (''64000000-0000-0000-0000-000000000003'', N''https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=900&q=80'', 3)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'ImageUrl', N'SortOrder') AND [object_id] = OBJECT_ID(N'[galeria_sobre]'))
        SET IDENTITY_INSERT [galeria_sobre] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description', N'EventType', N'UserId') AND [object_id] = OBJECT_ID(N'[log_movimento]'))
        SET IDENTITY_INSERT [log_movimento] ON;
    EXEC(N'INSERT INTO [log_movimento] ([Id], [CreatedAt], [Description], [EventType], [UserId])
    VALUES (''72000000-0000-0000-0000-000000000001'', ''2026-05-20T09:10:00.0000000'', N''Agendamento confirmado para Marina Pires.'', N''agendamento'', ''41000000-0000-0000-0000-000000000003''),
    (''72000000-0000-0000-0000-000000000002'', ''2026-05-20T10:30:00.0000000'', N''Novo candidato registrado no banco de talentos.'', N''cadastro'', ''41000000-0000-0000-0000-000000000004'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description', N'EventType', N'UserId') AND [object_id] = OBJECT_ID(N'[log_movimento]'))
        SET IDENTITY_INSERT [log_movimento] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Description', N'SortOrder', N'Title', N'YearLabel') AND [object_id] = OBJECT_ID(N'[marcos_historicos]'))
        SET IDENTITY_INSERT [marcos_historicos] ON;
    EXEC(N'INSERT INTO [marcos_historicos] ([Id], [Description], [SortOrder], [Title], [YearLabel])
    VALUES (''62000000-0000-0000-0000-000000000001'', N''Início das operações com agenda especializada e atendimento particular.'', 1, N''Primeira unidade'', N''2018''),
    (''62000000-0000-0000-0000-000000000002'', N''Padronização de jornadas clínicas e acompanhamento digital dos pacientes.'', 2, N''Protocolos integrados'', N''2020''),
    (''62000000-0000-0000-0000-000000000003'', N''Entrada de novos especialistas e ampliação das salas de procedimento.'', 3, N''Expansão da equipe'', N''2023''),
    (''62000000-0000-0000-0000-000000000004'', N''Renovação da estrutura, canais de relacionamento e indicadores de qualidade.'', 4, N''Experiência premium'', N''2025'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Description', N'SortOrder', N'Title', N'YearLabel') AND [object_id] = OBJECT_ID(N'[marcos_historicos]'))
        SET IDENTITY_INSERT [marcos_historicos] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Appointments', N'CancellationRate', N'MonthLabel', N'NewPatients', N'OccupancyRate', N'Profit', N'Revenue', N'TicketAverage') AND [object_id] = OBJECT_ID(N'[metricas_snapshot]'))
        SET IDENTITY_INSERT [metricas_snapshot] ON;
    EXEC(N'INSERT INTO [metricas_snapshot] ([Id], [Appointments], [CancellationRate], [MonthLabel], [NewPatients], [OccupancyRate], [Profit], [Revenue], [TicketAverage])
    VALUES (''71000000-0000-0000-0000-000000000001'', 132, 7.0, N''Dez/25'', 38, 64.0, 42000.0, 118000.0, 894.0),
    (''71000000-0000-0000-0000-000000000002'', 141, 6.0, N''Jan/26'', 42, 69.0, 48500.0, 126500.0, 897.0),
    (''71000000-0000-0000-0000-000000000003'', 136, 8.0, N''Fev/26'', 36, 67.0, 45200.0, 121800.0, 895.0),
    (''71000000-0000-0000-0000-000000000004'', 151, 5.0, N''Mar/26'', 47, 73.0, 54800.0, 139400.0, 923.0),
    (''71000000-0000-0000-0000-000000000005'', 158, 5.0, N''Abr/26'', 51, 76.0, 59200.0, 146200.0, 925.0),
    (''71000000-0000-0000-0000-000000000006'', 164, 4.0, N''Mai/26'', 54, 79.0, 63800.0, 154900.0, 944.0)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Appointments', N'CancellationRate', N'MonthLabel', N'NewPatients', N'OccupancyRate', N'Profit', N'Revenue', N'TicketAverage') AND [object_id] = OBJECT_ID(N'[metricas_snapshot]'))
        SET IDENTITY_INSERT [metricas_snapshot] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Mission', N'Values', N'Vision') AND [object_id] = OBJECT_ID(N'[mvv]'))
        SET IDENTITY_INSERT [mvv] ON;
    EXEC(N'INSERT INTO [mvv] ([Id], [Mission], [Values], [Vision])
    VALUES (''63000000-0000-0000-0000-000000000001'', N''Entregar cuidado especializado com clareza, segurança e atenção aos detalhes.'', N''Ética, acolhimento, precisão técnica, transparência e melhoria contínua.'', N''Ser referência regional em experiências clínicas premium e gestão orientada por dados.'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Mission', N'Values', N'Vision') AND [object_id] = OBJECT_ID(N'[mvv]'))
        SET IDENTITY_INSERT [mvv] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Description', N'Name') AND [object_id] = OBJECT_ID(N'[planos]'))
        SET IDENTITY_INSERT [planos] ON;
    EXEC(N'INSERT INTO [planos] ([Id], [Description], [Name])
    VALUES (''59000000-0000-0000-0000-000000000001'', N''Pacote de acompanhamento com descontos progressivos.'', N''Plano premium preventivo'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Description', N'Name') AND [object_id] = OBJECT_ID(N'[planos]'))
        SET IDENTITY_INSERT [planos] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Bio', N'DefaultCommissionPercent', N'MonthlyFixedPayment', N'Name', N'PhotoUrl', N'ProvidesCare', N'Specialty', N'UserId') AND [object_id] = OBJECT_ID(N'[profissionais]'))
        SET IDENTITY_INSERT [profissionais] ON;
    EXEC(N'INSERT INTO [profissionais] ([Id], [Bio], [DefaultCommissionPercent], [MonthlyFixedPayment], [Name], [PhotoUrl], [ProvidesCare], [Specialty], [UserId])
    VALUES (''43000000-0000-0000-0000-000000000002'', N''Atua em avaliação facial e protocolos conservadores para pacientes que buscam evolução mensurável.'', 30.0, NULL, N''Dr. Rafael Nogueira'', N''https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80'', CAST(1 AS bit), N''Harmonização facial'', NULL),
    (''43000000-0000-0000-0000-000000000003'', N''Cirurgiã-dentista com experiência em implantodontia, estética dental e planejamento multidisciplinar.'', 40.0, NULL, N''Dra. Camila Torres'', N''https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80'', CAST(1 AS bit), N''Odontologia especializada'', NULL),
    (''43000000-0000-0000-0000-000000000004'', N''Médico clínico com atendimento particular, acompanhamento longitudinal e análise detalhada de exames.'', 45.0, NULL, N''Dr. Marcos Vidal'', N''https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80'', CAST(1 AS bit), N''Clínica médica'', NULL),
    (''43000000-0000-0000-0000-000000000005'', N''Terapeuta focada em performance, autocuidado e criação de rotinas sustentáveis.'', 32.0, NULL, N''Dra. Laura Menezes'', N''https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&w=600&q=80'', CAST(1 AS bit), N''Terapias integrativas'', NULL)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Bio', N'DefaultCommissionPercent', N'MonthlyFixedPayment', N'Name', N'PhotoUrl', N'ProvidesCare', N'Specialty', N'UserId') AND [object_id] = OBJECT_ID(N'[profissionais]'))
        SET IDENTITY_INSERT [profissionais] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Name') AND [object_id] = OBJECT_ID(N'[roles]'))
        SET IDENTITY_INSERT [roles] ON;
    EXEC(N'INSERT INTO [roles] ([Id], [Name])
    VALUES (''40000000-0000-0000-0000-000000000001'', N''paciente''),
    (''40000000-0000-0000-0000-000000000002'', N''profissional''),
    (''40000000-0000-0000-0000-000000000003'', N''recepcao''),
    (''40000000-0000-0000-0000-000000000004'', N''admin'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Name') AND [object_id] = OBJECT_ID(N'[roles]'))
        SET IDENTITY_INSERT [roles] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Capacity', N'Name', N'Notes') AND [object_id] = OBJECT_ID(N'[salas]'))
        SET IDENTITY_INSERT [salas] ON;
    EXEC(N'INSERT INTO [salas] ([Id], [Capacity], [Name], [Notes])
    VALUES (''30000000-0000-0000-0000-000000000001'', 3, N''Sala de avaliação'', N''Consultas e avaliações.''),
    (''30000000-0000-0000-0000-000000000002'', 2, N''Sala de procedimentos'', N''Procedimentos estéticos avançados.''),
    (''30000000-0000-0000-0000-000000000003'', 2, N''Consultório odontológico'', N''Odontologia especializada.''),
    (''30000000-0000-0000-0000-000000000004'', 2, N''Sala terapêutica'', N''Ambiente reservado para terapias.'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Capacity', N'Name', N'Notes') AND [object_id] = OBJECT_ID(N'[salas]'))
        SET IDENTITY_INSERT [salas] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'BasePrice', N'Description', N'DurationMinutes', N'Name', N'ShortDescription') AND [object_id] = OBJECT_ID(N'[servicos]'))
        SET IDENTITY_INSERT [servicos] ON;
    EXEC(N'INSERT INTO [servicos] ([Id], [BasePrice], [Description], [DurationMinutes], [Name], [ShortDescription])
    VALUES (''20000000-0000-0000-0000-000000000001'', 380.0, N''Consulta completa para mapear necessidades, contraindicações, objetivos e sequência ideal de procedimentos.'', 60, N''Avaliação Facial Integrada'', N''Plano personalizado com análise facial, histórico e metas de tratamento.''),
    (''20000000-0000-0000-0000-000000000002'', 1800.0, N''Procedimento injetável com planejamento por região, revisão de fotos e acompanhamento de evolução.'', 75, N''Bioestimulador de Colágeno'', N''Tratamento para melhora gradual de firmeza e textura da pele.''),
    (''20000000-0000-0000-0000-000000000003'', 950.0, N''Clareamento conduzido por especialista, com registro de cor, proteção gengival e orientações pós-atendimento.'', 90, N''Clareamento Dental Premium'', N''Protocolo supervisionado com controle de sensibilidade.''),
    (''20000000-0000-0000-0000-000000000004'', 2500.0, N''Consulta especializada para diagnóstico, indicação, etapas cirúrgicas e previsibilidade do investimento.'', 80, N''Implantodontia Planejada'', N''Planejamento de implantes com avaliação de exames e cronograma.''),
    (''20000000-0000-0000-0000-000000000005'', 620.0, N''Consulta individual com anamnese, revisão de exames, hipóteses diagnósticas e orientações documentadas.'', 50, N''Consulta Médica Particular'', N''Atendimento clínico com escuta ampliada e plano de acompanhamento.''),
    (''20000000-0000-0000-0000-000000000006'', 320.0, N''Atendimento de continuidade para revisar evolução, exames e adequar o plano de cuidado.'', 35, N''Retorno Médico'', N''Revisão de exames e ajuste de conduta.''),
    (''20000000-0000-0000-0000-000000000007'', 420.0, N''Abordagem terapêutica para construir repertório emocional, metas realistas e acompanhamento entre sessões.'', 55, N''Terapia de Performance'', N''Sessão focada em performance, autocuidado e rotina.''),
    (''20000000-0000-0000-0000-000000000008'', 340.0, N''Sessão de continuidade com revisão de evolução, ajustes e próximos passos do plano terapêutico.'', 45, N''Sessão de Manutenção'', N''Acompanhamento periódico para pacientes em plano ativo.'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'BasePrice', N'Description', N'DurationMinutes', N'Name', N'ShortDescription') AND [object_id] = OBJECT_ID(N'[servicos]'))
        SET IDENTITY_INSERT [servicos] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Body', N'Channel', N'Occasion') AND [object_id] = OBJECT_ID(N'[templates_mensagem]'))
        SET IDENTITY_INSERT [templates_mensagem] ON;
    EXEC(N'INSERT INTO [templates_mensagem] ([Id], [Body], [Channel], [Occasion])
    VALUES (''57000000-0000-0000-0000-000000000001'', N''Olá, {{nome_paciente}}. Sua consulta de {{servico}} com {{profissional}} está agendada para {{data}} às {{horario}}. {{nome_clinica}}'', N''WhatsApp'', N''Confirmação''),
    (''57000000-0000-0000-0000-000000000002'', N''Lembramos sua consulta em {{data}} às {{horario}}. Em caso de dúvidas, responda este e-mail.'', N''E-mail'', N''Lembrete''),
    (''57000000-0000-0000-0000-000000000003'', N''{{nome_paciente}}, seu agendamento foi cancelado. Podemos ajudar com uma nova data?'', N''WhatsApp'', N''Cancelamento'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Body', N'Channel', N'Occasion') AND [object_id] = OBJECT_ID(N'[templates_mensagem]'))
        SET IDENTITY_INSERT [templates_mensagem] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Email', N'FullName', N'PasswordHash', N'Phone') AND [object_id] = OBJECT_ID(N'[usuarios]'))
        SET IDENTITY_INSERT [usuarios] ON;
    EXEC(N'INSERT INTO [usuarios] ([Id], [CreatedAt], [Email], [FullName], [PasswordHash], [Phone])
    VALUES (''41000000-0000-0000-0000-000000000001'', ''2026-05-01T09:00:00.0000000'', N''paciente@aio.com'', N''Marina Pires'', N''seed:senha123'', N''(11) 98888-1111''),
    (''41000000-0000-0000-0000-000000000002'', ''2026-05-01T09:00:00.0000000'', N''profissional@aio.com'', N''Dra. Helena Prado'', N''seed:senha123'', N''(11) 97777-2222''),
    (''41000000-0000-0000-0000-000000000003'', ''2026-05-01T09:00:00.0000000'', N''recepcao@aio.com'', N''Sofia Almeida'', N''seed:senha123'', N''(11) 96666-3333''),
    (''41000000-0000-0000-0000-000000000004'', ''2026-05-01T09:00:00.0000000'', N''admin@aio.com'', N''Bruno Castro'', N''seed:senha123'', N''(11) 95555-4444'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Email', N'FullName', N'PasswordHash', N'Phone') AND [object_id] = OBJECT_ID(N'[usuarios]'))
        SET IDENTITY_INSERT [usuarios] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Department', N'Description', N'Status', N'Title') AND [object_id] = OBJECT_ID(N'[vagas]'))
        SET IDENTITY_INSERT [vagas] ON;
    EXEC(N'INSERT INTO [vagas] ([Id], [Department], [Description], [Status], [Title])
    VALUES (''5a000000-0000-0000-0000-000000000001'', N''Recepção'', N''Atendimento premium, organização de agenda e experiência do paciente.'', N''aberta'', N''Recepcionista bilíngue''),
    (''5a000000-0000-0000-0000-000000000002'', N''Relacionamento'', N''Acompanhamento de leads, propostas e conversão de planos de tratamento.'', N''aberta'', N''Consultor comercial de saúde''),
    (''5a000000-0000-0000-0000-000000000003'', N''Operação clínica'', N''Preparo de sala, materiais, equipamentos e suporte aos profissionais.'', N''aberta'', N''Auxiliar de sala''),
    (''5a000000-0000-0000-0000-000000000004'', N''Administração'', N''Controle financeiro, fornecedores e indicadores operacionais.'', N''encerrada'', N''Analista administrativo'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Department', N'Description', N'Status', N'Title') AND [object_id] = OBJECT_ID(N'[vagas]'))
        SET IDENTITY_INSERT [vagas] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Candidate', N'CreatedAt', N'Email', N'JobOpeningId', N'Message') AND [object_id] = OBJECT_ID(N'[candidaturas]'))
        SET IDENTITY_INSERT [candidaturas] ON;
    EXEC(N'INSERT INTO [candidaturas] ([Id], [Candidate], [CreatedAt], [Email], [JobOpeningId], [Message])
    VALUES (''5b000000-0000-0000-0000-000000000001'', N''Ana Lima'', ''2026-05-01T00:00:00.0000000'', N''ana@example.com'', ''5a000000-0000-0000-0000-000000000001'', N''Tenho experiência com atendimento premium.''),
    (''5b000000-0000-0000-0000-000000000002'', N''Julia Reis'', ''2026-05-04T00:00:00.0000000'', N''julia@example.com'', ''5a000000-0000-0000-0000-000000000001'', N''Atuei em clínica odontológica por três anos.''),
    (''5b000000-0000-0000-0000-000000000003'', N''Pedro Martins'', ''2026-05-07T00:00:00.0000000'', N''pedro@example.com'', ''5a000000-0000-0000-0000-000000000002'', N''Tenho histórico em vendas consultivas.''),
    (''5b000000-0000-0000-0000-000000000004'', N''Renata Alves'', ''2026-05-11T00:00:00.0000000'', N''renata@example.com'', ''5a000000-0000-0000-0000-000000000003'', N''Tenho disponibilidade integral.'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Candidate', N'CreatedAt', N'Email', N'JobOpeningId', N'Message') AND [object_id] = OBJECT_ID(N'[candidaturas]'))
        SET IDENTITY_INSERT [candidaturas] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'ConversationId', N'UserId') AND [object_id] = OBJECT_ID(N'[conversa_participantes]'))
        SET IDENTITY_INSERT [conversa_participantes] ON;
    EXEC(N'INSERT INTO [conversa_participantes] ([ConversationId], [UserId])
    VALUES (''54000000-0000-0000-0000-000000000001'', ''41000000-0000-0000-0000-000000000001''),
    (''54000000-0000-0000-0000-000000000001'', ''41000000-0000-0000-0000-000000000003''),
    (''54000000-0000-0000-0000-000000000002'', ''41000000-0000-0000-0000-000000000001''),
    (''54000000-0000-0000-0000-000000000002'', ''41000000-0000-0000-0000-000000000003'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'ConversationId', N'UserId') AND [object_id] = OBJECT_ID(N'[conversa_participantes]'))
        SET IDENTITY_INSERT [conversa_participantes] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Department', N'MonthlySalary', N'UserId') AND [object_id] = OBJECT_ID(N'[funcionarios]'))
        SET IDENTITY_INSERT [funcionarios] ON;
    EXEC(N'INSERT INTO [funcionarios] ([Id], [Department], [MonthlySalary], [UserId])
    VALUES (''44000000-0000-0000-0000-000000000001'', N''Recepção'', 4200.0, ''41000000-0000-0000-0000-000000000003''),
    (''44000000-0000-0000-0000-000000000002'', N''Administração'', 7200.0, ''41000000-0000-0000-0000-000000000004'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Department', N'MonthlySalary', N'UserId') AND [object_id] = OBJECT_ID(N'[funcionarios]'))
        SET IDENTITY_INSERT [funcionarios] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Name', N'Percent', N'ServiceId') AND [object_id] = OBJECT_ID(N'[impostos_servico]'))
        SET IDENTITY_INSERT [impostos_servico] ON;
    EXEC(N'INSERT INTO [impostos_servico] ([Id], [Name], [Percent], [ServiceId])
    VALUES (''32000000-0000-0000-0000-000000000001'', N''ISS'', 5.0, ''20000000-0000-0000-0000-000000000002''),
    (''32000000-0000-0000-0000-000000000002'', N''ISS'', 5.0, ''20000000-0000-0000-0000-000000000004''),
    (''32000000-0000-0000-0000-000000000003'', N''ISS'', 3.0, ''20000000-0000-0000-0000-000000000005'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Name', N'Percent', N'ServiceId') AND [object_id] = OBJECT_ID(N'[impostos_servico]'))
        SET IDENTITY_INSERT [impostos_servico] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'AuthorName', N'AuthorUserId', N'Body', N'Channel', N'ConversationId', N'SentAt') AND [object_id] = OBJECT_ID(N'[mensagens]'))
        SET IDENTITY_INSERT [mensagens] ON;
    EXEC(N'INSERT INTO [mensagens] ([Id], [AuthorName], [AuthorUserId], [Body], [Channel], [ConversationId], [SentAt])
    VALUES (''55000000-0000-0000-0000-000000000001'', N''Marina Pires'', ''41000000-0000-0000-0000-000000000001'', N''Preciso fazer algum preparo antes da avaliação?'', 0, ''54000000-0000-0000-0000-000000000001'', ''2026-05-19T10:20:00.0000000''),
    (''55000000-0000-0000-0000-000000000002'', N''Recepção'', ''41000000-0000-0000-0000-000000000003'', N''Recomendamos chegar 10 minutos antes e trazer exames recentes, se houver.'', 0, ''54000000-0000-0000-0000-000000000001'', ''2026-05-19T10:25:00.0000000''),
    (''55000000-0000-0000-0000-000000000003'', N''Recepção'', ''41000000-0000-0000-0000-000000000003'', N''Temos disponibilidade na terça às 11h ou quarta às 15h.'', 1, ''54000000-0000-0000-0000-000000000002'', ''2026-05-18T16:40:00.0000000'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'AuthorName', N'AuthorUserId', N'Body', N'Channel', N'ConversationId', N'SentAt') AND [object_id] = OBJECT_ID(N'[mensagens]'))
        SET IDENTITY_INSERT [mensagens] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Active', N'Channel', N'LeadTime', N'TemplateId', N'Trigger') AND [object_id] = OBJECT_ID(N'[notificacao_regras]'))
        SET IDENTITY_INSERT [notificacao_regras] ON;
    EXEC(N'INSERT INTO [notificacao_regras] ([Id], [Active], [Channel], [LeadTime], [TemplateId], [Trigger])
    VALUES (''58000000-0000-0000-0000-000000000001'', CAST(1 AS bit), N''WhatsApp'', N''Imediatamente após agendar'', ''57000000-0000-0000-0000-000000000001'', N''Confirmação''),
    (''58000000-0000-0000-0000-000000000002'', CAST(1 AS bit), N''Ambos'', N''24h antes'', ''57000000-0000-0000-0000-000000000002'', N''Lembrete'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Active', N'Channel', N'LeadTime', N'TemplateId', N'Trigger') AND [object_id] = OBJECT_ID(N'[notificacao_regras]'))
        SET IDENTITY_INSERT [notificacao_regras] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'BirthDate', N'UserId') AND [object_id] = OBJECT_ID(N'[pacientes]'))
        SET IDENTITY_INSERT [pacientes] ON;
    EXEC(N'INSERT INTO [pacientes] ([Id], [BirthDate], [UserId])
    VALUES (''42000000-0000-0000-0000-000000000001'', ''1988-09-14T00:00:00.0000000'', ''41000000-0000-0000-0000-000000000001'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'BirthDate', N'UserId') AND [object_id] = OBJECT_ID(N'[pacientes]'))
        SET IDENTITY_INSERT [pacientes] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'PlanId', N'ServiceId', N'CoverageRule') AND [object_id] = OBJECT_ID(N'[plano_servicos]'))
        SET IDENTITY_INSERT [plano_servicos] ON;
    EXEC(N'INSERT INTO [plano_servicos] ([PlanId], [ServiceId], [CoverageRule])
    VALUES (''59000000-0000-0000-0000-000000000001'', ''20000000-0000-0000-0000-000000000001'', N''100% da avaliação inclusa''),
    (''59000000-0000-0000-0000-000000000001'', ''20000000-0000-0000-0000-000000000006'', N''50% de desconto em retornos'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'PlanId', N'ServiceId', N'CoverageRule') AND [object_id] = OBJECT_ID(N'[plano_servicos]'))
        SET IDENTITY_INSERT [plano_servicos] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Bio', N'DefaultCommissionPercent', N'MonthlyFixedPayment', N'Name', N'PhotoUrl', N'ProvidesCare', N'Specialty', N'UserId') AND [object_id] = OBJECT_ID(N'[profissionais]'))
        SET IDENTITY_INSERT [profissionais] ON;
    EXEC(N'INSERT INTO [profissionais] ([Id], [Bio], [DefaultCommissionPercent], [MonthlyFixedPayment], [Name], [PhotoUrl], [ProvidesCare], [Specialty], [UserId])
    VALUES (''43000000-0000-0000-0000-000000000001'', N''Especialista em estética avançada, com foco em planos graduais, naturalidade e segurança técnica.'', 35.0, NULL, N''Dra. Helena Prado'', N''https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80'', CAST(1 AS bit), N''Dermatologia estética'', ''41000000-0000-0000-0000-000000000002''),
    (''43000000-0000-0000-0000-000000000006'', N''Responsável por acolhimento, agenda compartilhada e central de comunicação.'', 0.0, NULL, N''Sofia Almeida'', N''https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80'', CAST(0 AS bit), N''Recepção premium'', ''41000000-0000-0000-0000-000000000003''),
    (''43000000-0000-0000-0000-000000000007'', N''Administração, indicadores executivos e configurações white label.'', 0.0, 7200.0, N''Bruno Castro'', N''https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80'', CAST(0 AS bit), N''Gestão administrativa'', ''41000000-0000-0000-0000-000000000004'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Bio', N'DefaultCommissionPercent', N'MonthlyFixedPayment', N'Name', N'PhotoUrl', N'ProvidesCare', N'Specialty', N'UserId') AND [object_id] = OBJECT_ID(N'[profissionais]'))
        SET IDENTITY_INSERT [profissionais] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'EndTime', N'ProfessionalId', N'StartTime', N'Weekday') AND [object_id] = OBJECT_ID(N'[profissional_horarios]'))
        SET IDENTITY_INSERT [profissional_horarios] ON;
    EXEC(N'INSERT INTO [profissional_horarios] ([Id], [EndTime], [ProfessionalId], [StartTime], [Weekday])
    VALUES (''45000000-0000-0000-0000-000000000004'', ''18:00:00'', ''43000000-0000-0000-0000-000000000002'', ''10:00:00'', 2),
    (''45000000-0000-0000-0000-000000000005'', ''16:00:00'', ''43000000-0000-0000-0000-000000000003'', ''08:00:00'', 1),
    (''45000000-0000-0000-0000-000000000006'', ''20:00:00'', ''43000000-0000-0000-0000-000000000004'', ''13:00:00'', 3),
    (''45000000-0000-0000-0000-000000000007'', ''17:00:00'', ''43000000-0000-0000-0000-000000000005'', ''09:00:00'', 5)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'EndTime', N'ProfessionalId', N'StartTime', N'Weekday') AND [object_id] = OBJECT_ID(N'[profissional_horarios]'))
        SET IDENTITY_INSERT [profissional_horarios] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'ProfessionalId', N'ServiceId', N'CompensationType', N'CompensationValue') AND [object_id] = OBJECT_ID(N'[profissional_servicos]'))
        SET IDENTITY_INSERT [profissional_servicos] ON;
    EXEC(N'INSERT INTO [profissional_servicos] ([ProfessionalId], [ServiceId], [CompensationType], [CompensationValue])
    VALUES (''43000000-0000-0000-0000-000000000002'', ''20000000-0000-0000-0000-000000000001'', N''default_commission'', NULL),
    (''43000000-0000-0000-0000-000000000003'', ''20000000-0000-0000-0000-000000000003'', N''default_commission'', NULL),
    (''43000000-0000-0000-0000-000000000003'', ''20000000-0000-0000-0000-000000000004'', N''fixed_value'', 900.0),
    (''43000000-0000-0000-0000-000000000004'', ''20000000-0000-0000-0000-000000000005'', N''default_commission'', NULL),
    (''43000000-0000-0000-0000-000000000004'', ''20000000-0000-0000-0000-000000000006'', N''default_commission'', NULL),
    (''43000000-0000-0000-0000-000000000005'', ''20000000-0000-0000-0000-000000000007'', N''default_commission'', NULL),
    (''43000000-0000-0000-0000-000000000005'', ''20000000-0000-0000-0000-000000000008'', N''default_commission'', NULL)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'ProfessionalId', N'ServiceId', N'CompensationType', N'CompensationValue') AND [object_id] = OBJECT_ID(N'[profissional_servicos]'))
        SET IDENTITY_INSERT [profissional_servicos] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'EquipmentId', N'RoomId') AND [object_id] = OBJECT_ID(N'[sala_equipamentos]'))
        SET IDENTITY_INSERT [sala_equipamentos] ON;
    EXEC(N'INSERT INTO [sala_equipamentos] ([EquipmentId], [RoomId])
    VALUES (''31000000-0000-0000-0000-000000000001'', ''30000000-0000-0000-0000-000000000001''),
    (''31000000-0000-0000-0000-000000000002'', ''30000000-0000-0000-0000-000000000002''),
    (''31000000-0000-0000-0000-000000000003'', ''30000000-0000-0000-0000-000000000003''),
    (''31000000-0000-0000-0000-000000000004'', ''30000000-0000-0000-0000-000000000003'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'EquipmentId', N'RoomId') AND [object_id] = OBJECT_ID(N'[sala_equipamentos]'))
        SET IDENTITY_INSERT [sala_equipamentos] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'RoomId', N'ServiceId') AND [object_id] = OBJECT_ID(N'[sala_servicos]'))
        SET IDENTITY_INSERT [sala_servicos] ON;
    EXEC(N'INSERT INTO [sala_servicos] ([RoomId], [ServiceId])
    VALUES (''30000000-0000-0000-0000-000000000001'', ''20000000-0000-0000-0000-000000000001''),
    (''30000000-0000-0000-0000-000000000001'', ''20000000-0000-0000-0000-000000000005''),
    (''30000000-0000-0000-0000-000000000001'', ''20000000-0000-0000-0000-000000000006''),
    (''30000000-0000-0000-0000-000000000002'', ''20000000-0000-0000-0000-000000000002''),
    (''30000000-0000-0000-0000-000000000003'', ''20000000-0000-0000-0000-000000000003''),
    (''30000000-0000-0000-0000-000000000003'', ''20000000-0000-0000-0000-000000000004''),
    (''30000000-0000-0000-0000-000000000004'', ''20000000-0000-0000-0000-000000000007''),
    (''30000000-0000-0000-0000-000000000004'', ''20000000-0000-0000-0000-000000000008'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'RoomId', N'ServiceId') AND [object_id] = OBJECT_ID(N'[sala_servicos]'))
        SET IDENTITY_INSERT [sala_servicos] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'CategoryId', N'ServiceId') AND [object_id] = OBJECT_ID(N'[servico_categorias]'))
        SET IDENTITY_INSERT [servico_categorias] ON;
    EXEC(N'INSERT INTO [servico_categorias] ([CategoryId], [ServiceId])
    VALUES (''10000000-0000-0000-0000-000000000001'', ''20000000-0000-0000-0000-000000000001''),
    (''10000000-0000-0000-0000-000000000001'', ''20000000-0000-0000-0000-000000000002''),
    (''10000000-0000-0000-0000-000000000002'', ''20000000-0000-0000-0000-000000000003''),
    (''10000000-0000-0000-0000-000000000002'', ''20000000-0000-0000-0000-000000000004''),
    (''10000000-0000-0000-0000-000000000003'', ''20000000-0000-0000-0000-000000000005''),
    (''10000000-0000-0000-0000-000000000003'', ''20000000-0000-0000-0000-000000000006''),
    (''10000000-0000-0000-0000-000000000004'', ''20000000-0000-0000-0000-000000000007''),
    (''10000000-0000-0000-0000-000000000004'', ''20000000-0000-0000-0000-000000000008'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'CategoryId', N'ServiceId') AND [object_id] = OBJECT_ID(N'[servico_categorias]'))
        SET IDENTITY_INSERT [servico_categorias] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'RoleId', N'UserId') AND [object_id] = OBJECT_ID(N'[usuario_roles]'))
        SET IDENTITY_INSERT [usuario_roles] ON;
    EXEC(N'INSERT INTO [usuario_roles] ([RoleId], [UserId])
    VALUES (''40000000-0000-0000-0000-000000000001'', ''41000000-0000-0000-0000-000000000001''),
    (''40000000-0000-0000-0000-000000000002'', ''41000000-0000-0000-0000-000000000002''),
    (''40000000-0000-0000-0000-000000000003'', ''41000000-0000-0000-0000-000000000003''),
    (''40000000-0000-0000-0000-000000000004'', ''41000000-0000-0000-0000-000000000004'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'RoleId', N'UserId') AND [object_id] = OBJECT_ID(N'[usuario_roles]'))
        SET IDENTITY_INSERT [usuario_roles] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Date', N'DependentId', N'PatientId', N'ProfessionalId', N'ServiceId', N'Status', N'Time') AND [object_id] = OBJECT_ID(N'[agendamentos]'))
        SET IDENTITY_INSERT [agendamentos] ON;
    EXEC(N'INSERT INTO [agendamentos] ([Id], [Date], [DependentId], [PatientId], [ProfessionalId], [ServiceId], [Status], [Time])
    VALUES (''50000000-0000-0000-0000-000000000001'', ''2026-03-12'', NULL, ''42000000-0000-0000-0000-000000000001'', ''43000000-0000-0000-0000-000000000001'', ''20000000-0000-0000-0000-000000000001'', 4, ''10:00:00''),
    (''50000000-0000-0000-0000-000000000002'', ''2026-04-03'', NULL, ''42000000-0000-0000-0000-000000000001'', ''43000000-0000-0000-0000-000000000003'', ''20000000-0000-0000-0000-000000000003'', 4, ''14:00:00''),
    (''50000000-0000-0000-0000-000000000004'', ''2026-05-27'', NULL, ''42000000-0000-0000-0000-000000000001'', ''43000000-0000-0000-0000-000000000004'', ''20000000-0000-0000-0000-000000000005'', 2, ''15:00:00'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Date', N'DependentId', N'PatientId', N'ProfessionalId', N'ServiceId', N'Status', N'Time') AND [object_id] = OBJECT_ID(N'[agendamentos]'))
        SET IDENTITY_INSERT [agendamentos] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'BirthDate', N'FullName', N'PatientId', N'Relationship') AND [object_id] = OBJECT_ID(N'[dependentes]'))
        SET IDENTITY_INSERT [dependentes] ON;
    EXEC(N'INSERT INTO [dependentes] ([Id], [BirthDate], [FullName], [PatientId], [Relationship])
    VALUES (''42100000-0000-0000-0000-000000000001'', ''2016-08-12T00:00:00.0000000'', N''Lia Pires'', ''42000000-0000-0000-0000-000000000001'', N''Filha''),
    (''42100000-0000-0000-0000-000000000002'', ''2019-03-20T00:00:00.0000000'', N''Theo Pires'', ''42000000-0000-0000-0000-000000000001'', N''Filho'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'BirthDate', N'FullName', N'PatientId', N'Relationship') AND [object_id] = OBJECT_ID(N'[dependentes]'))
        SET IDENTITY_INSERT [dependentes] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'EndTime', N'ProfessionalId', N'StartTime', N'Weekday') AND [object_id] = OBJECT_ID(N'[profissional_horarios]'))
        SET IDENTITY_INSERT [profissional_horarios] ON;
    EXEC(N'INSERT INTO [profissional_horarios] ([Id], [EndTime], [ProfessionalId], [StartTime], [Weekday])
    VALUES (''45000000-0000-0000-0000-000000000001'', ''17:00:00'', ''43000000-0000-0000-0000-000000000001'', ''09:00:00'', 1),
    (''45000000-0000-0000-0000-000000000002'', ''17:00:00'', ''43000000-0000-0000-0000-000000000001'', ''09:00:00'', 3),
    (''45000000-0000-0000-0000-000000000003'', ''13:00:00'', ''43000000-0000-0000-0000-000000000001'', ''09:00:00'', 5)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'EndTime', N'ProfessionalId', N'StartTime', N'Weekday') AND [object_id] = OBJECT_ID(N'[profissional_horarios]'))
        SET IDENTITY_INSERT [profissional_horarios] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'ProfessionalId', N'ServiceId', N'CompensationType', N'CompensationValue') AND [object_id] = OBJECT_ID(N'[profissional_servicos]'))
        SET IDENTITY_INSERT [profissional_servicos] ON;
    EXEC(N'INSERT INTO [profissional_servicos] ([ProfessionalId], [ServiceId], [CompensationType], [CompensationValue])
    VALUES (''43000000-0000-0000-0000-000000000001'', ''20000000-0000-0000-0000-000000000001'', N''default_commission'', NULL),
    (''43000000-0000-0000-0000-000000000001'', ''20000000-0000-0000-0000-000000000002'', N''custom_percent'', 38.0)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'ProfessionalId', N'ServiceId', N'CompensationType', N'CompensationValue') AND [object_id] = OBJECT_ID(N'[profissional_servicos]'))
        SET IDENTITY_INSERT [profissional_servicos] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'AppointmentId', N'ChangedAt', N'ChangedByUserId', N'Status') AND [object_id] = OBJECT_ID(N'[agendamento_status_log]'))
        SET IDENTITY_INSERT [agendamento_status_log] ON;
    EXEC(N'INSERT INTO [agendamento_status_log] ([Id], [AppointmentId], [ChangedAt], [ChangedByUserId], [Status])
    VALUES (''51000000-0000-0000-0000-000000000001'', ''50000000-0000-0000-0000-000000000001'', ''2026-05-01T10:00:00.0000000'', ''41000000-0000-0000-0000-000000000003'', 4),
    (''51000000-0000-0000-0000-000000000002'', ''50000000-0000-0000-0000-000000000002'', ''2026-05-02T10:00:00.0000000'', ''41000000-0000-0000-0000-000000000003'', 4),
    (''51000000-0000-0000-0000-000000000004'', ''50000000-0000-0000-0000-000000000004'', ''2026-05-04T10:00:00.0000000'', ''41000000-0000-0000-0000-000000000003'', 2)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'AppointmentId', N'ChangedAt', N'ChangedByUserId', N'Status') AND [object_id] = OBJECT_ID(N'[agendamento_status_log]'))
        SET IDENTITY_INSERT [agendamento_status_log] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Date', N'DependentId', N'PatientId', N'ProfessionalId', N'ServiceId', N'Status', N'Time') AND [object_id] = OBJECT_ID(N'[agendamentos]'))
        SET IDENTITY_INSERT [agendamentos] ON;
    EXEC(N'INSERT INTO [agendamentos] ([Id], [Date], [DependentId], [PatientId], [ProfessionalId], [ServiceId], [Status], [Time])
    VALUES (''50000000-0000-0000-0000-000000000003'', ''2026-04-18'', ''42100000-0000-0000-0000-000000000001'', ''42000000-0000-0000-0000-000000000001'', ''43000000-0000-0000-0000-000000000005'', ''20000000-0000-0000-0000-000000000007'', 4, ''09:00:00''),
    (''50000000-0000-0000-0000-000000000005'', ''2026-06-02'', ''42100000-0000-0000-0000-000000000002'', ''42000000-0000-0000-0000-000000000001'', ''43000000-0000-0000-0000-000000000005'', ''20000000-0000-0000-0000-000000000008'', 1, ''11:00:00'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Date', N'DependentId', N'PatientId', N'ProfessionalId', N'ServiceId', N'Status', N'Time') AND [object_id] = OBJECT_ID(N'[agendamentos]'))
        SET IDENTITY_INSERT [agendamentos] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Amount', N'AppointmentId', N'Percent', N'ProfessionalId') AND [object_id] = OBJECT_ID(N'[comissoes]'))
        SET IDENTITY_INSERT [comissoes] ON;
    EXEC(N'INSERT INTO [comissoes] ([Id], [Amount], [AppointmentId], [Percent], [ProfessionalId])
    VALUES (''53000000-0000-0000-0000-000000000001'', 133.0, ''50000000-0000-0000-0000-000000000001'', 35.0, ''43000000-0000-0000-0000-000000000001''),
    (''53000000-0000-0000-0000-000000000002'', 380.0, ''50000000-0000-0000-0000-000000000002'', 40.0, ''43000000-0000-0000-0000-000000000003'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Amount', N'AppointmentId', N'Percent', N'ProfessionalId') AND [object_id] = OBJECT_ID(N'[comissoes]'))
        SET IDENTITY_INSERT [comissoes] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'AppointmentId', N'GrossAmount', N'Method', N'PaidAt') AND [object_id] = OBJECT_ID(N'[pagamentos]'))
        SET IDENTITY_INSERT [pagamentos] ON;
    EXEC(N'INSERT INTO [pagamentos] ([Id], [AppointmentId], [GrossAmount], [Method], [PaidAt])
    VALUES (''52000000-0000-0000-0000-000000000001'', ''50000000-0000-0000-0000-000000000001'', 380.0, N''Mercado Pago'', ''2026-03-12T10:45:00.0000000''),
    (''52000000-0000-0000-0000-000000000002'', ''50000000-0000-0000-0000-000000000002'', 950.0, N''Cartão'', ''2026-04-03T15:30:00.0000000'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'AppointmentId', N'GrossAmount', N'Method', N'PaidAt') AND [object_id] = OBJECT_ID(N'[pagamentos]'))
        SET IDENTITY_INSERT [pagamentos] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'AppointmentId', N'ChangedAt', N'ChangedByUserId', N'Status') AND [object_id] = OBJECT_ID(N'[agendamento_status_log]'))
        SET IDENTITY_INSERT [agendamento_status_log] ON;
    EXEC(N'INSERT INTO [agendamento_status_log] ([Id], [AppointmentId], [ChangedAt], [ChangedByUserId], [Status])
    VALUES (''51000000-0000-0000-0000-000000000003'', ''50000000-0000-0000-0000-000000000003'', ''2026-05-03T10:00:00.0000000'', ''41000000-0000-0000-0000-000000000003'', 4),
    (''51000000-0000-0000-0000-000000000005'', ''50000000-0000-0000-0000-000000000005'', ''2026-05-05T10:00:00.0000000'', ''41000000-0000-0000-0000-000000000003'', 1)');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'AppointmentId', N'ChangedAt', N'ChangedByUserId', N'Status') AND [object_id] = OBJECT_ID(N'[agendamento_status_log]'))
        SET IDENTITY_INSERT [agendamento_status_log] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_agendamento_status_log_AppointmentId] ON [agendamento_status_log] ([AppointmentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_agendamentos_DependentId] ON [agendamentos] ([DependentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_agendamentos_PatientId] ON [agendamentos] ([PatientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_agendamentos_ProfessionalId_Date_Time] ON [agendamentos] ([ProfessionalId], [Date], [Time]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_agendamentos_ServiceId] ON [agendamentos] ([ServiceId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_candidaturas_JobOpeningId] ON [candidaturas] ([JobOpeningId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_comissoes_AppointmentId] ON [comissoes] ([AppointmentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_comissoes_ProfessionalId] ON [comissoes] ([ProfessionalId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_configuracoes_Key] ON [configuracoes] ([Key]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_conversa_participantes_UserId] ON [conversa_participantes] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_dependentes_PatientId] ON [dependentes] ([PatientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_funcionarios_UserId] ON [funcionarios] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_impostos_servico_ServiceId] ON [impostos_servico] ([ServiceId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_log_movimento_EventType_CreatedAt] ON [log_movimento] ([EventType], [CreatedAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_mensagens_ConversationId_SentAt] ON [mensagens] ([ConversationId], [SentAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_notificacao_regras_TemplateId] ON [notificacao_regras] ([TemplateId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_pacientes_UserId] ON [pacientes] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_pagamentos_AppointmentId] ON [pagamentos] ([AppointmentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_plano_servicos_ServiceId] ON [plano_servicos] ([ServiceId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [IX_profissionais_UserId] ON [profissionais] ([UserId]) WHERE [UserId] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_profissional_horarios_ProfessionalId_Weekday] ON [profissional_horarios] ([ProfessionalId], [Weekday]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_profissional_servicos_ServiceId] ON [profissional_servicos] ([ServiceId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_roles_Name] ON [roles] ([Name]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_sala_equipamentos_EquipmentId] ON [sala_equipamentos] ([EquipmentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_sala_servicos_ServiceId] ON [sala_servicos] ([ServiceId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_servico_categorias_CategoryId] ON [servico_categorias] ([CategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_usuario_roles_RoleId] ON [usuario_roles] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_usuarios_Email] ON [usuarios] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520103118_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260520103118_InitialCreate', N'10.0.8');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520104809_Phase3AuthAndIntegration'
)
BEGIN
    CREATE TABLE [refresh_tokens] (
        [Id] uniqueidentifier NOT NULL,
        [UserId] uniqueidentifier NOT NULL,
        [TokenHash] nvarchar(500) NOT NULL,
        [ExpiresAt] datetime2 NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [RevokedAt] datetime2 NULL,
        [ReplacedByTokenHash] nvarchar(500) NULL,
        CONSTRAINT [PK_refresh_tokens] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_refresh_tokens_usuarios_UserId] FOREIGN KEY ([UserId]) REFERENCES [usuarios] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520104809_Phase3AuthAndIntegration'
)
BEGIN
    CREATE UNIQUE INDEX [IX_refresh_tokens_TokenHash] ON [refresh_tokens] ([TokenHash]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520104809_Phase3AuthAndIntegration'
)
BEGIN
    CREATE INDEX [IX_refresh_tokens_UserId_ExpiresAt] ON [refresh_tokens] ([UserId], [ExpiresAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260520104809_Phase3AuthAndIntegration'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260520104809_Phase3AuthAndIntegration', N'10.0.8');
END;

COMMIT;
GO

