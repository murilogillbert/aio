import { Link } from "react-router-dom";
import { Instagram, MessageCircle } from "lucide-react";
import { useConfig } from "../context/ConfigContext";

export function Footer() {
  const { config } = useConfig();
  return (
    <footer className="border-t border-brown-mid/15 bg-surface">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <img src={config.logoUrl} alt={config.clinicName} className="h-10 w-10 rounded-lg object-cover" />
            <strong className="font-heading text-xl">{config.clinicName}</strong>
          </div>
          <p className="mt-3 text-sm leading-6 text-brown-mid">{config.address}</p>
          <p className="text-sm leading-6 text-brown-mid">{config.openingHours}</p>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide">Mapa do site</h2>
          <div className="mt-3 grid gap-2 text-sm text-brown-mid">
            {["Serviços", "Profissionais", "Sobre", "Vagas", "Login"].map((label) => (
              <Link key={label} to={`/${label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}>
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide">Contato</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={config.whatsappUrl} className="inline-flex items-center gap-2 rounded-lg border border-brown-mid/20 px-3 py-2 text-sm font-semibold">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <a href={config.instagramUrl} className="inline-flex items-center gap-2 rounded-lg border border-brown-mid/20 px-3 py-2 text-sm font-semibold">
              <Instagram className="h-4 w-4" />
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
