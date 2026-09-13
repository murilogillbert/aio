import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const hashPassword = (password: string) => bcrypt.hash(password, 10);

async function main() {
  const alreadySeeded = await prisma.user.findFirst();
  if (alreadySeeded) {
    console.log("Seed já aplicado anteriormente — nada a fazer.");
    return;
  }

  const passwordHash = await hashPassword("senha123");

  const [rolePaciente, roleProfissional, roleRecepcao, roleAdmin] = await Promise.all([
    prisma.role.create({ data: { name: "paciente" } }),
    prisma.role.create({ data: { name: "profissional" } }),
    prisma.role.create({ data: { name: "recepcao" } }),
    prisma.role.create({ data: { name: "admin" } }),
  ]);

  const [catEstetica, catOdonto, catMedicina, catTerapias, catOperacao, catAdministrativo] = await Promise.all([
    prisma.category.create({ data: { name: "Estética avançada", type: "servico" } }),
    prisma.category.create({ data: { name: "Odontologia", type: "servico" } }),
    prisma.category.create({ data: { name: "Medicina particular", type: "servico" } }),
    prisma.category.create({ data: { name: "Terapias", type: "servico" } }),
    prisma.category.create({ data: { name: "Operação", type: "equipe" } }),
    prisma.category.create({ data: { name: "Administrativo", type: "equipe" } }),
  ]);

  const [roomFacial, roomOdonto, roomProcedimentos, roomTerapias] = await Promise.all([
    prisma.room.create({ data: { name: "Sala Facial", capacity: 1, description: "Sala para procedimentos faciais" } }),
    prisma.room.create({ data: { name: "Consultório Odontológico", capacity: 1, description: "Consultório equipado para odontologia" } }),
    prisma.room.create({ data: { name: "Sala de Procedimentos", capacity: 1, description: "Sala para procedimentos médicos" } }),
    prisma.room.create({ data: { name: "Sala de Terapias", capacity: 1, description: "Sala para sessões terapêuticas" } }),
  ]);

  const [equipLaser, equipCadeiraOdonto, equipUltrassom, equipMaca] = await Promise.all([
    prisma.equipment.create({ data: { name: "Laser de Diodo", category: "Estética", quantity: 1, unitValue: 28000 } }),
    prisma.equipment.create({ data: { name: "Cadeira Odontológica", category: "Odontologia", quantity: 2, unitValue: 22000 } }),
    prisma.equipment.create({ data: { name: "Ultrassom Terapêutico", category: "Terapias", quantity: 2, unitValue: 9500 } }),
    prisma.equipment.create({ data: { name: "Maca Elétrica", category: "Geral", quantity: 3, unitValue: 7200 } }),
  ]);

  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: "Avaliação Facial Integrada",
        shortDescription: "Diagnóstico completo de pele com plano de tratamento personalizado.",
        description: "Avaliação facial completa com mapeamento de pele, indicação de protocolos e planejamento terapêutico.",
        preparation: "Chegar sem maquiagem.",
        color: "#C2410C",
        durationMinutes: 60,
        basePrice: 380,
        requiresRoom: true,
        defaultRoomId: roomFacial.id,
        serviceCategories: { create: { categoryId: catEstetica.id } },
        serviceEquipments: { create: { equipmentId: equipLaser.id, required: false } },
      },
    }),
    prisma.service.create({
      data: {
        name: "Bioestimulador de Colágeno",
        shortDescription: "Procedimento injetável para estímulo de colágeno.",
        description: "Aplicação de bioestimulador de colágeno para rejuvenescimento facial.",
        preparation: "Evitar anticoagulantes por 48h.",
        color: "#9A3412",
        durationMinutes: 75,
        basePrice: 1800,
        requiresRoom: true,
        defaultRoomId: roomFacial.id,
        serviceCategories: { create: { categoryId: catEstetica.id } },
        taxes: { create: { name: "ISS", percent: 5 } },
        serviceEquipments: { create: { equipmentId: equipLaser.id, required: true } },
      },
    }),
    prisma.service.create({
      data: {
        name: "Clareamento Dental Premium",
        shortDescription: "Clareamento dental supervisionado em consultório.",
        description: "Sessão de clareamento dental com laser de baixa intensidade.",
        preparation: "Evitar café e vinho por 24h antes.",
        color: "#1D4ED8",
        durationMinutes: 90,
        basePrice: 950,
        requiresRoom: true,
        defaultRoomId: roomOdonto.id,
        serviceCategories: { create: { categoryId: catOdonto.id } },
        taxes: { create: { name: "ISS", percent: 5 } },
        serviceEquipments: { create: { equipmentId: equipCadeiraOdonto.id, required: true } },
      },
    }),
    prisma.service.create({
      data: {
        name: "Implantodontia Planejada",
        shortDescription: "Planejamento e instalação de implante dentário.",
        description: "Procedimento de implantodontia guiado por planejamento digital.",
        preparation: "Trazer exames de imagem recentes.",
        color: "#1E3A8A",
        durationMinutes: 80,
        basePrice: 2500,
        requiresRoom: true,
        defaultRoomId: roomOdonto.id,
        serviceCategories: { create: { categoryId: catOdonto.id } },
        taxes: { create: { name: "ISS", percent: 3 } },
        serviceEquipments: { create: { equipmentId: equipCadeiraOdonto.id, required: true } },
      },
    }),
    prisma.service.create({
      data: {
        name: "Consulta Médica Particular",
        shortDescription: "Consulta médica com clínico geral.",
        description: "Atendimento médico particular para avaliação geral de saúde.",
        preparation: "Trazer exames anteriores, se houver.",
        color: "#065F46",
        durationMinutes: 50,
        basePrice: 620,
        requiresRoom: true,
        defaultRoomId: roomProcedimentos.id,
        serviceCategories: { create: { categoryId: catMedicina.id } },
      },
    }),
    prisma.service.create({
      data: {
        name: "Retorno Médico",
        shortDescription: "Consulta de retorno médico.",
        description: "Consulta de acompanhamento e reavaliação clínica.",
        preparation: "",
        color: "#047857",
        durationMinutes: 35,
        basePrice: 320,
        requiresRoom: true,
        defaultRoomId: roomProcedimentos.id,
        serviceCategories: { create: { categoryId: catMedicina.id } },
      },
    }),
    prisma.service.create({
      data: {
        name: "Terapia de Performance",
        shortDescription: "Sessão terapêutica para performance física e mental.",
        description: "Sessão de terapia focada em performance e bem-estar.",
        preparation: "Usar roupas confortáveis.",
        color: "#7C2D12",
        durationMinutes: 55,
        basePrice: 420,
        requiresRoom: true,
        defaultRoomId: roomTerapias.id,
        serviceCategories: { create: { categoryId: catTerapias.id } },
        serviceEquipments: { create: { equipmentId: equipUltrassom.id, required: false } },
      },
    }),
    prisma.service.create({
      data: {
        name: "Sessão de Manutenção",
        shortDescription: "Sessão terapêutica de manutenção.",
        description: "Sessão de manutenção do plano terapêutico em curso.",
        preparation: "",
        color: "#92400E",
        durationMinutes: 45,
        basePrice: 340,
        requiresRoom: true,
        defaultRoomId: roomTerapias.id,
        serviceCategories: { create: { categoryId: catTerapias.id } },
      },
    }),
  ]);
  const [
    svcAvaliacaoFacial,
    svcBioestimulador,
    svcClareamento,
    svcImplantodontia,
    svcConsultaMedica,
    svcRetornoMedico,
    svcTerapiaPerformance,
    svcSessaoManutencao,
  ] = services;

  await Promise.all([
    prisma.roomService.create({ data: { roomId: roomFacial.id, serviceId: svcAvaliacaoFacial.id } }),
    prisma.roomService.create({ data: { roomId: roomFacial.id, serviceId: svcBioestimulador.id } }),
    prisma.roomService.create({ data: { roomId: roomOdonto.id, serviceId: svcClareamento.id } }),
    prisma.roomService.create({ data: { roomId: roomOdonto.id, serviceId: svcImplantodontia.id } }),
    prisma.roomService.create({ data: { roomId: roomProcedimentos.id, serviceId: svcConsultaMedica.id } }),
    prisma.roomService.create({ data: { roomId: roomProcedimentos.id, serviceId: svcRetornoMedico.id } }),
    prisma.roomService.create({ data: { roomId: roomTerapias.id, serviceId: svcTerapiaPerformance.id } }),
    prisma.roomService.create({ data: { roomId: roomTerapias.id, serviceId: svcSessaoManutencao.id } }),
  ]);

  const patientUser = await prisma.user.create({
    data: {
      fullName: "Marina Pires",
      email: "paciente@aio.com",
      phone: "11988887777",
      passwordHash,
      userRoles: { create: { roleId: rolePaciente.id } },
      patient: {
        create: {
          cpf: "11122233344",
          address: "Rua das Flores, 100",
          city: "São Paulo",
          state: "SP",
          postalCode: "01310-000",
          birthDate: new Date("1990-04-12T00:00:00.000Z"),
          dependents: {
            create: [
              { fullName: "Lia Pires", birthDate: new Date("2015-06-01T00:00:00.000Z"), relationship: "Filha" },
              { fullName: "Theo Pires", birthDate: new Date("2018-09-20T00:00:00.000Z"), relationship: "Filho" },
            ],
          },
        },
      },
    },
    include: { patient: true },
  });

  const helenaUser = await prisma.user.create({
    data: {
      fullName: "Dra. Helena Prado",
      email: "profissional@aio.com",
      phone: "11977776666",
      passwordHash,
      userRoles: { create: { roleId: roleProfissional.id } },
    },
  });
  const helena = await prisma.professional.create({
    data: {
      userId: helenaUser.id,
      name: "Dra. Helena Prado",
      specialty: "Dermatologia estética",
      bio: "Especialista em procedimentos faciais minimamente invasivos.",
      email: "profissional@aio.com",
      phone: "11977776666",
      licenseNumber: "CRM-12345",
      councilType: "CRM",
      defaultCommissionPercent: 30,
      providesCare: true,
      photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2",
      schedules: {
        create: [
          { weekday: 1, startTime: "09:00", endTime: "18:00" },
          { weekday: 3, startTime: "09:00", endTime: "18:00" },
          { weekday: 5, startTime: "09:00", endTime: "13:00" },
        ],
      },
      professionalServices: {
        create: [
          { serviceId: svcAvaliacaoFacial.id, compensationType: "default_commission" },
          { serviceId: svcBioestimulador.id, compensationType: "custom_percent", compensationValue: 38 },
        ],
      },
    },
  });

  const rafael = await prisma.professional.create({
    data: {
      name: "Rafael Nogueira",
      specialty: "Odontologia estética",
      bio: "Referência em clareamento e implantodontia planejada.",
      email: "rafael.nogueira@aio.com",
      phone: "11966665555",
      licenseNumber: "CRO-54321",
      councilType: "CRO",
      defaultCommissionPercent: 28,
      providesCare: true,
      photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d",
      schedules: { create: [{ weekday: 2, startTime: "08:00", endTime: "17:00" }, { weekday: 4, startTime: "08:00", endTime: "17:00" }] },
      professionalServices: {
        create: [
          { serviceId: svcClareamento.id, compensationType: "default_commission" },
          { serviceId: svcImplantodontia.id, compensationType: "fixed_value", compensationValue: 900 },
        ],
      },
    },
  });

  const camila = await prisma.professional.create({
    data: {
      name: "Camila Torres",
      specialty: "Clínica geral",
      bio: "Atendimento médico particular com foco em saúde preventiva.",
      email: "camila.torres@aio.com",
      phone: "11955554444",
      licenseNumber: "CRM-67890",
      councilType: "CRM",
      defaultCommissionPercent: 25,
      providesCare: true,
      photoUrl: "https://images.unsplash.com/photo-1580281658626-ee379fd9fb70",
      schedules: { create: [{ weekday: 1, startTime: "13:00", endTime: "19:00" }, { weekday: 3, startTime: "13:00", endTime: "19:00" }] },
      professionalServices: {
        create: [
          { serviceId: svcConsultaMedica.id, compensationType: "default_commission" },
          { serviceId: svcRetornoMedico.id, compensationType: "default_commission" },
        ],
      },
    },
  });

  const marcos = await prisma.professional.create({
    data: {
      name: "Marcos Vidal",
      specialty: "Fisioterapia de performance",
      bio: "Sessões terapêuticas voltadas para performance física.",
      email: "marcos.vidal@aio.com",
      phone: "11944443333",
      licenseNumber: "CREFITO-1122",
      councilType: "CREFITO",
      defaultCommissionPercent: 32,
      providesCare: true,
      photoUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7",
      schedules: { create: [{ weekday: 2, startTime: "07:00", endTime: "15:00" }, { weekday: 4, startTime: "07:00", endTime: "15:00" }] },
      professionalServices: { create: [{ serviceId: svcTerapiaPerformance.id, compensationType: "default_commission" }] },
    },
  });

  const laura = await prisma.professional.create({
    data: {
      name: "Laura Menezes",
      specialty: "Terapias integrativas",
      bio: "Sessões de manutenção e acompanhamento terapêutico.",
      email: "laura.menezes@aio.com",
      phone: "11933332222",
      licenseNumber: "CREFITO-3344",
      councilType: "CREFITO",
      defaultCommissionPercent: 30,
      providesCare: true,
      photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
      schedules: { create: [{ weekday: 5, startTime: "09:00", endTime: "17:00" }] },
      professionalServices: { create: [{ serviceId: svcSessaoManutencao.id, compensationType: "default_commission" }] },
    },
  });

  const recepcaoUser = await prisma.user.create({
    data: {
      fullName: "Sofia Almeida",
      email: "recepcao@aio.com",
      phone: "11922221111",
      passwordHash,
      userRoles: { create: { roleId: roleRecepcao.id } },
      employee: { create: { department: "Operação", monthlySalary: 4200 } },
    },
  });
  const sofia = await prisma.professional.create({
    data: {
      userId: recepcaoUser.id,
      name: "Sofia Almeida",
      specialty: "Recepção",
      email: "recepcao@aio.com",
      phone: "11922221111",
      providesCare: false,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      fullName: "Bruno Castro",
      email: "admin@aio.com",
      phone: "11911110000",
      passwordHash,
      userRoles: { create: { roleId: roleAdmin.id } },
      employee: { create: { department: "Administrativo", monthlySalary: 7200 } },
    },
  });
  const bruno = await prisma.professional.create({
    data: {
      userId: adminUser.id,
      name: "Bruno Castro",
      specialty: "Administração",
      email: "admin@aio.com",
      phone: "11911110000",
      providesCare: false,
      monthlyFixedPayment: 7200,
    },
  });
  void sofia;
  void bruno;

  const patient = patientUser.patient!;

  const appt1 = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      professionalId: helena.id,
      serviceId: svcAvaliacaoFacial.id,
      roomId: roomFacial.id,
      date: new Date(Date.now() - 20 * 86400000),
      time: "10:00",
      status: "Realizado",
      statusLogs: { create: { status: "Realizado" } },
    },
  });
  await prisma.payment.create({ data: { appointmentId: appt1.id, grossAmount: 380, method: "Pix" } });
  await prisma.commission.create({ data: { appointmentId: appt1.id, professionalId: helena.id, amount: 114, percent: 30 } });

  const appt2 = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      professionalId: rafael.id,
      serviceId: svcClareamento.id,
      roomId: roomOdonto.id,
      date: new Date(Date.now() - 10 * 86400000),
      time: "14:00",
      status: "Realizado",
      statusLogs: { create: { status: "Realizado" } },
    },
  });
  await prisma.payment.create({ data: { appointmentId: appt2.id, grossAmount: 950, method: "Cartão de crédito" } });
  await prisma.commission.create({ data: { appointmentId: appt2.id, professionalId: rafael.id, amount: 266, percent: 28 } });

  await prisma.appointment.create({
    data: {
      patientId: patient.id,
      professionalId: camila.id,
      serviceId: svcConsultaMedica.id,
      roomId: roomProcedimentos.id,
      date: new Date(Date.now() + 3 * 86400000),
      time: "15:00",
      status: "Agendado",
      statusLogs: { create: { status: "Agendado" } },
    },
  });

  await prisma.appointment.create({
    data: {
      patientId: patient.id,
      professionalId: marcos.id,
      serviceId: svcTerapiaPerformance.id,
      roomId: roomTerapias.id,
      date: new Date(Date.now() + 5 * 86400000),
      time: "08:00",
      status: "Confirmado",
      statusLogs: { create: { status: "Confirmado" } },
    },
  });

  await prisma.appointment.create({
    data: {
      patientId: patient.id,
      professionalId: laura.id,
      serviceId: svcSessaoManutencao.id,
      roomId: roomTerapias.id,
      date: new Date(Date.now() + 7 * 86400000),
      time: "10:00",
      status: "Agendado",
      statusLogs: { create: { status: "Agendado" } },
    },
  });

  const conversa1 = await prisma.conversation.create({
    data: {
      title: "Marina Pires",
      channel: "Aplicacao",
      participants: { create: [{ userId: patientUser.id }, { userId: recepcaoUser.id }] },
      messages: {
        create: [
          { authorUserId: recepcaoUser.id, authorName: "Sofia Almeida", channel: "Aplicacao", body: "Olá Marina, confirmando seu horário de amanhã." },
          { authorUserId: patientUser.id, authorName: "Marina Pires", channel: "Aplicacao", body: "Perfeito, confirmado!" },
        ],
      },
    },
  });
  const conversa2 = await prisma.conversation.create({
    data: {
      title: "Grupo Recepção",
      channel: "Interno",
      participants: { create: [{ userId: recepcaoUser.id }, { userId: adminUser.id }] },
      messages: { create: [{ authorUserId: adminUser.id, authorName: "Bruno Castro", channel: "Interno", body: "Bom dia, agenda de hoje está cheia." }] },
    },
  });
  void conversa1;
  void conversa2;

  await Promise.all([
    prisma.messagingChannel.create({ data: { name: "Recepção", participantRule: "recepcao,admin" } }),
    prisma.messagingChannel.create({ data: { name: "Clínica geral", participantRule: "profissional,admin" } }),
  ]);

  const templateConfirmacao = await prisma.messageTemplate.create({
    data: { occasion: "Confirmação de agendamento", channel: "WhatsApp", body: "Olá {{nome_paciente}}, seu horário está confirmado para {{data_hora}}." },
  });
  const templateLembrete = await prisma.messageTemplate.create({
    data: { occasion: "Lembrete de consulta", channel: "WhatsApp", body: "Olá {{nome_paciente}}, lembrete do seu atendimento em {{data_hora}}." },
  });
  const templateCancelamento = await prisma.messageTemplate.create({
    data: { occasion: "Cancelamento", channel: "E-mail", body: "Olá {{nome_paciente}}, seu agendamento foi cancelado." },
  });

  await Promise.all([
    prisma.notificationRule.create({ data: { trigger: "Agendamento criado", leadTime: "Imediato", channel: "WhatsApp", templateId: templateConfirmacao.id, active: true } }),
    prisma.notificationRule.create({ data: { trigger: "24h antes", leadTime: "24 horas", channel: "WhatsApp", templateId: templateLembrete.id, active: true } }),
  ]);
  void templateCancelamento;

  const plan = await prisma.plan.create({ data: { name: "Plano Bem-Estar", description: "Cobertura para terapias e consultas médicas." } });
  await Promise.all([
    prisma.planService.create({ data: { planId: plan.id, serviceId: svcConsultaMedica.id, coverageRule: "Integral", showPrice: false } }),
    prisma.planService.create({ data: { planId: plan.id, serviceId: svcSessaoManutencao.id, coverageRule: "Parcial", customPrice: 200 } }),
  ]);

  const jobOpenings = await Promise.all([
    prisma.jobOpening.create({ data: { title: "Esteticista", department: "Estética", description: "Vaga para esteticista com experiência em protocolos faciais.", status: "aberta" } }),
    prisma.jobOpening.create({ data: { title: "Dentista Clínico Geral", department: "Odontologia", description: "Vaga para dentista clínico geral, período integral.", status: "aberta" } }),
    prisma.jobOpening.create({ data: { title: "Recepcionista", department: "Operação", description: "Vaga para recepcionista com experiência em agendamento.", status: "encerrada" } }),
    prisma.jobOpening.create({ data: { title: "Fisioterapeuta", department: "Terapias", description: "Vaga para fisioterapeuta especializado em performance.", status: "aberta" } }),
  ]);

  await Promise.all([
    prisma.jobApplication.create({ data: { jobOpeningId: jobOpenings[0].id, candidate: "Ana Souza", email: "ana.souza@example.com", message: "Tenho 5 anos de experiência em estética facial." } }),
    prisma.jobApplication.create({ data: { jobOpeningId: jobOpenings[1].id, candidate: "Pedro Lima", email: "pedro.lima@example.com", message: "Dentista com CRO ativo, disponibilidade imediata." } }),
    prisma.jobApplication.create({ data: { jobOpeningId: jobOpenings[3].id, candidate: "Beatriz Rocha", email: "beatriz.rocha@example.com", message: "Fisioterapeuta especializada em performance esportiva." } }),
    prisma.jobApplication.create({ data: { jobOpeningId: jobOpenings[0].id, candidate: "Carla Mendes", email: "carla.mendes@example.com", message: "Interessada na vaga de esteticista." } }),
  ]);
  await prisma.talentPoolEntry.create({ data: { candidate: "Diego Fontes", email: "diego.fontes@example.com", message: "Interessado em oportunidades futuras na área administrativa." } });

  const settings: [string, string][] = [
    ["clinicName", "Clínica Aurora"],
    ["logoUrl", "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Ccircle cx='32' cy='32' r='30' fill='%23C2410C'/%3E%3C/svg%3E"],
    ["theme.primary", "#C2410C"],
    ["theme.primaryLight", "#F97316"],
    ["theme.bgBase", "#FFF7ED"],
    ["theme.bgSecondary", "#FFEDD5"],
    ["theme.brownDark", "#431407"],
    ["theme.brownMid", "#78350F"],
    ["theme.surface", "#FFFFFF"],
    ["theme.headingFont", "Playfair Display"],
    ["theme.bodyFont", "Inter"],
    ["address", "Av. Paulista, 1000 - São Paulo, SP"],
    ["coordinates.lat", "-23.561684"],
    ["coordinates.lng", "-46.655981"],
    ["whatsappUrl", "https://wa.me/5511999998888"],
    ["instagramUrl", "https://instagram.com/clinicaaurora"],
    ["openingHours", "Seg a Sáb, 08h às 20h"],
    ["about.text", "A Clínica Aurora nasceu para oferecer cuidado integral em estética, odontologia, medicina e terapias, com atendimento humanizado e tecnologia de ponta."],
  ];
  await prisma.appSetting.createMany({ data: settings.map(([key, value]) => ({ key, value })) });

  await Promise.all([
    prisma.banner.create({ data: { title: "Bem-estar em primeiro lugar", subtitle: "Conheça nossos protocolos exclusivos", ctaText: "Agendar agora", ctaUrl: "/agendar", imageUrl: "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c", sortOrder: 0, active: true } }),
    prisma.banner.create({ data: { title: "Odontologia de alto padrão", subtitle: "Sorria com confiança", ctaText: "Ver serviços", ctaUrl: "/servicos", imageUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5", sortOrder: 1, active: true } }),
    prisma.banner.create({ data: { title: "Equipe multidisciplinar", subtitle: "Cuidado completo em um só lugar", ctaText: "Conhecer equipe", ctaUrl: "/profissionais", imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf", sortOrder: 2, active: true } }),
  ]);

  await Promise.all([
    prisma.historicMilestone.create({ data: { yearLabel: "2018", title: "Fundação", description: "Abertura da primeira unidade da Clínica Aurora.", sortOrder: 0 } }),
    prisma.historicMilestone.create({ data: { yearLabel: "2020", title: "Expansão odontológica", description: "Inauguração da ala de odontologia premium.", sortOrder: 1 } }),
    prisma.historicMilestone.create({ data: { yearLabel: "2022", title: "Novo centro de terapias", description: "Abertura do centro de terapias integrativas.", sortOrder: 2 } }),
    prisma.historicMilestone.create({ data: { yearLabel: "2024", title: "Certificação de excelência", description: "Reconhecimento pela qualidade no atendimento.", sortOrder: 3 } }),
  ]);

  await prisma.missionVisionValue.create({
    data: {
      mission: "Proporcionar cuidado integral com excelência técnica e acolhimento humano.",
      vision: "Ser referência regional em saúde e bem-estar premium.",
      values: "Ética, excelência, empatia e inovação.",
    },
  });

  await Promise.all([
    prisma.aboutGalleryItem.create({ data: { imageUrl: "https://images.unsplash.com/photo-1629909613654-28e377c37b09", sortOrder: 0 } }),
    prisma.aboutGalleryItem.create({ data: { imageUrl: "https://images.unsplash.com/photo-1629909615184-74f495363b67", sortOrder: 1 } }),
    prisma.aboutGalleryItem.create({ data: { imageUrl: "https://images.unsplash.com/photo-1629909613655-be4f4c37a0a3", sortOrder: 2 } }),
  ]);

  await prisma.clinic.create({
    data: { name: "Clínica Aurora", email: "contato@clinicaaurora.com", phone: "1130001000", mpSandboxMode: true, remindersEnabled: true },
  });

  const months = ["Dez/25", "Jan/26", "Fev/26", "Mar/26", "Abr/26", "Mai/26"];
  await prisma.cost.createMany({
    data: months.flatMap((month) => [
      { monthLabel: month, type: "Fixo" as const, name: "Aluguel", value: 12000 },
      { monthLabel: month, type: "Variavel" as const, name: "Marketing", value: 3200 },
    ]),
  });

  const baseRevenue = 118000;
  await prisma.metricsSnapshot.createMany({
    data: months.map((month, index) => {
      const revenue = baseRevenue + index * 7000;
      return {
        monthLabel: month,
        revenue,
        profit: revenue * 0.34,
        appointments: 180 + index * 12,
        ticketAverage: 480 + index * 5,
        occupancyRate: 62 + index * 2,
        cancellationRate: 12 - index * 0.5,
        newPatients: 24 + index * 3,
      };
    }),
  });

  await Promise.all([
    prisma.movementLog.create({ data: { eventType: "NEW_APPOINTMENT", description: "Agendamento de exemplo criado no seed.", userId: recepcaoUser.id } }),
    prisma.movementLog.create({ data: { eventType: "PAYMENT_CONFIRMED", description: "Pagamento de exemplo confirmado no seed.", userId: adminUser.id } }),
  ]);

  console.log("Seed concluído com sucesso.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
