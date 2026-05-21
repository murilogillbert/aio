using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Aio.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "banco_talentos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Candidate = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_banco_talentos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "banners",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Subtitle = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    CtaText = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    CtaUrl = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    Active = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_banners", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "canais_mensageria",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    ParticipantRule = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_canais_mensageria", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "categorias",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_categorias", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "configuracoes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Key = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    ValueType = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_configuracoes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "conversas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Channel = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_conversas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "custos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MonthLabel = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Value = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_custos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "equipamentos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    UnitValue = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_equipamentos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "galeria_sobre",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_galeria_sobre", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "log_movimento",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_log_movimento", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "marcos_historicos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    YearLabel = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_marcos_historicos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "metricas_snapshot",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    MonthLabel = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Revenue = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    Profit = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    Appointments = table.Column<int>(type: "int", nullable: false),
                    TicketAverage = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    OccupancyRate = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    CancellationRate = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    NewPatients = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_metricas_snapshot", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "mvv",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Mission = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Vision = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Values = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mvv", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "planos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_planos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "roles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "salas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_salas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "servicos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    ShortDescription = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    BasePrice = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_servicos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "templates_mensagem",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Occasion = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Channel = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Body = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_templates_mensagem", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "usuarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "vagas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Department = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_vagas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "mensagens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AuthorUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    AuthorName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Channel = table.Column<int>(type: "int", nullable: false),
                    Body = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    SentAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_mensagens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_mensagens_conversas_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "conversas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "sala_equipamentos",
                columns: table => new
                {
                    RoomId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EquipmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sala_equipamentos", x => new { x.RoomId, x.EquipmentId });
                    table.ForeignKey(
                        name: "FK_sala_equipamentos_equipamentos_EquipmentId",
                        column: x => x.EquipmentId,
                        principalTable: "equipamentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sala_equipamentos_salas_RoomId",
                        column: x => x.RoomId,
                        principalTable: "salas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "impostos_servico",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServiceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Percent = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_impostos_servico", x => x.Id);
                    table.ForeignKey(
                        name: "FK_impostos_servico_servicos_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "servicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "plano_servicos",
                columns: table => new
                {
                    PlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServiceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CoverageRule = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_plano_servicos", x => new { x.PlanId, x.ServiceId });
                    table.ForeignKey(
                        name: "FK_plano_servicos_planos_PlanId",
                        column: x => x.PlanId,
                        principalTable: "planos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_plano_servicos_servicos_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "servicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "sala_servicos",
                columns: table => new
                {
                    RoomId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServiceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_sala_servicos", x => new { x.RoomId, x.ServiceId });
                    table.ForeignKey(
                        name: "FK_sala_servicos_salas_RoomId",
                        column: x => x.RoomId,
                        principalTable: "salas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_sala_servicos_servicos_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "servicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "servico_categorias",
                columns: table => new
                {
                    ServiceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_servico_categorias", x => new { x.ServiceId, x.CategoryId });
                    table.ForeignKey(
                        name: "FK_servico_categorias_categorias_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "categorias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_servico_categorias_servicos_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "servicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "notificacao_regras",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Trigger = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    LeadTime = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Channel = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    TemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Active = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_notificacao_regras", x => x.Id);
                    table.ForeignKey(
                        name: "FK_notificacao_regras_templates_mensagem_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "templates_mensagem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "conversa_participantes",
                columns: table => new
                {
                    ConversationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_conversa_participantes", x => new { x.ConversationId, x.UserId });
                    table.ForeignKey(
                        name: "FK_conversa_participantes_conversas_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "conversas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_conversa_participantes_usuarios_UserId",
                        column: x => x.UserId,
                        principalTable: "usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "funcionarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Department = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    MonthlySalary = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_funcionarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_funcionarios_usuarios_UserId",
                        column: x => x.UserId,
                        principalTable: "usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "pacientes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    BirthDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pacientes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_pacientes_usuarios_UserId",
                        column: x => x.UserId,
                        principalTable: "usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "profissionais",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    PhotoUrl = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Bio = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Specialty = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    DefaultCommissionPercent = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    MonthlyFixedPayment = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: true),
                    ProvidesCare = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_profissionais", x => x.Id);
                    table.ForeignKey(
                        name: "FK_profissionais_usuarios_UserId",
                        column: x => x.UserId,
                        principalTable: "usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "usuario_roles",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoleId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuario_roles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_usuario_roles_roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_usuario_roles_usuarios_UserId",
                        column: x => x.UserId,
                        principalTable: "usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "candidaturas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    JobOpeningId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Candidate = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_candidaturas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_candidaturas_vagas_JobOpeningId",
                        column: x => x.JobOpeningId,
                        principalTable: "vagas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "dependentes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PatientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    BirthDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Relationship = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_dependentes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_dependentes_pacientes_PatientId",
                        column: x => x.PatientId,
                        principalTable: "pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "profissional_horarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProfessionalId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Weekday = table.Column<int>(type: "int", nullable: false),
                    StartTime = table.Column<TimeOnly>(type: "time", nullable: false),
                    EndTime = table.Column<TimeOnly>(type: "time", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_profissional_horarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_profissional_horarios_profissionais_ProfessionalId",
                        column: x => x.ProfessionalId,
                        principalTable: "profissionais",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "profissional_servicos",
                columns: table => new
                {
                    ProfessionalId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServiceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CompensationType = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    CompensationValue = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_profissional_servicos", x => new { x.ProfessionalId, x.ServiceId });
                    table.ForeignKey(
                        name: "FK_profissional_servicos_profissionais_ProfessionalId",
                        column: x => x.ProfessionalId,
                        principalTable: "profissionais",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_profissional_servicos_servicos_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "servicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "agendamentos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PatientId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DependentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    ProfessionalId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServiceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    Time = table.Column<TimeOnly>(type: "time", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_agendamentos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_agendamentos_dependentes_DependentId",
                        column: x => x.DependentId,
                        principalTable: "dependentes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_agendamentos_pacientes_PatientId",
                        column: x => x.PatientId,
                        principalTable: "pacientes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_agendamentos_profissionais_ProfessionalId",
                        column: x => x.ProfessionalId,
                        principalTable: "profissionais",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_agendamentos_servicos_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "servicos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "agendamento_status_log",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AppointmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ChangedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_agendamento_status_log", x => x.Id);
                    table.ForeignKey(
                        name: "FK_agendamento_status_log_agendamentos_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "agendamentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "comissoes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AppointmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ProfessionalId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    Percent = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_comissoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_comissoes_agendamentos_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "agendamentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_comissoes_profissionais_ProfessionalId",
                        column: x => x.ProfessionalId,
                        principalTable: "profissionais",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "pagamentos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AppointmentId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GrossAmount = table.Column<decimal>(type: "decimal(12,2)", precision: 12, scale: 2, nullable: false),
                    Method = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    PaidAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pagamentos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_pagamentos_agendamentos_AppointmentId",
                        column: x => x.AppointmentId,
                        principalTable: "agendamentos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "banco_talentos",
                columns: new[] { "Id", "Candidate", "CreatedAt", "Email", "Message" },
                values: new object[] { new Guid("5c000000-0000-0000-0000-000000000001"), "Carla Souza", new DateTime(2026, 5, 9, 0, 0, 0, 0, DateTimeKind.Unspecified), "carla@example.com", "Gostaria de entrar no banco de talentos." });

            migrationBuilder.InsertData(
                table: "banners",
                columns: new[] { "Id", "Active", "CtaText", "CtaUrl", "ImageUrl", "SortOrder", "Subtitle", "Title" },
                values: new object[,]
                {
                    { new Guid("61000000-0000-0000-0000-000000000001"), true, "Agendar avaliação", "/agendar", "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=80", 1, "Serviços especializados, profissionais selecionados e acompanhamento próximo em cada etapa.", "Cuidado premium com agenda inteligente" },
                    { new Guid("61000000-0000-0000-0000-000000000002"), true, "Conhecer serviços", "/servicos", "https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=1600&q=80", 2, "Fluxos pensados para reduzir espera, organizar mensagens e manter seu plano de cuidado visível.", "Experiência acolhedora do primeiro contato ao retorno" },
                    { new Guid("61000000-0000-0000-0000-000000000003"), true, "Ver profissionais", "/profissionais", "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=1600&q=80", 3, "Profissionais habilitados para tratamentos avançados, com agenda integrada e métricas claras.", "Equipe multidisciplinar em um só lugar" }
                });

            migrationBuilder.InsertData(
                table: "canais_mensageria",
                columns: new[] { "Id", "Name", "ParticipantRule" },
                values: new object[,]
                {
                    { new Guid("56000000-0000-0000-0000-000000000001"), "Recepção e profissionais", "role:recepcao,role:profissional" },
                    { new Guid("56000000-0000-0000-0000-000000000002"), "Administrativo", "role:admin,role:recepcao" }
                });

            migrationBuilder.InsertData(
                table: "categorias",
                columns: new[] { "Id", "Name", "Type" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), "Estética avançada", "servico" },
                    { new Guid("10000000-0000-0000-0000-000000000002"), "Odontologia", "servico" },
                    { new Guid("10000000-0000-0000-0000-000000000003"), "Medicina particular", "servico" },
                    { new Guid("10000000-0000-0000-0000-000000000004"), "Terapias", "servico" },
                    { new Guid("10000000-0000-0000-0000-000000000005"), "Operação", "equipe" },
                    { new Guid("10000000-0000-0000-0000-000000000006"), "Administrativo", "equipe" }
                });

            migrationBuilder.InsertData(
                table: "configuracoes",
                columns: new[] { "Id", "Key", "Value", "ValueType" },
                values: new object[,]
                {
                    { new Guid("60000000-0000-0000-0000-000000000001"), "clinicName", "Clínica Aurora", "string" },
                    { new Guid("60000000-0000-0000-0000-000000000002"), "logoUrl", "data:image/svg+xml,%3Csvg width='96' height='96' viewBox='0 0 96 96' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='96' height='96' rx='22' fill='%23C2410C'/%3E%3Cpath d='M48 18c10 16 20 24 20 38 0 11-9 20-20 20s-20-9-20-20c0-14 10-22 20-38Z' fill='white' fill-opacity='.92'/%3E%3C/svg%3E", "string" },
                    { new Guid("60000000-0000-0000-0000-000000000003"), "theme.primary", "#C2410C", "color" },
                    { new Guid("60000000-0000-0000-0000-000000000004"), "theme.primaryLight", "#F59E0B", "color" },
                    { new Guid("60000000-0000-0000-0000-000000000005"), "theme.bgBase", "#FAF7F2", "color" },
                    { new Guid("60000000-0000-0000-0000-000000000006"), "theme.bgSecondary", "#EFE7D8", "color" },
                    { new Guid("60000000-0000-0000-0000-000000000007"), "theme.brownDark", "#3D2817", "color" },
                    { new Guid("60000000-0000-0000-0000-000000000008"), "theme.brownMid", "#7A5C3E", "color" },
                    { new Guid("60000000-0000-0000-0000-000000000009"), "theme.surface", "#FFFFFF", "color" },
                    { new Guid("60000000-0000-0000-0000-000000000010"), "theme.headingFont", "Playfair Display", "font" },
                    { new Guid("60000000-0000-0000-0000-000000000011"), "theme.bodyFont", "Inter", "font" },
                    { new Guid("60000000-0000-0000-0000-000000000012"), "address", "Av. Paulista, 1578, Bela Vista, São Paulo - SP", "string" },
                    { new Guid("60000000-0000-0000-0000-000000000013"), "coordinates.lat", "-23.561414", "decimal" },
                    { new Guid("60000000-0000-0000-0000-000000000014"), "coordinates.lng", "-46.655881", "decimal" },
                    { new Guid("60000000-0000-0000-0000-000000000015"), "whatsappUrl", "https://wa.me/5511999999999", "url" },
                    { new Guid("60000000-0000-0000-0000-000000000016"), "instagramUrl", "https://instagram.com/clinicaaurora", "url" },
                    { new Guid("60000000-0000-0000-0000-000000000017"), "openingHours", "Segunda a sexta, 8h às 20h. Sábado, 8h às 14h.", "string" },
                    { new Guid("60000000-0000-0000-0000-000000000018"), "about.text", "Nossa clínica nasceu para oferecer uma jornada de cuidado particular, precisa e acolhedora. Unimos tecnologia, escuta clínica e ambientes preparados para atendimentos de alto valor.", "text" }
                });

            migrationBuilder.InsertData(
                table: "conversas",
                columns: new[] { "Id", "Channel", "Title" },
                values: new object[,]
                {
                    { new Guid("54000000-0000-0000-0000-000000000001"), 0, "Dúvida sobre preparo" },
                    { new Guid("54000000-0000-0000-0000-000000000002"), 1, "Remarcação de retorno" }
                });

            migrationBuilder.InsertData(
                table: "custos",
                columns: new[] { "Id", "MonthLabel", "Name", "Type", "Value" },
                values: new object[,]
                {
                    { new Guid("70000000-0000-0000-0000-000000000001"), "Dez/25", "Aluguel", 0, 18000m },
                    { new Guid("70000000-0000-0000-0000-000000000002"), "Jan/26", "Salários fixos", 0, 34000m },
                    { new Guid("70000000-0000-0000-0000-000000000003"), "Fev/26", "Insumos estéticos", 1, 13200m },
                    { new Guid("70000000-0000-0000-0000-000000000004"), "Mar/26", "Assinaturas", 0, 4200m },
                    { new Guid("70000000-0000-0000-0000-000000000005"), "Abr/26", "Materiais odontológicos", 1, 9700m },
                    { new Guid("70000000-0000-0000-0000-000000000006"), "Mai/26", "Energia e utilidades", 0, 6800m }
                });

            migrationBuilder.InsertData(
                table: "equipamentos",
                columns: new[] { "Id", "Category", "Name", "Quantity", "UnitValue" },
                values: new object[,]
                {
                    { new Guid("31000000-0000-0000-0000-000000000001"), "Diagnóstico", "Scanner facial", 1, 28000m },
                    { new Guid("31000000-0000-0000-0000-000000000002"), "Estética", "Dermatoscópio", 2, 9500m },
                    { new Guid("31000000-0000-0000-0000-000000000003"), "Odontologia", "LED clareador", 1, 7200m },
                    { new Guid("31000000-0000-0000-0000-000000000004"), "Odontologia", "Motor cirúrgico", 1, 18000m }
                });

            migrationBuilder.InsertData(
                table: "galeria_sobre",
                columns: new[] { "Id", "ImageUrl", "SortOrder" },
                values: new object[,]
                {
                    { new Guid("64000000-0000-0000-0000-000000000001"), "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80", 1 },
                    { new Guid("64000000-0000-0000-0000-000000000002"), "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=900&q=80", 2 },
                    { new Guid("64000000-0000-0000-0000-000000000003"), "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=900&q=80", 3 }
                });

            migrationBuilder.InsertData(
                table: "log_movimento",
                columns: new[] { "Id", "CreatedAt", "Description", "EventType", "UserId" },
                values: new object[,]
                {
                    { new Guid("72000000-0000-0000-0000-000000000001"), new DateTime(2026, 5, 20, 9, 10, 0, 0, DateTimeKind.Unspecified), "Agendamento confirmado para Marina Pires.", "agendamento", new Guid("41000000-0000-0000-0000-000000000003") },
                    { new Guid("72000000-0000-0000-0000-000000000002"), new DateTime(2026, 5, 20, 10, 30, 0, 0, DateTimeKind.Unspecified), "Novo candidato registrado no banco de talentos.", "cadastro", new Guid("41000000-0000-0000-0000-000000000004") }
                });

            migrationBuilder.InsertData(
                table: "marcos_historicos",
                columns: new[] { "Id", "Description", "SortOrder", "Title", "YearLabel" },
                values: new object[,]
                {
                    { new Guid("62000000-0000-0000-0000-000000000001"), "Início das operações com agenda especializada e atendimento particular.", 1, "Primeira unidade", "2018" },
                    { new Guid("62000000-0000-0000-0000-000000000002"), "Padronização de jornadas clínicas e acompanhamento digital dos pacientes.", 2, "Protocolos integrados", "2020" },
                    { new Guid("62000000-0000-0000-0000-000000000003"), "Entrada de novos especialistas e ampliação das salas de procedimento.", 3, "Expansão da equipe", "2023" },
                    { new Guid("62000000-0000-0000-0000-000000000004"), "Renovação da estrutura, canais de relacionamento e indicadores de qualidade.", 4, "Experiência premium", "2025" }
                });

            migrationBuilder.InsertData(
                table: "metricas_snapshot",
                columns: new[] { "Id", "Appointments", "CancellationRate", "MonthLabel", "NewPatients", "OccupancyRate", "Profit", "Revenue", "TicketAverage" },
                values: new object[,]
                {
                    { new Guid("71000000-0000-0000-0000-000000000001"), 132, 7m, "Dez/25", 38, 64m, 42000m, 118000m, 894m },
                    { new Guid("71000000-0000-0000-0000-000000000002"), 141, 6m, "Jan/26", 42, 69m, 48500m, 126500m, 897m },
                    { new Guid("71000000-0000-0000-0000-000000000003"), 136, 8m, "Fev/26", 36, 67m, 45200m, 121800m, 895m },
                    { new Guid("71000000-0000-0000-0000-000000000004"), 151, 5m, "Mar/26", 47, 73m, 54800m, 139400m, 923m },
                    { new Guid("71000000-0000-0000-0000-000000000005"), 158, 5m, "Abr/26", 51, 76m, 59200m, 146200m, 925m },
                    { new Guid("71000000-0000-0000-0000-000000000006"), 164, 4m, "Mai/26", 54, 79m, 63800m, 154900m, 944m }
                });

            migrationBuilder.InsertData(
                table: "mvv",
                columns: new[] { "Id", "Mission", "Values", "Vision" },
                values: new object[] { new Guid("63000000-0000-0000-0000-000000000001"), "Entregar cuidado especializado com clareza, segurança e atenção aos detalhes.", "Ética, acolhimento, precisão técnica, transparência e melhoria contínua.", "Ser referência regional em experiências clínicas premium e gestão orientada por dados." });

            migrationBuilder.InsertData(
                table: "planos",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[] { new Guid("59000000-0000-0000-0000-000000000001"), "Pacote de acompanhamento com descontos progressivos.", "Plano premium preventivo" });

            migrationBuilder.InsertData(
                table: "profissionais",
                columns: new[] { "Id", "Bio", "DefaultCommissionPercent", "MonthlyFixedPayment", "Name", "PhotoUrl", "ProvidesCare", "Specialty", "UserId" },
                values: new object[,]
                {
                    { new Guid("43000000-0000-0000-0000-000000000002"), "Atua em avaliação facial e protocolos conservadores para pacientes que buscam evolução mensurável.", 30m, null, "Dr. Rafael Nogueira", "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80", true, "Harmonização facial", null },
                    { new Guid("43000000-0000-0000-0000-000000000003"), "Cirurgiã-dentista com experiência em implantodontia, estética dental e planejamento multidisciplinar.", 40m, null, "Dra. Camila Torres", "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=600&q=80", true, "Odontologia especializada", null },
                    { new Guid("43000000-0000-0000-0000-000000000004"), "Médico clínico com atendimento particular, acompanhamento longitudinal e análise detalhada de exames.", 45m, null, "Dr. Marcos Vidal", "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80", true, "Clínica médica", null },
                    { new Guid("43000000-0000-0000-0000-000000000005"), "Terapeuta focada em performance, autocuidado e criação de rotinas sustentáveis.", 32m, null, "Dra. Laura Menezes", "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&w=600&q=80", true, "Terapias integrativas", null }
                });

            migrationBuilder.InsertData(
                table: "roles",
                columns: new[] { "Id", "Name" },
                values: new object[,]
                {
                    { new Guid("40000000-0000-0000-0000-000000000001"), "paciente" },
                    { new Guid("40000000-0000-0000-0000-000000000002"), "profissional" },
                    { new Guid("40000000-0000-0000-0000-000000000003"), "recepcao" },
                    { new Guid("40000000-0000-0000-0000-000000000004"), "admin" }
                });

            migrationBuilder.InsertData(
                table: "salas",
                columns: new[] { "Id", "Capacity", "Name", "Notes" },
                values: new object[,]
                {
                    { new Guid("30000000-0000-0000-0000-000000000001"), 3, "Sala de avaliação", "Consultas e avaliações." },
                    { new Guid("30000000-0000-0000-0000-000000000002"), 2, "Sala de procedimentos", "Procedimentos estéticos avançados." },
                    { new Guid("30000000-0000-0000-0000-000000000003"), 2, "Consultório odontológico", "Odontologia especializada." },
                    { new Guid("30000000-0000-0000-0000-000000000004"), 2, "Sala terapêutica", "Ambiente reservado para terapias." }
                });

            migrationBuilder.InsertData(
                table: "servicos",
                columns: new[] { "Id", "BasePrice", "Description", "DurationMinutes", "Name", "ShortDescription" },
                values: new object[,]
                {
                    { new Guid("20000000-0000-0000-0000-000000000001"), 380m, "Consulta completa para mapear necessidades, contraindicações, objetivos e sequência ideal de procedimentos.", 60, "Avaliação Facial Integrada", "Plano personalizado com análise facial, histórico e metas de tratamento." },
                    { new Guid("20000000-0000-0000-0000-000000000002"), 1800m, "Procedimento injetável com planejamento por região, revisão de fotos e acompanhamento de evolução.", 75, "Bioestimulador de Colágeno", "Tratamento para melhora gradual de firmeza e textura da pele." },
                    { new Guid("20000000-0000-0000-0000-000000000003"), 950m, "Clareamento conduzido por especialista, com registro de cor, proteção gengival e orientações pós-atendimento.", 90, "Clareamento Dental Premium", "Protocolo supervisionado com controle de sensibilidade." },
                    { new Guid("20000000-0000-0000-0000-000000000004"), 2500m, "Consulta especializada para diagnóstico, indicação, etapas cirúrgicas e previsibilidade do investimento.", 80, "Implantodontia Planejada", "Planejamento de implantes com avaliação de exames e cronograma." },
                    { new Guid("20000000-0000-0000-0000-000000000005"), 620m, "Consulta individual com anamnese, revisão de exames, hipóteses diagnósticas e orientações documentadas.", 50, "Consulta Médica Particular", "Atendimento clínico com escuta ampliada e plano de acompanhamento." },
                    { new Guid("20000000-0000-0000-0000-000000000006"), 320m, "Atendimento de continuidade para revisar evolução, exames e adequar o plano de cuidado.", 35, "Retorno Médico", "Revisão de exames e ajuste de conduta." },
                    { new Guid("20000000-0000-0000-0000-000000000007"), 420m, "Abordagem terapêutica para construir repertório emocional, metas realistas e acompanhamento entre sessões.", 55, "Terapia de Performance", "Sessão focada em performance, autocuidado e rotina." },
                    { new Guid("20000000-0000-0000-0000-000000000008"), 340m, "Sessão de continuidade com revisão de evolução, ajustes e próximos passos do plano terapêutico.", 45, "Sessão de Manutenção", "Acompanhamento periódico para pacientes em plano ativo." }
                });

            migrationBuilder.InsertData(
                table: "templates_mensagem",
                columns: new[] { "Id", "Body", "Channel", "Occasion" },
                values: new object[,]
                {
                    { new Guid("57000000-0000-0000-0000-000000000001"), "Olá, {{nome_paciente}}. Sua consulta de {{servico}} com {{profissional}} está agendada para {{data}} às {{horario}}. {{nome_clinica}}", "WhatsApp", "Confirmação" },
                    { new Guid("57000000-0000-0000-0000-000000000002"), "Lembramos sua consulta em {{data}} às {{horario}}. Em caso de dúvidas, responda este e-mail.", "E-mail", "Lembrete" },
                    { new Guid("57000000-0000-0000-0000-000000000003"), "{{nome_paciente}}, seu agendamento foi cancelado. Podemos ajudar com uma nova data?", "WhatsApp", "Cancelamento" }
                });

            migrationBuilder.InsertData(
                table: "usuarios",
                columns: new[] { "Id", "CreatedAt", "Email", "FullName", "PasswordHash", "Phone" },
                values: new object[,]
                {
                    { new Guid("41000000-0000-0000-0000-000000000001"), new DateTime(2026, 5, 1, 9, 0, 0, 0, DateTimeKind.Unspecified), "paciente@aio.com", "Marina Pires", "seed:senha123", "(11) 98888-1111" },
                    { new Guid("41000000-0000-0000-0000-000000000002"), new DateTime(2026, 5, 1, 9, 0, 0, 0, DateTimeKind.Unspecified), "profissional@aio.com", "Dra. Helena Prado", "seed:senha123", "(11) 97777-2222" },
                    { new Guid("41000000-0000-0000-0000-000000000003"), new DateTime(2026, 5, 1, 9, 0, 0, 0, DateTimeKind.Unspecified), "recepcao@aio.com", "Sofia Almeida", "seed:senha123", "(11) 96666-3333" },
                    { new Guid("41000000-0000-0000-0000-000000000004"), new DateTime(2026, 5, 1, 9, 0, 0, 0, DateTimeKind.Unspecified), "admin@aio.com", "Bruno Castro", "seed:senha123", "(11) 95555-4444" }
                });

            migrationBuilder.InsertData(
                table: "vagas",
                columns: new[] { "Id", "Department", "Description", "Status", "Title" },
                values: new object[,]
                {
                    { new Guid("5a000000-0000-0000-0000-000000000001"), "Recepção", "Atendimento premium, organização de agenda e experiência do paciente.", "aberta", "Recepcionista bilíngue" },
                    { new Guid("5a000000-0000-0000-0000-000000000002"), "Relacionamento", "Acompanhamento de leads, propostas e conversão de planos de tratamento.", "aberta", "Consultor comercial de saúde" },
                    { new Guid("5a000000-0000-0000-0000-000000000003"), "Operação clínica", "Preparo de sala, materiais, equipamentos e suporte aos profissionais.", "aberta", "Auxiliar de sala" },
                    { new Guid("5a000000-0000-0000-0000-000000000004"), "Administração", "Controle financeiro, fornecedores e indicadores operacionais.", "encerrada", "Analista administrativo" }
                });

            migrationBuilder.InsertData(
                table: "candidaturas",
                columns: new[] { "Id", "Candidate", "CreatedAt", "Email", "JobOpeningId", "Message" },
                values: new object[,]
                {
                    { new Guid("5b000000-0000-0000-0000-000000000001"), "Ana Lima", new DateTime(2026, 5, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "ana@example.com", new Guid("5a000000-0000-0000-0000-000000000001"), "Tenho experiência com atendimento premium." },
                    { new Guid("5b000000-0000-0000-0000-000000000002"), "Julia Reis", new DateTime(2026, 5, 4, 0, 0, 0, 0, DateTimeKind.Unspecified), "julia@example.com", new Guid("5a000000-0000-0000-0000-000000000001"), "Atuei em clínica odontológica por três anos." },
                    { new Guid("5b000000-0000-0000-0000-000000000003"), "Pedro Martins", new DateTime(2026, 5, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), "pedro@example.com", new Guid("5a000000-0000-0000-0000-000000000002"), "Tenho histórico em vendas consultivas." },
                    { new Guid("5b000000-0000-0000-0000-000000000004"), "Renata Alves", new DateTime(2026, 5, 11, 0, 0, 0, 0, DateTimeKind.Unspecified), "renata@example.com", new Guid("5a000000-0000-0000-0000-000000000003"), "Tenho disponibilidade integral." }
                });

            migrationBuilder.InsertData(
                table: "conversa_participantes",
                columns: new[] { "ConversationId", "UserId" },
                values: new object[,]
                {
                    { new Guid("54000000-0000-0000-0000-000000000001"), new Guid("41000000-0000-0000-0000-000000000001") },
                    { new Guid("54000000-0000-0000-0000-000000000001"), new Guid("41000000-0000-0000-0000-000000000003") },
                    { new Guid("54000000-0000-0000-0000-000000000002"), new Guid("41000000-0000-0000-0000-000000000001") },
                    { new Guid("54000000-0000-0000-0000-000000000002"), new Guid("41000000-0000-0000-0000-000000000003") }
                });

            migrationBuilder.InsertData(
                table: "funcionarios",
                columns: new[] { "Id", "Department", "MonthlySalary", "UserId" },
                values: new object[,]
                {
                    { new Guid("44000000-0000-0000-0000-000000000001"), "Recepção", 4200m, new Guid("41000000-0000-0000-0000-000000000003") },
                    { new Guid("44000000-0000-0000-0000-000000000002"), "Administração", 7200m, new Guid("41000000-0000-0000-0000-000000000004") }
                });

            migrationBuilder.InsertData(
                table: "impostos_servico",
                columns: new[] { "Id", "Name", "Percent", "ServiceId" },
                values: new object[,]
                {
                    { new Guid("32000000-0000-0000-0000-000000000001"), "ISS", 5m, new Guid("20000000-0000-0000-0000-000000000002") },
                    { new Guid("32000000-0000-0000-0000-000000000002"), "ISS", 5m, new Guid("20000000-0000-0000-0000-000000000004") },
                    { new Guid("32000000-0000-0000-0000-000000000003"), "ISS", 3m, new Guid("20000000-0000-0000-0000-000000000005") }
                });

            migrationBuilder.InsertData(
                table: "mensagens",
                columns: new[] { "Id", "AuthorName", "AuthorUserId", "Body", "Channel", "ConversationId", "SentAt" },
                values: new object[,]
                {
                    { new Guid("55000000-0000-0000-0000-000000000001"), "Marina Pires", new Guid("41000000-0000-0000-0000-000000000001"), "Preciso fazer algum preparo antes da avaliação?", 0, new Guid("54000000-0000-0000-0000-000000000001"), new DateTime(2026, 5, 19, 10, 20, 0, 0, DateTimeKind.Unspecified) },
                    { new Guid("55000000-0000-0000-0000-000000000002"), "Recepção", new Guid("41000000-0000-0000-0000-000000000003"), "Recomendamos chegar 10 minutos antes e trazer exames recentes, se houver.", 0, new Guid("54000000-0000-0000-0000-000000000001"), new DateTime(2026, 5, 19, 10, 25, 0, 0, DateTimeKind.Unspecified) },
                    { new Guid("55000000-0000-0000-0000-000000000003"), "Recepção", new Guid("41000000-0000-0000-0000-000000000003"), "Temos disponibilidade na terça às 11h ou quarta às 15h.", 1, new Guid("54000000-0000-0000-0000-000000000002"), new DateTime(2026, 5, 18, 16, 40, 0, 0, DateTimeKind.Unspecified) }
                });

            migrationBuilder.InsertData(
                table: "notificacao_regras",
                columns: new[] { "Id", "Active", "Channel", "LeadTime", "TemplateId", "Trigger" },
                values: new object[,]
                {
                    { new Guid("58000000-0000-0000-0000-000000000001"), true, "WhatsApp", "Imediatamente após agendar", new Guid("57000000-0000-0000-0000-000000000001"), "Confirmação" },
                    { new Guid("58000000-0000-0000-0000-000000000002"), true, "Ambos", "24h antes", new Guid("57000000-0000-0000-0000-000000000002"), "Lembrete" }
                });

            migrationBuilder.InsertData(
                table: "pacientes",
                columns: new[] { "Id", "BirthDate", "UserId" },
                values: new object[] { new Guid("42000000-0000-0000-0000-000000000001"), new DateTime(1988, 9, 14, 0, 0, 0, 0, DateTimeKind.Unspecified), new Guid("41000000-0000-0000-0000-000000000001") });

            migrationBuilder.InsertData(
                table: "plano_servicos",
                columns: new[] { "PlanId", "ServiceId", "CoverageRule" },
                values: new object[,]
                {
                    { new Guid("59000000-0000-0000-0000-000000000001"), new Guid("20000000-0000-0000-0000-000000000001"), "100% da avaliação inclusa" },
                    { new Guid("59000000-0000-0000-0000-000000000001"), new Guid("20000000-0000-0000-0000-000000000006"), "50% de desconto em retornos" }
                });

            migrationBuilder.InsertData(
                table: "profissionais",
                columns: new[] { "Id", "Bio", "DefaultCommissionPercent", "MonthlyFixedPayment", "Name", "PhotoUrl", "ProvidesCare", "Specialty", "UserId" },
                values: new object[,]
                {
                    { new Guid("43000000-0000-0000-0000-000000000001"), "Especialista em estética avançada, com foco em planos graduais, naturalidade e segurança técnica.", 35m, null, "Dra. Helena Prado", "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80", true, "Dermatologia estética", new Guid("41000000-0000-0000-0000-000000000002") },
                    { new Guid("43000000-0000-0000-0000-000000000006"), "Responsável por acolhimento, agenda compartilhada e central de comunicação.", 0m, null, "Sofia Almeida", "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=600&q=80", false, "Recepção premium", new Guid("41000000-0000-0000-0000-000000000003") },
                    { new Guid("43000000-0000-0000-0000-000000000007"), "Administração, indicadores executivos e configurações white label.", 0m, 7200m, "Bruno Castro", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80", false, "Gestão administrativa", new Guid("41000000-0000-0000-0000-000000000004") }
                });

            migrationBuilder.InsertData(
                table: "profissional_horarios",
                columns: new[] { "Id", "EndTime", "ProfessionalId", "StartTime", "Weekday" },
                values: new object[,]
                {
                    { new Guid("45000000-0000-0000-0000-000000000004"), new TimeOnly(18, 0, 0), new Guid("43000000-0000-0000-0000-000000000002"), new TimeOnly(10, 0, 0), 2 },
                    { new Guid("45000000-0000-0000-0000-000000000005"), new TimeOnly(16, 0, 0), new Guid("43000000-0000-0000-0000-000000000003"), new TimeOnly(8, 0, 0), 1 },
                    { new Guid("45000000-0000-0000-0000-000000000006"), new TimeOnly(20, 0, 0), new Guid("43000000-0000-0000-0000-000000000004"), new TimeOnly(13, 0, 0), 3 },
                    { new Guid("45000000-0000-0000-0000-000000000007"), new TimeOnly(17, 0, 0), new Guid("43000000-0000-0000-0000-000000000005"), new TimeOnly(9, 0, 0), 5 }
                });

            migrationBuilder.InsertData(
                table: "profissional_servicos",
                columns: new[] { "ProfessionalId", "ServiceId", "CompensationType", "CompensationValue" },
                values: new object[,]
                {
                    { new Guid("43000000-0000-0000-0000-000000000002"), new Guid("20000000-0000-0000-0000-000000000001"), "default_commission", null },
                    { new Guid("43000000-0000-0000-0000-000000000003"), new Guid("20000000-0000-0000-0000-000000000003"), "default_commission", null },
                    { new Guid("43000000-0000-0000-0000-000000000003"), new Guid("20000000-0000-0000-0000-000000000004"), "fixed_value", 900m },
                    { new Guid("43000000-0000-0000-0000-000000000004"), new Guid("20000000-0000-0000-0000-000000000005"), "default_commission", null },
                    { new Guid("43000000-0000-0000-0000-000000000004"), new Guid("20000000-0000-0000-0000-000000000006"), "default_commission", null },
                    { new Guid("43000000-0000-0000-0000-000000000005"), new Guid("20000000-0000-0000-0000-000000000007"), "default_commission", null },
                    { new Guid("43000000-0000-0000-0000-000000000005"), new Guid("20000000-0000-0000-0000-000000000008"), "default_commission", null }
                });

            migrationBuilder.InsertData(
                table: "sala_equipamentos",
                columns: new[] { "EquipmentId", "RoomId" },
                values: new object[,]
                {
                    { new Guid("31000000-0000-0000-0000-000000000001"), new Guid("30000000-0000-0000-0000-000000000001") },
                    { new Guid("31000000-0000-0000-0000-000000000002"), new Guid("30000000-0000-0000-0000-000000000002") },
                    { new Guid("31000000-0000-0000-0000-000000000003"), new Guid("30000000-0000-0000-0000-000000000003") },
                    { new Guid("31000000-0000-0000-0000-000000000004"), new Guid("30000000-0000-0000-0000-000000000003") }
                });

            migrationBuilder.InsertData(
                table: "sala_servicos",
                columns: new[] { "RoomId", "ServiceId" },
                values: new object[,]
                {
                    { new Guid("30000000-0000-0000-0000-000000000001"), new Guid("20000000-0000-0000-0000-000000000001") },
                    { new Guid("30000000-0000-0000-0000-000000000001"), new Guid("20000000-0000-0000-0000-000000000005") },
                    { new Guid("30000000-0000-0000-0000-000000000001"), new Guid("20000000-0000-0000-0000-000000000006") },
                    { new Guid("30000000-0000-0000-0000-000000000002"), new Guid("20000000-0000-0000-0000-000000000002") },
                    { new Guid("30000000-0000-0000-0000-000000000003"), new Guid("20000000-0000-0000-0000-000000000003") },
                    { new Guid("30000000-0000-0000-0000-000000000003"), new Guid("20000000-0000-0000-0000-000000000004") },
                    { new Guid("30000000-0000-0000-0000-000000000004"), new Guid("20000000-0000-0000-0000-000000000007") },
                    { new Guid("30000000-0000-0000-0000-000000000004"), new Guid("20000000-0000-0000-0000-000000000008") }
                });

            migrationBuilder.InsertData(
                table: "servico_categorias",
                columns: new[] { "CategoryId", "ServiceId" },
                values: new object[,]
                {
                    { new Guid("10000000-0000-0000-0000-000000000001"), new Guid("20000000-0000-0000-0000-000000000001") },
                    { new Guid("10000000-0000-0000-0000-000000000001"), new Guid("20000000-0000-0000-0000-000000000002") },
                    { new Guid("10000000-0000-0000-0000-000000000002"), new Guid("20000000-0000-0000-0000-000000000003") },
                    { new Guid("10000000-0000-0000-0000-000000000002"), new Guid("20000000-0000-0000-0000-000000000004") },
                    { new Guid("10000000-0000-0000-0000-000000000003"), new Guid("20000000-0000-0000-0000-000000000005") },
                    { new Guid("10000000-0000-0000-0000-000000000003"), new Guid("20000000-0000-0000-0000-000000000006") },
                    { new Guid("10000000-0000-0000-0000-000000000004"), new Guid("20000000-0000-0000-0000-000000000007") },
                    { new Guid("10000000-0000-0000-0000-000000000004"), new Guid("20000000-0000-0000-0000-000000000008") }
                });

            migrationBuilder.InsertData(
                table: "usuario_roles",
                columns: new[] { "RoleId", "UserId" },
                values: new object[,]
                {
                    { new Guid("40000000-0000-0000-0000-000000000001"), new Guid("41000000-0000-0000-0000-000000000001") },
                    { new Guid("40000000-0000-0000-0000-000000000002"), new Guid("41000000-0000-0000-0000-000000000002") },
                    { new Guid("40000000-0000-0000-0000-000000000003"), new Guid("41000000-0000-0000-0000-000000000003") },
                    { new Guid("40000000-0000-0000-0000-000000000004"), new Guid("41000000-0000-0000-0000-000000000004") }
                });

            migrationBuilder.InsertData(
                table: "agendamentos",
                columns: new[] { "Id", "Date", "DependentId", "PatientId", "ProfessionalId", "ServiceId", "Status", "Time" },
                values: new object[,]
                {
                    { new Guid("50000000-0000-0000-0000-000000000001"), new DateOnly(2026, 3, 12), null, new Guid("42000000-0000-0000-0000-000000000001"), new Guid("43000000-0000-0000-0000-000000000001"), new Guid("20000000-0000-0000-0000-000000000001"), 4, new TimeOnly(10, 0, 0) },
                    { new Guid("50000000-0000-0000-0000-000000000002"), new DateOnly(2026, 4, 3), null, new Guid("42000000-0000-0000-0000-000000000001"), new Guid("43000000-0000-0000-0000-000000000003"), new Guid("20000000-0000-0000-0000-000000000003"), 4, new TimeOnly(14, 0, 0) },
                    { new Guid("50000000-0000-0000-0000-000000000004"), new DateOnly(2026, 5, 27), null, new Guid("42000000-0000-0000-0000-000000000001"), new Guid("43000000-0000-0000-0000-000000000004"), new Guid("20000000-0000-0000-0000-000000000005"), 2, new TimeOnly(15, 0, 0) }
                });

            migrationBuilder.InsertData(
                table: "dependentes",
                columns: new[] { "Id", "BirthDate", "FullName", "PatientId", "Relationship" },
                values: new object[,]
                {
                    { new Guid("42100000-0000-0000-0000-000000000001"), new DateTime(2016, 8, 12, 0, 0, 0, 0, DateTimeKind.Unspecified), "Lia Pires", new Guid("42000000-0000-0000-0000-000000000001"), "Filha" },
                    { new Guid("42100000-0000-0000-0000-000000000002"), new DateTime(2019, 3, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), "Theo Pires", new Guid("42000000-0000-0000-0000-000000000001"), "Filho" }
                });

            migrationBuilder.InsertData(
                table: "profissional_horarios",
                columns: new[] { "Id", "EndTime", "ProfessionalId", "StartTime", "Weekday" },
                values: new object[,]
                {
                    { new Guid("45000000-0000-0000-0000-000000000001"), new TimeOnly(17, 0, 0), new Guid("43000000-0000-0000-0000-000000000001"), new TimeOnly(9, 0, 0), 1 },
                    { new Guid("45000000-0000-0000-0000-000000000002"), new TimeOnly(17, 0, 0), new Guid("43000000-0000-0000-0000-000000000001"), new TimeOnly(9, 0, 0), 3 },
                    { new Guid("45000000-0000-0000-0000-000000000003"), new TimeOnly(13, 0, 0), new Guid("43000000-0000-0000-0000-000000000001"), new TimeOnly(9, 0, 0), 5 }
                });

            migrationBuilder.InsertData(
                table: "profissional_servicos",
                columns: new[] { "ProfessionalId", "ServiceId", "CompensationType", "CompensationValue" },
                values: new object[,]
                {
                    { new Guid("43000000-0000-0000-0000-000000000001"), new Guid("20000000-0000-0000-0000-000000000001"), "default_commission", null },
                    { new Guid("43000000-0000-0000-0000-000000000001"), new Guid("20000000-0000-0000-0000-000000000002"), "custom_percent", 38m }
                });

            migrationBuilder.InsertData(
                table: "agendamento_status_log",
                columns: new[] { "Id", "AppointmentId", "ChangedAt", "ChangedByUserId", "Status" },
                values: new object[,]
                {
                    { new Guid("51000000-0000-0000-0000-000000000001"), new Guid("50000000-0000-0000-0000-000000000001"), new DateTime(2026, 5, 1, 10, 0, 0, 0, DateTimeKind.Unspecified), new Guid("41000000-0000-0000-0000-000000000003"), 4 },
                    { new Guid("51000000-0000-0000-0000-000000000002"), new Guid("50000000-0000-0000-0000-000000000002"), new DateTime(2026, 5, 2, 10, 0, 0, 0, DateTimeKind.Unspecified), new Guid("41000000-0000-0000-0000-000000000003"), 4 },
                    { new Guid("51000000-0000-0000-0000-000000000004"), new Guid("50000000-0000-0000-0000-000000000004"), new DateTime(2026, 5, 4, 10, 0, 0, 0, DateTimeKind.Unspecified), new Guid("41000000-0000-0000-0000-000000000003"), 2 }
                });

            migrationBuilder.InsertData(
                table: "agendamentos",
                columns: new[] { "Id", "Date", "DependentId", "PatientId", "ProfessionalId", "ServiceId", "Status", "Time" },
                values: new object[,]
                {
                    { new Guid("50000000-0000-0000-0000-000000000003"), new DateOnly(2026, 4, 18), new Guid("42100000-0000-0000-0000-000000000001"), new Guid("42000000-0000-0000-0000-000000000001"), new Guid("43000000-0000-0000-0000-000000000005"), new Guid("20000000-0000-0000-0000-000000000007"), 4, new TimeOnly(9, 0, 0) },
                    { new Guid("50000000-0000-0000-0000-000000000005"), new DateOnly(2026, 6, 2), new Guid("42100000-0000-0000-0000-000000000002"), new Guid("42000000-0000-0000-0000-000000000001"), new Guid("43000000-0000-0000-0000-000000000005"), new Guid("20000000-0000-0000-0000-000000000008"), 1, new TimeOnly(11, 0, 0) }
                });

            migrationBuilder.InsertData(
                table: "comissoes",
                columns: new[] { "Id", "Amount", "AppointmentId", "Percent", "ProfessionalId" },
                values: new object[,]
                {
                    { new Guid("53000000-0000-0000-0000-000000000001"), 133m, new Guid("50000000-0000-0000-0000-000000000001"), 35m, new Guid("43000000-0000-0000-0000-000000000001") },
                    { new Guid("53000000-0000-0000-0000-000000000002"), 380m, new Guid("50000000-0000-0000-0000-000000000002"), 40m, new Guid("43000000-0000-0000-0000-000000000003") }
                });

            migrationBuilder.InsertData(
                table: "pagamentos",
                columns: new[] { "Id", "AppointmentId", "GrossAmount", "Method", "PaidAt" },
                values: new object[,]
                {
                    { new Guid("52000000-0000-0000-0000-000000000001"), new Guid("50000000-0000-0000-0000-000000000001"), 380m, "Mercado Pago", new DateTime(2026, 3, 12, 10, 45, 0, 0, DateTimeKind.Unspecified) },
                    { new Guid("52000000-0000-0000-0000-000000000002"), new Guid("50000000-0000-0000-0000-000000000002"), 950m, "Cartão", new DateTime(2026, 4, 3, 15, 30, 0, 0, DateTimeKind.Unspecified) }
                });

            migrationBuilder.InsertData(
                table: "agendamento_status_log",
                columns: new[] { "Id", "AppointmentId", "ChangedAt", "ChangedByUserId", "Status" },
                values: new object[,]
                {
                    { new Guid("51000000-0000-0000-0000-000000000003"), new Guid("50000000-0000-0000-0000-000000000003"), new DateTime(2026, 5, 3, 10, 0, 0, 0, DateTimeKind.Unspecified), new Guid("41000000-0000-0000-0000-000000000003"), 4 },
                    { new Guid("51000000-0000-0000-0000-000000000005"), new Guid("50000000-0000-0000-0000-000000000005"), new DateTime(2026, 5, 5, 10, 0, 0, 0, DateTimeKind.Unspecified), new Guid("41000000-0000-0000-0000-000000000003"), 1 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_agendamento_status_log_AppointmentId",
                table: "agendamento_status_log",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_agendamentos_DependentId",
                table: "agendamentos",
                column: "DependentId");

            migrationBuilder.CreateIndex(
                name: "IX_agendamentos_PatientId",
                table: "agendamentos",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_agendamentos_ProfessionalId_Date_Time",
                table: "agendamentos",
                columns: new[] { "ProfessionalId", "Date", "Time" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_agendamentos_ServiceId",
                table: "agendamentos",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_candidaturas_JobOpeningId",
                table: "candidaturas",
                column: "JobOpeningId");

            migrationBuilder.CreateIndex(
                name: "IX_comissoes_AppointmentId",
                table: "comissoes",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_comissoes_ProfessionalId",
                table: "comissoes",
                column: "ProfessionalId");

            migrationBuilder.CreateIndex(
                name: "IX_configuracoes_Key",
                table: "configuracoes",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_conversa_participantes_UserId",
                table: "conversa_participantes",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_dependentes_PatientId",
                table: "dependentes",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_funcionarios_UserId",
                table: "funcionarios",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_impostos_servico_ServiceId",
                table: "impostos_servico",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_log_movimento_EventType_CreatedAt",
                table: "log_movimento",
                columns: new[] { "EventType", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_mensagens_ConversationId_SentAt",
                table: "mensagens",
                columns: new[] { "ConversationId", "SentAt" });

            migrationBuilder.CreateIndex(
                name: "IX_notificacao_regras_TemplateId",
                table: "notificacao_regras",
                column: "TemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_pacientes_UserId",
                table: "pacientes",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_pagamentos_AppointmentId",
                table: "pagamentos",
                column: "AppointmentId");

            migrationBuilder.CreateIndex(
                name: "IX_plano_servicos_ServiceId",
                table: "plano_servicos",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_profissionais_UserId",
                table: "profissionais",
                column: "UserId",
                unique: true,
                filter: "[UserId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_profissional_horarios_ProfessionalId_Weekday",
                table: "profissional_horarios",
                columns: new[] { "ProfessionalId", "Weekday" });

            migrationBuilder.CreateIndex(
                name: "IX_profissional_servicos_ServiceId",
                table: "profissional_servicos",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_roles_Name",
                table: "roles",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_sala_equipamentos_EquipmentId",
                table: "sala_equipamentos",
                column: "EquipmentId");

            migrationBuilder.CreateIndex(
                name: "IX_sala_servicos_ServiceId",
                table: "sala_servicos",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_servico_categorias_CategoryId",
                table: "servico_categorias",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_usuario_roles_RoleId",
                table: "usuario_roles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_Email",
                table: "usuarios",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "agendamento_status_log");

            migrationBuilder.DropTable(
                name: "banco_talentos");

            migrationBuilder.DropTable(
                name: "banners");

            migrationBuilder.DropTable(
                name: "canais_mensageria");

            migrationBuilder.DropTable(
                name: "candidaturas");

            migrationBuilder.DropTable(
                name: "comissoes");

            migrationBuilder.DropTable(
                name: "configuracoes");

            migrationBuilder.DropTable(
                name: "conversa_participantes");

            migrationBuilder.DropTable(
                name: "custos");

            migrationBuilder.DropTable(
                name: "funcionarios");

            migrationBuilder.DropTable(
                name: "galeria_sobre");

            migrationBuilder.DropTable(
                name: "impostos_servico");

            migrationBuilder.DropTable(
                name: "log_movimento");

            migrationBuilder.DropTable(
                name: "marcos_historicos");

            migrationBuilder.DropTable(
                name: "mensagens");

            migrationBuilder.DropTable(
                name: "metricas_snapshot");

            migrationBuilder.DropTable(
                name: "mvv");

            migrationBuilder.DropTable(
                name: "notificacao_regras");

            migrationBuilder.DropTable(
                name: "pagamentos");

            migrationBuilder.DropTable(
                name: "plano_servicos");

            migrationBuilder.DropTable(
                name: "profissional_horarios");

            migrationBuilder.DropTable(
                name: "profissional_servicos");

            migrationBuilder.DropTable(
                name: "sala_equipamentos");

            migrationBuilder.DropTable(
                name: "sala_servicos");

            migrationBuilder.DropTable(
                name: "servico_categorias");

            migrationBuilder.DropTable(
                name: "usuario_roles");

            migrationBuilder.DropTable(
                name: "vagas");

            migrationBuilder.DropTable(
                name: "conversas");

            migrationBuilder.DropTable(
                name: "templates_mensagem");

            migrationBuilder.DropTable(
                name: "agendamentos");

            migrationBuilder.DropTable(
                name: "planos");

            migrationBuilder.DropTable(
                name: "equipamentos");

            migrationBuilder.DropTable(
                name: "salas");

            migrationBuilder.DropTable(
                name: "categorias");

            migrationBuilder.DropTable(
                name: "roles");

            migrationBuilder.DropTable(
                name: "dependentes");

            migrationBuilder.DropTable(
                name: "profissionais");

            migrationBuilder.DropTable(
                name: "servicos");

            migrationBuilder.DropTable(
                name: "pacientes");

            migrationBuilder.DropTable(
                name: "usuarios");
        }
    }
}
