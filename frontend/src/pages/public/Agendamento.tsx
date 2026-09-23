import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Select } from "../../components/ui";
import { PageHeader } from "../../components/Page";
import { PaymentCheckout } from "../../components/PaymentCheckout";
import { getAgenda, getProfissionais, getServicos, criarAgendamento } from "../../services/api";
import type { AgendaSlot, BookingDraft, Professional, Service } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { useConfig } from "../../context/ConfigContext";
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
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { config } = useConfig();
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
      setServices(serviceData.filter((service) => service.onlineBooking));
      setProfessionals(professionalData.filter((item) => item.role === "profissional"));
    });
  }, []);

  useEffect(() => {
    getAgenda(draft.professionalId).then((data) => setSlots(data.filter((slot) => slot.available).slice(0, 24)));
    localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [draft]);

  const selectedService = services.find((service) => service.id === draft.serviceId);
  const selectedProfessional = professionals.find((professional) => professional.id === draft.professionalId);
  const selectedPlan = selectedService?.plans.find((plan) => plan.planId === draft.planId);
  const displayPrice = selectedService
    ? selectedPlan
      ? selectedPlan.showPrice
        ? currency(selectedPlan.customPrice ?? selectedService.priceFrom)
        : "Consulte a cobertura"
      : selectedService.showPrice
        ? currency(selectedService.priceFrom)
        : "Consulte o valor"
    : "A definir";
  const professionalOptions = useMemo(() => {
    if (!selectedService) return professionals;
    return professionals.filter((professional) => selectedService.professionalIds.includes(professional.id));
  }, [professionals, selectedService]);
  const serviceOptions = useMemo(() => {
    if (!selectedProfessional) return services;
    return services.filter((service) => selectedProfessional.services.includes(service.id));
  }, [services, selectedProfessional]);

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
    const created = await criarAgendamento({ ...draft, patientId: user.id });
    localStorage.removeItem(draftKey);
    setLoading(false);
    if (config.paymentRequiredAtBooking) {
      setPendingPaymentId(created.id);
      return;
    }
    showToast("success", "Agendamento criado.");
    navigate("/minha-conta/agendamentos");
  };

  if (pendingPaymentId) {
    return (
      <main className="route-fade mx-auto max-w-lg px-4 py-8">
        <PageHeader title="Pagamento" description="Conclua o pagamento para confirmar seu agendamento." />
        <PaymentCheckout
          appointmentId={pendingPaymentId}
          onPaid={() => {
            showToast("success", "Agendamento confirmado.");
            navigate("/minha-conta/agendamentos");
          }}
        />
      </main>
    );
  }

  const selectedSlots = slots.filter((slot) => (draft.date ? slot.date === draft.date : true));
  const uniqueDates = Array.from(new Set(slots.map((slot) => slot.date))).slice(0, 10);

  return (
    <main className="route-fade mx-auto max-w-5xl px-4 py-8">
      <PageHeader title="Agendar" description="Escolha serviço, profissional e horário. Se precisar entrar na conta, o fluxo continua deste ponto." />
      <form className="grid gap-4 lg:grid-cols-[1fr_320px]" onSubmit={submit}>
        <Card className="grid gap-4">
          <Select
            label="Profissional"
            value={draft.professionalId ?? ""}
            onChange={(event) => {
              const professionalId = event.target.value || undefined;
              const nextProfessional = professionals.find((professional) => professional.id === professionalId);
              const serviceStillValid = nextProfessional && draft.serviceId ? nextProfessional.services.includes(draft.serviceId) : true;
              setDraft({ ...draft, professionalId, serviceId: serviceStillValid ? draft.serviceId : undefined, date: undefined, time: undefined });
            }}
          >
            <option value="">Todos</option>
            {professionalOptions.map((professional) => <option key={professional.id} value={professional.id}>{professional.name}</option>)}
          </Select>
          <Select
            label="Serviço"
            value={draft.serviceId ?? ""}
            onChange={(event) => {
              const serviceId = event.target.value || undefined;
              const nextService = services.find((service) => service.id === serviceId);
              const planStillValid = nextService && draft.planId ? nextService.plans.some((plan) => plan.planId === draft.planId) : false;
              setDraft({ ...draft, serviceId, planId: planStillValid ? draft.planId : undefined });
            }}
            required
          >
            <option value="">Selecione</option>
            {serviceOptions.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
          </Select>
          {selectedService?.plans.length ? (
            <Select label="Convênio" value={draft.planId ?? ""} onChange={(event) => setDraft({ ...draft, planId: event.target.value || undefined })}>
              <option value="">Particular</option>
              {selectedService.plans.map((plan) => <option key={plan.planId} value={plan.planId}>{plan.planName}</option>)}
            </Select>
          ) : null}
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
            <p>Valor: <strong className="text-brown-dark">{displayPrice}</strong></p>
            <p>Data: <strong className="text-brown-dark">{draft.date ? dateLabel(draft.date) : "A definir"}</strong></p>
            <p>Horário: <strong className="text-brown-dark">{draft.time ?? "A definir"}</strong></p>
          </div>
          <Button className="mt-5 w-full" loading={loading}>Confirmar agendamento</Button>
        </Card>
      </form>
    </main>
  );
}
