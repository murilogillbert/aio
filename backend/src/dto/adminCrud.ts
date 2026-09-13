import { randomUUID } from "node:crypto";
import { prisma } from "../db.js";
import { badRequest, notFound } from "../lib/httpError.js";
import { naiveDate } from "../lib/datetime.js";

export type AdminCrudItem = { id: string; title: string; subtitle: string; status: string; fields: Record<string, string> };

const str = (fields: Record<string, string>, key: string, fallback = "") => fields[key] ?? fallback;
const num = (fields: Record<string, string>, key: string, fallback = 0) => {
  const value = Number(fields[key]);
  return Number.isFinite(value) ? value : fallback;
};
const boolVal = (fields: Record<string, string>, key: string, fallback = false) =>
  fields[key] === undefined ? fallback : fields[key] === "true";

type ResourceHandler = {
  list: () => Promise<AdminCrudItem[]>;
  create: (fields: Record<string, string>) => Promise<AdminCrudItem>;
  update: (id: string, fields: Record<string, string>) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

const attachCategory = async (serviceId: string, categoryName: string) => {
  await prisma.serviceCategory.deleteMany({ where: { serviceId } });
  if (!categoryName) return;
  const category =
    (await prisma.category.findFirst({ where: { name: categoryName, type: "servico" } })) ??
    (await prisma.category.create({ data: { name: categoryName, type: "servico" } }));
  await prisma.serviceCategory.create({ data: { serviceId, categoryId: category.id } });
};

const handlers: Record<string, ResourceHandler> = {
  profissionais: {
    async list() {
      const rows = await prisma.professional.findMany();
      return rows.map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: p.specialty,
        status: p.providesCare ? "atende" : "administrativo",
        fields: {
          name: p.name,
          specialty: p.specialty,
          bio: p.bio,
          photoUrl: p.photoUrl,
          defaultCommission: String(p.defaultCommissionPercent),
          monthlyFixedPayment: p.monthlyFixedPayment ? String(p.monthlyFixedPayment) : "",
          providesCare: String(p.providesCare),
        },
      }));
    },
    async create(fields) {
      const created = await prisma.professional.create({
        data: {
          name: str(fields, "name"),
          specialty: str(fields, "specialty"),
          bio: str(fields, "bio"),
          photoUrl: str(fields, "photoUrl"),
          defaultCommissionPercent: num(fields, "defaultCommission"),
          monthlyFixedPayment: fields.monthlyFixedPayment ? num(fields, "monthlyFixedPayment") : null,
          providesCare: boolVal(fields, "providesCare", true),
        },
      });
      return (await handlers.profissionais.list()).find((item) => item.id === created.id)!;
    },
    async update(id, fields) {
      await prisma.professional.update({
        where: { id },
        data: {
          name: str(fields, "name"),
          specialty: str(fields, "specialty"),
          bio: str(fields, "bio"),
          photoUrl: str(fields, "photoUrl"),
          defaultCommissionPercent: num(fields, "defaultCommission"),
          monthlyFixedPayment: fields.monthlyFixedPayment ? num(fields, "monthlyFixedPayment") : null,
          providesCare: boolVal(fields, "providesCare", true),
        },
      });
    },
    async remove(id) {
      await prisma.professional.delete({ where: { id } });
    },
  },

  servicos: {
    async list() {
      const rows = await prisma.service.findMany({ include: { serviceCategories: { include: { category: true } } } });
      return rows.map((s) => ({
        id: s.id,
        title: s.name,
        subtitle: s.shortDescription,
        status: s.isActive ? "ativo" : "inativo",
        fields: {
          name: s.name,
          category: s.serviceCategories[0]?.category.name ?? "",
          shortDescription: s.shortDescription,
          description: s.description,
          durationMinutes: String(s.durationMinutes),
          basePrice: String(s.basePrice),
        },
      }));
    },
    async create(fields) {
      const created = await prisma.service.create({
        data: {
          name: str(fields, "name"),
          shortDescription: str(fields, "shortDescription"),
          description: str(fields, "description"),
          durationMinutes: num(fields, "durationMinutes", 60),
          basePrice: num(fields, "basePrice"),
        },
      });
      await attachCategory(created.id, str(fields, "category"));
      return (await handlers.servicos.list()).find((item) => item.id === created.id)!;
    },
    async update(id, fields) {
      await prisma.service.update({
        where: { id },
        data: {
          name: str(fields, "name"),
          shortDescription: str(fields, "shortDescription"),
          description: str(fields, "description"),
          durationMinutes: num(fields, "durationMinutes", 60),
          basePrice: num(fields, "basePrice"),
        },
      });
      await attachCategory(id, str(fields, "category"));
    },
    async remove(id) {
      await prisma.service.delete({ where: { id } });
    },
  },

  vagas: {
    async list() {
      const rows = await prisma.jobOpening.findMany();
      return rows.map((j) => ({
        id: j.id,
        title: j.title,
        subtitle: j.department,
        status: j.status,
        fields: { title: j.title, department: j.department, description: j.description, status: j.status },
      }));
    },
    async create(fields) {
      const created = await prisma.jobOpening.create({
        data: {
          title: str(fields, "title"),
          department: str(fields, "department"),
          description: str(fields, "description"),
          status: str(fields, "status", "aberta"),
        },
      });
      return (await handlers.vagas.list()).find((item) => item.id === created.id)!;
    },
    async update(id, fields) {
      await prisma.jobOpening.update({
        where: { id },
        data: {
          title: str(fields, "title"),
          department: str(fields, "department"),
          description: str(fields, "description"),
          status: str(fields, "status", "aberta"),
        },
      });
    },
    async remove(id) {
      await prisma.jobOpening.delete({ where: { id } });
    },
  },

  categorias: {
    async list() {
      const rows = await prisma.category.findMany();
      return rows.map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: c.type,
        status: c.type,
        fields: { name: c.name, type: c.type },
      }));
    },
    async create(fields) {
      const created = await prisma.category.create({ data: { name: str(fields, "name"), type: str(fields, "type") } });
      return (await handlers.categorias.list()).find((item) => item.id === created.id)!;
    },
    async update(id, fields) {
      await prisma.category.update({ where: { id }, data: { name: str(fields, "name"), type: str(fields, "type") } });
    },
    async remove(id) {
      await prisma.category.delete({ where: { id } });
    },
  },

  salas: {
    async list() {
      const rows = await prisma.room.findMany();
      return rows.map((r) => ({
        id: r.id,
        title: r.name,
        subtitle: `Capacidade: ${r.capacity}`,
        status: r.isActive ? "ativo" : "inativo",
        fields: { name: r.name, capacity: String(r.capacity), notes: r.notes },
      }));
    },
    async create(fields) {
      const created = await prisma.room.create({
        data: { name: str(fields, "name"), capacity: num(fields, "capacity"), notes: str(fields, "notes") },
      });
      return (await handlers.salas.list()).find((item) => item.id === created.id)!;
    },
    async update(id, fields) {
      await prisma.room.update({
        where: { id },
        data: { name: str(fields, "name"), capacity: num(fields, "capacity"), notes: str(fields, "notes") },
      });
    },
    async remove(id) {
      await prisma.room.delete({ where: { id } });
    },
  },

  equipamentos: {
    async list() {
      const rows = await prisma.equipment.findMany();
      return rows.map((e) => ({
        id: e.id,
        title: e.name,
        subtitle: e.category,
        status: e.status,
        fields: { name: e.name, category: e.category, quantity: String(e.quantity), unitValue: String(e.unitValue) },
      }));
    },
    async create(fields) {
      const created = await prisma.equipment.create({
        data: {
          name: str(fields, "name"),
          category: str(fields, "category"),
          quantity: num(fields, "quantity"),
          unitValue: num(fields, "unitValue"),
        },
      });
      return (await handlers.equipamentos.list()).find((item) => item.id === created.id)!;
    },
    async update(id, fields) {
      await prisma.equipment.update({
        where: { id },
        data: {
          name: str(fields, "name"),
          category: str(fields, "category"),
          quantity: num(fields, "quantity"),
          unitValue: num(fields, "unitValue"),
        },
      });
    },
    async remove(id) {
      await prisma.equipment.delete({ where: { id } });
    },
  },

  templates: {
    async list() {
      const rows = await prisma.messageTemplate.findMany();
      return rows.map((t) => ({
        id: t.id,
        title: t.occasion,
        subtitle: t.channel,
        status: t.channel,
        fields: { occasion: t.occasion, channel: t.channel, body: t.body },
      }));
    },
    async create(fields) {
      const created = await prisma.messageTemplate.create({
        data: { occasion: str(fields, "occasion"), channel: str(fields, "channel"), body: str(fields, "body") },
      });
      return (await handlers.templates.list()).find((item) => item.id === created.id)!;
    },
    async update(id, fields) {
      await prisma.messageTemplate.update({
        where: { id },
        data: { occasion: str(fields, "occasion"), channel: str(fields, "channel"), body: str(fields, "body") },
      });
    },
    async remove(id) {
      await prisma.messageTemplate.delete({ where: { id } });
    },
  },

  notificacoes: {
    async list() {
      const rows = await prisma.notificationRule.findMany();
      return rows.map((r) => ({
        id: r.id,
        title: r.trigger,
        subtitle: r.leadTime,
        status: r.active ? "ativo" : "inativo",
        fields: {
          trigger: r.trigger,
          leadTime: r.leadTime,
          channel: r.channel,
          templateId: r.templateId,
          active: String(r.active),
        },
      }));
    },
    async create(fields) {
      let templateId = str(fields, "templateId");
      let template = templateId ? await prisma.messageTemplate.findUnique({ where: { id: templateId } }) : null;
      if (!template) {
        template = await prisma.messageTemplate.findFirst();
        if (!template) throw badRequest("Nenhum template de mensagem cadastrado.");
        templateId = template.id;
      }
      const created = await prisma.notificationRule.create({
        data: {
          trigger: str(fields, "trigger"),
          leadTime: str(fields, "leadTime"),
          channel: str(fields, "channel"),
          templateId,
          active: boolVal(fields, "active", true),
        },
      });
      return (await handlers.notificacoes.list()).find((item) => item.id === created.id)!;
    },
    async update(id, fields) {
      let templateId = str(fields, "templateId");
      let template = templateId ? await prisma.messageTemplate.findUnique({ where: { id: templateId } }) : null;
      if (!template) {
        template = await prisma.messageTemplate.findFirst();
        if (template) templateId = template.id;
      }
      await prisma.notificationRule.update({
        where: { id },
        data: {
          trigger: str(fields, "trigger"),
          leadTime: str(fields, "leadTime"),
          channel: str(fields, "channel"),
          templateId: templateId || undefined,
          active: boolVal(fields, "active", true),
        },
      });
    },
    async remove(id) {
      await prisma.notificationRule.delete({ where: { id } });
    },
  },

  planos: {
    async list() {
      const rows = await prisma.plan.findMany();
      return rows.map((p) => ({
        id: p.id,
        title: p.name,
        subtitle: p.description,
        status: "",
        fields: { name: p.name, description: p.description },
      }));
    },
    async create(fields) {
      const created = await prisma.plan.create({ data: { name: str(fields, "name"), description: str(fields, "description") } });
      return (await handlers.planos.list()).find((item) => item.id === created.id)!;
    },
    async update(id, fields) {
      await prisma.plan.update({ where: { id }, data: { name: str(fields, "name"), description: str(fields, "description") } });
    },
    async remove(id) {
      await prisma.plan.delete({ where: { id } });
    },
  },

  "chat-interno": {
    async list() {
      const rows = await prisma.messagingChannel.findMany();
      return rows.map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: c.participantRule,
        status: "",
        fields: { name: c.name, participantRule: c.participantRule },
      }));
    },
    async create(fields) {
      const created = await prisma.messagingChannel.create({
        data: { name: str(fields, "name"), participantRule: str(fields, "participantRule") },
      });
      return (await handlers["chat-interno"].list()).find((item) => item.id === created.id)!;
    },
    async update(id, fields) {
      await prisma.messagingChannel.update({
        where: { id },
        data: { name: str(fields, "name"), participantRule: str(fields, "participantRule") },
      });
    },
    async remove(id) {
      await prisma.messagingChannel.delete({ where: { id } });
    },
  },

  integracoes: {
    async list() {
      const rows = await prisma.appSetting.findMany({ where: { valueType: "integration" } });
      return rows.map((setting) => {
        const parsed = JSON.parse(setting.value) as { name: string; status: string; description: string };
        return { id: setting.id, title: parsed.name, subtitle: parsed.description, status: parsed.status, fields: parsed as unknown as Record<string, string> };
      });
    },
    async create(fields) {
      const payload = { name: str(fields, "name"), status: str(fields, "status", "mock"), description: str(fields, "description") };
      const created = await prisma.appSetting.create({
        data: { key: `integration.${randomUUID()}`, value: JSON.stringify(payload), valueType: "integration" },
      });
      return { id: created.id, title: payload.name, subtitle: payload.description, status: payload.status, fields: payload };
    },
    async update(id, fields) {
      const payload = { name: str(fields, "name"), status: str(fields, "status", "mock"), description: str(fields, "description") };
      await prisma.appSetting.update({ where: { id }, data: { value: JSON.stringify(payload) } });
    },
    async remove(id) {
      await prisma.appSetting.delete({ where: { id } });
    },
  },

  banners: {
    async list() {
      const rows = await prisma.banner.findMany({ orderBy: { sortOrder: "asc" } });
      return rows.map((b) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        status: b.active ? "ativo" : "inativo",
        fields: {
          title: b.title,
          subtitle: b.subtitle,
          ctaText: b.ctaText,
          ctaUrl: b.ctaUrl,
          imageUrl: b.imageUrl,
          order: String(b.sortOrder),
          active: String(b.active),
        },
      }));
    },
    async create(fields) {
      const created = await prisma.banner.create({
        data: {
          title: str(fields, "title"),
          subtitle: str(fields, "subtitle"),
          ctaText: str(fields, "ctaText"),
          ctaUrl: str(fields, "ctaUrl"),
          imageUrl: str(fields, "imageUrl"),
          sortOrder: num(fields, "order"),
          active: boolVal(fields, "active", true),
        },
      });
      return (await handlers.banners.list()).find((item) => item.id === created.id)!;
    },
    async update(id, fields) {
      await prisma.banner.update({
        where: { id },
        data: {
          title: str(fields, "title"),
          subtitle: str(fields, "subtitle"),
          ctaText: str(fields, "ctaText"),
          ctaUrl: str(fields, "ctaUrl"),
          imageUrl: str(fields, "imageUrl"),
          sortOrder: num(fields, "order"),
          active: boolVal(fields, "active", true),
        },
      });
    },
    async remove(id) {
      await prisma.banner.delete({ where: { id } });
    },
  },

  custos: {
    async list() {
      const rows = await prisma.cost.findMany();
      return rows.map((c) => ({
        id: c.id,
        title: c.name,
        subtitle: c.monthLabel,
        status: c.type === "Fixo" ? "fixo" : "variavel",
        fields: { name: c.name, month: c.monthLabel, type: c.type === "Fixo" ? "fixo" : "variavel", value: String(c.value) },
      }));
    },
    async create(fields) {
      const created = await prisma.cost.create({
        data: {
          name: str(fields, "name"),
          monthLabel: str(fields, "month"),
          type: str(fields, "type") === "variavel" ? "Variavel" : "Fixo",
          value: num(fields, "value"),
        },
      });
      return (await handlers.custos.list()).find((item) => item.id === created.id)!;
    },
    async update(id, fields) {
      await prisma.cost.update({
        where: { id },
        data: {
          name: str(fields, "name"),
          monthLabel: str(fields, "month"),
          type: str(fields, "type") === "variavel" ? "Variavel" : "Fixo",
          value: num(fields, "value"),
        },
      });
    },
    async remove(id) {
      await prisma.cost.delete({ where: { id } });
    },
  },

  movimento: {
    async list() {
      const rows = await prisma.movementLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
      return rows.map((m) => ({
        id: m.id,
        title: m.eventType,
        subtitle: m.description,
        status: "",
        fields: { eventType: m.eventType, description: m.description, createdAt: m.createdAt.toISOString().slice(0, 16) },
      }));
    },
    async create(fields) {
      const created = await prisma.movementLog.create({
        data: {
          eventType: str(fields, "eventType"),
          description: str(fields, "description"),
          createdAt: fields.createdAt ? naiveDate(fields.createdAt) : new Date(),
        },
      });
      return (await handlers.movimento.list()).find((item) => item.id === created.id)!;
    },
    async update(id, fields) {
      await prisma.movementLog.update({
        where: { id },
        data: {
          eventType: str(fields, "eventType"),
          description: str(fields, "description"),
          createdAt: fields.createdAt ? naiveDate(fields.createdAt) : undefined,
        },
      });
    },
    async remove(id) {
      await prisma.movementLog.delete({ where: { id } });
    },
  },
};

export const getHandler = (resource: string): ResourceHandler => {
  const handler = handlers[resource];
  if (!handler) throw notFound(`Recurso '${resource}' não suportado.`);
  return handler;
};
