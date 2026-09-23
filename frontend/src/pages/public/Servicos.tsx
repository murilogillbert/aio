import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button, Card, EmptyState, Select, Skeleton } from "../../components/ui";
import { PageHeader } from "../../components/Page";
import { getProfissionaisPorServico, getServico, getServicos } from "../../services/api";
import type { Professional, Service } from "../../types";
import { currency } from "../../utils";

export function ServicosList() {
  const [services, setServices] = useState<Service[]>([]);
  const [category, setCategory] = useState("Todas");
  const [price, setPrice] = useState("Todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServicos()
      .then((data) => setServices(data.filter((service) => service.onlineBooking)))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["Todas", ...Array.from(new Set(services.map((service) => service.category)))];
  const filtered = services.filter((service) => {
    const categoryMatch = category === "Todas" || service.category === category;
    const priceMatch =
      price === "Todos" ||
      (price === "ate-500" && service.priceFrom <= 500) ||
      (price === "500-1500" && service.priceFrom > 500 && service.priceFrom <= 1500) ||
      (price === "1500+" && service.priceFrom > 1500);
    return categoryMatch && priceMatch;
  });

  return (
    <main className="route-fade mx-auto max-w-7xl px-4 py-8">
      <PageHeader title="Serviços" description="Lista completa com filtros por categoria e faixa de preço." />
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <Select label="Categoria" value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </Select>
        <Select label="Faixa de preço" value={price} onChange={(event) => setPrice(event.target.value)}>
          <option>Todos</option>
          <option value="ate-500">Até R$ 500</option>
          <option value="500-1500">R$ 500 a R$ 1.500</option>
          <option value="1500+">Acima de R$ 1.500</option>
        </Select>
      </div>
      {loading ? <Skeleton className="h-64" /> : filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((service) => (
            <Card key={service.id}>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">{service.category}</p>
              <h2 className="mt-2 text-xl font-bold">{service.name}</h2>
              <p className="mt-2 text-sm leading-6 text-brown-mid">{service.shortDescription}</p>
              {service.showDuration || service.showPrice ? (
                <p className="mt-4 text-sm font-semibold">
                  {[service.showDuration ? `${service.durationMinutes} min` : null, service.showPrice ? currency(service.priceFrom) : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/servicos/${service.id}`}><Button variant="secondary">Detalhes</Button></Link>
                <Link to={`/agendar?servico=${service.id}`}><Button>Agendar</Button></Link>
              </div>
            </Card>
          ))}
        </div>
      ) : <EmptyState title="Nenhum serviço encontrado com esses filtros." />}
    </main>
  );
}

export function ServicoDetail() {
  const { id = "" } = useParams();
  const [service, setService] = useState<Service | undefined>();
  const [professionals, setProfessionals] = useState<Professional[]>([]);

  useEffect(() => {
    Promise.all([getServico(id), getProfissionaisPorServico(id)]).then(([serviceData, professionalsData]) => {
      setService(serviceData);
      setProfessionals(professionalsData);
    });
  }, [id]);

  if (!service) return <main className="mx-auto max-w-5xl px-4 py-8"><Skeleton className="h-80" /></main>;

  return (
    <main className="route-fade mx-auto max-w-5xl px-4 py-8">
      <PageHeader
        title={service.name}
        description={service.description}
        actions={service.onlineBooking ? <Link to={`/agendar?servico=${service.id}`}><Button>Agendar</Button></Link> : null}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-brown-mid">Categoria</p><strong>{service.category}</strong></Card>
        {service.showDuration ? <Card><p className="text-sm text-brown-mid">Duração</p><strong>{service.durationMinutes} minutos</strong></Card> : null}
        {service.showPrice ? <Card><p className="text-sm text-brown-mid">Valor</p><strong>{currency(service.priceFrom)}</strong></Card> : null}
      </div>
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-bold">Profissionais habilitados</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {professionals.map((professional) => (
            <Card key={professional.id}>
              <h3 className="font-bold">{professional.name}</h3>
              <p className="text-sm text-brown-mid">{professional.specialty}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
