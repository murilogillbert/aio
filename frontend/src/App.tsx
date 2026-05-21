import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  ClipboardList,
  Cog,
  HomeIcon,
  LayoutDashboard,
  MessageCircle,
  Palette,
  ReceiptText,
  Settings,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { InternalLayout, type SidebarLink } from "./components/InternalLayout";
import { useAuth } from "./context/AuthContext";
import type { Role } from "./types";
import { Home } from "./pages/public/Home";
import { ServicoDetail, ServicosList } from "./pages/public/Servicos";
import { ProfissionalDetail, ProfissionaisList } from "./pages/public/Profissionais";
import { Sobre } from "./pages/public/Sobre";
import { Vagas } from "./pages/public/Vagas";
import { Login, Cadastro } from "./pages/public/AuthPages";
import { Agendamento } from "./pages/public/Agendamento";
import { Forbidden, NotFound } from "./pages/public/StatusPages";
import {
  PatientAppointments,
  PatientDashboard,
  PatientDependents,
  PatientMessages,
  PatientProfile,
} from "./pages/patient/PatientPages";
import {
  ProfessionalAgenda,
  ProfessionalDashboard,
  ProfessionalMessages,
  ProfessionalMetrics,
} from "./pages/professional/ProfessionalPages";
import {
  ReceptionAgenda,
  ReceptionDashboard,
  ReceptionMessages,
  ReceptionPatients,
  ReceptionProfessionals,
  ReceptionServices,
} from "./pages/reception/ReceptionPages";
import {
  AdminAboutConfig,
  AdminBannersConfig,
  AdminDashboard,
  AdminDesignConfig,
  AdminMetrics,
  AdminProfessionals,
  AdminRecruitment,
  AdminServices,
  AdminSimpleConfig,
} from "./pages/admin/AdminPages";
import { AdminIntegrations } from "./pages/admin/AdminIntegrations";
import {
  AdminDashboardPage,
  AdminFaturamentoPage,
  AdminMetricasProfissionaisPage,
  AdminMetricasServicosPage,
  AdminMovimentoPage,
} from "./pages/admin/AdminMetricsPages";

function PublicLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

function RequireRole({ role }: { role: Role }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  if (user?.role !== role) return <Navigate to="/403" replace />;
  return <Outlet />;
}

const patientLinks: SidebarLink[] = [
  { to: "/minha-conta", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/minha-conta/agendamentos", label: "Agendamentos", icon: <CalendarDays className="h-4 w-4" /> },
  { to: "/minha-conta/dependentes", label: "Dependentes", icon: <UsersRound className="h-4 w-4" /> },
  { to: "/minha-conta/mensagens", label: "Mensagens", icon: <MessageCircle className="h-4 w-4" /> },
  { to: "/minha-conta/perfil", label: "Perfil", icon: <UserRound className="h-4 w-4" /> },
];

const professionalLinks: SidebarLink[] = [
  { to: "/profissional", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/profissional/agenda", label: "Agenda", icon: <CalendarDays className="h-4 w-4" /> },
  { to: "/profissional/metricas", label: "Métricas", icon: <BarChart3 className="h-4 w-4" /> },
  { to: "/profissional/mensagens", label: "Mensagens", icon: <MessageCircle className="h-4 w-4" /> },
];

const receptionLinks: SidebarLink[] = [
  { to: "/recepcao", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/recepcao/agenda", label: "Agenda", icon: <CalendarDays className="h-4 w-4" /> },
  { to: "/recepcao/pacientes", label: "Pacientes", icon: <UserRound className="h-4 w-4" /> },
  { to: "/recepcao/mensagens", label: "Mensagens", icon: <MessageCircle className="h-4 w-4" /> },
  { to: "/recepcao/servicos", label: "Serviços", icon: <Stethoscope className="h-4 w-4" /> },
  { to: "/recepcao/profissionais", label: "Profissionais", icon: <UsersRound className="h-4 w-4" /> },
];

const adminLinks: SidebarLink[] = [
  { to: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/admin/profissionais", label: "Profissionais", icon: <UsersRound className="h-4 w-4" /> },
  { to: "/admin/servicos", label: "Serviços", icon: <Stethoscope className="h-4 w-4" /> },
  { to: "/admin/recrutamento", label: "Recrutamento", icon: <BriefcaseBusiness className="h-4 w-4" /> },
  { to: "/admin/configuracoes/design", label: "Design", icon: <Palette className="h-4 w-4" /> },
  { to: "/admin/configuracoes/sobre", label: "Sobre", icon: <HomeIcon className="h-4 w-4" /> },
  { to: "/admin/configuracoes/banners", label: "Banners", icon: <ClipboardList className="h-4 w-4" /> },
  { to: "/admin/configuracoes/notificacoes", label: "Notificações", icon: <Settings className="h-4 w-4" /> },
  { to: "/admin/configuracoes/templates", label: "Templates", icon: <ReceiptText className="h-4 w-4" /> },
  { to: "/admin/configuracoes/integracoes", label: "Integrações", icon: <Cog className="h-4 w-4" /> },
  { to: "/admin/metricas", label: "Métricas", icon: <BarChart3 className="h-4 w-4" /> },
];

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/servicos" element={<ServicosList />} />
        <Route path="/servicos/:id" element={<ServicoDetail />} />
        <Route path="/profissionais" element={<ProfissionaisList />} />
        <Route path="/profissionais/:id" element={<ProfissionalDetail />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/vagas" element={<Vagas />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/agendar" element={<Agendamento />} />
        <Route path="/403" element={<Forbidden />} />
      </Route>

      <Route element={<RequireRole role="paciente" />}>
        <Route element={<InternalLayout links={patientLinks} title="Área do paciente" />}>
          <Route path="/minha-conta" element={<PatientDashboard />} />
          <Route path="/minha-conta/agendamentos" element={<PatientAppointments />} />
          <Route path="/minha-conta/dependentes" element={<PatientDependents />} />
          <Route path="/minha-conta/mensagens" element={<PatientMessages />} />
          <Route path="/minha-conta/perfil" element={<PatientProfile />} />
        </Route>
      </Route>

      <Route element={<RequireRole role="profissional" />}>
        <Route element={<InternalLayout links={professionalLinks} title="Portal profissional" />}>
          <Route path="/profissional" element={<ProfessionalDashboard />} />
          <Route path="/profissional/agenda" element={<ProfessionalAgenda />} />
          <Route path="/profissional/metricas" element={<ProfessionalMetrics />} />
          <Route path="/profissional/mensagens" element={<ProfessionalMessages />} />
        </Route>
      </Route>

      <Route element={<RequireRole role="recepcao" />}>
        <Route element={<InternalLayout links={receptionLinks} title="Recepção" />}>
          <Route path="/recepcao" element={<ReceptionDashboard />} />
          <Route path="/recepcao/agenda" element={<ReceptionAgenda />} />
          <Route path="/recepcao/pacientes" element={<ReceptionPatients />} />
          <Route path="/recepcao/mensagens" element={<ReceptionMessages />} />
          <Route path="/recepcao/servicos" element={<ReceptionServices />} />
          <Route path="/recepcao/profissionais" element={<ReceptionProfessionals />} />
        </Route>
      </Route>

      <Route element={<RequireRole role="admin" />}>
        <Route element={<InternalLayout links={adminLinks} title="Administração" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/profissionais" element={<AdminProfessionals />} />
          <Route path="/admin/servicos" element={<AdminServices />} />
          <Route path="/admin/recrutamento" element={<AdminRecruitment />} />
          <Route path="/admin/configuracoes/notificacoes" element={<AdminSimpleConfig resource="notificacoes" title="Notificações" description="Regras de disparo automático, antecedência, canal e template associado." />} />
          <Route path="/admin/configuracoes/templates" element={<AdminSimpleConfig resource="templates" title="Templates" description="Editor por ocasião e canal com variáveis dinâmicas." />} />
          <Route path="/admin/configuracoes/integracoes" element={<AdminIntegrations />} />
          <Route path="/admin/configuracoes/planos" element={<AdminSimpleConfig resource="planos" title="Planos" description="Planos, convênios, pacotes e regras de cobertura." />} />
          <Route path="/admin/configuracoes/categorias" element={<AdminSimpleConfig resource="categorias" title="Categorias" description="Categorias usadas em profissionais, serviços, salas e equipamentos." />} />
          <Route path="/admin/configuracoes/salas" element={<AdminSimpleConfig resource="salas" title="Salas" description="Tipos compatíveis, equipamentos, capacidade e observações." />} />
          <Route path="/admin/configuracoes/equipamentos" element={<AdminSimpleConfig resource="equipamentos" title="Equipamentos" description="Categoria, salas, quantidade e valor unitário." />} />
          <Route path="/admin/configuracoes/chat-interno" element={<AdminSimpleConfig resource="chat-interno" title="Chat interno" description="Canais e participantes por role ou usuário." />} />
          <Route path="/admin/configuracoes/sobre" element={<AdminAboutConfig />} />
          <Route path="/admin/configuracoes/banners" element={<AdminBannersConfig />} />
          <Route path="/admin/configuracoes/design" element={<AdminDesignConfig />} />
          <Route path="/admin/metricas" element={<AdminDashboardPage />} />
          <Route path="/admin/metricas/custos" element={<AdminMetrics variant="custos" />} />
          <Route path="/admin/metricas/faturamento" element={<AdminFaturamentoPage />} />
          <Route path="/admin/metricas/salas" element={<AdminMetrics variant="salas" />} />
          <Route path="/admin/metricas/equipamentos" element={<AdminMetrics variant="equipamentos" />} />
          <Route path="/admin/metricas/servicos" element={<AdminMetricasServicosPage />} />
          <Route path="/admin/metricas/profissionais" element={<AdminMetricasProfissionaisPage />} />
          <Route path="/admin/metricas/movimento" element={<AdminMovimentoPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
