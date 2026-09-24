import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, Badge, Button, Card, EmptyState, Input, Select, Skeleton, Textarea } from "../../components/ui";
import { MiniBarChart, PageHeader, StatCard, StatGrid } from "../../components/Page";
import { ChatPanel } from "../../components/ChatPanel";
import { currency, dateLabel, naiveNowIso, todayLocalDate } from "../../utils";
import { useAgendaSlots } from "../../hooks/useAgenda";
import { useAppointmentsRange } from "../../hooks/useAppointments";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  changePassword,
  checkinAppointment,
  getMyProfessionalMetrics,
  listMyPatients,
  patchAppointmentConfirmation,
  updateMe,
  uploadFile,
} from "../../services/api";

export function ProfessionalDashboard() {
  const { appointments, loading, reload } = useAppointmentsRange(todayLocalDate(), todayLocalDate());
  const { showToast } = useToast();
  const sorted = [...appointments].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const nextSlot = sorted.find((item) => item.startTime >= naiveNowIso());

  const confirm = async (id: string) => {
    try {
      await patchAppointmentConfirmation(id, "Confirmado");
      showToast("success", "Atendimento confirmado.");
      await reload();
    } catch {
      showToast("error", "Não foi possível confirmar.");
    }
  };

  const checkin = async (id: string) => {
    try {
      await checkinAppointment(id);
      showToast("success", "Check-in registrado.");
      await reload();
    } catch {
      showToast("error", "Não foi possível registrar o check-in.");
    }
  };

  return (
    <>
      <PageHeader title="Painel do dia" description="Consultas agendadas hoje e ações rápidas." />
      <StatGrid>
        <StatCard label="Consultas hoje" value={String(sorted.length)} />
        <StatCard label="Próximo horário" value={nextSlot?.startTime.slice(11, 16) ?? "-"} />
        <StatCard label="Confirmadas" value={String(sorted.filter((item) => item.patientConfirmation === "Confirmado").length)} />
        <StatCard label="Pendentes" value={String(sorted.filter((item) => item.patientConfirmation === "Pendente").length)} />
      </StatGrid>
      {loading ? (
        <Skeleton className="mt-6 h-40" />
      ) : sorted.length === 0 ? (
        <EmptyState title="Nenhuma consulta hoje." />
      ) : (
        <div className="mt-6 grid gap-3">
          {sorted.map((item) => (
            <Card key={item.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <strong>{item.startTime.slice(11, 16)} — {item.patientName}</strong>
                  {item.dependentName ? <p className="text-xs font-medium text-primary">Para {item.dependentName} (dependente)</p> : null}
                  <p className="text-sm text-brown-mid">{item.serviceName}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={item.patientConfirmation === "Confirmado" ? "success" : "warning"}>{item.patientConfirmation}</Badge>
                  {item.patientConfirmation !== "Confirmado" ? <Button variant="secondary" onClick={() => confirm(item.id)}>Confirmar</Button> : null}
                  <Button variant="ghost" onClick={() => checkin(item.id)}>Check-in</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export function ProfessionalAgenda() {
  const { user } = useAuth();
  const { slots, loading: loadingSlots } = useAgendaSlots(user?.professionalId);
  const days = Array.from(new Set(slots.slice(0, 120).map((slot) => slot.date))).slice(0, 7);
  const rangeStart = days[0] ?? todayLocalDate();
  const rangeEnd = days[days.length - 1] ?? todayLocalDate();
  const { appointments, loading: loadingAppointments } = useAppointmentsRange(rangeStart, rangeEnd);
  const appointmentById = new Map(appointments.map((item) => [item.id, item]));
  const loading = loadingSlots || loadingAppointments;

  return (
    <>
      <PageHeader title="Agenda" description="Visão diária e semanal da agenda própria." />
      {loading ? (
        <Skeleton className="h-72" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {days.map((day) => (
            <Card key={day}>
              <h2 className="font-bold">{dateLabel(day)}</h2>
              <div className="mt-3 grid gap-2">
                {slots.filter((slot) => slot.date === day).slice(0, 8).map((slot) => {
                  const appt = slot.appointmentId ? appointmentById.get(slot.appointmentId) : undefined;
                  return (
                    <div key={slot.id} className="flex items-center justify-between gap-2 rounded-lg bg-bg-secondary px-3 py-2 text-sm">
                      <span>
                        {slot.time} - {slot.available ? "Disponível" : appt ? `${appt.patientName}${appt.dependentName ? ` (para ${appt.dependentName})` : ""}` : "Agendado"}
                      </span>
                      {!slot.available && slot.appointmentId ? (
                        <Link className="text-xs font-bold text-primary" to={`/profissional/agendamentos/${slot.appointmentId}/evolucao`}>Evolução</Link>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export function ProfessionalPatients() {
  const [patients, setPatients] = useState<{ id: string; fullName: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyPatients()
      .then(setPatients)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title="Meus pacientes" description="Pacientes com quem você já teve atendimento." />
      {loading ? (
        <Skeleton className="h-40" />
      ) : patients.length === 0 ? (
        <EmptyState title="Nenhum paciente atendido ainda." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {patients.map((patient) => (
            <Card key={patient.id}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-bold">{patient.fullName}</h2>
                <Link to={`/profissional/pacientes/${patient.id}/prontuario`}>
                  <Button variant="secondary">Prontuário</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

const PERIOD_OPTIONS = [
  { value: "7d", label: "7 dias" },
  { value: "mes_atual", label: "Mês atual" },
  { value: "30d", label: "30 dias" },
  { value: "trimestre", label: "Trimestre" },
  { value: "6m", label: "6 meses" },
  { value: "ano_atual", label: "Este ano" },
];

export function ProfessionalMetrics() {
  const [periodo, setPeriodo] = useState("30d");
  const [offset, setOffset] = useState(0);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const customRange = customStart && customEnd ? { start: customStart, end: customEnd } : undefined;
  const [metric, setMetric] = useState<Awaited<ReturnType<typeof getMyProfessionalMetrics>>>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMyProfessionalMetrics(periodo, offset, customRange)
      .then(setMetric)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo, offset, customStart, customEnd]);

  return (
    <>
      <PageHeader
        title="Métricas individuais"
        description="Atendimentos, comissão, ticket médio e cancelamentos no período selecionado."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select label="" value={periodo} onChange={(event) => { setPeriodo(event.target.value); setOffset(0); setCustomStart(""); setCustomEnd(""); }}>
              {PERIOD_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </Select>
            <Button type="button" variant="secondary" onClick={() => setOffset((current) => current + 1)} disabled={Boolean(customRange)}>← Anterior</Button>
            <Button type="button" variant="ghost" onClick={() => setOffset(0)} disabled={offset === 0 || Boolean(customRange)}>Período atual</Button>
          </div>
        }
      />
      <Card className="mb-4">
        <p className="mb-2 text-sm font-medium">Ou escolha um período personalizado</p>
        <div className="flex flex-wrap items-end gap-2">
          <Input label="De" type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} />
          <Input label="Até" type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} />
          {customRange ? <Button type="button" variant="ghost" onClick={() => { setCustomStart(""); setCustomEnd(""); }}>Limpar</Button> : null}
        </div>
      </Card>
      {loading ? (
        <Skeleton className="h-40" />
      ) : !metric ? (
        <EmptyState title="Sem dados para este período." />
      ) : (
        <>
          <StatGrid>
            <StatCard label="Atendimentos" value={String(metric.appointments)} hint={customRange ? "Período personalizado" : offset > 0 ? `${offset} período(s) atrás` : "Período atual"} />
            <StatCard label="Valores a receber" value={currency(metric.netPayout)} hint={`${metric.commissionPct}% de comissão`} />
            <StatCard label="Receita gerada" value={currency(metric.revenue)} />
            <StatCard label="Cancelamento" value={`${metric.cancellationRate}%`} />
          </StatGrid>
          <StatGrid>
            <StatCard label="Confirmações" value={String(metric.confirmedCount)} />
            <StatCard label="Não compareceu" value={String(metric.noShowCount)} />
            <StatCard label="Não compareceu após confirmar" value={String(metric.noShowAfterConfirmationCount)} />
          </StatGrid>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card>
              <h2 className="mb-4 font-bold">Resumo</h2>
              <MiniBarChart
                data={[
                  { label: "Realizados", value: metric.completedCount },
                  { label: "Cancelados", value: metric.cancelledCount },
                  { label: "Não compareceu", value: metric.noShowCount },
                ]}
              />
            </Card>
            <Card>
              <h2 className="mb-4 font-bold">Pacientes</h2>
              <MiniBarChart
                data={[
                  { label: "Novos", value: metric.newPatients },
                  { label: "Recorrentes", value: metric.returningPatients },
                ]}
              />
            </Card>
            <Card>
              <h2 className="mb-4 font-bold">Sua comissão por forma de pagamento</h2>
              {metric.byMethod.length === 0 ? <p className="text-sm text-brown-mid">Sem pagamentos no período.</p> : (
                <div className="grid gap-2 text-sm">
                  {metric.byMethod.map((entry) => (
                    <div key={entry.label} className="flex items-center justify-between"><span>{entry.label}</span><strong>{currency(entry.value)}</strong></div>
                  ))}
                </div>
              )}
            </Card>
            <Card>
              <h2 className="mb-4 font-bold">Sua comissão por convênio</h2>
              {metric.byPlan.length === 0 ? <p className="text-sm text-brown-mid">Sem atendimentos no período.</p> : (
                <div className="grid gap-2 text-sm">
                  {metric.byPlan.map((entry) => (
                    <div key={entry.label} className="flex items-center justify-between"><span>{entry.label}</span><strong>{currency(entry.value)}</strong></div>
                  ))}
                </div>
              )}
            </Card>
          </div>
          <Card className="mt-4">
            <h2 className="mb-4 font-bold">Sua comissão por paciente atendido</h2>
            {metric.byPatient.length === 0 ? <p className="text-sm text-brown-mid">Sem atendimentos no período.</p> : (
              <div className="grid gap-2 text-sm">
                {metric.byPatient.map((entry) => (
                  <div key={entry.label} className="flex items-center justify-between rounded-lg bg-bg-secondary p-2">
                    <span>{entry.label} <span className="text-xs text-brown-mid">({entry.count} atendimento{entry.count === 1 ? "" : "s"})</span></span>
                    <strong>{currency(entry.revenue)}</strong>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </>
  );
}

export function ProfessionalMessages() {
  return (
    <>
      <PageHeader title="Mensagens" description="Converse diretamente com a recepção." />
      <ChatPanel />
    </>
  );
}

export function ProfessionalProfile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    fullName: user?.fullName ?? "",
    phone: user?.phone ?? "",
    bio: user?.bio ?? "",
    specialty: user?.specialty ?? "",
    photoUrl: user?.photoUrl ?? "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ atual: "", nova: "", confirmar: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateMe(form);
      updateUser(updated);
      showToast("success", "Perfil atualizado.");
    } catch {
      showToast("error", "Não foi possível salvar o perfil.");
    } finally {
      setSavingProfile(false);
    }
  };

  const uploadPhoto = async (file: File) => {
    setUploadingPhoto(true);
    try {
      const { url } = await uploadFile(file);
      setForm((current) => ({ ...current, photoUrl: url }));
      const updated = await updateMe({ photoUrl: url });
      updateUser(updated);
      showToast("success", "Foto atualizada.");
    } catch {
      showToast("error", "Não foi possível enviar a imagem.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (passwordForm.nova !== passwordForm.confirmar) {
      showToast("error", "As senhas precisam ser iguais.");
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(passwordForm.atual, passwordForm.nova);
      showToast("success", "Senha alterada.");
      setPasswordForm({ atual: "", nova: "", confirmar: "" });
    } catch {
      showToast("error", "Senha atual incorreta.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <PageHeader title="Perfil" description="Edite seus dados profissionais, foto e senha." />
      <div className="grid max-w-2xl gap-4">
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <Avatar src={form.photoUrl} name={user?.fullName ?? "Profissional"} />
            <div>
              <h2 className="font-bold">{user?.fullName}</h2>
              <p className="text-sm text-brown-mid">{user?.email}</p>
              <label className="mt-1 inline-block cursor-pointer text-xs font-bold text-primary">
                {uploadingPhoto ? "Enviando..." : "Trocar foto"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingPhoto}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadPhoto(file);
                  }}
                />
              </label>
            </div>
          </div>
          <form className="grid gap-4" onSubmit={saveProfile}>
            <Input label="Nome" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
            <Input label="Celular" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            <Input label="Especialidade" value={form.specialty} onChange={(event) => setForm({ ...form, specialty: event.target.value })} />
            <Textarea label="Bio" value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} />
            <Button loading={savingProfile}>Salvar alterações</Button>
          </form>
        </Card>
        <Card>
          <h2 className="mb-4 font-bold">Alterar senha</h2>
          <form className="grid gap-4" onSubmit={savePassword}>
            <Input label="Senha atual" type="password" value={passwordForm.atual} onChange={(event) => setPasswordForm({ ...passwordForm, atual: event.target.value })} required />
            <Input label="Nova senha" type="password" value={passwordForm.nova} onChange={(event) => setPasswordForm({ ...passwordForm, nova: event.target.value })} required />
            <Input label="Confirmar nova senha" type="password" value={passwordForm.confirmar} onChange={(event) => setPasswordForm({ ...passwordForm, confirmar: event.target.value })} required />
            <Button loading={savingPassword}>Alterar senha</Button>
          </form>
        </Card>
      </div>
    </>
  );
}
