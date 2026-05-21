import { useConfig } from "../../context/ConfigContext";
import { Card } from "../../components/ui";
import { PageHeader } from "../../components/Page";

export function Sobre() {
  const { config } = useConfig();
  const { about } = config;

  return (
    <main className="route-fade mx-auto max-w-7xl px-4 py-8">
      <PageHeader title="Sobre" description={about.text} />
      <section className="grid gap-4 md:grid-cols-3">
        <Card><h2 className="font-bold">Missão</h2><p className="mt-2 text-sm leading-6 text-brown-mid">{about.mvv.mission}</p></Card>
        <Card><h2 className="font-bold">Visão</h2><p className="mt-2 text-sm leading-6 text-brown-mid">{about.mvv.vision}</p></Card>
        <Card><h2 className="font-bold">Valores</h2><p className="mt-2 text-sm leading-6 text-brown-mid">{about.mvv.values}</p></Card>
      </section>
      <section className="mt-8">
        <h2 className="mb-4 font-heading text-2xl font-bold">Linha do tempo</h2>
        <div className="grid gap-3">
          {about.milestones.map((item) => (
            <Card key={item.date}>
              <p className="text-sm font-bold text-primary">{item.date}</p>
              <h3 className="mt-1 font-bold">{item.title}</h3>
              <p className="mt-1 text-sm text-brown-mid">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>
      <section className="mt-8">
        <h2 className="mb-4 font-heading text-2xl font-bold">Instalações</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {about.gallery.map((src) => <img key={src} src={src} alt="" className="h-56 w-full rounded-xl object-cover" />)}
        </div>
      </section>
    </main>
  );
}
