using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Aio.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class Phase4ServicesProsAgendaClinic : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "servicos",
                type: "nvarchar(16)",
                maxLength: 16,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "DefaultRoomId",
                table: "servicos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "servicos",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "OnlineBooking",
                table: "servicos",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "Preparation",
                table: "servicos",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "RequiresRoom",
                table: "servicos",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ShowDuration",
                table: "servicos",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<bool>(
                name: "ShowPrice",
                table: "servicos",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "salas",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "salas",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "salas",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<decimal>(
                name: "CompensationValue",
                table: "profissional_servicos",
                type: "decimal(12,2)",
                precision: 12,
                scale: 2,
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CouncilType",
                table: "profissionais",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "profissionais",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "profissionais",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "Languages",
                table: "profissionais",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LicenseNumber",
                table: "profissionais",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Phone",
                table: "profissionais",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "CustomPrice",
                table: "plano_servicos",
                type: "decimal(12,2)",
                precision: 12,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "ShowPrice",
                table: "plano_servicos",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "pacientes",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "pacientes",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Cpf",
                table: "pacientes",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "pacientes",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "pacientes",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PostalCode",
                table: "pacientes",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "State",
                table: "pacientes",
                type: "nvarchar(40)",
                maxLength: 40,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "equipamentos",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "Location",
                table: "equipamentos",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "MaintenanceDate",
                table: "equipamentos",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SerialNumber",
                table: "equipamentos",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "equipamentos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "categorias",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "categorias",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ParentId",
                table: "categorias",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CancellationSource",
                table: "agendamentos",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CancelledAt",
                table: "agendamentos",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "agendamentos",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "agendamentos",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "PatientConfirmation",
                table: "agendamentos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "PlanId",
                table: "agendamentos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "RecurrenceGroupId",
                table: "agendamentos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "RoomId",
                table: "agendamentos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "agendamentos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "agendamento_equipamentos",
                columns: table => new
                {
                    AppointmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EquipmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_agendamento_equipamentos", x => new { x.AppointmentId, x.EquipmentId });
                    table.ForeignKey(
                        name: "FK_agendamento_equipamentos_agendamentos_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "agendamentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_agendamento_equipamentos_equipamentos_EquipmentId",
                        column: x => x.EquipmentId,
                        principalTable: "equipamentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "clinica",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Cnpj = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    GmailClientId = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    GmailClientSecret = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    GmailAccessToken = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    GmailRefreshToken = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    GmailTokenExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    GmailConnected = table.Column<bool>(type: "bit", nullable: false),
                    PubSubProjectId = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    PubSubTopicName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    PubSubServiceAccount = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    PubSubConnected = table.Column<bool>(type: "bit", nullable: false),
                    MpAccessTokenProd = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MpAccessTokenSandbox = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    MpPublicKey = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    MpWebhookSecret = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    MpSandboxMode = table.Column<bool>(type: "bit", nullable: false),
                    MpConnected = table.Column<bool>(type: "bit", nullable: false),
                    WaPhoneNumberId = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    WaWabaId = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    WaAccessToken = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    WaVerifyToken = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    WaAppSecret = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    WaConnected = table.Column<bool>(type: "bit", nullable: false),
                    SmtpHost = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    SmtpPort = table.Column<int>(type: "int", nullable: true),
                    SmtpUsername = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    SmtpPassword = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    SmtpFrom = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    SmtpConnected = table.Column<bool>(type: "bit", nullable: false),
                    ResendApiKey = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ResendFromEmail = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    ResendFromName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    ResendConnected = table.Column<bool>(type: "bit", nullable: false),
                    IgAccountId = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    IgPageId = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    IgAccessToken = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    IgAppSecret = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    IgVerifyToken = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    IgConnected = table.Column<bool>(type: "bit", nullable: false),
                    RemindersEnabled = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_clinica", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "profissional_bloqueios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProfessionalId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StartAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_profissional_bloqueios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_profissional_bloqueios_profissionais_ProfessionalId",
                        column: x => x.ProfessionalId,
                        principalTable: "profissionais",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "profissional_categorias",
                columns: table => new
                {
                    ProfessionalId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_profissional_categorias", x => new { x.ProfessionalId, x.CategoryId });
                    table.ForeignKey(
                        name: "FK_profissional_categorias_categorias_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "categorias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_profissional_categorias_profissionais_ProfessionalId",
                        column: x => x.ProfessionalId,
                        principalTable: "profissionais",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "prontuarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PatientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BloodType = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Allergies = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    ChronicConditions = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    CurrentMedications = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    FamilyHistory = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    SurgicalHistory = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Habits = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    HeightCm = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    WeightKg = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_prontuarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_prontuarios_pacientes_PatientId",
                        column: x => x.PatientId,
                        principalTable: "pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "servico_equipamentos",
                columns: table => new
                {
                    ServiceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EquipmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Required = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_servico_equipamentos", x => new { x.ServiceId, x.EquipmentId });
                    table.ForeignKey(
                        name: "FK_servico_equipamentos_equipamentos_EquipmentId",
                        column: x => x.EquipmentId,
                        principalTable: "equipamentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_servico_equipamentos_servicos_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "servicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "evolucoes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MedicalRecordId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AppointmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProfessionalId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChiefComplaint = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Subjective = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Objective = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Assessment = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Plan = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Diagnosis = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    DiagnosisCode = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Prescription = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    VitalSignsJson = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    IsSigned = table.Column<bool>(type: "bit", nullable: false),
                    SignedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_evolucoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_evolucoes_agendamentos_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "agendamentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_evolucoes_profissionais_ProfessionalId",
                        column: x => x.ProfessionalId,
                        principalTable: "profissionais",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_evolucoes_prontuarios_MedicalRecordId",
                        column: x => x.MedicalRecordId,
                        principalTable: "prontuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "prontuario_anexos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MedicalRecordId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    FileUrl = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    FileType = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    UploadedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_prontuario_anexos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_prontuario_anexos_prontuarios_MedicalRecordId",
                        column: x => x.MedicalRecordId,
                        principalTable: "prontuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "agendamentos",
                keyColumn: "Id",
                keyValue: new Guid("50000000-0000-0000-0000-000000000001"),
                columns: new[] { "CancellationSource", "CancelledAt", "CreatedAt", "Notes", "PatientConfirmation", "PlanId", "RecurrenceGroupId", "RoomId", "Type" },
                values: new object[] { null, null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", 0, null, null, null, 0 });

            migrationBuilder.UpdateData(
                table: "agendamentos",
                keyColumn: "Id",
                keyValue: new Guid("50000000-0000-0000-0000-000000000002"),
                columns: new[] { "CancellationSource", "CancelledAt", "CreatedAt", "Notes", "PatientConfirmation", "PlanId", "RecurrenceGroupId", "RoomId", "Type" },
                values: new object[] { null, null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", 0, null, null, null, 0 });

            migrationBuilder.UpdateData(
                table: "agendamentos",
                keyColumn: "Id",
                keyValue: new Guid("50000000-0000-0000-0000-000000000003"),
                columns: new[] { "CancellationSource", "CancelledAt", "CreatedAt", "Notes", "PatientConfirmation", "PlanId", "RecurrenceGroupId", "RoomId", "Type" },
                values: new object[] { null, null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", 0, null, null, null, 0 });

            migrationBuilder.UpdateData(
                table: "agendamentos",
                keyColumn: "Id",
                keyValue: new Guid("50000000-0000-0000-0000-000000000004"),
                columns: new[] { "CancellationSource", "CancelledAt", "CreatedAt", "Notes", "PatientConfirmation", "PlanId", "RecurrenceGroupId", "RoomId", "Type" },
                values: new object[] { null, null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", 0, null, null, null, 0 });

            migrationBuilder.UpdateData(
                table: "agendamentos",
                keyColumn: "Id",
                keyValue: new Guid("50000000-0000-0000-0000-000000000005"),
                columns: new[] { "CancellationSource", "CancelledAt", "CreatedAt", "Notes", "PatientConfirmation", "PlanId", "RecurrenceGroupId", "RoomId", "Type" },
                values: new object[] { null, null, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "", 0, null, null, null, 0 });

            migrationBuilder.UpdateData(
                table: "categorias",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000001"),
                columns: new[] { "Description", "IsActive", "ParentId" },
                values: new object[] { "", true, null });

            migrationBuilder.UpdateData(
                table: "categorias",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000002"),
                columns: new[] { "Description", "IsActive", "ParentId" },
                values: new object[] { "", true, null });

            migrationBuilder.UpdateData(
                table: "categorias",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000003"),
                columns: new[] { "Description", "IsActive", "ParentId" },
                values: new object[] { "", true, null });

            migrationBuilder.UpdateData(
                table: "categorias",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000004"),
                columns: new[] { "Description", "IsActive", "ParentId" },
                values: new object[] { "", true, null });

            migrationBuilder.UpdateData(
                table: "categorias",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000005"),
                columns: new[] { "Description", "IsActive", "ParentId" },
                values: new object[] { "", true, null });

            migrationBuilder.UpdateData(
                table: "categorias",
                keyColumn: "Id",
                keyValue: new Guid("10000000-0000-0000-0000-000000000006"),
                columns: new[] { "Description", "IsActive", "ParentId" },
                values: new object[] { "", true, null });

            migrationBuilder.InsertData(
                table: "clinica",
                columns: new[] { "Id", "Cnpj", "CreatedAt", "Email", "GmailAccessToken", "GmailClientId", "GmailClientSecret", "GmailConnected", "GmailRefreshToken", "GmailTokenExpiresAt", "IgAccessToken", "IgAccountId", "IgAppSecret", "IgConnected", "IgPageId", "IgVerifyToken", "MpAccessTokenProd", "MpAccessTokenSandbox", "MpConnected", "MpPublicKey", "MpSandboxMode", "MpWebhookSecret", "Name", "Phone", "PubSubConnected", "PubSubProjectId", "PubSubServiceAccount", "PubSubTopicName", "RemindersEnabled", "ResendApiKey", "ResendConnected", "ResendFromEmail", "ResendFromName", "SmtpConnected", "SmtpFrom", "SmtpHost", "SmtpPassword", "SmtpPort", "SmtpUsername", "UpdatedAt", "WaAccessToken", "WaAppSecret", "WaConnected", "WaPhoneNumberId", "WaVerifyToken", "WaWabaId" },
                values: new object[] { new Guid("65000000-0000-0000-0000-000000000001"), "", new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "contato@aio.com", null, null, null, false, null, null, null, null, null, false, null, null, null, null, false, null, true, null, "Clínica Aurora", "(11) 99999-0000", false, null, null, null, true, null, false, null, null, false, null, null, null, null, null, null, null, null, false, null, null, null });

            migrationBuilder.UpdateData(
                table: "equipamentos",
                keyColumn: "Id",
                keyValue: new Guid("31000000-0000-0000-0000-000000000001"),
                columns: new[] { "IsActive", "Location", "MaintenanceDate", "SerialNumber", "Status" },
                values: new object[] { true, "", null, "", 0 });

            migrationBuilder.UpdateData(
                table: "equipamentos",
                keyColumn: "Id",
                keyValue: new Guid("31000000-0000-0000-0000-000000000002"),
                columns: new[] { "IsActive", "Location", "MaintenanceDate", "SerialNumber", "Status" },
                values: new object[] { true, "", null, "", 0 });

            migrationBuilder.UpdateData(
                table: "equipamentos",
                keyColumn: "Id",
                keyValue: new Guid("31000000-0000-0000-0000-000000000003"),
                columns: new[] { "IsActive", "Location", "MaintenanceDate", "SerialNumber", "Status" },
                values: new object[] { true, "", null, "", 0 });

            migrationBuilder.UpdateData(
                table: "equipamentos",
                keyColumn: "Id",
                keyValue: new Guid("31000000-0000-0000-0000-000000000004"),
                columns: new[] { "IsActive", "Location", "MaintenanceDate", "SerialNumber", "Status" },
                values: new object[] { true, "", null, "", 0 });

            migrationBuilder.UpdateData(
                table: "pacientes",
                keyColumn: "Id",
                keyValue: new Guid("42000000-0000-0000-0000-000000000001"),
                columns: new[] { "Address", "City", "Cpf", "IsActive", "Notes", "PostalCode", "State" },
                values: new object[] { "", "", "", true, "", "", "" });

            migrationBuilder.UpdateData(
                table: "plano_servicos",
                keyColumns: new[] { "PlanId", "ServiceId" },
                keyValues: new object[] { new Guid("59000000-0000-0000-0000-000000000001"), new Guid("20000000-0000-0000-0000-000000000001") },
                columns: new[] { "CustomPrice", "ShowPrice" },
                values: new object[] { null, true });

            migrationBuilder.UpdateData(
                table: "plano_servicos",
                keyColumns: new[] { "PlanId", "ServiceId" },
                keyValues: new object[] { new Guid("59000000-0000-0000-0000-000000000001"), new Guid("20000000-0000-0000-0000-000000000006") },
                columns: new[] { "CustomPrice", "ShowPrice" },
                values: new object[] { null, true });

            migrationBuilder.UpdateData(
                table: "profissionais",
                keyColumn: "Id",
                keyValue: new Guid("43000000-0000-0000-0000-000000000001"),
                columns: new[] { "CouncilType", "Email", "IsActive", "Languages", "LicenseNumber", "Phone" },
                values: new object[] { "", "", true, "", "", "" });

            migrationBuilder.UpdateData(
                table: "profissionais",
                keyColumn: "Id",
                keyValue: new Guid("43000000-0000-0000-0000-000000000002"),
                columns: new[] { "CouncilType", "Email", "IsActive", "Languages", "LicenseNumber", "Phone" },
                values: new object[] { "", "", true, "", "", "" });

            migrationBuilder.UpdateData(
                table: "profissionais",
                keyColumn: "Id",
                keyValue: new Guid("43000000-0000-0000-0000-000000000003"),
                columns: new[] { "CouncilType", "Email", "IsActive", "Languages", "LicenseNumber", "Phone" },
                values: new object[] { "", "", true, "", "", "" });

            migrationBuilder.UpdateData(
                table: "profissionais",
                keyColumn: "Id",
                keyValue: new Guid("43000000-0000-0000-0000-000000000004"),
                columns: new[] { "CouncilType", "Email", "IsActive", "Languages", "LicenseNumber", "Phone" },
                values: new object[] { "", "", true, "", "", "" });

            migrationBuilder.UpdateData(
                table: "profissionais",
                keyColumn: "Id",
                keyValue: new Guid("43000000-0000-0000-0000-000000000005"),
                columns: new[] { "CouncilType", "Email", "IsActive", "Languages", "LicenseNumber", "Phone" },
                values: new object[] { "", "", true, "", "", "" });

            migrationBuilder.UpdateData(
                table: "profissionais",
                keyColumn: "Id",
                keyValue: new Guid("43000000-0000-0000-0000-000000000006"),
                columns: new[] { "CouncilType", "Email", "IsActive", "Languages", "LicenseNumber", "Phone" },
                values: new object[] { "", "", true, "", "", "" });

            migrationBuilder.UpdateData(
                table: "profissionais",
                keyColumn: "Id",
                keyValue: new Guid("43000000-0000-0000-0000-000000000007"),
                columns: new[] { "CouncilType", "Email", "IsActive", "Languages", "LicenseNumber", "Phone" },
                values: new object[] { "", "", true, "", "", "" });

            migrationBuilder.UpdateData(
                table: "salas",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000001"),
                columns: new[] { "Description", "IsActive", "Location" },
                values: new object[] { "", true, "" });

            migrationBuilder.UpdateData(
                table: "salas",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000002"),
                columns: new[] { "Description", "IsActive", "Location" },
                values: new object[] { "", true, "" });

            migrationBuilder.UpdateData(
                table: "salas",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000003"),
                columns: new[] { "Description", "IsActive", "Location" },
                values: new object[] { "", true, "" });

            migrationBuilder.UpdateData(
                table: "salas",
                keyColumn: "Id",
                keyValue: new Guid("30000000-0000-0000-0000-000000000004"),
                columns: new[] { "Description", "IsActive", "Location" },
                values: new object[] { "", true, "" });

            migrationBuilder.InsertData(
                table: "servico_equipamentos",
                columns: new[] { "EquipmentId", "ServiceId", "Required" },
                values: new object[,]
                {
                    { new Guid("31000000-0000-0000-0000-000000000001"), new Guid("20000000-0000-0000-0000-000000000001"), true },
                    { new Guid("31000000-0000-0000-0000-000000000002"), new Guid("20000000-0000-0000-0000-000000000002"), true },
                    { new Guid("31000000-0000-0000-0000-000000000003"), new Guid("20000000-0000-0000-0000-000000000003"), true },
                    { new Guid("31000000-0000-0000-0000-000000000004"), new Guid("20000000-0000-0000-0000-000000000004"), true }
                });

            migrationBuilder.UpdateData(
                table: "servicos",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000001"),
                columns: new[] { "Color", "DefaultRoomId", "IsActive", "OnlineBooking", "Preparation", "RequiresRoom", "ShowDuration", "ShowPrice" },
                values: new object[] { "#C2410C", null, true, true, "", false, true, true });

            migrationBuilder.UpdateData(
                table: "servicos",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000002"),
                columns: new[] { "Color", "DefaultRoomId", "IsActive", "OnlineBooking", "Preparation", "RequiresRoom", "ShowDuration", "ShowPrice" },
                values: new object[] { "#C2410C", null, true, true, "", false, true, true });

            migrationBuilder.UpdateData(
                table: "servicos",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000003"),
                columns: new[] { "Color", "DefaultRoomId", "IsActive", "OnlineBooking", "Preparation", "RequiresRoom", "ShowDuration", "ShowPrice" },
                values: new object[] { "#C2410C", null, true, true, "", false, true, true });

            migrationBuilder.UpdateData(
                table: "servicos",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000004"),
                columns: new[] { "Color", "DefaultRoomId", "IsActive", "OnlineBooking", "Preparation", "RequiresRoom", "ShowDuration", "ShowPrice" },
                values: new object[] { "#C2410C", null, true, true, "", false, true, true });

            migrationBuilder.UpdateData(
                table: "servicos",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000005"),
                columns: new[] { "Color", "DefaultRoomId", "IsActive", "OnlineBooking", "Preparation", "RequiresRoom", "ShowDuration", "ShowPrice" },
                values: new object[] { "#C2410C", null, true, true, "", false, true, true });

            migrationBuilder.UpdateData(
                table: "servicos",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000006"),
                columns: new[] { "Color", "DefaultRoomId", "IsActive", "OnlineBooking", "Preparation", "RequiresRoom", "ShowDuration", "ShowPrice" },
                values: new object[] { "#C2410C", null, true, true, "", false, true, true });

            migrationBuilder.UpdateData(
                table: "servicos",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000007"),
                columns: new[] { "Color", "DefaultRoomId", "IsActive", "OnlineBooking", "Preparation", "RequiresRoom", "ShowDuration", "ShowPrice" },
                values: new object[] { "#C2410C", null, true, true, "", false, true, true });

            migrationBuilder.UpdateData(
                table: "servicos",
                keyColumn: "Id",
                keyValue: new Guid("20000000-0000-0000-0000-000000000008"),
                columns: new[] { "Color", "DefaultRoomId", "IsActive", "OnlineBooking", "Preparation", "RequiresRoom", "ShowDuration", "ShowPrice" },
                values: new object[] { "#C2410C", null, true, true, "", false, true, true });

            migrationBuilder.CreateIndex(
                name: "IX_servicos_DefaultRoomId",
                table: "servicos",
                column: "DefaultRoomId");

            migrationBuilder.CreateIndex(
                name: "IX_pacientes_Cpf",
                table: "pacientes",
                column: "Cpf");

            migrationBuilder.CreateIndex(
                name: "IX_categorias_ParentId",
                table: "categorias",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_agendamentos_PlanId",
                table: "agendamentos",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_agendamentos_RecurrenceGroupId",
                table: "agendamentos",
                column: "RecurrenceGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_agendamentos_RoomId",
                table: "agendamentos",
                column: "RoomId");

            migrationBuilder.CreateIndex(
                name: "IX_agendamento_equipamentos_EquipmentId",
                table: "agendamento_equipamentos",
                column: "EquipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_evolucoes_AppointmentId",
                table: "evolucoes",
                column: "AppointmentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_evolucoes_MedicalRecordId",
                table: "evolucoes",
                column: "MedicalRecordId");

            migrationBuilder.CreateIndex(
                name: "IX_evolucoes_ProfessionalId",
                table: "evolucoes",
                column: "ProfessionalId");

            migrationBuilder.CreateIndex(
                name: "IX_profissional_bloqueios_ProfessionalId_StartAt_EndAt",
                table: "profissional_bloqueios",
                columns: new[] { "ProfessionalId", "StartAt", "EndAt" });

            migrationBuilder.CreateIndex(
                name: "IX_profissional_categorias_CategoryId",
                table: "profissional_categorias",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_prontuario_anexos_MedicalRecordId",
                table: "prontuario_anexos",
                column: "MedicalRecordId");

            migrationBuilder.CreateIndex(
                name: "IX_prontuarios_PatientId",
                table: "prontuarios",
                column: "PatientId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_servico_equipamentos_EquipmentId",
                table: "servico_equipamentos",
                column: "EquipmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_agendamentos_planos_PlanId",
                table: "agendamentos",
                column: "PlanId",
                principalTable: "planos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_agendamentos_salas_RoomId",
                table: "agendamentos",
                column: "RoomId",
                principalTable: "salas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_categorias_categorias_ParentId",
                table: "categorias",
                column: "ParentId",
                principalTable: "categorias",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_servicos_salas_DefaultRoomId",
                table: "servicos",
                column: "DefaultRoomId",
                principalTable: "salas",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_agendamentos_planos_PlanId",
                table: "agendamentos");

            migrationBuilder.DropForeignKey(
                name: "FK_agendamentos_salas_RoomId",
                table: "agendamentos");

            migrationBuilder.DropForeignKey(
                name: "FK_categorias_categorias_ParentId",
                table: "categorias");

            migrationBuilder.DropForeignKey(
                name: "FK_servicos_salas_DefaultRoomId",
                table: "servicos");

            migrationBuilder.DropTable(
                name: "agendamento_equipamentos");

            migrationBuilder.DropTable(
                name: "clinica");

            migrationBuilder.DropTable(
                name: "evolucoes");

            migrationBuilder.DropTable(
                name: "profissional_bloqueios");

            migrationBuilder.DropTable(
                name: "profissional_categorias");

            migrationBuilder.DropTable(
                name: "prontuario_anexos");

            migrationBuilder.DropTable(
                name: "servico_equipamentos");

            migrationBuilder.DropTable(
                name: "prontuarios");

            migrationBuilder.DropIndex(
                name: "IX_servicos_DefaultRoomId",
                table: "servicos");

            migrationBuilder.DropIndex(
                name: "IX_pacientes_Cpf",
                table: "pacientes");

            migrationBuilder.DropIndex(
                name: "IX_categorias_ParentId",
                table: "categorias");

            migrationBuilder.DropIndex(
                name: "IX_agendamentos_PlanId",
                table: "agendamentos");

            migrationBuilder.DropIndex(
                name: "IX_agendamentos_RecurrenceGroupId",
                table: "agendamentos");

            migrationBuilder.DropIndex(
                name: "IX_agendamentos_RoomId",
                table: "agendamentos");

            migrationBuilder.DropColumn(
                name: "Color",
                table: "servicos");

            migrationBuilder.DropColumn(
                name: "DefaultRoomId",
                table: "servicos");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "servicos");

            migrationBuilder.DropColumn(
                name: "OnlineBooking",
                table: "servicos");

            migrationBuilder.DropColumn(
                name: "Preparation",
                table: "servicos");

            migrationBuilder.DropColumn(
                name: "RequiresRoom",
                table: "servicos");

            migrationBuilder.DropColumn(
                name: "ShowDuration",
                table: "servicos");

            migrationBuilder.DropColumn(
                name: "ShowPrice",
                table: "servicos");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "salas");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "salas");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "salas");

            migrationBuilder.DropColumn(
                name: "CouncilType",
                table: "profissionais");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "profissionais");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "profissionais");

            migrationBuilder.DropColumn(
                name: "Languages",
                table: "profissionais");

            migrationBuilder.DropColumn(
                name: "LicenseNumber",
                table: "profissionais");

            migrationBuilder.DropColumn(
                name: "Phone",
                table: "profissionais");

            migrationBuilder.DropColumn(
                name: "CustomPrice",
                table: "plano_servicos");

            migrationBuilder.DropColumn(
                name: "ShowPrice",
                table: "plano_servicos");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "pacientes");

            migrationBuilder.DropColumn(
                name: "City",
                table: "pacientes");

            migrationBuilder.DropColumn(
                name: "Cpf",
                table: "pacientes");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "pacientes");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "pacientes");

            migrationBuilder.DropColumn(
                name: "PostalCode",
                table: "pacientes");

            migrationBuilder.DropColumn(
                name: "State",
                table: "pacientes");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "equipamentos");

            migrationBuilder.DropColumn(
                name: "Location",
                table: "equipamentos");

            migrationBuilder.DropColumn(
                name: "MaintenanceDate",
                table: "equipamentos");

            migrationBuilder.DropColumn(
                name: "SerialNumber",
                table: "equipamentos");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "equipamentos");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "categorias");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "categorias");

            migrationBuilder.DropColumn(
                name: "ParentId",
                table: "categorias");

            migrationBuilder.DropColumn(
                name: "CancellationSource",
                table: "agendamentos");

            migrationBuilder.DropColumn(
                name: "CancelledAt",
                table: "agendamentos");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "agendamentos");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "agendamentos");

            migrationBuilder.DropColumn(
                name: "PatientConfirmation",
                table: "agendamentos");

            migrationBuilder.DropColumn(
                name: "PlanId",
                table: "agendamentos");

            migrationBuilder.DropColumn(
                name: "RecurrenceGroupId",
                table: "agendamentos");

            migrationBuilder.DropColumn(
                name: "RoomId",
                table: "agendamentos");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "agendamentos");

            migrationBuilder.AlterColumn<decimal>(
                name: "CompensationValue",
                table: "profissional_servicos",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(12,2)",
                oldPrecision: 12,
                oldScale: 2,
                oldNullable: true);
        }
    }
}
