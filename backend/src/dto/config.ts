import { prisma } from "../db.js";

export type ClinicConfig = {
  clinicName: string;
  logoUrl: string;
  theme: {
    primary: string;
    primaryLight: string;
    bgBase: string;
    bgSecondary: string;
    brownDark: string;
    brownMid: string;
    surface: string;
    headingFont: string;
    bodyFont: string;
  };
  address: string;
  coordinates: { lat: number; lng: number };
  whatsappUrl: string;
  instagramUrl: string;
  openingHours: string;
  banners: unknown[];
  about: {
    text: string;
    milestones: { date: string; title: string; description: string }[];
    mvv: { mission: string; vision: string; values: string };
    gallery: string[];
  };
  messageTemplates: unknown[];
  notificationRules: unknown[];
  integrations: unknown[];
  paymentRequiredAtBooking: boolean;
};

const SETTING_KEYS = [
  "clinicName",
  "logoUrl",
  "theme.primary",
  "theme.primaryLight",
  "theme.bgBase",
  "theme.bgSecondary",
  "theme.brownDark",
  "theme.brownMid",
  "theme.surface",
  "theme.headingFont",
  "theme.bodyFont",
  "address",
  "coordinates.lat",
  "coordinates.lng",
  "whatsappUrl",
  "instagramUrl",
  "openingHours",
  "about.text",
] as const;

const FALLBACK_INTEGRATIONS = [
  { id: "gmail-oauth", name: "Gmail OAuth", status: "mock" as const, description: "Autenticação e envio de emails via Gmail." },
  { id: "mercado-pago", name: "Mercado Pago", status: "mock" as const, description: "Recebimento de pagamentos online." },
  { id: "whatsapp-business", name: "WhatsApp Business", status: "mock" as const, description: "Notificações e mensagens via WhatsApp." },
];

export const buildClinicConfig = async (): Promise<ClinicConfig> => {
  const settings = await prisma.appSetting.findMany();
  const map = new Map(settings.map((setting) => [setting.key, setting.value]));
  const get = (key: string, fallback = "") => map.get(key) ?? fallback;

  const [banners, milestones, mvv, gallery, templates, rules, integrationSettings, clinic] = await Promise.all([
    prisma.banner.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.historicMilestone.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.missionVisionValue.findFirst(),
    prisma.aboutGalleryItem.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.messageTemplate.findMany(),
    prisma.notificationRule.findMany(),
    prisma.appSetting.findMany({ where: { valueType: "integration" } }),
    prisma.clinic.findFirst(),
  ]);

  const integrations = integrationSettings.length
    ? integrationSettings.map((setting) => {
        const parsed = JSON.parse(setting.value) as { name: string; status: string; description: string };
        return { id: setting.key.replace(/^integration\./, ""), ...parsed };
      })
    : FALLBACK_INTEGRATIONS;

  return {
    clinicName: get("clinicName", "Clínica"),
    logoUrl: get("logoUrl"),
    theme: {
      primary: get("theme.primary", "#C2410C"),
      primaryLight: get("theme.primaryLight", "#F97316"),
      bgBase: get("theme.bgBase", "#FFF7ED"),
      bgSecondary: get("theme.bgSecondary", "#FFEDD5"),
      brownDark: get("theme.brownDark", "#431407"),
      brownMid: get("theme.brownMid", "#78350F"),
      surface: get("theme.surface", "#FFFFFF"),
      headingFont: get("theme.headingFont", "Playfair Display"),
      bodyFont: get("theme.bodyFont", "Inter"),
    },
    address: get("address"),
    coordinates: { lat: Number(get("coordinates.lat", "0")), lng: Number(get("coordinates.lng", "0")) },
    whatsappUrl: get("whatsappUrl"),
    instagramUrl: get("instagramUrl"),
    openingHours: get("openingHours"),
    banners: banners.map((banner) => ({
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      ctaText: banner.ctaText,
      ctaUrl: banner.ctaUrl,
      imageUrl: banner.imageUrl,
      order: banner.sortOrder,
      active: banner.active,
    })),
    about: {
      text: get("about.text"),
      milestones: milestones.map((m) => ({ date: m.yearLabel, title: m.title, description: m.description })),
      mvv: { mission: mvv?.mission ?? "", vision: mvv?.vision ?? "", values: mvv?.values ?? "" },
      gallery: gallery.map((g) => g.imageUrl),
    },
    messageTemplates: templates.map((t) => ({ id: t.id, occasion: t.occasion, channel: t.channel, body: t.body })),
    notificationRules: rules.map((r) => ({
      id: r.id,
      trigger: r.trigger,
      leadTime: r.leadTime,
      channel: r.channel,
      templateId: r.templateId,
      active: r.active,
    })),
    integrations,
    paymentRequiredAtBooking: clinic?.paymentRequiredAtBooking ?? false,
  };
};

export const applyClinicConfig = async (config: ClinicConfig): Promise<void> => {
  const values: Record<string, string> = {
    clinicName: config.clinicName ?? "",
    logoUrl: config.logoUrl ?? "",
    "theme.primary": config.theme?.primary ?? "",
    "theme.primaryLight": config.theme?.primaryLight ?? "",
    "theme.bgBase": config.theme?.bgBase ?? "",
    "theme.bgSecondary": config.theme?.bgSecondary ?? "",
    "theme.brownDark": config.theme?.brownDark ?? "",
    "theme.brownMid": config.theme?.brownMid ?? "",
    "theme.surface": config.theme?.surface ?? "",
    "theme.headingFont": config.theme?.headingFont ?? "",
    "theme.bodyFont": config.theme?.bodyFont ?? "",
    address: config.address ?? "",
    "coordinates.lat": String(config.coordinates?.lat ?? 0),
    "coordinates.lng": String(config.coordinates?.lng ?? 0),
    whatsappUrl: config.whatsappUrl ?? "",
    instagramUrl: config.instagramUrl ?? "",
    openingHours: config.openingHours ?? "",
    "about.text": config.about?.text ?? "",
  };

  for (const key of SETTING_KEYS) {
    await prisma.appSetting.upsert({
      where: { key },
      create: { key, value: values[key], valueType: "string" },
      update: { value: values[key] },
    });
  }

  await prisma.historicMilestone.deleteMany();
  if (config.about?.milestones?.length) {
    await prisma.historicMilestone.createMany({
      data: config.about.milestones.map((m, index) => ({
        yearLabel: m.date,
        title: m.title,
        description: m.description,
        sortOrder: index,
      })),
    });
  }

  await prisma.aboutGalleryItem.deleteMany();
  if (config.about?.gallery?.length) {
    await prisma.aboutGalleryItem.createMany({
      data: config.about.gallery.map((imageUrl, index) => ({ imageUrl, sortOrder: index })),
    });
  }

  const existingMvv = await prisma.missionVisionValue.findFirst();
  const mvv = config.about?.mvv ?? { mission: "", vision: "", values: "" };
  if (existingMvv) {
    await prisma.missionVisionValue.update({ where: { id: existingMvv.id }, data: mvv });
  } else {
    await prisma.missionVisionValue.create({ data: mvv });
  }
};
