import type { ClinicConfig } from "../types";

export const defaultConfig: ClinicConfig = {
  clinicName: "Clínica Aurora",
  logoUrl:
    "data:image/svg+xml,%3Csvg width='96' height='96' viewBox='0 0 96 96' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='96' height='96' rx='22' fill='%23C2410C'/%3E%3Cpath d='M48 18c10 16 20 24 20 38 0 11-9 20-20 20s-20-9-20-20c0-14 10-22 20-38Z' fill='white' fill-opacity='.92'/%3E%3C/svg%3E",
  theme: {
    primary: "#C2410C",
    primaryLight: "#F59E0B",
    bgBase: "#FAF7F2",
    bgSecondary: "#EFE7D8",
    brownDark: "#3D2817",
    brownMid: "#7A5C3E",
    surface: "#FFFFFF",
    headingFont: "Playfair Display",
    bodyFont: "Inter",
  },
  address: "Av. Paulista, 1578, Bela Vista, São Paulo - SP",
  coordinates: { lat: -23.561414, lng: -46.655881 },
  whatsappUrl: "https://wa.me/5511999999999",
  instagramUrl: "https://instagram.com/clinicaaurora",
  openingHours: "Segunda a sexta, 8h às 20h. Sábado, 8h às 14h.",
  banners: [
    {
      id: "banner-1",
      title: "Cuidado premium com agenda inteligente",
      subtitle: "Serviços especializados, profissionais selecionados e acompanhamento próximo em cada etapa.",
      ctaText: "Agendar avaliação",
      ctaUrl: "/agendar",
      imageUrl:
        "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1600&q=80",
      order: 1,
      active: true,
    },
    {
      id: "banner-2",
      title: "Experiência acolhedora do primeiro contato ao retorno",
      subtitle: "Fluxos pensados para reduzir espera, organizar mensagens e manter seu plano de cuidado visível.",
      ctaText: "Conhecer serviços",
      ctaUrl: "/servicos",
      imageUrl:
        "https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=1600&q=80",
      order: 2,
      active: true,
    },
    {
      id: "banner-3",
      title: "Equipe multidisciplinar em um só lugar",
      subtitle: "Profissionais habilitados para tratamentos avançados, com agenda integrada e métricas claras.",
      ctaText: "Ver profissionais",
      ctaUrl: "/profissionais",
      imageUrl:
        "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=1600&q=80",
      order: 3,
      active: true,
    },
  ],
  about: {
    text:
      "Nossa clínica nasceu para oferecer uma jornada de cuidado particular, precisa e acolhedora. Unimos tecnologia, escuta clínica e ambientes preparados para atendimentos de alto valor, com foco em segurança, previsibilidade e relacionamento contínuo.",
    milestones: [
      {
        date: "2018",
        title: "Primeira unidade",
        description: "Início das operações com agenda especializada e atendimento particular.",
      },
      {
        date: "2020",
        title: "Protocolos integrados",
        description: "Padronização de jornadas clínicas e acompanhamento digital dos pacientes.",
      },
      {
        date: "2023",
        title: "Expansão da equipe",
        description: "Entrada de novos especialistas e ampliação das salas de procedimento.",
      },
      {
        date: "2025",
        title: "Experiência premium",
        description: "Renovação da estrutura, canais de relacionamento e indicadores de qualidade.",
      },
    ],
    mvv: {
      mission: "Entregar cuidado especializado com clareza, segurança e atenção aos detalhes.",
      vision: "Ser referência regional em experiências clínicas premium e gestão orientada por dados.",
      values: "Ética, acolhimento, precisão técnica, transparência e melhoria contínua.",
    },
    gallery: [
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=900&q=80",
    ],
  },
  messageTemplates: [
    {
      id: "tpl-confirmacao-wa",
      occasion: "Confirmação",
      channel: "WhatsApp",
      body: "Olá, {{nome_paciente}}. Sua consulta de {{servico}} com {{profissional}} está agendada para {{data}} às {{horario}}. {{nome_clinica}}",
    },
    {
      id: "tpl-lembrete-email",
      occasion: "Lembrete",
      channel: "E-mail",
      body: "Lembramos sua consulta em {{data}} às {{horario}}. Em caso de dúvidas, responda este e-mail.",
    },
    {
      id: "tpl-cancelamento-wa",
      occasion: "Cancelamento",
      channel: "WhatsApp",
      body: "{{nome_paciente}}, seu agendamento foi cancelado. Podemos ajudar com uma nova data?",
    },
  ],
  notificationRules: [
    {
      id: "rule-1",
      trigger: "Confirmação",
      leadTime: "Imediatamente após agendar",
      channel: "WhatsApp",
      templateId: "tpl-confirmacao-wa",
      active: true,
    },
    {
      id: "rule-2",
      trigger: "Lembrete",
      leadTime: "24h antes",
      channel: "Ambos",
      templateId: "tpl-lembrete-email",
      active: true,
    },
  ],
  integrations: [
    {
      id: "gmail-oauth",
      name: "Gmail OAuth",
      status: "mock",
      description: "Autorização de caixa postal para envio e leitura de mensagens.",
    },
    {
      id: "mercado-pago",
      name: "Mercado Pago",
      status: "mock",
      description: "Cobranças, links de pagamento e conciliação.",
    },
    {
      id: "whatsapp-business",
      name: "WhatsApp Business API",
      status: "mock",
      description: "Mensagens transacionais e conversas operacionais.",
    },
  ],
  paymentRequiredAtBooking: false,
};
