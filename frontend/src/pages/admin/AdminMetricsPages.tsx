import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, AlertTriangle, Award, CheckCircle, Minus, Plug, TrendingDown, TrendingUp, XCircle } from "lucide-react";
import { Badge, Button, Card, Input, Select, Skeleton } from "../../components/ui";
import { PageHeader, StatCard, StatGrid } from "../../components/Page";
import { currency, todayLocalDate } from "../../utils";
import {
  getDashboard,
  getFaturamento,
  getMovimento,
  getProfessionalMetrics,
  getProfissionais,
  getServiceMetrics,
  getServicos,
  searchPatients,
} from "../../services/api";
import type { MetricsFilters } from "../../services/api";
import type {
  MetricsDashboard,
  MetricsFaturamento,
  MetricsMovimento,
  PatientRich,
  Professional,
  ProfessionalMetric,
  Service,
  ServiceMetric,
} from "../../types";

const PERIODOS = ["7d", "30d", "3m", "12m"];
const periodoLabel = (p: string) => ({ "7d": "7 dias", "30d": "30 dias", "3m": "3 meses", "12m": "12 meses" }[p] ?? p);

function TrendBadge({ value }: { value: number }) {
  if (Math.abs(value) < 0.01) return <span className="inline-flex items-center gap-1 text-xs text-brown-mid"><Minus className="h-3 w-3" /> 0%</span>;
  const positive = value > 0;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold ${positive ? "text-primary" : "text-red-600"}`}>
      {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {positive ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; tone: "success" | "warning" | "danger" | "neutral"; icon: React.ReactNode }> = {
    destaque: { label: "Destaque", tone: "success", icon: <Award className="h-3 w-3" /> },
    estavel: { label: "Estável", tone: "neutral", icon: <CheckCircle className="h-3 w-3" /> },
    atencao: { label: "Atenção", tone: "warning", icon: <AlertTriangle className="h-3 w-3" /> },
    critico: { label: "Crítico", tone: "danger", icon: <XCircle className="h-3 w-3" /> },
  };
  const config = map[status] ?? map.estavel;
  return <span className={`inline-flex items-center gap-1`}><Badge tone={config.tone}>{config.icon}{config.label}</Badge></span>;
}

function DistributionBar({ items, max }: { items: { label: string; value: number }[]; max?: number }) {
  const computedMax = max ?? Math.max(1, ...items.map((x) => x.value));
  if (!items.length) return <p className="text-sm text-brown-mid">Sem dados no período.</p>;
  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between text-xs">
            <span className="text-brown-mid">{item.label}</span>
            <span className="font-bold">{item.value < 100 ? item.value.toFixed(0) : currency(item.value)}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-bg-secondary">
            <div className="h-full bg-primary" style={{ width: `${Math.min(100, (item.value / computedMax) * 100)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function PeriodSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <Select label="Período" value={value} onChange={(event) => onChange(event.target.value)}>
      {PERIODOS.map((period) => <option key={period} value={period}>{periodoLabel(period)}</option>)}
    </Select>
  );
}

function CustomRangePicker({ start, end, onChange }: { start: string; end: string; onChange: (start: string, end: string) => void }) {
  return (
    <Card className="mb-4">
      <p className="mb-2 text-sm font-medium">Ou escolha um período personalizado</p>
      <div className="flex flex-wrap items-end gap-2">
        <Input label="De" type="date" value={start} onChange={(event) => onChange(event.target.value, end)} />
        <Input label="Até" type="date" value={end} onChange={(event) => onChange(start, event.target.value)} />
        {start && end ? <Button type="button" variant="ghost" onClick={() => onChange("", "")}>Limpar</Button> : null}
      </div>
    </Card>
  );
}

function MetricsFilterBar({
  filters,
  onChange,
  showProfessional = true,
}: {
  filters: MetricsFilters & { patientLabel?: string };
  onChange: (next: MetricsFilters & { patientLabel?: string }) => void;
  showProfessional?: boolean;
}) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [patientQuery, setPatientQuery] = useState("");
  const [patientResults, setPatientResults] = useState<PatientRich[]>([]);
  const [showPatientResults, setShowPatientResults] = useState(false);

  useEffect(() => {
    getProfissionais().then((items) => setProfessionals(items.filter((item) => item.role === "profissional")));
    getServicos().then(setServices);
  }, []);

  useEffect(() => {
    if (!patientQuery.trim()) { setPatientResults([]); return; }
    const timer = window.setTimeout(() => void searchPatients(patientQuery).then(setPatientResults), 250);
    return () => window.clearTimeout(timer);
  }, [patientQuery]);

  const plans = useMemo(() => {
    const byId = new Map<string, string>();
    services.forEach((service) => service.plans.forEach((plan) => byId.set(plan.planId, plan.planName)));
    return [...byId.entries()].map(([planId, planName]) => ({ planId, planName }));
  }, [services]);

  const hasFilters = Boolean(filters.professionalId || filters.patientId || filters.planId || filters.serviceId);

  return (
    <Card className="mb-4">
      <p className="mb-2 text-sm font-medium">Filtros</p>
      <div className="flex flex-wrap items-end gap-2">
        {showProfessional ? (
          <Select label="Profissional" value={filters.professionalId ?? ""} onChange={(event) => onChange({ ...filters, professionalId: event.target.value || undefined })} className="min-w-40">
            <option value="">Todos</option>
            {professionals.map((pro) => <option key={pro.id} value={pro.id}>{pro.name}</option>)}
          </Select>
        ) : null}
        <Select label="Serviço" value={filters.serviceId ?? ""} onChange={(event) => onChange({ ...filters, serviceId: event.target.value || undefined })} className="min-w-40">
          <option value="">Todos</option>
          {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
        </Select>
        <Select label="Convênio" value={filters.planId ?? ""} onChange={(event) => onChange({ ...filters, planId: event.target.value || undefined })} className="min-w-36">
          <option value="">Todos</option>
          {plans.map((plan) => <option key={plan.planId} value={plan.planId}>{plan.planName}</option>)}
        </Select>
        <div className="relative">
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Paciente</span>
            <input
              className="min-h-11 w-48 rounded-lg border border-brown-mid/25 bg-surface px-3 text-sm"
              value={filters.patientId ? (filters.patientLabel ?? "") : patientQuery}
              onChange={(event) => {
                setPatientQuery(event.target.value);
                setShowPatientResults(true);
                if (filters.patientId) onChange({ ...filters, patientId: undefined, patientLabel: undefined });
              }}
              onFocus={() => setShowPatientResults(true)}
              placeholder="Buscar paciente"
            />
          </label>
          {showPatientResults && patientResults.length > 0 ? (
            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-brown-mid/25 bg-surface shadow-soft">
              {patientResults.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-bg-secondary"
                  onClick={() => {
                    onChange({ ...filters, patientId: patient.id, patientLabel: patient.name });
                    setPatientQuery("");
                    setShowPatientResults(false);
                  }}
                >
                  {patient.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {hasFilters ? (
          <Button type="button" variant="ghost" onClick={() => { onChange({}); setPatientQuery(""); }}>Limpar filtros</Button>
        ) : null}
      </div>
    </Card>
  );
}

// ─── Dashboard ──────────────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const [period, setPeriod] = useState("30d");
  const [data, setData] = useState<MetricsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    getDashboard(period).then(setData).finally(() => setLoading(false));
  }, [period]);
  if (loading || !data) return <Skeleton className="h-72" />;
  return (
    <>
      <PageHeader title="Visão executiva" description="KPIs do período + tendência vs período anterior + lista de espera em tempo real." actions={<PeriodSelector value={period} onChange={setPeriod} />} />
      <StatGrid>
        <StatCard label="Receita" value={currency(data.revenue)} hint={data.revenueTrend !== 0 ? `${data.revenueTrend > 0 ? "+" : ""}${data.revenueTrend}% vs anterior` : undefined} />
        <StatCard label="Lucro estimado" value={currency(data.profit)} hint={`${data.profitTrend > 0 ? "+" : ""}${data.profitTrend}% vs anterior`} />
        <StatCard label="Atendimentos" value={String(data.appointments)} hint={`${data.appointmentsTrend > 0 ? "+" : ""}${data.appointmentsTrend}% vs anterior`} />
        <StatCard label="Ticket médio" value={currency(data.ticketAverage)} hint={`Ocupação ${data.occupancy}%`} />
      </StatGrid>
      <div className="mt-4 grid gap-4 lg:grid-cols-[240px_1fr]">
        <StatCard label="Taxa de não comparecimento" value={`${data.noShowRate}%`} hint="Da clínica inteira, no período" />
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plug className="h-4 w-4 text-primary" />
              <h2 className="font-bold">Integrações conectadas</h2>
            </div>
            <Link to="/admin/configuracoes/integracoes" className="text-xs font-bold text-primary">Gerenciar</Link>
          </div>
          <p className="mt-1 text-xs text-brown-mid">{data.integrationsHealth.connected} de {data.integrationsHealth.total} configuradas</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.integrationsHealth.details.map((item) => (
              <Badge key={item.key} tone={item.connected ? "success" : "neutral"}>{item.label}</Badge>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-bold">Lista de espera (agora)</h2>
          <p className="text-xs text-brown-mid">Pacientes com horário passado e ainda não atendidos.</p>
          <div className="mt-3 grid gap-2">
            {data.waitingList.length === 0 ? <p className="text-sm text-brown-mid">Ninguém esperando.</p> : data.waitingList.map((entry) => (
              <div key={entry.appointmentId} className="rounded-lg bg-bg-secondary p-3 text-sm">
                <div className="flex justify-between"><strong>{entry.patientName}</strong><Badge tone="warning">{entry.waitMinutes} min</Badge></div>
                <p className="text-xs text-brown-mid">{entry.service} com {entry.professionalName}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="font-bold">Próximos hoje</h2>
          <div className="mt-3 grid gap-2">
            {data.upcoming.length === 0 ? <p className="text-sm text-brown-mid">Nenhuma consulta restante hoje.</p> : data.upcoming.map((entry) => (
              <div key={entry.appointmentId} className="rounded-lg bg-bg-secondary p-3 text-sm">
                <div className="flex justify-between"><strong>{entry.patientName}</strong><span className="text-xs">{entry.startTime.slice(11, 16)}</span></div>
                <p className="text-xs text-brown-mid">{entry.service} com {entry.professionalName}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="mt-4">
        <h2 className="mb-3 font-bold">Evolução mensal</h2>
        <DistributionBar items={data.monthlySeries.map((p) => ({ label: p.month, value: p.revenue }))} />
      </Card>
    </>
  );
}

// ─── Faturamento ────────────────────────────────────────────────────────────

export function AdminFaturamentoPage() {
  const [period, setPeriod] = useState("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const customRange = customStart && customEnd ? { start: customStart, end: customEnd } : undefined;
  const [filters, setFilters] = useState<MetricsFilters & { patientLabel?: string }>({});
  const [data, setData] = useState<MetricsFaturamento | null>(null);
  useEffect(() => { void getFaturamento(period, customRange, filters).then(setData); }, [period, customStart, customEnd, filters]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!data) return <Skeleton className="h-72" />;
  return (
    <>
      <PageHeader title="Faturamento" description="Receita, repasses, custos, comissão, receita líquida e margem." actions={<PeriodSelector value={period} onChange={(value) => { setPeriod(value); setCustomStart(""); setCustomEnd(""); }} />} />
      <CustomRangePicker start={customStart} end={customEnd} onChange={(start, end) => { setCustomStart(start); setCustomEnd(end); }} />
      <MetricsFilterBar filters={filters} onChange={setFilters} />
      <StatGrid>
        <StatCard label="Receita bruta" value={currency(data.totalRevenue)} hint={`${data.revenueTrend > 0 ? "+" : ""}${data.revenueTrend}% vs anterior`} />
        <StatCard label="Repasses (comissões)" value={currency(data.totalPayout)} />
        <StatCard label="Custos" value={currency(data.totalCustos)} hint={`${data.custosCount} lançamentos`} />
        <StatCard label="Receita líquida" value={currency(data.netRevenue)} hint={`Margem ${data.margemLiquida}%`} />
      </StatGrid>
      <StatGrid>
        <StatCard label="Atendimentos" value={String(data.totalAppointments)} hint={`Concluídos ${data.completedAppointments}`} />
        <StatCard label="Ticket médio" value={currency(data.ticketMedio)} />
        <StatCard label="Inadimplência" value={currency(data.delinquency)} hint="Realizados sem pagamento" />
      </StatGrid>
      <StatGrid>
        <StatCard label="Cancelamentos" value={String(data.cancelledCount)} />
        <StatCard label="Confirmações" value={String(data.confirmedCount)} />
        <StatCard label="Não compareceu após confirmar" value={String(data.noShowAfterConfirmationCount)} />
      </StatGrid>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card><h2 className="mb-3 font-bold">Por método de pagamento</h2><DistributionBar items={data.byMethod} /></Card>
        <Card><h2 className="mb-3 font-bold">Online (Asaas) vs. manual (recepção)</h2><DistributionBar items={data.byOrigin} /></Card>
        <Card><h2 className="mb-3 font-bold">Por convênio</h2><DistributionBar items={data.byPlan} /></Card>
        <Card><h2 className="mb-3 font-bold">Custos por tipo</h2><DistributionBar items={data.custosByCategory} /></Card>
        <Card>
          <h2 className="mb-3 font-bold">Top repasses</h2>
          <div className="grid gap-2 text-sm">
            {data.payouts.slice(0, 5).map((payout) => (
              <div key={payout.professionalId} className="flex items-center justify-between rounded-lg bg-bg-secondary p-3">
                <div>
                  <strong>{payout.name}</strong>
                  <p className="text-xs text-brown-mid">{payout.specialty} · {payout.appointments} atendimentos</p>
                </div>
                <div className="text-right">
                  <strong>{currency(payout.netAfterTax)}</strong>
                  <p className="text-xs text-brown-mid">{payout.commissionPct.toFixed(1)}% bruto {currency(payout.gross)}</p>
                  {payout.netAfterTax !== payout.net ? (
                    <p className="text-xs text-brown-mid">Comissão bruta {currency(payout.net)} (com imposto retido)</p>
                  ) : null}
                </div>
              </div>
            ))}
            {!data.payouts.length ? <p className="text-sm text-brown-mid">Sem comissões registradas no período.</p> : null}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 font-bold">Receita por paciente</h2>
          <div className="grid max-h-72 gap-2 overflow-y-auto text-sm">
            {data.byPatient.slice(0, 20).map((entry) => (
              <div key={entry.patientId + entry.label} className="flex items-center justify-between rounded-lg bg-bg-secondary p-3">
                <span>{entry.label} <span className="text-xs text-brown-mid">({entry.appointments} atendimento{entry.appointments === 1 ? "" : "s"})</span></span>
                <strong>{currency(entry.revenue)}</strong>
              </div>
            ))}
            {!data.byPatient.length ? <p className="text-sm text-brown-mid">Sem pagamentos no período.</p> : null}
          </div>
        </Card>
      </div>
      <Card className="mt-4">
        <h2 className="mb-3 font-bold">Evolução mensal</h2>
        <DistributionBar items={data.monthlyRevenue.map((p) => ({ label: p.month, value: p.revenue }))} />
      </Card>
    </>
  );
}

// ─── Profissionais ──────────────────────────────────────────────────────────

export function AdminMetricasProfissionaisPage() {
  const [period, setPeriod] = useState("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const customRange = customStart && customEnd ? { start: customStart, end: customEnd } : undefined;
  const [filters, setFilters] = useState<MetricsFilters & { patientLabel?: string }>({});
  const [items, setItems] = useState<ProfessionalMetric[]>([]);
  useEffect(() => { void getProfessionalMetrics(period, customRange, filters).then(setItems); }, [period, customStart, customEnd, filters]); // eslint-disable-line react-hooks/exhaustive-deps
  const totalRevenue = items.reduce((sum, x) => sum + x.revenue, 0);
  const totalPayout = items.reduce((sum, x) => sum + x.netPayout, 0);
  return (
    <>
      <PageHeader title="Métricas por profissional" description="Ranking, ocupação, comissão real, tendência e status calculado por thresholds." actions={<PeriodSelector value={period} onChange={(value) => { setPeriod(value); setCustomStart(""); setCustomEnd(""); }} />} />
      <CustomRangePicker start={customStart} end={customEnd} onChange={(start, end) => { setCustomStart(start); setCustomEnd(end); }} />
      <MetricsFilterBar filters={filters} onChange={setFilters} />
      <StatGrid>
        <StatCard label="Receita total" value={currency(totalRevenue)} />
        <StatCard label="Repasses" value={currency(totalPayout)} />
        <StatCard label="Profissionais" value={String(items.length)} />
        <StatCard label="Receita líquida" value={currency(totalRevenue - totalPayout)} />
      </StatGrid>
      <div className="mt-6 grid gap-3">
        {items.map((entry, index) => (
          <Card key={entry.professionalId}>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-white text-sm font-bold">{index + 1}</div>
                <div>
                  <h3 className="font-bold">{entry.name}</h3>
                  <p className="text-xs text-brown-mid">{entry.specialty}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={entry.status} />
                <TrendBadge value={entry.revenueTrend} />
              </div>
            </div>
            <div className="mt-3 grid gap-2 text-sm md:grid-cols-4">
              <div><span className="text-xs text-brown-mid">Atendimentos</span><p className="font-bold">{entry.appointments} <span className="text-xs text-brown-mid">({entry.completedCount} concluídos)</span></p></div>
              <div><span className="text-xs text-brown-mid">Receita</span><p className="font-bold">{currency(entry.revenue)}</p></div>
              <div>
                <span className="text-xs text-brown-mid">Repasse líquido</span>
                <p className="font-bold">{currency(entry.netPayout)} <span className="text-xs text-brown-mid">({entry.commissionPct.toFixed(1)}%)</span></p>
                {entry.netPayout !== entry.grossPayout ? <p className="text-xs text-brown-mid">Bruto {currency(entry.grossPayout)}</p> : null}
              </div>
              <div><span className="text-xs text-brown-mid">Ticket médio</span><p className="font-bold">{currency(entry.ticket)}</p></div>
              <div><span className="text-xs text-brown-mid">Ocupação</span><p className="font-bold">{entry.occupancy}%</p></div>
              <div><span className="text-xs text-brown-mid">Cancelamento</span><p className="font-bold">{entry.cancellationRate}%</p></div>
              <div><span className="text-xs text-brown-mid">Não compareceu</span><p className="font-bold">{entry.noShowCount}</p></div>
              <div><span className="text-xs text-brown-mid">Confirmações</span><p className="font-bold">{entry.confirmedCount}</p></div>
              <div><span className="text-xs text-brown-mid">Não compareceu após confirmar</span><p className="font-bold">{entry.noShowAfterConfirmationCount}</p></div>
              <div><span className="text-xs text-brown-mid">Novos pacientes</span><p className="font-bold">{entry.newPatients}</p></div>
              <div><span className="text-xs text-brown-mid">Retorno</span><p className="font-bold">{entry.returningPatients}</p></div>
            </div>
          </Card>
        ))}
        {!items.length ? <p className="text-sm text-brown-mid">Sem dados no período.</p> : null}
      </div>
    </>
  );
}

// ─── Serviços ───────────────────────────────────────────────────────────────

export function AdminMetricasServicosPage() {
  const [period, setPeriod] = useState("30d");
  const [items, setItems] = useState<ServiceMetric[]>([]);
  useEffect(() => { void getServiceMetrics(period).then(setItems); }, [period]);
  return (
    <>
      <PageHeader title="Métricas por serviço" description="Ranking por volume e receita, conversão, duração e cancelamento." actions={<PeriodSelector value={period} onChange={setPeriod} />} />
      <div className="grid gap-3">
        {items.map((entry) => (
          <Card key={entry.serviceId}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold">{entry.name}</h3>
                <p className="text-xs text-brown-mid">Volume {entry.volume} · Concluídos {entry.completedCount} · Cancelados {entry.cancelledCount}</p>
              </div>
              <Badge tone={entry.cancellationRate > 20 ? "danger" : entry.cancellationRate > 10 ? "warning" : "success"}>{entry.cancellationRate.toFixed(1)}% cancel.</Badge>
            </div>
            <div className="mt-3 grid gap-2 text-sm md:grid-cols-4">
              <div><span className="text-xs text-brown-mid">Receita</span><p className="font-bold">{currency(entry.revenue)}</p></div>
              <div><span className="text-xs text-brown-mid">Conversão</span><p className="font-bold">{entry.conversionRate.toFixed(1)}%</p></div>
              <div><span className="text-xs text-brown-mid">Duração estimada</span><p className="font-bold">{entry.estimatedDurationMinutes} min</p></div>
              <div><span className="text-xs text-brown-mid">Duração média</span><p className="font-bold">{entry.avgDurationMinutes.toFixed(0)} min</p></div>
            </div>
          </Card>
        ))}
        {!items.length ? <p className="text-sm text-brown-mid">Sem serviços no período.</p> : null}
      </div>
    </>
  );
}

// ─── Movimento ──────────────────────────────────────────────────────────────

export function AdminMovimentoPage() {
  const [date, setDate] = useState(todayLocalDate());
  const [data, setData] = useState<MetricsMovimento | null>(null);
  useEffect(() => { void getMovimento(date).then(setData); }, [date]);
  if (!data) return <Skeleton className="h-72" />;
  const dateLabel = new Date(date + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  return (
    <>
      <PageHeader
        title="Movimento do dia"
        description={dateLabel}
        actions={
          <label className="grid gap-2 text-sm font-medium">
            <span>Data</span>
            <input type="date" className="min-h-11 rounded-lg border border-brown-mid/25 bg-surface px-3" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
        }
      />
      <StatGrid>
        <StatCard label="Atendimentos" value={String(data.totalAppointments)} hint={`${data.appointmentsTrend > 0 ? "+" : ""}${data.appointmentsTrend}% vs ontem`} />
        <StatCard label="Realizados" value={String(data.completed)} hint={`Taxa ${data.showRate}%`} />
        <StatCard label="Receita do dia" value={currency(data.revenueToday)} hint={`${data.revenueTrend > 0 ? "+" : ""}${data.revenueTrend}% vs ontem`} />
        <StatCard label="Pendente" value={currency(data.pendingToday)} hint="Ainda a cobrar" />
      </StatGrid>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card><h2 className="mb-3 font-bold">Status</h2><DistributionBar items={data.statusBreakdown} /></Card>
        <Card><h2 className="mb-3 font-bold">Receita por método</h2><DistributionBar items={data.revenueByMethod} /></Card>
        <Card>
          <h2 className="mb-3 font-bold">Por hora</h2>
          <div className="flex h-32 items-end gap-1">
            {Array.from({ length: 14 }, (_, index) => {
              const hour = 7 + index;
              const entry = data.hourlyDistribution.find((x) => x.hour === hour);
              const count = entry?.count ?? 0;
              const max = Math.max(1, ...data.hourlyDistribution.map((x) => x.count));
              return (
                <div key={hour} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded bg-primary" style={{ height: `${(count / max) * 100}%` }} />
                  <span className="text-[10px] text-brown-mid">{hour}h</span>
                </div>
              );
            })}
          </div>
        </Card>
        <Card><h2 className="mb-3 font-bold">Por profissional</h2><DistributionBar items={data.byProfessional} /></Card>
      </div>
      <Card className="mt-4">
        <h2 className="mb-3 font-bold">Eventos do dia</h2>
        <div className="grid gap-2 text-sm">
          {data.events.length === 0 ? <p className="text-brown-mid">Sem eventos registrados.</p> : data.events.map((event) => (
            <div key={event.id} className="flex items-center gap-3 rounded-lg bg-bg-secondary p-3">
              <Activity className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <strong className="text-xs uppercase tracking-wide">{event.type}</strong>
                <p>{event.description}</p>
              </div>
              <span className="text-xs text-brown-mid">{new Date(event.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
