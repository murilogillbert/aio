import { FormEvent, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Card, EmptyState, Select, Skeleton } from "../../components/ui";
import { PageHeader } from "../../components/Page";
import { useToast } from "../../context/ToastContext";
import { useConfirm } from "../../context/ConfirmContext";
import { useProfessionals } from "../../hooks/useCatalog";
import { createProfessionalSchedule, deleteProfessionalSchedule, listProfessionalSchedules } from "../../services/api";
import type { ProfessionalScheduleSlot } from "../../types";

const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function ProfessionalSchedulesPage() {
  const { professionals, loading: loadingProfessionals } = useProfessionals(true);
  const [professionalId, setProfessionalId] = useState("");
  const [schedules, setSchedules] = useState<ProfessionalScheduleSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState({ weekday: "1", startTime: "09:00", endTime: "18:00" });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    if (professionals.length && !professionalId) setProfessionalId(professionals[0].id);
  }, [professionals, professionalId]);

  const load = async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      setSchedules(await listProfessionalSchedules(id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load(professionalId);
  }, [professionalId]);

  const addSchedule = async (event: FormEvent) => {
    event.preventDefault();
    if (!professionalId) return;
    if (draft.endTime <= draft.startTime) {
      showToast("error", "O horário final deve ser depois do inicial.");
      return;
    }
    setSaving(true);
    try {
      await createProfessionalSchedule({
        professionalId,
        weekday: Number(draft.weekday),
        startTime: draft.startTime,
        endTime: draft.endTime,
      });
      showToast("success", "Horário adicionado.");
      await load(professionalId);
    } catch {
      showToast("error", "Não foi possível adicionar o horário.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (schedule: ProfessionalScheduleSlot) => {
    if (!(await confirm(`Remover o horário de ${WEEKDAYS[schedule.weekday]} ${schedule.startTime}–${schedule.endTime}?`, { danger: true, confirmLabel: "Remover" }))) return;
    try {
      await deleteProfessionalSchedule(schedule.id);
      showToast("success", "Horário removido.");
      await load(professionalId);
    } catch {
      showToast("error", "Não foi possível remover o horário.");
    }
  };

  return (
    <>
      <PageHeader title="Horários de atendimento" description="Configure os dias e horários em que cada profissional fica disponível para agendamento." />
      <Card>
        {loadingProfessionals ? (
          <Skeleton className="h-11" />
        ) : (
          <Select label="Profissional" value={professionalId} onChange={(event) => setProfessionalId(event.target.value)}>
            {professionals.map((professional) => (
              <option key={professional.id} value={professional.id}>{professional.name}</option>
            ))}
          </Select>
        )}
      </Card>

      {!professionalId ? null : loading ? (
        <Skeleton className="mt-4 h-40" />
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {WEEKDAYS.map((label, weekday) => {
            const dayBlocks = schedules.filter((slot) => slot.weekday === weekday);
            return (
              <Card key={weekday}>
                <h3 className="font-bold">{label}</h3>
                {dayBlocks.length === 0 ? (
                  <p className="mt-2 text-sm text-brown-mid">Sem atendimento.</p>
                ) : (
                  <div className="mt-2 grid gap-2">
                    {dayBlocks.map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between gap-2 rounded-lg bg-bg-secondary px-3 py-2 text-sm">
                        <span>{slot.startTime} – {slot.endTime}</span>
                        <Button variant="ghost" onClick={() => void remove(slot)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {professionalId ? (
        <Card className="mt-4">
          <h3 className="mb-3 font-bold">Adicionar horário</h3>
          <form className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end" onSubmit={addSchedule}>
            <Select label="Dia da semana" value={draft.weekday} onChange={(event) => setDraft({ ...draft, weekday: event.target.value })}>
              {WEEKDAYS.map((label, index) => <option key={index} value={index}>{label}</option>)}
            </Select>
            <label className="grid gap-2 text-sm font-medium text-brown-dark">
              <span>Início</span>
              <input type="time" className="min-h-11 rounded-lg border border-brown-mid/25 bg-surface px-3 py-2 text-brown-dark shadow-sm" value={draft.startTime} onChange={(event) => setDraft({ ...draft, startTime: event.target.value })} required />
            </label>
            <label className="grid gap-2 text-sm font-medium text-brown-dark">
              <span>Fim</span>
              <input type="time" className="min-h-11 rounded-lg border border-brown-mid/25 bg-surface px-3 py-2 text-brown-dark shadow-sm" value={draft.endTime} onChange={(event) => setDraft({ ...draft, endTime: event.target.value })} required />
            </label>
            <Button loading={saving}><Plus className="h-4 w-4" />Adicionar</Button>
          </form>
        </Card>
      ) : null}

      {!loadingProfessionals && professionals.length === 0 ? (
        <EmptyState title="Nenhum profissional que atende pacientes cadastrado ainda." />
      ) : null}
    </>
  );
}
