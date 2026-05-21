import { Menu, UserRound } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useConfig } from "../context/ConfigContext";
import { roleHome, useAuth } from "../context/AuthContext";
import { Button } from "./ui";
import { useState } from "react";

const publicLinks = [
  { to: "/servicos", label: "Serviços" },
  { to: "/profissionais", label: "Profissionais" },
  { to: "/sobre", label: "Sobre" },
  { to: "/vagas", label: "Vagas" },
];

export function Header() {
  const { config } = useConfig();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const goToArea = () => {
    if (user) navigate(roleHome[user.role]);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-brown-mid/15 bg-bg-base/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <img src={config.logoUrl} alt={config.clinicName} className="h-10 w-10 rounded-lg object-cover" />
          <span className="truncate font-heading text-xl font-bold">{config.clinicName}</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {publicLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className="rounded-lg px-3 py-2 text-sm font-semibold text-brown-mid transition hover:bg-bg-secondary hover:text-brown-dark">
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 sm:flex">
          {user ? (
            <>
              <Button variant="secondary" onClick={goToArea}>
                <UserRound className="h-4 w-4" />
                Minha área
              </Button>
              <Button variant="ghost" onClick={logout}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="secondary">Login</Button>
              </Link>
              <Link to="/cadastro">
                <Button>Cadastro</Button>
              </Link>
            </>
          )}
        </div>
        <button className="rounded-lg p-2 transition hover:bg-bg-secondary lg:hidden" aria-label="Abrir menu" onClick={() => setOpen((value) => !value)}>
          <Menu className="h-6 w-6" />
        </button>
      </div>
      {open ? (
        <div className="border-t border-brown-mid/15 bg-surface px-4 py-3 lg:hidden">
          <div className="grid gap-1">
            {publicLinks.map((link) => (
              <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-semibold text-brown-mid hover:bg-bg-secondary">
                {link.label}
              </NavLink>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              {user ? (
                <>
                  <Button variant="secondary" onClick={goToArea}>Minha área</Button>
                  <Button variant="ghost" onClick={logout}>Sair</Button>
                </>
              ) : (
                <>
                  <Link to="/login"><Button variant="secondary" className="w-full">Login</Button></Link>
                  <Link to="/cadastro"><Button className="w-full">Cadastro</Button></Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
