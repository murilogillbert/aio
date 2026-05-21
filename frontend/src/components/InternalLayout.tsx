import type { ReactNode } from "react";
import { Menu, LogOut } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useConfig } from "../context/ConfigContext";
import { Button } from "./ui";

export type SidebarLink = {
  to: string;
  label: string;
  icon?: ReactNode;
};

export function InternalLayout({ links, title }: { links: SidebarLink[]; title: string }) {
  const { config } = useConfig();
  const { logout, user } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const SidebarContent = (
    <>
      <div className="flex items-center gap-3 px-3 py-2">
        <img src={config.logoUrl} alt={config.clinicName} className="h-10 w-10 rounded-lg object-cover" />
        <div className="min-w-0">
          <p className="truncate font-heading text-lg font-bold">{config.clinicName}</p>
          <p className="truncate text-xs text-brown-mid">{title}</p>
        </div>
      </div>
      <nav className="mt-4 grid gap-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to.split("/").length <= 2}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${
                isActive ? "bg-primary text-white" : "text-brown-mid hover:bg-bg-secondary hover:text-brown-dark"
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-6">
        <p className="mb-3 rounded-lg bg-bg-secondary px-3 py-2 text-xs text-brown-mid">{user?.fullName}</p>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-bg-base text-brown-dark lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-brown-mid/15 bg-surface p-4 lg:flex">{SidebarContent}</aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-brown-mid/15 bg-bg-base/95 px-4 py-3 backdrop-blur lg:hidden">
          <button className="rounded-lg p-2 hover:bg-bg-secondary" aria-label="Abrir menu" onClick={() => setOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <strong>{title}</strong>
          <div className="h-10 w-10" />
        </header>
        {open ? (
          <div className="fixed inset-0 z-50 bg-brown-dark/40 lg:hidden" onClick={() => setOpen(false)}>
            <aside className="flex h-full w-[min(86vw,320px)] flex-col bg-surface p-4" onClick={(event) => event.stopPropagation()}>
              {SidebarContent}
            </aside>
          </div>
        ) : null}
        <main className="route-fade mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
