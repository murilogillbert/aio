import { FormEvent, useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, Input, Modal, Select, Skeleton, Textarea } from "../../components/ui";
import { MiniBarChart, PageHeader, StatCard, StatGrid } from "../../components/Page";
import { useConfig } from "../../context/ConfigContext";
import { useToast } from "../../context/ToastContext";
import type { AdminCrudField, AdminCrudItem, ClinicConfig, MetricsPoint } from "../../types";
import { currency } from "../../utils";
import {
  createAdminCrud,
  deleteAdminCrud,
  getMetricBreakdowns,
  getMetricasGerais,
  listAdminCrud,
  updateAdminCrud,
} from "../../services/api";
import { AdminServiceEditor } from "./AdminServiceEditor";

const fieldSets: Record<string, AdminCrudField[]> = {
  profissionais: [
    { key: "name", label: "Nome" },
    { key: "email", label: "Email de acesso (login)" },
    { key: "phone", label: "Telefone" },
    { key: "specialty", label: "Especialidade" },
    { key: "bio", label: "Bio", type: "textarea" },
    { key: "photoUrl", label: "Foto URL" },
    { key: "defaultCommission", label: "Comissao padrao (%)", type: "number" },
    { key: "monthlyFixedPayment", label: "Pagamento fixo mensal", type: "number" },
    { key: "providesCare", label: "Atende pacientes", type: "select", options: ["true", "false"] },
  ],
  servicos: [
    { key: "name", label: "Nome" },
    { key: "category", label: "Categoria" },
    { key: "shortDescription", label: "Descricao curta" },
    { key: "description", label: "Descricao completa", type: "textarea" },
    { key: "durationMinutes", label: "Duracao em minutos", type: "number" },
    { key: "basePrice", label: "Valor base", type: "number" },
  ],
  vagas: [
    { key: "title", label: "Titulo" },
    { key: "department", label: "Departamento" },
    { key: "description", label: "Descricao", type: "textarea" },
    { key: "status", label: "Status", type: "select", options: ["aberta", "encerrada"] },
  ],
  categorias: [
    { key: "name", label: "Nome" },
    { key: "type", label: "Tipo" },
  ],
  salas: [
    { key: "name", label: "Nome" },
    { key: "capacity", label: "Capacidade", type: "number" },
    { key: "notes", label: "Observacoes", type: "textarea" },
  ],
  equipamentos: [
    { key: "name", label: "Nome" },
    { key: "category", label: "Categoria" },
    { key: "quantity", label: "Quantidade", type: "number" },
    { key: "unitValue", label: "Valor unitario", type: "number" },
  ],
  templates: [
    { key: "occasion", label: "Ocasião" },
    { key: "channel", label: "Canal", type: "select", options: ["WhatsApp", "E-mail"] },
    { key: "body", label: "Mensagem", type: "textarea" },
  ],
  notificacoes: [
    { key: "trigger", label: "Gatilho" },
    { key: "leadTime", label: "Antecedencia" },
    { key: "channel", label: "Canal", type: "select", options: ["WhatsApp", "E-mail", "Ambos"] },
    { key: "templateId", label: "Template ID" },
    { key: "active", label: "Ativo", type: "select", options: ["true", "false"] },
  ],
  planos: [
    { key: "name", label: "Nome" },
    { key: "description", label: "Descricao", type: "textarea" },
  ],
  "chat-interno": [
    { key: "name", label: "Nome do canal" },
    { key: "participantRule", label: "Regra de participantes" },
  ],
  banners: [
    { key: "title", label: "Titulo" },
    { key: "subtitle", label: "Subtitulo", type: "textarea" },
    { key: "ctaText", label: "Texto CTA" },
    { key: "ctaUrl", label: "URL CTA" },
    { key: "imageUrl", label: "Imagem URL" },
    { key: "order", label: "Ordem", type: "number" },
    { key: "active", label: "Ativo", type: "select", options: ["true", "false"] },
  ],
  custos: [
    { key: "name", label: "Nome" },
    { key: "month", label: "Mes" },
    { key: "type", label: "Tipo", type: "select", options: ["fixo", "variavel"] },
    { key: "value", label: "Valor", type: "number" },
  ],
  usuarios: [
    { key: "fullName", label: "Nome" },
    { key: "email", label: "Email de acesso (login)" },
    { key: "phone", label: "Telefone" },
    { key: "role", label: "Papel", type: "select", options: ["paciente", "recepcao", "admin"] },
    { key: "isActive", label: "Ativo", type: "select", options: ["true", "false"] },
  ],
  movimento: [
    { key: "eventType", label: "Tipo de evento" },
    { key: "description", label: "Descricao", type: "textarea" },
    { key: "createdAt", label: "Data e hora", type: "datetime-local" },
  ],
};

function AdminCrudPage({
  resource,
  title,
  description,
  fields = fieldSets[resource] ?? [{ key: "name", label: "Nome" }],
}: {
  resource: string;
  title: string;
  description: string;
  fields?: AdminCrudField[];
}) {
  const [items, setItems] = useState<AdminCrudItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminCrudItem | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listAdminCrud(resource));
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    void load();
  }, [load]);

  const openForm = (item?: AdminCrudItem) => {
    setEditing(item ?? null);
    setDraft(item?.fields ?? Object.fromEntries(fields.map((field) => [field.key, field.options?.[0] ?? ""])));
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) await updateAdminCrud(resource, editing.id, draft);
      else await createAdminCrud(resource, draft);
      const createsAccount = !editing && (resource === "profissionais" || resource === "usuarios");
      showToast("success", createsAccount ? "Conta criada — email de boas-vindas enviado." : "Registro salvo.");
      setEditing(null);
      setDraft({});
      await load();
    } catch {
      showToast("error", "Nao foi possivel salvar.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: AdminCrudItem) => {
    if (!window.confirm(`Excluir ${item.title}?`)) return;
    try {
      await deleteAdminCrud(resource, item.id);
      showToast("success", "Registro excluido.");
      await load();
    } catch {
      showToast("error", "Nao foi possivel excluir. Verifique vinculos existentes.");
    }
  };

  return (
    <>
      <PageHeader title={title} description={description} actions={<Button onClick={() => openForm()}>Adicionar</Button>} />
      {loading ? (
        <Skeleton className="h-72" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-bold">{item.title}</h2>
                  <p className="mt-1 text-sm text-brown-mid">{item.subtitle || "Sem detalhe"}</p>
                </div>
                {item.status ? <Badge>{item.status}</Badge> : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => openForm(item)}>Editar</Button>
                <Button variant="ghost" onClick={() => remove(item)}>Excluir</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={Boolean(editing) || Object.keys(draft).length > 0} title={editing ? "Editar registro" : "Novo registro"} onClose={() => { setEditing(null); setDraft({}); }}>
        <form className="grid gap-4" onSubmit={save}>
          {fields.map((field) => {
            const value = draft[field.key] ?? "";
            const onChange = (next: string) => setDraft((current) => ({ ...current, [field.key]: next }));
            if (field.type === "textarea") return <Textarea key={field.key} label={field.label} value={value} onChange={(event) => onChange(event.target.value)} />;
            if (field.type === "select") {
              return (
                <Select key={field.key} label={field.label} value={value} onChange={(event) => onChange(event.target.value)}>
                  {(field.options ?? []).map((option) => <option key={option}>{option}</option>)}
                </Select>
              );
            }
            return <Input key={field.key} label={field.label} type={field.type ?? "text"} value={value} onChange={(event) => onChange(event.target.value)} />;
          })}
          <Button loading={saving}>Salvar</Button>
        </form>
      </Modal>
    </>
  );
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<MetricsPoint[]>([]);
  useEffect(() => {
    getMetricasGerais().then(setMetrics).catch(() => setMetrics([]));
  }, []);
  const latest = metrics.at(-1);
  return (
    <>
      <PageHeader title="Administracao" description="KPIs executivos, alertas operacionais e atalhos." />
      <StatGrid>
        <StatCard label="Receita do mes" value={latest ? currency(latest.revenue) : "-"} />
        <StatCard label="Lucro estimado" value={latest ? currency(latest.profit) : "-"} />
        <StatCard label="Atendimentos" value={latest ? String(latest.appointments) : "-"} />
        <StatCard label="Novos pacientes" value={latest ? String(latest.newPatients) : "-"} />
      </StatGrid>
    </>
  );
}

export function AdminProfessionals() {
  return <AdminCrudPage resource="profissionais" title="Profissionais e equipe" description="Criar, editar e excluir profissionais, comissoes, perfis e dados operacionais." />;
}

export function AdminServices() {
  return <AdminServiceEditor />;
}

export function AdminUsers() {
  return (
    <AdminCrudPage
      resource="usuarios"
      title="Usuários & papéis"
      description="Criar, editar papel e desativar contas de paciente, recepção e admin. Profissionais são criados na tela 'Profissionais e equipe' (cria também o perfil operacional). Novas contas recebem senha padrão 123456 e um email para definir a senha própria."
    />
  );
}

export function AdminRecruitment() {
  return <AdminCrudPage resource="vagas" title="Recrutamento" description="Criar, editar, publicar, encerrar e excluir vagas." />;
}

export function AdminMetrics({ variant = "geral" }: { variant?: string }) {
  const [metrics, setMetrics] = useState<MetricsPoint[]>([]);
  const [breakdowns, setBreakdowns] = useState<{ serviceRankingMock: { label: string; value: number }[]; professionalRankingMock: { label: string; value: number }[] }>({ serviceRankingMock: [], professionalRankingMock: [] });
  const titles: Record<string, string> = {
    geral: "Metricas gerais",
    custos: "Custos",
    faturamento: "Faturamento",
    salas: "Salas",
    equipamentos: "Equipamentos",
    servicos: "Servicos",
    profissionais: "Profissionais",
    movimento: "Log de movimento",
  };
  useEffect(() => {
    getMetricasGerais().then(setMetrics).catch(() => setMetrics([]));
    getMetricBreakdowns().then(setBreakdowns).catch(() => undefined);
  }, []);
  const latest = metrics.at(-1);
  if (variant === "custos") return <AdminCrudPage resource="custos" title="Custos" description="Criar, editar e excluir custos fixos e variaveis usados no calculo de lucro." fields={fieldSets.custos} />;
  if (variant === "movimento") return <AdminCrudPage resource="movimento" title="Log de movimento" description="Criar, editar e excluir eventos operacionais da trilha de atividade." fields={fieldSets.movimento} />;
  return (
    <>
      <PageHeader title={titles[variant] ?? "Metricas"} description="Painel com dados reais do banco e acoes CRUD nas secoes operacionais." actions={<Select label="Periodo"><option>Ultimos 6 meses</option><option>Mes atual</option></Select>} />
      <StatGrid>
        <StatCard label="Receita" value={latest ? currency(latest.revenue) : "-"} />
        <StatCard label="Lucro" value={latest ? currency(latest.profit) : "-"} />
        <StatCard label="Ticket medio" value={latest ? currency(latest.ticketAverage) : "-"} />
        <StatCard label="Cancelamento" value={latest ? `${latest.cancellationRate}%` : "-"} />
      </StatGrid>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card><h2 className="mb-4 font-bold">Evolucao</h2><MiniBarChart data={metrics.map((item) => ({ label: item.month, value: item.revenue }))} /></Card>
        <Card><h2 className="mb-4 font-bold">{variant === "profissionais" ? "Por profissional" : "Por servico"}</h2><MiniBarChart data={variant === "profissionais" ? breakdowns.professionalRankingMock : breakdowns.serviceRankingMock} /></Card>
      </div>
    </>
  );
}

export function AdminSimpleConfig({ title, description, resource }: { title: string; description: string; resource?: string }) {
  const inferred = resource ?? title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
  return <AdminCrudPage resource={inferred} title={title} description={description} fields={fieldSets[inferred]} />;
}

export function AdminAboutConfig() {
  const { config, updateConfig } = useConfig();
  const { showToast } = useToast();
  const [draft, setDraft] = useState(config);
  useEffect(() => setDraft(config), [config]);

  const setMilestone = (index: number, key: "date" | "title" | "description", value: string) => {
    const milestones = draft.about.milestones.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item);
    setDraft({ ...draft, about: { ...draft.about, milestones } });
  };

  const addMilestone = () => {
    setDraft({ ...draft, about: { ...draft.about, milestones: [...draft.about.milestones, { date: "", title: "", description: "" }] } });
  };

  const removeMilestone = (index: number) => {
    setDraft({ ...draft, about: { ...draft.about, milestones: draft.about.milestones.filter((_, itemIndex) => itemIndex !== index) } });
  };

  const setGalleryImage = (index: number, value: string) => {
    const gallery = draft.about.gallery.map((item, itemIndex) => itemIndex === index ? value : item);
    setDraft({ ...draft, about: { ...draft.about, gallery } });
  };

  const addGalleryImage = () => {
    setDraft({ ...draft, about: { ...draft.about, gallery: [...draft.about.gallery, ""] } });
  };

  const removeGalleryImage = (index: number) => {
    setDraft({ ...draft, about: { ...draft.about, gallery: draft.about.gallery.filter((_, itemIndex) => itemIndex !== index) } });
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    await updateConfig(draft);
    showToast("success", "Conteudo Sobre salvo.");
  };
  return (
    <>
      <PageHeader title="Configuracoes de Sobre" description="Editor do conteudo institucional publicado em /sobre." />
      <Card>
        <form className="grid gap-4" onSubmit={save}>
          <Textarea label="Texto institucional" value={draft.about.text} onChange={(event) => setDraft({ ...draft, about: { ...draft.about, text: event.target.value } })} />
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Missao" value={draft.about.mvv.mission} onChange={(event) => setDraft({ ...draft, about: { ...draft.about, mvv: { ...draft.about.mvv, mission: event.target.value } } })} />
            <Input label="Visao" value={draft.about.mvv.vision} onChange={(event) => setDraft({ ...draft, about: { ...draft.about, mvv: { ...draft.about.mvv, vision: event.target.value } } })} />
          </div>
          <Textarea label="Valores" value={draft.about.mvv.values} onChange={(event) => setDraft({ ...draft, about: { ...draft.about, mvv: { ...draft.about.mvv, values: event.target.value } } })} />
          <div className="rounded-lg border border-brown-mid/20 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-bold">Marcos historicos</h2>
              <Button type="button" variant="secondary" onClick={addMilestone}>Adicionar marco</Button>
            </div>
            <div className="mt-4 grid gap-4">
              {draft.about.milestones.map((milestone, index) => (
                <div key={`${milestone.title}-${index}`} className="grid gap-3 rounded-lg bg-bg-secondary p-3">
                  <div className="grid gap-3 md:grid-cols-[120px_1fr]">
                    <Input label="Data" value={milestone.date} onChange={(event) => setMilestone(index, "date", event.target.value)} />
                    <Input label="Titulo" value={milestone.title} onChange={(event) => setMilestone(index, "title", event.target.value)} />
                  </div>
                  <Textarea label="Descricao" value={milestone.description} onChange={(event) => setMilestone(index, "description", event.target.value)} />
                  <Button type="button" variant="ghost" onClick={() => removeMilestone(index)}>Remover marco</Button>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-brown-mid/20 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-bold">Galeria de instalacoes</h2>
              <Button type="button" variant="secondary" onClick={addGalleryImage}>Adicionar foto</Button>
            </div>
            <div className="mt-4 grid gap-3">
              {draft.about.gallery.map((imageUrl, index) => (
                <div key={`${imageUrl}-${index}`} className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <Input label="Imagem URL" value={imageUrl} onChange={(event) => setGalleryImage(index, event.target.value)} />
                  <Button type="button" variant="ghost" onClick={() => removeGalleryImage(index)}>Remover</Button>
                </div>
              ))}
            </div>
          </div>
          <Button>Salvar</Button>
        </form>
      </Card>
    </>
  );
}

export function AdminBannersConfig() {
  return <AdminCrudPage resource="banners" title="Configuracoes de banners" description="Criar, editar, ordenar, ativar e excluir slides do carrossel." fields={fieldSets.banners} />;
}

export function AdminDesignConfig() {
  const { config, updateConfig } = useConfig();
  const { showToast } = useToast();
  const [draft, setDraft] = useState<ClinicConfig>(config);
  useEffect(() => setDraft(config), [config]);
  const save = async (event: FormEvent) => {
    event.preventDefault();
    await updateConfig(draft);
    showToast("success", "Design aplicado.");
  };
  const setTheme = (key: keyof ClinicConfig["theme"], value: string) => setDraft({ ...draft, theme: { ...draft.theme, [key]: value } });
  return (
    <>
      <PageHeader title="Design white label" description="Cores e fontes aplicadas em tempo real via variaveis CSS no :root." />
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <form className="grid gap-4" onSubmit={save}>
            <Input label="Nome da clinica" value={draft.clinicName} onChange={(event) => setDraft({ ...draft, clinicName: event.target.value })} />
            <Input label="Logo URL" value={draft.logoUrl} onChange={(event) => setDraft({ ...draft, logoUrl: event.target.value })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Cor primaria" type="color" value={draft.theme.primary} onChange={(event) => setTheme("primary", event.target.value)} />
              <Input label="Cor de acento" type="color" value={draft.theme.primaryLight} onChange={(event) => setTheme("primaryLight", event.target.value)} />
              <Input label="Fundo" type="color" value={draft.theme.bgBase} onChange={(event) => setTheme("bgBase", event.target.value)} />
              <Input label="Texto" type="color" value={draft.theme.brownDark} onChange={(event) => setTheme("brownDark", event.target.value)} />
            </div>
            <Select label="Fonte de titulos" value={draft.theme.headingFont} onChange={(event) => setTheme("headingFont", event.target.value)}>
              <option>Playfair Display</option><option>Inter</option><option>Georgia</option>
            </Select>
            <Select label="Fonte de corpo" value={draft.theme.bodyFont} onChange={(event) => setTheme("bodyFont", event.target.value)}>
              <option>Inter</option><option>Arial</option><option>Roboto</option>
            </Select>
            <Button>Salvar design</Button>
          </form>
        </Card>
        <Card>
          <img src={draft.logoUrl} alt={draft.clinicName} className="h-16 w-16 rounded-lg object-cover" />
          <h2 className="mt-4 font-heading text-3xl font-bold">{draft.clinicName}</h2>
          <p className="mt-2 text-sm text-brown-mid">Preview em tempo real dos tokens da instancia.</p>
          <Button className="mt-4">CTA primario</Button>
        </Card>
      </div>
    </>
  );
}
