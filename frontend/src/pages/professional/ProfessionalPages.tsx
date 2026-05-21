import { useEffect, useState } from "react";
import { Badge, Card, Skeleton } from "../../components/ui";
import { MiniBarChart, PageHeader, StatCard, StatGrid } from "../../components/Page";
import { getAgenda, getMetricBreakdowns, getMetricasGerais } from "../../services/api";
import type { AgendaSlot, MetricsPoint } from "../../types";
import { currency, dateLabel } from "../../utils";

const todayItems = [
  { time: "09:00", patient: "Marina Pires", service: "Avaliacao Facial Integrada", status: "confirmado" },
  { time: "11:00", patient: "Carla Souza", service: "Bioestimulador de Colageno", status: "pendente" },
  { time: "15:00", patient: "Ana Lima", service: "Avaliacao Facial Integrada", status: "confirmado" },
];

export function ProfessionalDashboard() {
  const [metrics, setMetrics] = useState<MetricsPoint[]>([]);
  const [slots, setSlots] = useState<AgendaSlot[]>([]);

  useEffect(() => {
    getMetricasGerais().then(setMetrics).catch(() => setMetrics([]));
    getAgenda().then(setSlots).catch(() => setSlots([]));
  }, []);

  const latest = metrics.at(-1);
  const today = new Date().toISOString().slice(0, 10);
  const todaySlots = slots.filter((slot) => slot.date === today);
  const nextSlot = todaySlots.find((slot) => slot.available) ?? slots.find((slot) => slot.available);

  return (
    <>
      <PageHeader title="Painel do dia" description="Consultas agendadas, receita estimada e proximos horarios." />
      <StatGrid>
        <StatCard label="Consultas hoje" value={String(todaySlots.filter((slot) => !slot.available).length)} />
        <StatCard label="Receita estimada" value={latest ? currency(latest.revenue) : "-"} />
        <StatCard label="Proximo horario" value={nextSlot?.time ?? "-"} />
        <StatCard label="Mes" value={latest ? currency(latest.revenue) : "-"} hint="Receita gerada" />
      </StatGrid>
      <ScheduleList />
    </>
  );
}

function ScheduleList() {
  return (
    <div className="mt-6 grid gap-3">
      {todayItems.map((item) => (
        <Card key={item.time}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <strong>{item.time} - {item.patient}</strong>
              <p className="text-sm text-brown-mid">{item.service}</p>
            </div>
            <Badge tone={item.status === "confirmado" ? "success" : "warning"}>{item.status}</Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ProfessionalAgenda() {
  const [slots, setSlots] = useState<AgendaSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAgenda().then(setSlots).catch(() => setSlots([])).finally(() => setLoading(false));
  }, []);

  const days = Array.from(new Set(slots.slice(0, 60).map((slot) => slot.date))).slice(0, 5);

  return (
    <>
      <PageHeader title="Agenda" description="Visao diaria e semanal da agenda propria." />
      {loading ? (
        <Skeleton className="h-72" />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {days.map((day) => (
            <Card key={day}>
              <h2 className="font-bold">{dateLabel(day)}</h2>
              <div className="mt-3 grid gap-2">
                {slots.filter((slot) => slot.date === day).slice(0, 6).map((slot) => (
                  <p key={slot.id} className="rounded-lg bg-bg-secondary px-3 py-2 text-sm">
                    {slot.time} - {slot.available ? "Disponivel" : "Agendado"}
                  </p>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export function ProfessionalMetrics() {
  const [metrics, setMetrics] = useState<MetricsPoint[]>([]);
  const [ranking, setRanking] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    getMetricasGerais().then(setMetrics).catch(() => setMetrics([]));
    getMetricBreakdowns().then((data) => setRanking(data.serviceRankingMock)).catch(() => setRanking([]));
  }, []);

  const current = metrics.at(-1);

  return (
    <>
      <PageHeader title="Metricas individuais" description="Atendimentos, comissao, ticket medio, cancelamentos e evolucao." />
      <StatGrid>
        <StatCard label="Atendimentos" value={current ? String(current.appointments) : "-"} hint="Mes atual" />
        <StatCard label="Receita gerada" value={current ? currency(current.revenue) : "-"} />
        <StatCard label="Comissao" value={current ? currency(current.revenue * 0.35) : "-"} />
        <StatCard label="Cancelamento" value={current ? `${current.cancellationRate}%` : "-"} />
      </StatGrid>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card><h2 className="mb-4 font-bold">Evolucao mensal</h2><MiniBarChart data={metrics.map((item) => ({ label: item.month, value: item.revenue }))} /></Card>
        <Card><h2 className="mb-4 font-bold">Distribuicao de servicos</h2><MiniBarChart data={ranking} /></Card>
      </div>
    </>
  );
}

export function ProfessionalMessages() {
  return (
    <>
      <PageHeader title="Mensagens internas" description="Chat interno com recepcao e canais configurados." />
      <Card><h2 className="font-bold">Recepcao</h2><p className="mt-2 text-sm text-brown-mid">Sala 2 preparada para os procedimentos da tarde.</p></Card>
    </>
  );
}
