import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Select } from "../../components/ui";
import { PageHeader } from "../../components/Page";
import { getAgenda, getProfissionais, getServicos, criarAgendamento } from "../../services/api";
import type { AgendaSlot, BookingDraft, Professional, Service } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { currency, dateLabel } from "../../utils";

const draftKey = "aio-booking-draft";

export function Agendamento() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [slots, setSlots] = useState<AgendaSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [draft, setDraft] = useState<BookingDraft>(() => {
    const stored = localStorage.getItem(draftKey);
    const fromStorage = stored ? (JSON.parse(stored) as BookingDraft) : {};
    return {
      ...fromStorage,
      serviceId: params.get("servico") ?? fromStorage.serviceId,
      professionalId: params.get("profissional") ?? fromStorage.professionalId,
      date: params.get("data") ?? fromStorage.date,
      time: params.get("horario") ?? fromStorage.time,
      patientTarget: fromStorage.patientTarget ?? "self",
    };
  });

  useEffect(() => {
    Promise.all([getServicos(), getProfissionais()]).then(([serviceData, professionalData]) => {
      setServices(serviceData);
      setProfessionals(professionalData.filter((item) => item.role === "profissional"));
    });
  }, []);

  useEffect(() => {
    getAgenda(draft.professionalId).then((data) => setSlots(data.filter((slot) => slot.available).slice(0, 24)));
    localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [draft]);

  const selectedService = services.find((service) => service.id === draft.serviceId);
  const professionalOptions = useMemo(() => {
    if (!selectedService) return professionals;
    return professionals.filter((professional) => selectedService.professionalIds.includes(professional.id));
  }, [professionals, selectedService]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.serviceId || !draft.professionalId || !draft.date || !draft.time) {
      showToast("error", "Selecione serviço, profissional, data e horário.");
      return;
    }
    if (!isAuthenticated || !user) {
      localStorage.setItem(draftKey, JSON.stringify(draft));
      navigate(`/login?redirect=${encodeURIComponent("/agendar")}`);
      return;
    }
    setLoading(true);
    await criarAgendamento({ ...draft, patientId: user.id });
    localStorage.removeItem(draftKey);
    showToast("success", "Agendamento criado.");
    setLoading(false);
    navigate("/minha-conta/agendamentos");
  };

  const selectedSlots = slots.filter((slot) => (draft.date ? slot.date === draft.date : true));
  const uniqueDates = Array.from(new Set(slots.map((slot) => slot.date))).slice(0, 10);

  return (
    <main className="route-fade mx-auto max-w-5xl px-4 py-8">
      <PageHeader title="Agendar" description="Escolha serviço, profissional e horário. Se precisar entrar na conta, o fluxo continua deste ponto." />
      <form className="grid gap-4 lg:grid-cols-[1fr_320px]" onSubmit={submit}>
        <Card className="grid gap-4">
          <Select label="Serviço" value={draft.serviceId ?? ""} onChange={(event) => setDraft({ ...draft, serviceId: event.target.value, professionalId: undefined })} required>
            <option value="">Selecione</option>
            {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
          </Select>
          <Select label="Profissional" value={draft.professionalId ?? ""} onChange={(event) => setDraft({ ...draft, professionalId: event.target.value, date: undefined, time: undefined })} required>
            <option value="">Selecione</option>
            {professionalOptions.map((professional) => <option key={professional.id} value={professional.id}>{professional.name}</option>)}
          </Select>
          <Select label="Data" value={draft.date ?? ""} onChange={(event) => setDraft({ ...draft, date: event.target.value, time: undefined })} required>
            <option value="">Selecione</option>
            {uniqueDates.map((date) => <option key={date} value={date}>{dateLabel(date)}</option>)}
          </Select>
          <Select label="Horário" value={draft.time ?? ""} onChange={(event) => setDraft({ ...draft, time: event.target.value })} required>
            <option value="">Selecione</option>
            {selectedSlots.map((slot) => <option key={slot.id} value={slot.time}>{slot.time}</option>)}
          </Select>
          {user?.dependents?.length ? (
            <Select label="Para quem" value={draft.patientTarget ?? "self"} onChange={(event) => setDraft({ ...draft, patientTarget: event.target.value })}>
              <option value="self">Titular</option>
              {user.dependents.map((dependent) => <option key={dependent.id} value={dependent.id}>{dependent.fullName}</option>)}
            </Select>
          ) : null}
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Resumo</h2>
          <div className="mt-4 grid gap-3 text-sm text-brown-mid">
            <p>Serviço: <strong className="text-brown-dark">{selectedService?.name ?? "A definir"}</strong></p>
            <p>Valor: <strong className="text-brown-dark">{selectedService ? currency(selectedService.priceFrom) : "A definir"}</strong></p>
            <p>Data: <strong className="text-brown-dark">{draft.date ? dateLabel(draft.date) : "A definir"}</strong></p>
            <p>Horário: <strong className="text-brown-dark">{draft.time ?? "A definir"}</strong></p>
          </div>
          <Button className="mt-5 w-full" loading={loading}>Confirmar agendamento</Button>
        </Card>
      </form>
    </main>
  );
}
