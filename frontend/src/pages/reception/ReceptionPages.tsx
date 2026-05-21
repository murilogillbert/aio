import { FormEvent, useEffect, useMemo, useState } from "react";
import { Bell, CalendarCheck, Clock, Loader2, Plus, Search, UserCheck, Users, X, XCircle } from "lucide-react";
import { Badge, Button, Card, Input, Modal, Select, Skeleton, Textarea } from "../../components/ui";
import { PageHeader, StatCard, StatGrid } from "../../components/Page";
import {
  createPatient,
  deletePatient,
  getMovimento,
  getProfissionais,
  getServicos,
  listAppointments,
  searchPatients,
  updatePatient,
} from "../../services/api";
import type { AppointmentRich, MetricsMovimento, PatientRich, PatientUpsert, Professional, Service } from "../../types";
import { currency, dateLabel } from "../../utils";
import { useToast } from "../../context/ToastContext";

export { ReceptionAgenda } from "./ReceptionAgenda";

// ─── Dashboard ──────────────────────────────────────────────────────────────

export function ReceptionDashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const [data, setData] = useState<MetricsMovimento | null>(null);
  const [appointments, setAppointments] = useState<AppointmentRich[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const [mov, appts] = await Promise.all([
        getMovimento(today),
        listAppointments(`${today}T00:00:00`, `${today}T23:59:59`),
      ]);
      setData(mov);
      setAppointments(appts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (loading || !data) return <Skeleton className="h-72" />;

  const now = new Date();
  const waiting = appointments
    .filter((appt) => (appt.status === "Confirmado" || appt.status === "Agendado") && new Date(appt.startTime) <= now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 6);
  const next = appointments
    .filter((appt) => (appt.status === "Confirmado" || appt.status === "Agendado") && new Date(appt.startTime) > now)
    .slice(0, 6);

  return (
    <>
      <PageHeader title="Recepção" description={`Visão do dia (${dateLabel(today)}). Atualiza automaticamente a cada minuto.`} actions={<Button variant="secondary" onClick={() => void refresh()}><Loader2 className="h-4 w-4" />Atualizar</Button>} />
      <StatGrid>
        <StatCard label="Atendimentos" value={String(data.totalAppointments)} hint={`Taxa ${data.showRate}%`} />
        <StatCard label="Confirmados" value={String(data.confirmed)} hint={`Pendentes ${data.scheduled}`} />
        <StatCard label="Em atendimento" value={String(data.inProgress)} hint={`Realizados ${data.completed}`} />
        <StatCard label="Cancelados" value={String(data.cancelled + data.noShow)} hint={`No-show ${data.noShow}`} />
      </StatGrid>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 font-bold"><Clock className="h-4 w-4 text-primary" />Sala de espera</h2>
          <p className="text-xs text-brown-mid">Pacientes com horário já passado e ainda não atendidos.</p>
          <div className="mt-3 grid gap-2">
            {waiting.length === 0 ? <p className="text-sm text-brown-mid">Ninguém esperando.</p> : waiting.map((appt) => {
              const waitMinutes = Math.max(0, Math.floor((Date.now() - new Date(appt.startTime).getTime()) / 60000));
              return (
                <div key={appt.id} className="rounded-lg bg-bg-secondary p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <strong>{appt.patientName}</strong>
                    <Badge tone={waitMinutes > 20 ? "danger" : waitMinutes > 5 ? "warning" : "neutral"}>{waitMinutes} min</Badge>
                  </div>
                  <p className="text-xs text-brown-mid">{appt.serviceName} com {appt.professionalName}</p>
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 font-bold"><CalendarCheck className="h-4 w-4 text-primary" />Próximos hoje</h2>
          <div className="mt-3 grid gap-2">
            {next.length === 0 ? <p className="text-sm text-brown-mid">Nenhum agendamento futuro.</p> : next.map((appt) => (
              <div key={appt.id} className="rounded-lg bg-bg-secondary p-3 text-sm">
                <div className="flex items-center justify-between">
                  <strong>{appt.patientName}</strong>
                  <span className="text-xs">{new Date(appt.startTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p className="text-xs text-brown-mid">{appt.serviceName} com {appt.professionalName}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="mt-4">
        <h2 className="flex items-center gap-2 font-bold"><Bell className="h-4 w-4 text-primary" />Eventos recentes</h2>
        <div className="mt-3 grid gap-2 text-sm">
          {data.events.slice(0, 8).map((event) => (
            <div key={event.id} className="flex items-center justify-between gap-2 rounded-lg bg-bg-secondary p-3">
              <div>
                <strong className="text-xs uppercase tracking-wide">{event.type}</strong>
                <p>{event.description}</p>
              </div>
              <span className="text-xs text-brown-mid">{new Date(event.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          ))}
          {data.events.length === 0 ? <p className="text-brown-mid">Sem eventos registrados hoje.</p> : null}
        </div>
      </Card>
    </>
  );
}

// ─── Patients ───────────────────────────────────────────────────────────────

const emptyPatient: PatientUpsert = {
  name: "",
  email: "",
  phone: "",
  cpf: "",
  birthDate: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  notes: "",
};

export function ReceptionPatients() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<PatientRich[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PatientUpsert>(emptyPatient);
  const [duplicates, setDuplicates] = useState<PatientRich[] | null>(null);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await searchPatients(search));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(id);
  }, [search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyPatient);
    setDuplicates(null);
    setShowForm(true);
  };

  const openEdit = (patient: PatientRich) => {
    setEditingId(patient.id);
    setForm({
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      cpf: patient.cpf,
      birthDate: patient.birthDate ?? "",
      address: patient.address,
      city: patient.city,
      state: patient.state,
      postalCode: patient.postalCode,
      notes: patient.notes,
    });
    setDuplicates(null);
    setShowForm(true);
  };

  const submit = async (event?: FormEvent, force = false) => {
    event?.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updatePatient(editingId, form);
        showToast("success", "Paciente atualizado.");
      } else {
        const result = await createPatient(form, force);
        setCreatedPassword(result.generatedPassword);
        showToast("success", "Paciente cadastrado.");
      }
      setShowForm(false);
      setDuplicates(null);
      await load();
    } catch (error) {
      // 409 com duplicidades
      const msg = error instanceof Error ? error.message : "";
      try {
        const parsed = JSON.parse(msg) as { matches?: PatientRich[] };
        if (parsed.matches?.length) {
          setDuplicates(parsed.matches);
          return;
        }
      } catch {
        /* ignore */
      }
      showToast("error", "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (patient: PatientRich) => {
    if (!window.confirm(`Inativar paciente ${patient.name}?`)) return;
    try {
      await deletePatient(patient.id);
      showToast("success", "Paciente inativado.");
      await load();
    } catch {
      showToast("error", "Falha ao inativar.");
    }
  };

  return (
    <>
      <PageHeader title="Pacientes" description="Cadastro com detecção de duplicidade por CPF, e-mail ou telefone." actions={<Button onClick={openCreate}><Plus className="h-4 w-4" />Novo paciente</Button>} />
      <Card className="mb-3">
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Buscar</span>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-mid" />
            <input className="min-h-11 w-full rounded-lg border border-brown-mid/25 bg-surface pl-8 pr-2 text-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome, e-mail, CPF ou telefone" />
          </div>
        </label>
      </Card>
      {loading ? <Skeleton className="h-72" /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((patient) => (
            <Card key={patient.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold">{patient.name}</h2>
                  <p className="text-xs text-brown-mid">{patient.email} · {patient.phone || "sem telefone"}</p>
                  {patient.cpf ? <p className="text-xs text-brown-mid">CPF {patient.cpf}</p> : null}
                </div>
                {!patient.isActive ? <Badge tone="danger">Inativo</Badge> : null}
              </div>
              <p className="mt-2 text-xs text-brown-mid">{patient.dependents} dependentes</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => openEdit(patient)}>Editar</Button>
                <Button variant="ghost" onClick={() => void remove(patient)}>Inativar</Button>
              </div>
            </Card>
          ))}
          {!items.length ? <p className="text-sm text-brown-mid">Nenhum paciente encontrado.</p> : null}
        </div>
      )}

      <Modal open={showForm} title={editingId ? "Editar paciente" : "Novo paciente"} onClose={() => { setShowForm(false); setDuplicates(null); }}>
        {duplicates ? (
          <div className="grid gap-3">
            <p className="text-sm">Encontramos pacientes existentes com dados parecidos. Continua mesmo assim?</p>
            <div className="grid gap-2 text-sm">
              {duplicates.map((dup) => (
                <div key={dup.id} className="rounded-lg bg-bg-secondary p-3">
                  <strong>{dup.name}</strong>
                  <p className="text-xs text-brown-mid">{dup.email} · {dup.phone} · CPF {dup.cpf}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setDuplicates(null)}>Voltar</Button>
              <Button onClick={() => void submit(undefined, true)}>Cadastrar mesmo assim</Button>
            </div>
          </div>
        ) : (
          <form className="grid gap-3" onSubmit={(event) => void submit(event, false)}>
            <Input label="Nome completo" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <div className="grid gap-3 md:grid-cols-2">
              <Input label="E-mail" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
              <Input label="Celular" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
              <Input label="CPF" value={form.cpf} onChange={(event) => setForm({ ...form, cpf: event.target.value })} />
              <Input label="Nascimento" type="date" value={form.birthDate ?? ""} onChange={(event) => setForm({ ...form, birthDate: event.target.value })} />
            </div>
            <Input label="Endereço" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
            <div className="grid gap-3 md:grid-cols-3">
              <Input label="Cidade" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} />
              <Input label="Estado" value={form.state} onChange={(event) => setForm({ ...form, state: event.target.value })} />
              <Input label="CEP" value={form.postalCode} onChange={(event) => setForm({ ...form, postalCode: event.target.value })} />
            </div>
            <Textarea label="Observações" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button loading={saving}>Salvar paciente</Button>
            </div>
          </form>
        )}
      </Modal>

      {createdPassword ? (
        <Modal open title="Senha gerada" onClose={() => setCreatedPassword(null)}>
          <div className="grid gap-3">
            <p className="text-sm">A senha provisória do paciente foi gerada. Anote agora — ela não será exibida novamente.</p>
            <code className="rounded-lg bg-bg-secondary px-3 py-2 text-center text-lg font-bold tracking-wider">{createdPassword}</code>
            <Button onClick={() => setCreatedPassword(null)}>Entendi</Button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

// ─── Messages (lista mais real) ─────────────────────────────────────────────

export function ReceptionMessages() {
  // Por enquanto retorno do MovementLog com filtro de mensagens; substitui o array literal antigo
  const [data, setData] = useState<MetricsMovimento | null>(null);
  useEffect(() => { void getMovimento().then(setData); }, []);
  const messageEvents = useMemo(() => data?.events.filter((event) => event.type === "MESSAGE_RECEIVED") ?? [], [data]);
  return (
    <>
      <PageHeader title="Central de comunicação" description="Vista unificada de Aplicação, WhatsApp e e-mail. Mensagens lidas do MovementLog enquanto a integração não está conectada." />
      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <div className="grid gap-2">
          {messageEvents.length === 0 ? (
            <Card>
              <p className="text-sm text-brown-mid">Nenhuma mensagem registrada. Conecte uma integração em Configurações &gt; Integrações para começar a receber mensagens.</p>
            </Card>
          ) : messageEvents.map((event) => (
            <Card key={event.id}>
              <div className="flex items-center justify-between"><strong>{event.patient ?? "Desconhecido"}</strong><Badge>{event.type}</Badge></div>
              <p className="mt-2 text-sm text-brown-mid">{event.description}</p>
              <p className="mt-1 text-xs text-brown-mid">{new Date(event.createdAt).toLocaleString("pt-BR")}</p>
            </Card>
          ))}
        </div>
        <Card>
          <h2 className="font-bold">Thread</h2>
          <div className="mt-4 rounded-lg bg-bg-secondary p-3 text-sm text-brown-mid">Selecione uma conversa à esquerda. Quando a integração estiver conectada, as respostas voltarão automaticamente para o canal de origem.</div>
        </Card>
      </div>
    </>
  );
}

// ─── Services (read-only, mantém igual mas usa serviços via API) ─────────────

export function ReceptionServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getServicos().then(setServices).finally(() => setLoading(false)); }, []);
  return (
    <>
      <PageHeader title="Consulta de serviços" description="Somente leitura para orientar agendamentos." />
      {loading ? <Skeleton className="h-72" /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {services.map((service) => (
            <Card key={service.id}>
              <h2 className="font-bold">{service.name}</h2>
              <p className="text-sm text-brown-mid">{service.durationMinutes} min - {currency(service.priceFrom)}</p>
              <p className="mt-2 text-sm text-brown-mid">{service.description}</p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

// ─── Professionals (read-only) ──────────────────────────────────────────────

export function ReceptionProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getProfissionais().then((items) => setProfessionals(items.filter((entry) => entry.role === "profissional"))).finally(() => setLoading(false)); }, []);
  return (
    <>
      <PageHeader title="Consulta de profissionais" description="Serviços, especialização e dados operacionais." />
      {loading ? <Skeleton className="h-72" /> : (
        <div className="grid gap-3 md:grid-cols-2">
          {professionals.map((pro) => (
            <Card key={pro.id}>
              <h2 className="font-bold">{pro.name}</h2>
              <p className="text-sm text-brown-mid">{pro.specialty}</p>
              <p className="mt-2 text-sm text-brown-mid">Serviços: {pro.services.length} · Comissão padrão {pro.defaultCommission}%</p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
