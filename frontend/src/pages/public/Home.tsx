import { Calendar, ChevronLeft, ChevronRight, Clock, Instagram, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useConfig } from "../../context/ConfigContext";
import { Button, Card, Skeleton } from "../../components/ui";
import { MapView } from "../../components/MapView";
import { getProfissionais, getServicos } from "../../services/api";
import type { Professional, Service } from "../../types";
import { currency } from "../../utils";
import { Avatar } from "../../components/ui";

const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function Home() {
  const { config } = useConfig();
  const [slide, setSlide] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroImageFailed, setHeroImageFailed] = useState(false);
  const banners = useMemo(() => config.banners.filter((banner) => banner.active).sort((a, b) => a.order - b.order), [config.banners]);
  const active = banners[slide] ?? banners[0];

  useEffect(() => {
    Promise.all([getServicos(), getProfissionais()])
      .then(([serviceData, professionalData]) => {
        setServices(serviceData.slice(0, 6));
        setProfessionals(professionalData.filter((item) => item.role === "profissional").slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!banners.length) return;
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % banners.length), 5500);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  useEffect(() => setHeroImageFailed(false), [active?.id]);

  return (
    <div className="route-fade">
      {active ? (
        <section className="relative min-h-[540px] overflow-hidden bg-brown-dark text-white">
          {!heroImageFailed ? (
            <img
              src={active.imageUrl}
              alt=""
              onError={() => setHeroImageFailed(true)}
              className="absolute inset-0 h-full w-full object-cover opacity-55"
            />
          ) : null}
          <div className="absolute inset-0 bg-brown-dark/35" />
          <div className="relative mx-auto flex min-h-[540px] max-w-7xl flex-col justify-end px-4 pb-14 pt-24">
            <div className="max-w-2xl">
              <h1 className="font-heading text-4xl font-bold leading-tight md:text-6xl">{active.title}</h1>
              <p className="mt-4 text-base leading-7 text-white/90 md:text-lg">{active.subtitle}</p>
              <Link to={active.ctaUrl} className="mt-6 inline-flex">
                <Button>
                  <Calendar className="h-4 w-4" />
                  {active.ctaText}
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-2">
              <button className="rounded-full bg-white/15 p-2" aria-label="Slide anterior" onClick={() => setSlide((slide - 1 + banners.length) % banners.length)}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              {banners.map((banner, index) => (
                <button
                  key={banner.id}
                  aria-label={`Ir para slide ${index + 1}`}
                  className={`h-2 rounded-full transition-all ${index === slide ? "w-8 bg-white" : "w-2 bg-white/50"}`}
                  onClick={() => setSlide(index)}
                />
              ))}
              <button className="rounded-full bg-white/15 p-2" aria-label="Próximo slide" onClick={() => setSlide((slide + 1) % banners.length)}>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-bold">Serviços</h2>
            <p className="mt-2 text-sm text-brown-mid">Procedimentos e consultas com agenda integrada.</p>
          </div>
          <Link to="/servicos" className="text-sm font-bold text-primary">Ver todos</Link>
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-48" />)}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id} className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wide text-primary">{service.category}</span>
                <h3 className="mt-2 text-lg font-bold">{service.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-brown-mid">{service.shortDescription}</p>
                <p className="mt-4 text-sm font-semibold">A partir de {currency(service.priceFrom)}</p>
                <Link to={`/agendar?servico=${service.id}`} className="mt-4">
                  <Button className="w-full">Agendar</Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="bg-bg-secondary py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-3xl font-bold">Profissionais</h2>
              <p className="mt-2 text-sm text-brown-mid">Equipe habilitada para jornadas de cuidado premium.</p>
            </div>
            <Link to="/profissionais" className="text-sm font-bold text-primary">Ver equipe</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {professionals.map((professional) => (
              <Card key={professional.id}>
                <Avatar src={professional.photoUrl} name={professional.name} className="h-20 w-20" />
                <h3 className="mt-4 text-lg font-bold">{professional.name}</h3>
                <p className="text-sm text-brown-mid">{professional.specialty}</p>
                <Link to={`/agendar?profissional=${professional.id}`} className="mt-4 block">
                  <Button variant="secondary" className="w-full">Agendar</Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-12 lg:grid-cols-[1.1fr_.9fr]">
        <MapView lat={config.coordinates.lat} lng={config.coordinates.lng} label={config.clinicName} />
        <div>
          <h2 className="font-heading text-3xl font-bold">Mapa e contato</h2>
          <p className="mt-3 text-sm leading-6 text-brown-mid">{config.address}</p>
          {config.openingHoursStructured.length === 7 ? (
            <div className="mt-3 grid gap-1 text-sm">
              {config.openingHoursStructured.map((day) => (
                <div key={day.weekday} className="flex items-center gap-2 text-brown-mid">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span className="w-20 shrink-0 font-medium text-brown-dark">{WEEKDAY_SHORT[day.weekday]}</span>
                  <span>{day.closed ? "Fechado" : `${day.opens} às ${day.closes}`}</span>
                </div>
              ))}
            </div>
          ) : config.openingHours ? (
            <p className="mt-2 text-sm leading-6 text-brown-mid">{config.openingHours}</p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={config.whatsappUrl}><Button><MessageCircle className="h-4 w-4" />WhatsApp</Button></a>
            <a href={config.instagramUrl}><Button variant="secondary"><Instagram className="h-4 w-4" />Instagram</Button></a>
          </div>
        </div>
      </section>
    </div>
  );
}
