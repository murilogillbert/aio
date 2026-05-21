import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Avatar, Button, Card, EmptyState, Select, Skeleton } from "../../components/ui";
import { PageHeader } from "../../components/Page";
import { getAgenda, getProfessional, getProfissionais, getServicos } from "../../services/api";
import type { AgendaSlot, Professional, Service } from "../../types";
import { currency, dateLabel } from "../../utils";

export function ProfissionaisList() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [specialty, setSpecialty] = useState("Todas");
  const [serviceId, setServiceId] = useState("Todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProfissionais(), getServicos()])
      .then(([professionalData, serviceData]) => {
        setProfessionals(professionalData.filter((item) => item.role === "profissional"));
        setServices(serviceData);
      })
      .finally(() => setLoading(false));
  }, []);

  const specialties = ["Todas", ...Array.from(new Set(professionals.map((professional) => professional.specialty)))];
  const filtered = professionals.filter((professional) => {
    const specialtyMatch = specialty === "Todas" || professional.specialty === specialty;
    const serviceMatch = serviceId === "Todos" || professional.services.includes(serviceId);
    return specialtyMatch && serviceMatch;
  });

  return (
    <main className="route-fade mx-auto max-w-7xl px-4 py-8">
      <PageHeader title="Profissionais" description="Filtre por especialidade ou serviço realizado." />
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <Select label="Especialidade" value={specialty} onChange={(event) => setSpecialty(event.target.value)}>
          {specialties.map((item) => <option key={item}>{item}</option>)}
        </Select>
        <Select label="Serviço" value={serviceId} onChange={(event) => setServiceId(event.target.value)}>
          <option>Todos</option>
          {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
        </Select>
      </div>
      {loading ? <Skeleton className="h-64" /> : filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((professional) => (
            <Card key={professional.id}>
              <Avatar src={professional.photoUrl} name={professional.name} className="h-24 w-24" />
              <h2 className="mt-4 text-xl font-bold">{professional.name}</h2>
              <p className="text-sm text-brown-mid">{professional.specialty}</p>
              <p className="mt-3 text-sm leading-6 text-brown-mid">{professional.bio}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/profissionais/${professional.id}`}><Button variant="secondary">Detalhes</Button></Link>
                <Link to={`/agendar?profissional=${professional.id}`}><Button>Agendar</Button></Link>
              </div>
            </Card>
          ))}
        </div>
      ) : <EmptyState title="Nenhum profissional encontrado com esses filtros." />}
    </main>
  );
}

export function ProfissionalDetail() {
  const { id = "" } = useParams();
  const [professional, setProfessional] = useState<Professional | undefined>();
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<AgendaSlot[]>([]);

  useEffect(() => {
    Promise.all([getProfessional(id), getServicos(), getAgenda(id)]).then(([professionalData, serviceData, agendaData]) => {
      setProfessional(professionalData);
      setServices(serviceData);
      setSlots(agendaData.filter((slot) => slot.available).slice(0, 6));
    });
  }, [id]);

  if (!professional) return <main className="mx-auto max-w-5xl px-4 py-8"><Skeleton className="h-80" /></main>;
  const servicesDone = services.filter((service) => professional.services.includes(service.id));

  return (
    <main className="route-fade mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <Avatar src={professional.photoUrl} name={professional.name} className="h-56 w-full" />
        <PageHeader title={professional.name} description={professional.bio} actions={<Link to={`/agendar?profissional=${professional.id}`}><Button>Agendar</Button></Link>} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-lg font-bold">Serviços que realiza</h2>
          <div className="grid gap-3">
            {servicesDone.map((service) => <p key={service.id} className="text-sm text-brown-mid">{service.name} · {currency(service.priceFrom)}</p>)}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-bold">Agenda disponível</h2>
          <div className="grid gap-2">
            {slots.map((slot) => (
              <Link key={slot.id} to={`/agendar?profissional=${professional.id}&data=${slot.date}&horario=${slot.time}`} className="rounded-lg border border-brown-mid/15 px-3 py-2 text-sm hover:bg-bg-secondary">
                {dateLabel(slot.date)} às {slot.time}
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}
