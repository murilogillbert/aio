import { Link } from "react-router-dom";
import { CalendarPlus, MessageCircle, UserPlus } from "lucide-react";
import { Avatar, Badge, Button, Card, EmptyState, Input, Textarea } from "../../components/ui";
import { PageHeader, StatCard, StatGrid } from "../../components/Page";
import { useAuth } from "../../context/AuthContext";
import { appointmentTitle, dateLabel } from "../../utils";
import { useProfessionals, useServices } from "../../hooks/useCatalog";

export function PatientDashboard() {
  const { user } = useAuth();
  const upcoming = user?.appointments?.filter((item) => new Date(`${item.date}T12:00:00`) >= new Date("2026-05-20T12:00:00")) ?? [];
  return (
    <>
      <PageHeader title="Minha conta" description="Próximas consultas, mensagens e atalhos." />
      <StatGrid>
        <StatCard label="Próximas consultas" value={String(upcoming.length)} hint="Titular e dependentes" />
        <StatCard label="Dependentes" value={String(user?.dependents?.length ?? 0)} />
        <StatCard label="Mensagens" value={String(user?.conversations?.reduce((sum, item) => sum + item.unread, 0) ?? 0)} hint="Não lidas" />
        <StatCard label="Status" value="Ativo" hint="Cadastro validado" />
      </StatGrid>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Link to="/agendar"><Button className="w-full"><CalendarPlus className="h-4 w-4" />Agendar</Button></Link>
        <Link to="/minha-conta/dependentes"><Button variant="secondary" className="w-full"><UserPlus className="h-4 w-4" />Dependentes</Button></Link>
        <Link to="/minha-conta/mensagens"><Button variant="secondary" className="w-full"><MessageCircle className="h-4 w-4" />Mensagens</Button></Link>
      </div>
    </>
  );
}

export function PatientAppointments() {
  const { user } = useAuth();
  const appointments = user?.appointments ?? [];
  const { services } = useServices();
  const { professionals } = useProfessionals();

  return (
    <>
      <PageHeader title="Agendamentos" description="Histórico, futuros e ações disponíveis conforme antecedência." actions={<Link to="/agendar"><Button>Novo agendamento</Button></Link>} />
      <div className="grid gap-3">
        {appointments.map((appointment) => (
          <Card key={appointment.id}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-bold">{appointmentTitle(appointment, services, professionals)}</h2>
                <p className="text-sm text-brown-mid">{dateLabel(appointment.date)} às {appointment.time}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone={appointment.status === "cancelado" ? "danger" : "success"}>{appointment.status}</Badge>
                <Button variant="secondary">Remarcar</Button>
                <Button variant="ghost">Cancelar</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

export function PatientDependents() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="Dependentes" description="Gerencie pessoas vinculadas para escolher no agendamento." actions={<Button>Novo dependente</Button>} />
      <div className="grid gap-3 md:grid-cols-2">
        {user?.dependents?.map((dependent) => (
          <Card key={dependent.id}>
            <h2 className="font-bold">{dependent.fullName}</h2>
            <p className="text-sm text-brown-mid">{dependent.relationship} · Nascimento {dateLabel(dependent.birthDate)}</p>
            <div className="mt-4 flex gap-2"><Button variant="secondary">Editar</Button><Button variant="ghost">Remover</Button></div>
          </Card>
        )) ?? <EmptyState title="Nenhum dependente cadastrado." />}
      </div>
    </>
  );
}

export function PatientMessages() {
  const { user } = useAuth();
  const conversation = user?.conversations?.[0];
  return (
    <>
      <PageHeader title="Mensagens" description="No mobile, lista e conversa podem ser usadas em telas separadas." />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="grid gap-2">
          {user?.conversations?.map((item) => (
            <Card key={item.id}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-bold">{item.title}</h2>
                <Badge>{item.channel}</Badge>
              </div>
              <p className="mt-1 text-xs text-brown-mid">{item.unread} não lidas</p>
            </Card>
          ))}
        </div>
        <Card>
          <h2 className="font-bold">{conversation?.title ?? "Conversa"}</h2>
          <div className="mt-4 grid gap-3">
            {conversation?.messages.map((message) => (
              <div key={message.id} className="rounded-lg bg-bg-secondary p-3 text-sm">
                <strong>{message.author}</strong>
                <p className="mt-1 text-brown-mid">{message.text}</p>
              </div>
            ))}
          </div>
          <Textarea label="Responder" className="mt-4" />
          <Button className="mt-3">Enviar</Button>
        </Card>
      </div>
    </>
  );
}

export function PatientProfile() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title="Perfil" description="Edite dados de contato e senha." />
      <Card className="max-w-2xl">
        <div className="mb-4 flex items-center gap-3">
          <Avatar name={user?.fullName ?? "Paciente"} />
          <div><h2 className="font-bold">{user?.fullName}</h2><p className="text-sm text-brown-mid">{user?.email}</p></div>
        </div>
        <div className="grid gap-4">
          <Input label="Nome" defaultValue={user?.fullName} />
          <Input label="E-mail" defaultValue={user?.email} />
          <Input label="Celular" defaultValue={user?.phone} />
          <Input label="Nova senha" type="password" />
          <Button>Salvar alterações</Button>
        </div>
      </Card>
    </>
  );
}
