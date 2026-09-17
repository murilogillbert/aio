import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Card, Input } from "../../components/ui";
import { PageHeader } from "../../components/Page";
import { roleHome, useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { forgotPassword, resetPassword } from "../../services/api";

const phoneMask = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirect = new URLSearchParams(location.search).get("redirect");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      showToast("success", "Login realizado.");
      navigate(redirect || roleHome[user.role]);
    } catch {
      showToast("error", "Não foi possível entrar com esses dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="route-fade mx-auto max-w-md px-4 py-10">
      <PageHeader title="Login" description="Entre com e-mail e senha para acessar sua área." />
      <Card>
        <form className="grid gap-4" onSubmit={submit}>
          <Input label="E-mail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Input label="Senha" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          <Button loading={loading}>Entrar</Button>
        </form>
        <p className="mt-4 text-sm text-brown-mid">
          <Link to="/esqueci-senha" className="font-bold text-primary">Esqueci minha senha</Link>
        </p>
        <p className="mt-2 text-sm text-brown-mid">
          Ainda não tem conta? <Link to="/cadastro" className="font-bold text-primary">Cadastre-se</Link>
        </p>
      </Card>
    </main>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      showToast("error", "Não foi possível processar o pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="route-fade mx-auto max-w-md px-4 py-10">
      <PageHeader title="Esqueci minha senha" description="Informe seu email para receber um link de redefinição." />
      <Card>
        {sent ? (
          <p className="text-sm text-brown-mid">Se este email estiver cadastrado, você receberá um link para redefinir a senha em instantes.</p>
        ) : (
          <form className="grid gap-4" onSubmit={submit}>
            <Input label="E-mail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <Button loading={loading}>Enviar link</Button>
          </form>
        )}
        <p className="mt-4 text-sm text-brown-mid">
          <Link to="/login" className="font-bold text-primary">Voltar ao login</Link>
        </p>
      </Card>
    </main>
  );
}

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [novaSenha, setNovaSenha] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (novaSenha.length < 6) {
      showToast("error", "A senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirm) {
      showToast("error", "As senhas precisam ser iguais.");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, novaSenha);
      showToast("success", "Senha redefinida. Faça login com a nova senha.");
      navigate("/login");
    } catch {
      showToast("error", "Link inválido ou expirado. Solicite um novo.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="route-fade mx-auto max-w-md px-4 py-10">
        <PageHeader title="Redefinir senha" description="Link inválido." />
        <Card>
          <p className="text-sm text-brown-mid">
            Este link não é válido. Solicite um novo em <Link to="/esqueci-senha" className="font-bold text-primary">Esqueci minha senha</Link>.
          </p>
        </Card>
      </main>
    );
  }

  return (
    <main className="route-fade mx-auto max-w-md px-4 py-10">
      <PageHeader title="Redefinir senha" description="Escolha uma nova senha de acesso." />
      <Card>
        <form className="grid gap-4" onSubmit={submit}>
          <Input label="Nova senha" type="password" value={novaSenha} onChange={(event) => setNovaSenha(event.target.value)} required />
          <Input label="Confirmar nova senha" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required />
          <Button loading={loading}>Salvar nova senha</Button>
        </form>
      </Card>
    </main>
  );
}

export function Cadastro() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const errors = useMemo(() => {
    const next: string[] = [];
    if (form.password && !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.password)) next.push("Senha mínima de 8 caracteres, com letra e número.");
    if (form.confirm && form.password !== form.confirm) next.push("As senhas precisam ser iguais.");
    if (form.phone && form.phone.replace(/\D/g, "").length !== 11) next.push("Celular deve ter 11 dígitos.");
    return next;
  }, [form]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (errors.length) {
      showToast("error", errors[0]);
      return;
    }
    setLoading(true);
    const user = await register({ fullName: form.fullName, email: form.email, phone: form.phone, password: form.password });
    showToast("success", "Cadastro criado.");
    setLoading(false);
    navigate(roleHome[user.role]);
  };

  return (
    <main className="route-fade mx-auto max-w-xl px-4 py-10">
      <PageHeader title="Cadastro" description="Crie sua conta para agendar e acompanhar seus atendimentos." />
      <Card>
        <form className="grid gap-4" onSubmit={submit}>
          <Input label="Nome completo" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required />
          <Input label="E-mail" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          <Input label="Celular" value={form.phone} onChange={(event) => setForm({ ...form, phone: phoneMask(event.target.value) })} placeholder="(99) 99999-9999" required />
          <Input label="Senha" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          <Input label="Confirmar senha" type="password" value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} required />
          {errors.map((error) => <p key={error} className="text-sm text-red-700">{error}</p>)}
          <Button loading={loading}>Criar conta</Button>
        </form>
      </Card>
    </main>
  );
}
