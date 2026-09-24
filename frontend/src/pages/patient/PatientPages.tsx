import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, CreditCard, FileText, MessageCircle, UserPlus } from "lucide-react";
import { Avatar, Badge, Button, Card, EmptyState, Input, Modal, Skeleton } from "../../components/ui";
import { PageHeader, StatCard, StatGrid } from "../../components/Page";
import { ChatPanel } from "../../components/ChatPanel";
import { PaymentCheckout } from "../../components/PaymentCheckout";
import { useAuth } from "../../context/AuthContext";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { dateLabel, naiveNowIso, todayLocalDate } from "../../utils";
import { useAppointmentsRange } from "../../hooks/useAppointments";
import {
  changePassword,
  createDependent,
  deleteDependent,
  deleteSavedCard,
  listMyDocuments,
  listSavedCards,
  patchAppointmentStatus,
  updateAppointment,
  updateDependent,
  updateMe,
} from "../../services/api";
import type { SavedCard } from "../../services/api";
import type { PatientDocument } from "../../services/api";
import type { Dependent } from "../../types";

const addDaysStr = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export function PatientDashboard() {
  const { user } = useAuth();
  const { appointments } = useAppointmentsRange(addDaysStr(-30), addDaysStr(180));
  const upcoming = appointments.filter((item) => item.startTime >= naiveNowIso() && item.status !== "Cancelado");

  return (
    <>
      <PageHeader title="Minha conta" description="Próximas consultas, mensagens e atalhos." />
      <StatGrid>
        <StatCard label="Próximas consultas" value={String(upcoming.length)} hint="Titular e dependentes" />
        <StatCard label="Dependentes" value={String(user?.dependents?.length ?? 0)} />
        <StatCard label="Conversas" value={String(user?.conversations?.length ?? 0)} />
        <StatCard label="Status" value="Ativo" hint="Cadastro validado" />
      </StatGrid>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Link to="/agendar"><Button className="w-full"><CalendarPlus className="h-4 w-4" />Agendar</Button></Link>
        <Link to="/minha-conta/dependentes"><Button variant="secondary" className="w-full"><UserPlus className="h-4 w-4" />Dependentes</Button></Link>
        <Link to="/minha-conta/mensagens"><Button variant="secondary" className="w-full"><MessageCircle className="h-4 w-4" />Mensagens</Button></Link>
        <Link to="/minha-conta/documentos"><Button variant="secondary" className="w-full"><FileText className="h-4 w-4" />Documentos</Button></Link>
      </div>
    </>
  );
}

export function PatientAppointments() {
  const { appointments, loading, reload } = useAppointmentsRange(addDaysStr(-365), addDaysStr(365));
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [rescheduling, setRescheduling] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState<string | null>(null);

  const cancel = async (id: string) => {
    if (!(await confirm("Cancelar este agendamento?", { danger: true, confirmLabel: "Cancelar agendamento", cancelLabel: "Voltar" }))) return;
    try {
      await patchAppointmentStatus(id, "Cancelado");
      showToast("success", "Agendamento cancelado.");
      await reload();
    } catch {
      showToast("error", "Não foi possível cancelar.");
    }
  };

  const openReschedule = (id: string, startTime: string) => {
    const date = new Date(startTime);
    setRescheduling(id);
    setNewDate(date.toISOString().slice(0, 10));
    setNewTime(date.toISOString().slice(11, 16));
  };

  const submitReschedule = async (event: FormEvent) => {
    event.preventDefault();
    if (!rescheduling) return;
    setSaving(true);
    try {
      await updateAppointment(rescheduling, { startTime: `${newDate}T${newTime}:00.000Z` });
      showToast("success", "Agendamento remarcado.");
      setRescheduling(null);
      await reload();
    } catch {
      showToast("error", "Horário indisponível. Escolha outro.");
    } finally {
      setSaving(false);
    }
  };

  const sorted = [...appointments].sort((a, b) => b.startTime.localeCompare(a.startTime));

  return (
    <>
      <PageHeader title="Agendamentos" description="Histórico, futuros e ações disponíveis conforme antecedência." actions={<Link to="/agendar"><Button>Novo agendamento</Button></Link>} />
      {loading ? (
        <Skeleton className="h-40" />
      ) : sorted.length === 0 ? (
        <EmptyState title="Nenhum agendamento ainda." action={<Link to="/agendar"><Button>Agendar agora</Button></Link>} />
      ) : (
        <div className="grid gap-3">
          {sorted.map((appointment) => {
            const canManage = appointment.status !== "Cancelado" && appointment.status !== "Realizado" && appointment.startTime > naiveNowIso();
            return (
              <Card key={appointment.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-bold">{appointment.serviceName} com {appointment.professionalName}</h2>
                    <p className="text-sm text-brown-mid">{dateLabel(appointment.startTime.slice(0, 10))} às {appointment.startTime.slice(11, 16)}</p>
                    {appointment.dependentName ? <p className="mt-1 text-xs font-medium text-primary">Para {appointment.dependentName} (dependente)</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={appointment.status === "Cancelado" ? "danger" : appointment.status === "Realizado" ? "success" : "neutral"}>Status: {appointment.status}</Badge>
                    {appointment.status !== "Cancelado" ? (
                      <Badge tone={appointment.patientConfirmation === "Confirmado" ? "success" : appointment.patientConfirmation === "NaoConfirmado" ? "danger" : "warning"}>
                        Confirmação: {appointment.patientConfirmation}
                      </Badge>
                    ) : null}
                    {appointment.paymentStatus !== "PAID" && appointment.status !== "Cancelado" ? (
                      <Button variant="secondary" onClick={() => setPaying(appointment.id)}><CreditCard className="h-4 w-4" />Pagar</Button>
                    ) : null}
                    {canManage ? (
                      <>
                        <Button variant="secondary" onClick={() => openReschedule(appointment.id, appointment.startTime)}>Remarcar</Button>
                        <Button variant="ghost" onClick={() => cancel(appointment.id)}>Cancelar</Button>
                      </>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Modal open={Boolean(rescheduling)} title="Remarcar agendamento" onClose={() => setRescheduling(null)}>
        <form className="grid gap-4" onSubmit={submitReschedule}>
          <Input label="Nova data" type="date" min={todayLocalDate()} value={newDate} onChange={(event) => setNewDate(event.target.value)} required />
          <Input label="Novo horário" type="time" value={newTime} onChange={(event) => setNewTime(event.target.value)} required />
          <Button loading={saving}>Confirmar nova data</Button>
        </form>
      </Modal>
      <Modal open={Boolean(paying)} title="Pagar sessão" onClose={() => setPaying(null)}>
        {paying ? (
          <PaymentCheckout
            appointmentId={paying}
            onPaid={() => {
              setPaying(null);
              void reload();
            }}
          />
        ) : null}
      </Modal>
    </>
  );
}

export function PatientDependents() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const dependents = user?.dependents ?? [];
  const [editing, setEditing] = useState<Dependent | null>(null);
  const [draft, setDraft] = useState({ fullName: "", birthDate: "", relationship: "" });
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const openForm = (dependent?: Dependent) => {
    setEditing(dependent ?? null);
    setDraft(dependent ? { fullName: dependent.fullName, birthDate: dependent.birthDate, relationship: dependent.relationship } : { fullName: "", birthDate: "", relationship: "" });
    setOpen(true);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateDependent(editing.id, draft);
        updateUser({ ...user, dependents: dependents.map((d) => (d.id === editing.id ? updated : d)) });
      } else {
        const created = await createDependent(draft);
        updateUser({ ...user, dependents: [...dependents, created] });
      }
      showToast("success", "Dependente salvo.");
      setOpen(false);
    } catch {
      showToast("error", "Não foi possível salvar o dependente.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (dependent: Dependent) => {
    if (!user) return;
    if (!(await confirm(`Remover ${dependent.fullName}?`, { danger: true, confirmLabel: "Remover" }))) return;
    try {
      await deleteDependent(dependent.id);
      updateUser({ ...user, dependents: dependents.filter((d) => d.id !== dependent.id) });
      showToast("success", "Dependente removido.");
    } catch {
      showToast("error", "Não foi possível remover (verifique agendamentos vinculados).");
    }
  };

  return (
    <>
      <PageHeader title="Dependentes" description="Gerencie pessoas vinculadas para escolher no agendamento." actions={<Button onClick={() => openForm()}>Novo dependente</Button>} />
      <div className="grid gap-3 md:grid-cols-2">
        {dependents.length === 0 ? (
          <EmptyState title="Nenhum dependente cadastrado." />
        ) : (
          dependents.map((dependent) => (
            <Card key={dependent.id}>
              <h2 className="font-bold">{dependent.fullName}</h2>
              <p className="text-sm text-brown-mid">{dependent.relationship || "Dependente"} · Nascimento {dateLabel(dependent.birthDate)}</p>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" onClick={() => openForm(dependent)}>Editar</Button>
                <Button variant="ghost" onClick={() => remove(dependent)}>Remover</Button>
              </div>
            </Card>
          ))
        )}
      </div>
      <Modal open={open} title={editing ? "Editar dependente" : "Novo dependente"} onClose={() => setOpen(false)}>
        <form className="grid gap-4" onSubmit={save}>
          <Input label="Nome completo" value={draft.fullName} onChange={(event) => setDraft({ ...draft, fullName: event.target.value })} required />
          <Input label="Data de nascimento" type="date" value={draft.birthDate} onChange={(event) => setDraft({ ...draft, birthDate: event.target.value })} required />
          <Input label="Relação" placeholder="Filho(a), cônjuge..." value={draft.relationship} onChange={(event) => setDraft({ ...draft, relationship: event.target.value })} />
          <Button loading={saving}>Salvar</Button>
        </form>
      </Modal>
    </>
  );
}

export function PatientMessages() {
  return (
    <>
      <PageHeader title="Mensagens" description="Converse diretamente com a recepção." />
      <ChatPanel />
    </>
  );
}

export function PatientDocuments() {
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyDocuments()
      .then(setDocuments)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title="Documentos" description="Laudos e documentos enviados pelo seu profissional." />
      {loading ? (
        <Skeleton className="h-40" />
      ) : documents.length === 0 ? (
        <EmptyState title="Nenhum documento disponível ainda." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {documents.map((document) => (
            <Card key={document.id}>
              <h2 className="font-bold">{document.title || "Documento"}</h2>
              <p className="text-sm text-brown-mid">{dateLabel(document.createdAt.slice(0, 10))}</p>
              <a href={document.fileUrl} target="_blank" rel="noreferrer">
                <Button variant="secondary" className="mt-3">Abrir</Button>
              </a>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export function PatientPayment() {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const confirm = useConfirm();

  const load = () => {
    setLoading(true);
    listSavedCards()
      .then(setCards)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const remove = async (card: SavedCard) => {
    if (!(await confirm(`Remover cartão •••• ${card.last4}?`, { danger: true, confirmLabel: "Remover" }))) return;
    try {
      await deleteSavedCard(card.id);
      showToast("success", "Cartão removido.");
      load();
    } catch {
      showToast("error", "Não foi possível remover.");
    }
  };

  return (
    <>
      <PageHeader title="Formas de pagamento" description="Cartões salvos para pagar suas próximas sessões sem redigitar os dados. Um cartão é salvo ao marcar a opção durante um pagamento." />
      {loading ? (
        <Skeleton className="h-40" />
      ) : cards.length === 0 ? (
        <EmptyState title="Nenhum cartão salvo ainda." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {cards.map((card) => (
            <Card key={card.id}>
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-bold">•••• •••• •••• {card.last4}</p>
                  <p className="text-xs text-brown-mid">Validade {card.expiryMonth}/{card.expiryYear}</p>
                </div>
              </div>
              <Button variant="ghost" className="mt-3" onClick={() => void remove(card)}>Remover</Button>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export function PatientProfile() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ fullName: user?.fullName ?? "", phone: user?.phone ?? "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ atual: "", nova: "", confirmar: "" });
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await updateMe({ fullName: form.fullName, phone: form.phone });
      updateUser(updated);
      showToast("success", "Perfil atualizado.");
    } catch {
      showToast("error", "Não foi possível salvar o perfil.");
    } finally {
      setSavingProfile(false);
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
      <PageHeader title="Perfil" description="Edite dados de contato e senha." />
      <div className="grid max-w-2xl gap-4">
        <Card>
          <div className="mb-4 flex items-center gap-3">
            <Avatar name={user?.fullName ?? "Paciente"} />
            <div><h2 className="font-bold">{user?.fullName}</h2><p className="text-sm text-brown-mid">{user?.email}</p></div>
          </div>
          <form className="grid gap-4" onSubmit={saveProfile}>
            <Input label="Nome" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
            <Input label="Celular" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
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
