import { Link } from "react-router-dom";
import { Button, Card } from "../../components/ui";
import { PageHeader } from "../../components/Page";
import { roleHome, useAuth } from "../../context/AuthContext";

export function Forbidden() {
  const { user } = useAuth();
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <Card>
        <PageHeader title="Acesso restrito" description="Sua conta não tem permissão para acessar esta área." actions={user ? <Link to={roleHome[user.role]}><Button>Voltar para minha área</Button></Link> : <Link to="/login"><Button>Entrar</Button></Link>} />
      </Card>
    </main>
  );
}

export function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <Card>
        <PageHeader title="Página não encontrada" description="A rota solicitada não existe neste protótipo." actions={<Link to="/"><Button>Ir para início</Button></Link>} />
      </Card>
    </main>
  );
}
