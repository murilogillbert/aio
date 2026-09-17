import { useEffect, useState } from "react";
import { AlertTriangle, Check, ChevronDown, Copy, Eye, EyeOff, Mail, MessageCircle, CreditCard, Cloud, Send, Instagram, Wallet } from "lucide-react";
import { Badge, Button, Card, Input, Skeleton } from "../../components/ui";
import { PageHeader } from "../../components/Page";
import { useToast } from "../../context/ToastContext";
import { getClinicIntegrations, testIntegration, updateClinicIntegrations, type IntegrationType } from "../../services/api";
import type { IntegrationsDto, IntegrationsPatch } from "../../types";

type ConnectionStatus = "connected" | "disconnected" | "pending";

function StatusBadge({ status }: { status: ConnectionStatus }) {
  const map: Record<ConnectionStatus, { label: string; tone: "success" | "warning" | "neutral" }> = {
    connected: { label: "Conectado", tone: "success" },
    disconnected: { label: "Não conectado", tone: "neutral" },
    pending: { label: "Aguardando teste", tone: "warning" },
  };
  return <Badge tone={map[status].tone}>{map[status].label}</Badge>;
}

function SensitiveField({ label, value, onChange, placeholder, hint, masked }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; hint?: string; masked?: string | null }) {
  const [visible, setVisible] = useState(false);
  const hasSaved = Boolean(masked) && !value;
  return (
    <label className="grid gap-2 text-sm font-medium text-brown-dark">
      <span className="flex items-center gap-2">
        {label}
        {hasSaved ? <span className="text-xs font-normal text-primary">✓ salvo ({masked})</span> : null}
      </span>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          className="min-h-11 w-full rounded-lg border border-brown-mid/25 bg-surface px-3 py-2 pr-10 text-brown-dark shadow-sm transition focus:border-primary"
          placeholder={hasSaved ? masked ?? placeholder : placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="new-password"
        />
        <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-bg-secondary" onClick={() => setVisible((v) => !v)} aria-label={visible ? "Ocultar" : "Mostrar"}>
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint ? <span className="text-xs text-brown-mid">{hint}</span> : null}
    </label>
  );
}

function WebhookField({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <label className="grid gap-2 text-sm font-medium text-brown-dark">
      <span>{label}</span>
      <div className="flex items-center gap-2">
        <input className="min-h-11 flex-1 rounded-lg border border-brown-mid/25 bg-bg-secondary px-3 py-2 font-mono text-xs text-brown-dark" value={url} readOnly />
        <Button type="button" variant="secondary" onClick={copy}>{copied ? <><Check className="h-4 w-4" />Copiado</> : <><Copy className="h-4 w-4" />Copiar</>}</Button>
      </div>
    </label>
  );
}

function InstructionBox({ steps }: { steps: string[] }) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
      <p className="mb-2 font-bold uppercase text-xs tracking-wide text-primary">Como configurar</p>
      <ol className="ml-5 list-decimal space-y-1 text-brown-mid">
        {steps.map((step, index) => <li key={index}>{step}</li>)}
      </ol>
    </div>
  );
}

function Section({
  icon,
  title,
  description,
  status,
  defaultOpen,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: ConnectionStatus;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  return (
    <Card className="overflow-hidden">
      <button type="button" className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setOpen((v) => !v)}>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-bg-secondary p-2 text-primary">{icon}</div>
          <div>
            <h3 className="font-bold">{title}</h3>
            <p className="text-xs text-brown-mid">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <ChevronDown className={`h-5 w-5 transition ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open ? <div className="mt-5 grid gap-4 border-t border-brown-mid/15 pt-5">{children}</div> : null}
    </Card>
  );
}

export function AdminIntegrations() {
  const { showToast } = useToast();
  const [data, setData] = useState<IntegrationsDto | null>(null);
  const [loading, setLoading] = useState(true);

  const [gmail, setGmail] = useState({ clientId: "", clientSecret: "" });
  const [pubsub, setPubsub] = useState({ projectId: "", topicName: "", serviceAccount: "" });
  const [whatsapp, setWhatsapp] = useState({ phoneNumberId: "", wabaId: "", accessToken: "", verifyToken: "", appSecret: "" });
  const [mp, setMp] = useState({ accessTokenProd: "", accessTokenSandbox: "", publicKey: "", sandboxMode: true });
  const [resend, setResend] = useState({ apiKey: "", fromEmail: "", fromName: "", testEmail: "" });
  const [asaas, setAsaas] = useState({ apiKey: "", environment: "sandbox" });
  const [smtp, setSmtp] = useState({ host: "", port: "", username: "", password: "", from: "" });
  const [ig, setIg] = useState({ accountId: "", pageId: "", accessToken: "", appSecret: "", verifyToken: "" });

  const baseUrl = ((import.meta as ImportMeta).env?.VITE_API_URL as string) ?? "http://127.0.0.1:5088/api";

  const load = async () => {
    setLoading(true);
    try {
      const next = await getClinicIntegrations();
      setData(next);
      setGmail({ clientId: next.gmail.clientId ?? "", clientSecret: "" });
      setPubsub({ projectId: next.pubSub.projectId ?? "", topicName: next.pubSub.topicName ?? "", serviceAccount: "" });
      setWhatsapp({ phoneNumberId: next.whatsApp.phoneNumberId ?? "", wabaId: next.whatsApp.wabaId ?? "", accessToken: "", verifyToken: "", appSecret: "" });
      setMp({ accessTokenProd: "", accessTokenSandbox: "", publicKey: next.mercadoPago.publicKey ?? "", sandboxMode: next.mercadoPago.sandboxMode });
      setResend({ apiKey: "", fromEmail: next.resend.fromEmail ?? "", fromName: next.resend.fromName ?? "", testEmail: "" });
      setAsaas({ apiKey: "", environment: next.asaas.environment });
      setSmtp({ host: next.smtp.host ?? "", port: next.smtp.port?.toString() ?? "", username: next.smtp.username ?? "", password: "", from: next.smtp.from ?? "" });
      setIg({ accountId: next.instagram.accountId ?? "", pageId: next.instagram.pageId ?? "", accessToken: "", appSecret: "", verifyToken: "" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async (patch: IntegrationsPatch, label: string) => {
    try {
      const next = await updateClinicIntegrations(patch);
      setData(next);
      showToast("success", `${label}: dados salvos.`);
      await load();
    } catch {
      showToast("error", `${label}: erro ao salvar.`);
    }
  };

  const test = async (type: IntegrationType, payload?: Record<string, unknown>) => {
    try {
      const result = await testIntegration(type, payload);
      showToast(result.ok ? "success" : "error", result.message + (result.detail ? ` — ${result.detail}` : ""));
      if (result.ok) await load();
    } catch {
      showToast("error", "Falha ao testar.");
    }
  };

  if (loading || !data) return <Skeleton className="h-96" />;

  const statusOf = (connected: boolean, hasAny: boolean): ConnectionStatus =>
    connected ? "connected" : hasAny ? "pending" : "disconnected";

  return (
    <>
      <PageHeader title="Integrações" description="Conecte serviços externos: Gmail, WhatsApp, Mercado Pago, Resend, SMTP, Instagram. Tokens ficam armazenados na tabela clinica e voltam mascarados." />
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <strong>Como funciona</strong>
            <p className="mt-1 text-brown-mid">Cada seção tem campos sensíveis (com o olho para revelar), URLs de webhook prontas para copiar e instruções passo-a-passo. O botão <em>Verificar</em> chama um endpoint mock realista — valida formato e presença das credenciais.</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <Section icon={<Mail className="h-5 w-5" />} title="Gmail OAuth" description="Caixa de entrada para conversas vindas por e-mail." status={statusOf(data.gmail.connected, Boolean(data.gmail.clientId))} defaultOpen>
          <InstructionBox steps={[
            "Acesse console.cloud.google.com e crie um projeto",
            "Ative a Gmail API em APIs e Serviços",
            "Crie credenciais OAuth 2.0 (Aplicativo Web)",
            "Adicione a Redirect URI abaixo nas URIs autorizadas",
            "Copie Client ID e Client Secret",
          ]} />
          <div className="grid gap-3 md:grid-cols-2">
            <SensitiveField label="Client ID" value={gmail.clientId} onChange={(v) => setGmail({ ...gmail, clientId: v })} masked={data.gmail.clientId} placeholder="123456789.apps.googleusercontent.com" />
            <SensitiveField label="Client Secret" value={gmail.clientSecret} onChange={(v) => setGmail({ ...gmail, clientSecret: v })} masked={data.gmail.clientSecretMasked} placeholder="GOCSPX-xxxx" />
            <WebhookField label="Redirect URI" url={`${baseUrl}/auth/google/callback`} />
            <WebhookField label="URL do Webhook Pub/Sub" url={`${baseUrl}/webhooks/gmail`} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void save({ gmail: { clientId: gmail.clientId || "", clientSecret: gmail.clientSecret || "" } }, "Gmail")}>Salvar Gmail</Button>
            <Button variant="secondary" onClick={() => void test("gmail")}>Verificar</Button>
          </div>
        </Section>

        <Section icon={<Cloud className="h-5 w-5" />} title="Pub/Sub" description="Push notifications do Gmail para receber mensagens em tempo real." status={statusOf(data.pubSub.connected, Boolean(data.pubSub.projectId))}>
          <InstructionBox steps={[
            "No projeto, ative Pub/Sub e crie um tópico",
            "Crie uma service account com permissão de publisher",
            "Baixe o JSON da chave e cole abaixo",
          ]} />
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Project ID" value={pubsub.projectId} onChange={(event) => setPubsub({ ...pubsub, projectId: event.target.value })} placeholder="meu-projeto-123" />
            <Input label="Nome do tópico" value={pubsub.topicName} onChange={(event) => setPubsub({ ...pubsub, topicName: event.target.value })} placeholder="gmail-notifications" />
          </div>
          <SensitiveField label="Service Account JSON" value={pubsub.serviceAccount} onChange={(v) => setPubsub({ ...pubsub, serviceAccount: v })} masked={data.pubSub.serviceAccountMasked} placeholder='{"type":"service_account",...}' />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void save({ pubSub: { projectId: pubsub.projectId, topicName: pubsub.topicName, serviceAccount: pubsub.serviceAccount || "" } }, "Pub/Sub")}>Salvar</Button>
            <Button variant="secondary" onClick={() => void test("pubsub")}>Verificar</Button>
          </div>
        </Section>

        <Section icon={<MessageCircle className="h-5 w-5" />} title="WhatsApp Business" description="Mensagens transacionais e conversas via WhatsApp Cloud API." status={statusOf(data.whatsApp.connected, Boolean(data.whatsApp.phoneNumberId))}>
          <InstructionBox steps={[
            "Crie um app na Meta for Developers",
            "Adicione o produto WhatsApp e configure um número",
            "Pegue Phone Number ID e WABA ID no painel",
            "Gere um Access Token permanente",
            "Configure um Verify Token e use a URL abaixo no webhook",
          ]} />
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Phone Number ID" value={whatsapp.phoneNumberId} onChange={(event) => setWhatsapp({ ...whatsapp, phoneNumberId: event.target.value })} />
            <Input label="WABA ID" value={whatsapp.wabaId} onChange={(event) => setWhatsapp({ ...whatsapp, wabaId: event.target.value })} />
            <SensitiveField label="Access Token" value={whatsapp.accessToken} onChange={(v) => setWhatsapp({ ...whatsapp, accessToken: v })} masked={data.whatsApp.accessTokenMasked} />
            <SensitiveField label="Verify Token" value={whatsapp.verifyToken} onChange={(v) => setWhatsapp({ ...whatsapp, verifyToken: v })} masked={data.whatsApp.verifyTokenMasked} />
            <SensitiveField label="App Secret" value={whatsapp.appSecret} onChange={(v) => setWhatsapp({ ...whatsapp, appSecret: v })} masked={data.whatsApp.appSecretMasked} />
            <WebhookField label="URL do webhook" url={`${baseUrl}/webhooks/whatsapp`} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void save({ whatsApp: whatsapp }, "WhatsApp")}>Salvar</Button>
            <Button variant="secondary" onClick={() => void test("whatsapp")}>Verificar</Button>
          </div>
        </Section>

        <Section icon={<CreditCard className="h-5 w-5" />} title="Mercado Pago" description="Cobranças, links de pagamento PIX e cartão." status={statusOf(data.mercadoPago.connected, Boolean(data.mercadoPago.publicKey))}>
          <InstructionBox steps={[
            "Acesse mercadopago.com.br/developers",
            "Crie uma aplicação",
            "Copie Access Token e Public Key (sandbox e produção)",
            "Use o modo Sandbox enquanto testa",
          ]} />
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={mp.sandboxMode} onChange={(event) => setMp({ ...mp, sandboxMode: event.target.checked })} />
            Modo sandbox (TEST...)
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <SensitiveField label="Access Token (sandbox)" value={mp.accessTokenSandbox} onChange={(v) => setMp({ ...mp, accessTokenSandbox: v })} masked={data.mercadoPago.accessTokenSandboxMasked} placeholder="TEST-..." />
            <SensitiveField label="Access Token (produção)" value={mp.accessTokenProd} onChange={(v) => setMp({ ...mp, accessTokenProd: v })} masked={data.mercadoPago.accessTokenProdMasked} placeholder="APP_USR-..." />
            <Input label="Public Key" value={mp.publicKey} onChange={(event) => setMp({ ...mp, publicKey: event.target.value })} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void save({ mercadoPago: mp }, "Mercado Pago")}>Salvar</Button>
            <Button variant="secondary" onClick={() => void test("mercadopago")}>Verificar</Button>
          </div>
        </Section>

        <Section icon={<Send className="h-5 w-5" />} title="Resend" description="Envio transacional de e-mails (lembretes, confirmações, recuperação de senha)." status={statusOf(data.resend.connected, Boolean(data.resend.fromEmail))}>
          <InstructionBox steps={[
            "Crie uma conta em resend.com",
            "Verifique seu domínio",
            "Crie uma API Key (começa com re_)",
            "Configure um e-mail remetente do domínio verificado",
          ]} />
          <div className="grid gap-3 md:grid-cols-2">
            <SensitiveField label="API Key" value={resend.apiKey} onChange={(v) => setResend({ ...resend, apiKey: v })} masked={data.resend.apiKeyMasked} placeholder="re_xxxxxxxx" />
            <Input label="Remetente (e-mail)" value={resend.fromEmail} onChange={(event) => setResend({ ...resend, fromEmail: event.target.value })} placeholder="contato@suaclinica.com.br" />
            <Input label="Nome do remetente" value={resend.fromName} onChange={(event) => setResend({ ...resend, fromName: event.target.value })} placeholder="Clínica Aurora" />
            <Input label="E-mail para teste" value={resend.testEmail} onChange={(event) => setResend({ ...resend, testEmail: event.target.value })} placeholder="voce@gmail.com" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void save({ resend: { apiKey: resend.apiKey || "", fromEmail: resend.fromEmail, fromName: resend.fromName } }, "Resend")}>Salvar</Button>
            <Button variant="secondary" onClick={() => void test("resend", { testEmail: resend.testEmail })}>Verificar + e-mail de teste</Button>
          </div>
        </Section>

        <Section icon={<Wallet className="h-5 w-5" />} title="Asaas" description="Pagamento online do site: Pix, cartão de crédito e cartão salvo do paciente." status={statusOf(data.asaas.connected, Boolean(data.asaas.apiKeyMasked))}>
          <InstructionBox steps={[
            "Crie uma conta em sandbox.asaas.com para testar sem transações reais",
            "No painel Asaas, gere uma API Key (Integrações > API)",
            "Cole a chave abaixo e escolha o ambiente (sandbox ou produção)",
            "Cadastre a URL de webhook abaixo no Asaas com um token de autenticação forte",
            "Tokenização de cartão funciona direto em sandbox; em produção precisa ser liberada pelo gerente de conta Asaas",
          ]} />
          <div className="grid gap-3 md:grid-cols-2">
            <SensitiveField label="API Key" value={asaas.apiKey} onChange={(v) => setAsaas({ ...asaas, apiKey: v })} masked={data.asaas.apiKeyMasked} placeholder="$aact_..." />
            <label className="grid gap-2 text-sm font-medium text-brown-dark">
              <span>Ambiente</span>
              <select
                className="min-h-11 rounded-lg border border-brown-mid/25 bg-surface px-3 py-2 text-brown-dark shadow-sm"
                value={asaas.environment}
                onChange={(event) => setAsaas({ ...asaas, environment: event.target.value })}
              >
                <option value="sandbox">Sandbox (testes)</option>
                <option value="production">Produção</option>
              </select>
            </label>
            <WebhookField label="URL do webhook" url={`${baseUrl}/webhooks/asaas`} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void save({ asaas: { apiKey: asaas.apiKey || "", environment: asaas.environment } }, "Asaas")}>Salvar</Button>
            <Button variant="secondary" onClick={() => void test("asaas")}>Verificar</Button>
          </div>
        </Section>

        <Card>
          <h3 className="font-bold">Cobrança no agendamento</h3>
          <p className="text-sm text-brown-mid">Quando ligado, o site exige pagamento (Pix ou cartão via Asaas) para concluir um novo agendamento público. Quando desligado (padrão), o pagamento continua opcional e pode ser resolvido pela recepção.</p>
          <label className="mt-3 flex items-center gap-3 text-sm">
            <input type="checkbox" checked={data.paymentRequiredAtBooking} onChange={(event) => void save({ paymentRequiredAtBooking: event.target.checked }, "Cobrança")} />
            Exigir pagamento no momento do agendamento
          </label>
        </Card>

        <Section icon={<Send className="h-5 w-5 rotate-12" />} title="SMTP (fallback)" description="Servidor SMTP genérico caso o Resend não esteja disponível." status={statusOf(data.smtp.connected, Boolean(data.smtp.host))}>
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Host" value={smtp.host} onChange={(event) => setSmtp({ ...smtp, host: event.target.value })} placeholder="smtp.gmail.com" />
            <Input label="Porta" type="number" value={smtp.port} onChange={(event) => setSmtp({ ...smtp, port: event.target.value })} placeholder="587" />
            <Input label="Usuário" value={smtp.username} onChange={(event) => setSmtp({ ...smtp, username: event.target.value })} />
            <SensitiveField label="Senha" value={smtp.password} onChange={(v) => setSmtp({ ...smtp, password: v })} masked={data.smtp.passwordMasked} />
            <Input label="Remetente" value={smtp.from} onChange={(event) => setSmtp({ ...smtp, from: event.target.value })} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void save({ smtp: { host: smtp.host, port: Number(smtp.port) || 0, username: smtp.username, password: smtp.password || "", from: smtp.from } }, "SMTP")}>Salvar</Button>
            <Button variant="secondary" onClick={() => void test("smtp")}>Verificar</Button>
          </div>
        </Section>

        <Section icon={<Instagram className="h-5 w-5" />} title="Instagram Direct" description="Conversas vindas do DM do Instagram via Meta Graph API." status={statusOf(data.instagram.connected, Boolean(data.instagram.accountId))}>
          <InstructionBox steps={[
            "No Meta for Developers, adicione o produto Messenger > Instagram",
            "Vincule sua conta profissional do Instagram",
            "Pegue Account ID e Page ID",
            "Gere o Access Token e configure o verify token no webhook",
          ]} />
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Account ID" value={ig.accountId} onChange={(event) => setIg({ ...ig, accountId: event.target.value })} />
            <Input label="Page ID" value={ig.pageId} onChange={(event) => setIg({ ...ig, pageId: event.target.value })} />
            <SensitiveField label="Access Token" value={ig.accessToken} onChange={(v) => setIg({ ...ig, accessToken: v })} masked={data.instagram.accessTokenMasked} />
            <SensitiveField label="App Secret" value={ig.appSecret} onChange={(v) => setIg({ ...ig, appSecret: v })} masked={data.instagram.appSecretMasked} />
            <SensitiveField label="Verify Token" value={ig.verifyToken} onChange={(v) => setIg({ ...ig, verifyToken: v })} masked={data.instagram.verifyTokenMasked} />
            <WebhookField label="URL do webhook" url={`${baseUrl}/webhooks/instagram`} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void save({ instagram: ig }, "Instagram")}>Salvar</Button>
            <Button variant="secondary" onClick={() => void test("instagram")}>Verificar</Button>
          </div>
        </Section>

        <Card>
          <h3 className="font-bold">Lembretes automáticos</h3>
          <p className="text-sm text-brown-mid">Quando ligado, o job de background dispara confirmação/lembrete pelos canais configurados.</p>
          <label className="mt-3 flex items-center gap-3 text-sm">
            <input type="checkbox" checked={data.remindersEnabled} onChange={(event) => void save({ remindersEnabled: event.target.checked }, "Lembretes")} />
            Ativar lembretes automáticos (24h antes / confirmação imediata)
          </label>
        </Card>
      </div>
    </>
  );
}
