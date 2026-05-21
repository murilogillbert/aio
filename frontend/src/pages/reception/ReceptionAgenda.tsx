import { FormEvent, useEffect, useMemo, useState } from "react";
import { Calendar, CalendarRange, ChevronLeft, ChevronRight, Plus, Search, Trash2, X, Repeat, MessageCircle } from "lucide-react";
import { Badge, Button, Card, Input, Modal, Select, Skeleton, Textarea } from "../../components/ui";
import { PageHeader } from "../../components/Page";
import { useToast } from "../../context/ToastContext";
import {
  checkinAppointment,
  createAppointment,
  deleteAppointment,
  deleteFutureAppointments,
  getProfissionais,
  getServicos,
  listAppointments,
  patchAppointmentConfirmation,
  patchAppointmentStatus,
  payAppointment,
  searchPatients,
  updateAppointment,
} from "../../services/api";
import type { AppointmentRich, PatientRich, Professional, Service } from "../../types";
import { currency } from "../../utils";

const TIME_SLOTS = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30",
];

const STATUS_OPTIONS = [
  { value: "Agendado", label: "Agendado", tone: "warning" as const },
  { value: "Confirmado", label: "Confirmado", tone: "success" as const },
  { value: "EmAndamento", label: "Em atendimento", tone: "success" as const },
  { value: "Realizado", label: "Realizado", tone: "success" as const },
  { value: "NaoCompareceu", label: "Não compareceu", tone: "neutral" as const },
  { value: "Cancelado", label: "Cancelado", tone: "danger" as const },
];

const CONFIRMATION_OPTIONS = [
  { value: "Pendente", label: "Pendente" },
  { value: "Confirmado", label: "Confirmado" },
  { value: "NaoConfirmado", label: "Não confirmado" },
];

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function startOfWeek(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  const dayOfWeek = next.getDay();
  next.setDate(next.getDate() + (dayOfWeek === 0 ? -6 : 1 - dayOfWeek));
  return next;
}
function addDays(date: Date, count: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}
function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function fmtTime(iso: string): string {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
function durationMinutes(start: string, end: string): number {
  return Math.max(15, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));
}

interface FormState {
  patientId: string;
  patientLabel: string;
  professionalId: string;
  serviceId: string;
  planId: string;
  date: string;
  startTime: string;
  duration: string;
  notes: string;
  appointmentType: "Presencial" | "Online";
}

export function ReceptionAgenda() {
  const { showToast } = useToast();
  const today = isoDate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRich[]>([]);
  const [loading, setLoading] = useState(true);
  const [profFilter, setProfFilter] = useState("");
  const [profSearch, setProfSearch] = useState("");
  const [showCancelled, setShowCancelled] = useState(true);

  const [selectedAppt, setSelectedAppt] = useState<AppointmentRich | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteScope, setDeleteScope] = useState<"one" | "future">("one");
  const [showPayment, setShowPayment] = useState(false);

  const queryRange = useMemo(() => {
    if (viewMode === "day") return { start: `${selectedDate}T00:00:00`, end: `${selectedDate}T23:59:59` };
    const base = new Date(`${selectedDate}T12:00:00`);
    const weekStart = startOfWeek(base);
    const weekEnd = addDays(weekStart, 6);
    return { start: `${isoDate(weekStart)}T00:00:00`, end: `${isoDate(weekEnd)}T23:59:59` };
  }, [selectedDate, viewMode]);

  const refetchAppointments = async () => {
    const data = await listAppointments(queryRange.start, queryRange.end);
    setAppointments(data);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getProfissionais().then((items) => setProfessionals(items.filter((item) => item.role === "profissional"))),
      getServicos().then(setServices),
      refetchAppointments(),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void refetchAppointments();
  }, [queryRange.start, queryRange.end]);

  const emptyForm: FormState = {
    patientId: "",
    patientLabel: "",
    professionalId: "",
    serviceId: "",
    planId: "",
    date: selectedDate,
    startTime: "08:00",
    duration: "60",
    notes: "",
    appointmentType: "Presencial",
  };
  const [form, setForm] = useState<FormState>(emptyForm);

  const displayedProfs = useMemo(() => professionals.filter((pro) => {
    const matchesSearch = !profSearch || pro.name.toLowerCase().includes(profSearch.toLowerCase());
    const matchesFilter = !profFilter || pro.id === profFilter;
    return matchesSearch && matchesFilter;
  }), [professionals, profSearch, profFilter]);

  const visibleAppts = useMemo(() => appointments.filter((appt) => showCancelled || appt.status !== "Cancelado"), [appointments, showCancelled]);

  const openNewModal = (overrides?: Partial<FormState>) => {
    setEditingId(null);
    setForm({ ...emptyForm, date: selectedDate, ...overrides });
    setFormError("");
    setIsRecurring(false);
    setShowForm(true);
  };

  const openEditModal = (appt: AppointmentRich) => {
    setEditingId(appt.id);
    setForm({
      patientId: appt.patientId,
      patientLabel: appt.patientName,
      professionalId: appt.professionalId,
      serviceId: appt.serviceId,
      planId: appt.planId ?? "",
      date: appt.startTime.slice(0, 10),
      startTime: fmtTime(appt.startTime),
      duration: String(durationMinutes(appt.startTime, appt.endTime)),
      notes: appt.notes,
      appointmentType: appt.appointmentType === "Online" ? "Online" : "Presencial",
    });
    setFormError("");
    setIsRecurring(false);
    setShowForm(true);
  };

  const handleCellClick = (professionalId: string, time: string, date?: string) => {
    openNewModal({ professionalId, startTime: time, date: date || selectedDate });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    if (!form.patientId || !form.professionalId || !form.serviceId) {
      setFormError("Preencha paciente, profissional e serviço.");
      return;
    }
    try {
      const startTime = `${form.date}T${form.startTime}:00`;
      if (editingId) {
        await updateAppointment(editingId, {
          patientId: form.patientId,
          professionalId: form.professionalId,
          serviceId: form.serviceId,
          planId: form.planId || null,
          startTime,
          durationMinutes: Number(form.duration),
          notes: form.notes,
          appointmentType: form.appointmentType,
        });
        showToast("success", "Agendamento atualizado.");
      } else {
        const result = await createAppointment({
          patientId: form.patientId,
          professionalId: form.professionalId,
          serviceId: form.serviceId,
          planId: form.planId || null,
          startTime,
          durationMinutes: Number(form.duration),
          notes: form.notes,
          appointmentType: form.appointmentType,
          recurrence: isRecurring ? { weekly: true, durationDays: 90 } : undefined,
        });
        if ("skipped" in result && result.skipped > 0) {
          setFormError(`${result.message}`);
          await refetchAppointments();
          return;
        }
        showToast("success", "Agendamento criado.");
      }
      setShowForm(false);
      setIsRecurring(false);
      await refetchAppointments();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Erro ao salvar.");
    }
  };

  const changeStatus = async (status: string) => {
    if (!selectedAppt) return;
    try {
      const updated = await patchAppointmentStatus(selectedAppt.id, status, status === "Cancelado" ? "Recepcao" : undefined);
      setSelectedAppt(updated);
      showToast("success", "Status atualizado.");
      await refetchAppointments();
    } catch {
      showToast("error", "Não foi possível atualizar.");
    }
  };

  const changeConfirmation = async (value: string) => {
    if (!selectedAppt) return;
    try {
      const updated = await patchAppointmentConfirmation(selectedAppt.id, value);
      setSelectedAppt(updated);
      showToast("success", "Confirmação atualizada.");
      await refetchAppointments();
    } catch {
      showToast("error", "Falha ao atualizar confirmação.");
    }
  };

  const handleCheckin = async () => {
    if (!selectedAppt) return;
    await checkinAppointment(selectedAppt.id);
    showToast("success", "Chegada notificada.");
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAppt) return;
    try {
      if (deleteScope === "future" && selectedAppt.recurrenceGroupId) {
        const result = await deleteFutureAppointments(selectedAppt.id);
        showToast("success", result.message);
      } else {
        await deleteAppointment(selectedAppt.id);
        showToast("success", "Agendamento removido.");
      }
      setShowDelete(false);
      setSelectedAppt(null);
      setDeleteScope("one");
      await refetchAppointments();
    } catch {
      showToast("error", "Falha ao remover.");
    }
  };

  return (
    <>
      <PageHeader
        title="Agenda"
        description="Visão diária ou semanal, criação direta com validação de conflito e detalhes editáveis no painel lateral."
        actions={<Button onClick={() => openNewModal()}><Plus className="h-4 w-4" />Novo agendamento</Button>}
      />

      <Card className="mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" onClick={() => {
            const next = new Date(`${selectedDate}T12:00:00`);
            next.setDate(next.getDate() - (viewMode === "week" ? 7 : 1));
            setSelectedDate(isoDate(next));
          }}><ChevronLeft className="h-4 w-4" /></Button>
          <input type="date" className="min-h-11 rounded-lg border border-brown-mid/25 bg-surface px-3 text-sm" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          <Button variant="ghost" onClick={() => {
            const next = new Date(`${selectedDate}T12:00:00`);
            next.setDate(next.getDate() + (viewMode === "week" ? 7 : 1));
            setSelectedDate(isoDate(next));
          }}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="secondary" onClick={() => setSelectedDate(today)}>Hoje</Button>

          <div className="ml-auto flex items-center gap-1 rounded-lg border border-brown-mid/25 bg-surface p-1">
            <button className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-bold ${viewMode === "day" ? "bg-primary text-white" : "text-brown-mid"}`} onClick={() => setViewMode("day")}>
              <Calendar className="h-3 w-3" /> Dia
            </button>
            <button className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-bold ${viewMode === "week" ? "bg-primary text-white" : "text-brown-mid"}`} onClick={() => setViewMode("week")}>
              <CalendarRange className="h-3 w-3" /> Semana
            </button>
          </div>

          <div className="flex flex-1 items-center gap-2 md:flex-none">
            <Select label="Profissional" value={profFilter} onChange={(event) => setProfFilter(event.target.value)} className="min-w-40">
              <option value="">Todos</option>
              {professionals.map((pro) => <option key={pro.id} value={pro.id}>{pro.name}</option>)}
            </Select>
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Buscar</span>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-mid" />
                <input className="min-h-11 rounded-lg border border-brown-mid/25 bg-surface pl-8 pr-2 text-sm" value={profSearch} onChange={(event) => setProfSearch(event.target.value)} placeholder="Nome" />
              </div>
            </label>
            <label className="ml-1 flex items-center gap-2 text-sm">
              <input type="checkbox" checked={showCancelled} onChange={(event) => setShowCancelled(event.target.checked)} />
              <span>Cancelados</span>
            </label>
          </div>
        </div>
      </Card>

      {loading ? (
        <Skeleton className="h-96" />
      ) : viewMode === "day" ? (
        <DayGrid professionals={displayedProfs} appointments={visibleAppts.filter((appt) => appt.startTime.startsWith(selectedDate))} onCellClick={handleCellClick} onAppointmentClick={setSelectedAppt} />
      ) : (
        <WeekGrid selectedDate={selectedDate} professionals={displayedProfs} appointments={visibleAppts} onCellClick={handleCellClick} onAppointmentClick={setSelectedAppt} />
      )}

      <AppointmentFormModal
        open={showForm}
        onClose={() => { setShowForm(false); setIsRecurring(false); }}
        title={editingId ? "Editar agendamento" : "Novo agendamento"}
        form={form}
        setForm={setForm}
        services={services}
        professionals={professionals}
        isRecurring={isRecurring}
        setIsRecurring={setIsRecurring}
        error={formError}
        onSubmit={submit}
        canRecur={editingId === null}
      />

      <AppointmentDrawer
        appointment={selectedAppt}
        onClose={() => setSelectedAppt(null)}
        onEdit={() => selectedAppt && openEditModal(selectedAppt)}
        onStatusChange={changeStatus}
        onConfirmationChange={changeConfirmation}
        onCheckin={handleCheckin}
        onPay={() => setShowPayment(true)}
        onDelete={() => setShowDelete(true)}
      />

      {showDelete && selectedAppt ? (
        <Modal open title="Excluir agendamento" onClose={() => setShowDelete(false)}>
          <div className="grid gap-3">
            {selectedAppt.recurrenceGroupId ? (
              <>
                <p className="text-sm">Este agendamento faz parte de uma série recorrente. O que excluir?</p>
                <label className="flex items-center gap-2 text-sm"><input type="radio" name="scope" value="one" checked={deleteScope === "one"} onChange={() => setDeleteScope("one")} />Só este agendamento</label>
                <label className="flex items-center gap-2 text-sm"><input type="radio" name="scope" value="future" checked={deleteScope === "future"} onChange={() => setDeleteScope("future")} />Este e todos os futuros da série</label>
              </>
            ) : <p className="text-sm">Tem certeza que deseja excluir este agendamento? A ação não pode ser desfeita.</p>}
            <div className="mt-2 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowDelete(false)}>Cancelar</Button>
              <Button onClick={() => void handleDeleteConfirm()}><Trash2 className="h-4 w-4" />Excluir</Button>
            </div>
          </div>
        </Modal>
      ) : null}

      {showPayment && selectedAppt ? (
        <PaymentModal
          appointment={selectedAppt}
          services={services}
          onClose={() => setShowPayment(false)}
          onPaid={async () => { setShowPayment(false); await refetchAppointments(); }}
        />
      ) : null}
    </>
  );
}

// ─── Day Grid ───────────────────────────────────────────────────────────────

const ROW_HEIGHT = 48;

function DayGrid({ professionals, appointments, onCellClick, onAppointmentClick }: {
  professionals: Professional[];
  appointments: AppointmentRich[];
  onCellClick: (professionalId: string, time: string, date?: string) => void;
  onAppointmentClick: (appt: AppointmentRich) => void;
}) {
  if (!professionals.length) {
    return <p className="text-sm text-brown-mid">Nenhum profissional para mostrar. Ajuste o filtro.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        {/* Cabeçalho */}
        <div className="flex border-b border-brown-mid/15 bg-surface">
          <div className="w-16 shrink-0 bg-bg-base" />
          {professionals.map((pro) => (
            <div key={pro.id} className="flex-1 min-w-[160px] border-l border-brown-mid/15 p-2 text-center">
              <strong className="text-sm">{pro.name}</strong>
              <p className="text-xs text-brown-mid">{pro.specialty}</p>
            </div>
          ))}
        </div>
        {/* Corpo: coluna de horas + colunas por profissional */}
        <div className="flex">
          <TimeColumn />
          {professionals.map((pro) => (
            <ProfessionalColumn
              key={pro.id}
              professional={pro}
              appointments={appointments.filter((appt) => appt.professionalId === pro.id)}
              onCellClick={(time) => onCellClick(pro.id, time)}
              onAppointmentClick={onAppointmentClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TimeColumn() {
  return (
    <div className="w-16 shrink-0">
      {TIME_SLOTS.map((time) => (
        <div key={time} className="flex items-start justify-end border-b border-r border-brown-mid/15 bg-bg-base px-2 pt-1 text-xs text-brown-mid" style={{ height: ROW_HEIGHT }}>
          {time}
        </div>
      ))}
    </div>
  );
}

function ProfessionalColumn({ professional, appointments, onCellClick, onAppointmentClick }: {
  professional: Professional;
  appointments: AppointmentRich[];
  onCellClick: (time: string) => void;
  onAppointmentClick: (appt: AppointmentRich) => void;
}) {
  const occupied = new Set<number>();
  for (const appt of appointments) {
    const startIndex = TIME_SLOTS.indexOf(fmtTime(appt.startTime));
    if (startIndex < 0) continue;
    const slots = Math.max(1, Math.round(durationMinutes(appt.startTime, appt.endTime) / 30));
    for (let offset = 0; offset < slots; offset++) occupied.add(startIndex + offset);
  }
  return (
    <div
      className="relative flex-1 min-w-[160px] grid border-l border-brown-mid/15"
      style={{ gridTemplateColumns: "1fr", gridTemplateRows: `repeat(${TIME_SLOTS.length}, ${ROW_HEIGHT}px)` }}
    >
      {TIME_SLOTS.map((time, index) => occupied.has(index) ? null : (
        <button
          key={time}
          type="button"
          onClick={() => onCellClick(time)}
          className="m-0.5 rounded border border-dashed border-brown-mid/15 transition hover:border-primary hover:bg-primary/5"
          style={{ gridRow: index + 1 }}
          aria-label={`Criar às ${time}`}
        />
      ))}
      {appointments.map((appt) => {
        const startIndex = TIME_SLOTS.indexOf(fmtTime(appt.startTime));
        if (startIndex < 0) return null;
        const slots = Math.max(1, Math.round(durationMinutes(appt.startTime, appt.endTime) / 30));
        return (
          <button
            key={appt.id}
            type="button"
            onClick={() => onAppointmentClick(appt)}
            className="m-0.5 overflow-hidden rounded-lg border border-brown-mid/15 p-2 text-left text-xs transition hover:border-primary"
            style={{
              gridRow: `${startIndex + 1} / span ${slots}`,
              backgroundColor: `${appt.serviceColor}22`,
              borderLeft: `3px solid ${appt.serviceColor}`,
            }}
          >
            <strong className="block truncate text-brown-dark">{appt.patientName}</strong>
            <span className="block truncate text-brown-mid">{appt.serviceName}</span>
            <Badge tone={statusTone(appt.status)}>{statusLabel(appt.status)}</Badge>
          </button>
        );
      })}
    </div>
  );
}

// ─── Week Grid ──────────────────────────────────────────────────────────────

function WeekGrid({ selectedDate, professionals, appointments, onCellClick, onAppointmentClick }: {
  selectedDate: string;
  professionals: Professional[];
  appointments: AppointmentRich[];
  onCellClick: (professionalId: string, time: string, date?: string) => void;
  onAppointmentClick: (appt: AppointmentRich) => void;
}) {
  const weekStart = startOfWeek(new Date(`${selectedDate}T12:00:00`));
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  if (professionals.length > 1) {
    return (
      <Card className="mb-3">
        <p className="text-sm text-brown-mid">Na visão semanal, selecione um profissional no filtro acima para ver a semana dele em colunas de dia.</p>
      </Card>
    );
  }
  const pro = professionals[0];
  if (!pro) return <p className="text-sm text-brown-mid">Selecione um profissional.</p>;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[960px]">
        {/* Cabeçalho dos dias */}
        <div className="flex border-b border-brown-mid/15 bg-surface">
          <div className="w-16 shrink-0 bg-bg-base" />
          {days.map((day, index) => {
            const isToday = isoDate(day) === isoDate(new Date());
            return (
              <div key={day.toISOString()} className={`flex-1 min-w-[120px] border-l border-brown-mid/15 p-2 text-center ${isToday ? "bg-primary/5" : ""}`}>
                <strong className="text-sm">{DAY_LABELS[index]}</strong>
                <p className="text-xs text-brown-mid">{day.getDate()}/{day.getMonth() + 1}</p>
              </div>
            );
          })}
        </div>
        {/* Corpo: hora + 7 colunas de dia */}
        <div className="flex">
          <TimeColumn />
          {days.map((day) => {
            const dayIso = isoDate(day);
            const dayAppts = appointments.filter((appt) => appt.professionalId === pro.id && appt.startTime.startsWith(dayIso));
            return (
              <DayColumn
                key={dayIso}
                dayIso={dayIso}
                appointments={dayAppts}
                onCellClick={(time) => onCellClick(pro.id, time, dayIso)}
                onAppointmentClick={onAppointmentClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DayColumn({ dayIso, appointments, onCellClick, onAppointmentClick }: {
  dayIso: string;
  appointments: AppointmentRich[];
  onCellClick: (time: string) => void;
  onAppointmentClick: (appt: AppointmentRich) => void;
}) {
  const occupied = new Set<number>();
  for (const appt of appointments) {
    const startIndex = TIME_SLOTS.indexOf(fmtTime(appt.startTime));
    if (startIndex < 0) continue;
    const slots = Math.max(1, Math.round(durationMinutes(appt.startTime, appt.endTime) / 30));
    for (let offset = 0; offset < slots; offset++) occupied.add(startIndex + offset);
  }
  return (
    <div
      className="relative flex-1 min-w-[120px] grid border-l border-brown-mid/15"
      style={{ gridTemplateColumns: "1fr", gridTemplateRows: `repeat(${TIME_SLOTS.length}, ${ROW_HEIGHT}px)` }}
    >
      {TIME_SLOTS.map((time, index) => occupied.has(index) ? null : (
        <button
          key={`${dayIso}-${time}`}
          type="button"
          onClick={() => onCellClick(time)}
          className="m-0.5 rounded border border-dashed border-brown-mid/15 transition hover:border-primary hover:bg-primary/5"
          style={{ gridRow: index + 1 }}
          aria-label={`Criar em ${dayIso} às ${time}`}
        />
      ))}
      {appointments.map((appt) => {
        const startIndex = TIME_SLOTS.indexOf(fmtTime(appt.startTime));
        if (startIndex < 0) return null;
        const slots = Math.max(1, Math.round(durationMinutes(appt.startTime, appt.endTime) / 30));
        return (
          <button
            key={appt.id}
            type="button"
            onClick={() => onAppointmentClick(appt)}
            className="m-0.5 overflow-hidden rounded-lg border border-brown-mid/15 p-2 text-left text-xs transition hover:border-primary"
            style={{
              gridRow: `${startIndex + 1} / span ${slots}`,
              backgroundColor: `${appt.serviceColor}22`,
              borderLeft: `3px solid ${appt.serviceColor}`,
            }}
          >
            <strong className="block truncate text-brown-dark">{appt.patientName}</strong>
            <span className="block truncate text-brown-mid">{appt.serviceName}</span>
          </button>
        );
      })}
    </div>
  );
}

function statusTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "Cancelado") return "danger";
  if (status === "Realizado" || status === "Confirmado" || status === "EmAndamento") return "success";
  if (status === "Agendado" || status === "Pendente") return "warning";
  return "neutral";
}
function statusLabel(status: string): string {
  return STATUS_OPTIONS.find((opt) => opt.value === status)?.label ?? status;
}

// ─── Patient ComboBox ───────────────────────────────────────────────────────

function PatientCombo({ value, label, onChange }: { value: string; label: string; onChange: (id: string, label: string) => void }) {
  const [search, setSearch] = useState(label);
  const [results, setResults] = useState<PatientRich[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => { setSearch(label); }, [label]);
  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      void searchPatients(search).then(setResults).catch(() => setResults([]));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search, open]);
  return (
    <div className="grid gap-2 text-sm font-medium">
      <span>Paciente</span>
      <div className="relative">
        <input
          className="min-h-11 w-full rounded-lg border border-brown-mid/25 bg-surface px-3 text-sm"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 200)}
          placeholder="Nome, CPF, telefone..."
        />
        {open ? (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-64 overflow-auto rounded-lg border border-brown-mid/25 bg-surface shadow-lg">
            {results.length === 0 ? <p className="p-3 text-xs text-brown-mid">Sem resultados.</p> : results.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onMouseDown={() => { onChange(patient.id, patient.name); setSearch(patient.name); setOpen(false); }}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-bg-secondary ${value === patient.id ? "bg-bg-secondary" : ""}`}
              >
                <strong>{patient.name}</strong>
                <span className="ml-2 text-xs text-brown-mid">{patient.phone || patient.email}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ─── Form Modal ─────────────────────────────────────────────────────────────

function AppointmentFormModal({ open, onClose, title, form, setForm, services, professionals, isRecurring, setIsRecurring, error, onSubmit, canRecur }: {
  open: boolean;
  onClose: () => void;
  title: string;
  form: FormState;
  setForm: (next: FormState) => void;
  services: Service[];
  professionals: Professional[];
  isRecurring: boolean;
  setIsRecurring: (v: boolean) => void;
  error: string;
  onSubmit: (event: FormEvent) => void;
  canRecur: boolean;
}) {
  const selectedService = services.find((service) => service.id === form.serviceId);
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <PatientCombo value={form.patientId} label={form.patientLabel} onChange={(id, label) => setForm({ ...form, patientId: id, patientLabel: label })} />
        <div className="grid gap-3 md:grid-cols-2">
          <Select label="Serviço" value={form.serviceId} onChange={(event) => {
            const next = services.find((service) => service.id === event.target.value);
            setForm({ ...form, serviceId: event.target.value, duration: next ? String(next.durationMinutes) : form.duration });
          }} required>
            <option value="">Selecione</option>
            {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
          </Select>
          <Select label="Profissional" value={form.professionalId} onChange={(event) => setForm({ ...form, professionalId: event.target.value })} required>
            <option value="">Selecione</option>
            {professionals.filter((pro) => !selectedService || selectedService.professionalIds?.includes(pro.id) !== false).map((pro) => <option key={pro.id} value={pro.id}>{pro.name}</option>)}
          </Select>
          <Input label="Data" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
          <Select label="Hora" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })}>
            {TIME_SLOTS.map((time) => <option key={time}>{time}</option>)}
          </Select>
          <Input label="Duração (min)" type="number" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} />
          <Select label="Tipo" value={form.appointmentType} onChange={(event) => setForm({ ...form, appointmentType: event.target.value as "Presencial" | "Online" })}>
            <option>Presencial</option>
            <option>Online</option>
          </Select>
        </div>
        <Textarea label="Observações" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
        {canRecur ? (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isRecurring} onChange={(event) => setIsRecurring(event.target.checked)} />
            <span><Repeat className="mr-1 inline h-3 w-3" />Repetir semanalmente por 90 dias</span>
          </label>
        ) : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button>Salvar agendamento</Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Detail Drawer ──────────────────────────────────────────────────────────

function AppointmentDrawer({ appointment, onClose, onEdit, onStatusChange, onConfirmationChange, onCheckin, onPay, onDelete }: {
  appointment: AppointmentRich | null;
  onClose: () => void;
  onEdit: () => void;
  onStatusChange: (status: string) => void;
  onConfirmationChange: (value: string) => void;
  onCheckin: () => void;
  onPay: () => void;
  onDelete: () => void;
}) {
  if (!appointment) return null;
  const isPaid = appointment.paymentStatus === "PAID";
  return (
    <div className="fixed inset-0 z-40 grid place-items-end bg-brown-dark/30">
      <div className="h-full w-full max-w-md overflow-y-auto bg-surface p-5 shadow-soft sm:w-[420px]">
        <div className="mb-4 flex items-start justify-between gap-2">
          <h3 className="font-heading text-xl font-bold">Detalhes</h3>
          <Button variant="ghost" onClick={onClose}><X className="h-5 w-5" /></Button>
        </div>
        <div className="grid gap-3 text-sm">
          <div>
            <span className="text-xs uppercase tracking-wide text-brown-mid">Paciente</span>
            <p className="font-bold">{appointment.patientName}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wide text-brown-mid">Serviço</span>
            <p className="font-bold">{appointment.serviceName}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wide text-brown-mid">Profissional</span>
            <p className="font-bold">{appointment.professionalName}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wide text-brown-mid">Quando</span>
            <p className="font-bold">{new Date(appointment.startTime).toLocaleString("pt-BR")}</p>
          </div>
          {appointment.roomName ? (
            <div><span className="text-xs uppercase tracking-wide text-brown-mid">Sala</span><p className="font-bold">{appointment.roomName}</p></div>
          ) : null}
          <Select label="Status" value={appointment.status} onChange={(event) => onStatusChange(event.target.value)}>
            {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </Select>
          <Select label="Confirmação do paciente" value={appointment.patientConfirmation} onChange={(event) => onConfirmationChange(event.target.value)}>
            {CONFIRMATION_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </Select>
          <div>
            <span className="text-xs uppercase tracking-wide text-brown-mid">Pagamento</span>
            {isPaid ? <Badge tone="success">Pago {currency(appointment.paymentAmount ?? 0)}</Badge> : <Button variant="secondary" onClick={onPay}>Cobrar</Button>}
          </div>
          {appointment.notes ? (
            <div><span className="text-xs uppercase tracking-wide text-brown-mid">Observações</span><p>{appointment.notes}</p></div>
          ) : null}
          {appointment.recurrenceGroupId ? <Badge>Série recorrente</Badge> : null}
          <div className="mt-4 grid gap-2">
            <Button variant="secondary" onClick={onCheckin}><MessageCircle className="h-4 w-4" />Notificar chegada</Button>
            <Button variant="secondary" onClick={onEdit}>Editar</Button>
            <Button variant="ghost" onClick={onDelete}><Trash2 className="h-4 w-4" />Excluir</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Modal ──────────────────────────────────────────────────────────

function PaymentModal({ appointment, services, onClose, onPaid }: { appointment: AppointmentRich; services: Service[]; onClose: () => void; onPaid: () => void }) {
  const { showToast } = useToast();
  const service = services.find((entry) => entry.id === appointment.serviceId);
  const [amount, setAmount] = useState((service?.priceFrom ?? 0).toString());
  const [method, setMethod] = useState("PIX");
  const [paying, setPaying] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPaying(true);
    try {
      const result = await payAppointment(appointment.id, Number(amount), method);
      showToast("success", `${result.message} Comissão ${currency(result.commissionAmount)} (${result.commissionPct.toFixed(1)}%)`);
      await onPaid();
    } catch {
      showToast("error", "Não foi possível registrar o pagamento.");
    } finally {
      setPaying(false);
    }
  };
  return (
    <Modal open title="Registrar pagamento" onClose={onClose}>
      <form className="grid gap-3" onSubmit={submit}>
        <p className="text-sm text-brown-mid">{appointment.patientName} · {appointment.serviceName}</p>
        <Input label="Valor (R$)" type="number" step="0.01" min={0} value={amount} onChange={(event) => setAmount(event.target.value)} />
        <Select label="Método" value={method} onChange={(event) => setMethod(event.target.value)}>
          <option>PIX</option>
          <option>Cartão de crédito</option>
          <option>Cartão de débito</option>
          <option>Dinheiro</option>
          <option>Mercado Pago</option>
        </Select>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button loading={paying}>Confirmar pagamento</Button>
        </div>
      </form>
    </Modal>
  );
}
