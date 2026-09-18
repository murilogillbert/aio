import { prisma } from "../db.js";
import { sendEmail } from "../lib/email.js";

export const getOrCreateClinic = async () => {
  const existing = await prisma.clinic.findFirst();
  if (existing) return existing;
  return prisma.clinic.create({ data: { mpSandboxMode: true, remindersEnabled: true } });
};

const mask = (value: string | null | undefined): string | null => {
  if (!value) return null;
  if (value.length <= 4) return "••••";
  return `••••${value.slice(-4)}`;
};

export const isMasked = (value: string | undefined | null): boolean =>
  Boolean(value && (value.startsWith("••") || value.startsWith("**")));

export const buildIntegrationsDto = (clinic: Awaited<ReturnType<typeof getOrCreateClinic>>) => ({
  gmail: {
    clientId: clinic.gmailClientId ?? null,
    clientSecretMasked: mask(clinic.gmailClientSecret),
    accessTokenMasked: mask(clinic.gmailAccessToken),
    tokenExpiresAt: clinic.gmailTokenExpiresAt ? clinic.gmailTokenExpiresAt.toISOString() : null,
    connected: clinic.gmailConnected,
  },
  pubSub: {
    projectId: clinic.pubsubProjectId ?? null,
    topicName: clinic.pubsubTopicName ?? null,
    serviceAccountMasked: mask(clinic.pubsubServiceAccount),
    connected: clinic.pubsubConnected,
  },
  whatsApp: {
    phoneNumberId: clinic.waPhoneNumberId ?? null,
    wabaId: clinic.waWabaId ?? null,
    accessTokenMasked: mask(clinic.waAccessToken),
    verifyTokenMasked: mask(clinic.waVerifyToken),
    appSecretMasked: mask(clinic.waAppSecret),
    connected: clinic.waConnected,
  },
  mercadoPago: {
    accessTokenProdMasked: mask(clinic.mpAccessTokenProd),
    accessTokenSandboxMasked: mask(clinic.mpAccessTokenSandbox),
    publicKey: clinic.mpPublicKey ?? null,
    sandboxMode: clinic.mpSandboxMode,
    connected: clinic.mpConnected,
  },
  resend: {
    apiKeyMasked: mask(clinic.resendApiKey),
    fromEmail: clinic.resendFromEmail ?? null,
    fromName: clinic.resendFromName ?? null,
    connected: clinic.resendConnected,
  },
  asaas: {
    apiKeyMasked: mask(clinic.asaasApiKey),
    environment: clinic.asaasEnvironment,
    connected: clinic.asaasConnected,
  },
  smtp: {
    host: clinic.smtpHost ?? null,
    port: clinic.smtpPort ?? null,
    username: clinic.smtpUsername ?? null,
    passwordMasked: mask(clinic.smtpPassword),
    from: clinic.smtpFrom ?? null,
    connected: clinic.smtpConnected,
  },
  instagram: {
    accountId: clinic.igAccountId ?? null,
    pageId: clinic.igPageId ?? null,
    accessTokenMasked: mask(clinic.igAccessToken),
    appSecretMasked: mask(clinic.igAppSecret),
    verifyTokenMasked: mask(clinic.igVerifyToken),
    connected: clinic.igConnected,
  },
  remindersEnabled: clinic.remindersEnabled,
  paymentRequiredAtBooking: clinic.paymentRequiredAtBooking,
});

type IntegrationsPatch = Partial<{
  gmail: Partial<{ clientId: string; clientSecret: string }>;
  pubSub: Partial<{ projectId: string; topicName: string; serviceAccount: string }>;
  whatsApp: Partial<{ phoneNumberId: string; wabaId: string; accessToken: string; verifyToken: string; appSecret: string }>;
  mercadoPago: Partial<{ accessTokenProd: string; accessTokenSandbox: string; publicKey: string; sandboxMode: boolean }>;
  resend: Partial<{ apiKey: string; fromEmail: string; fromName: string }>;
  asaas: Partial<{ apiKey: string; environment: string }>;
  smtp: Partial<{ host: string; port: number; username: string; password: string; from: string }>;
  instagram: Partial<{ accountId: string; pageId: string; accessToken: string; appSecret: string; verifyToken: string }>;
  remindersEnabled: boolean;
  paymentRequiredAtBooking: boolean;
}>;

const patchField = (current: string | null, incoming: string | undefined): string | null | undefined => {
  if (incoming === undefined) return undefined;
  if (isMasked(incoming)) return undefined;
  return incoming;
};

export const applyIntegrationsPatch = async (patch: IntegrationsPatch) => {
  const clinic = await getOrCreateClinic();
  const data: Record<string, unknown> = {};

  if (patch.gmail) {
    const clientId = patch.gmail.clientId;
    const clientSecret = patchField(clinic.gmailClientSecret, patch.gmail.clientSecret);
    if (clientId !== undefined) data.gmailClientId = clientId;
    if (clientSecret !== undefined) data.gmailClientSecret = clientSecret;
    if (clientId !== undefined || clientSecret !== undefined) data.gmailConnected = false;
  }
  if (patch.pubSub) {
    const projectId = patch.pubSub.projectId;
    const topicName = patch.pubSub.topicName;
    const serviceAccount = patchField(clinic.pubsubServiceAccount, patch.pubSub.serviceAccount);
    if (projectId !== undefined) data.pubsubProjectId = projectId;
    if (topicName !== undefined) data.pubsubTopicName = topicName;
    if (serviceAccount !== undefined) data.pubsubServiceAccount = serviceAccount;
    if (projectId !== undefined || topicName !== undefined || serviceAccount !== undefined) data.pubsubConnected = false;
  }
  if (patch.whatsApp) {
    const { phoneNumberId, wabaId } = patch.whatsApp;
    const accessToken = patchField(clinic.waAccessToken, patch.whatsApp.accessToken);
    const verifyToken = patchField(clinic.waVerifyToken, patch.whatsApp.verifyToken);
    const appSecret = patchField(clinic.waAppSecret, patch.whatsApp.appSecret);
    if (phoneNumberId !== undefined) data.waPhoneNumberId = phoneNumberId;
    if (wabaId !== undefined) data.waWabaId = wabaId;
    if (accessToken !== undefined) data.waAccessToken = accessToken;
    if (verifyToken !== undefined) data.waVerifyToken = verifyToken;
    if (appSecret !== undefined) data.waAppSecret = appSecret;
    if ([phoneNumberId, wabaId, accessToken, verifyToken, appSecret].some((v) => v !== undefined)) data.waConnected = false;
  }
  if (patch.mercadoPago) {
    const accessTokenProd = patchField(clinic.mpAccessTokenProd, patch.mercadoPago.accessTokenProd);
    const accessTokenSandbox = patchField(clinic.mpAccessTokenSandbox, patch.mercadoPago.accessTokenSandbox);
    const { publicKey, sandboxMode } = patch.mercadoPago;
    if (accessTokenProd !== undefined) data.mpAccessTokenProd = accessTokenProd;
    if (accessTokenSandbox !== undefined) data.mpAccessTokenSandbox = accessTokenSandbox;
    if (publicKey !== undefined) data.mpPublicKey = publicKey;
    if (sandboxMode !== undefined) data.mpSandboxMode = sandboxMode;
    if ([accessTokenProd, accessTokenSandbox, publicKey].some((v) => v !== undefined)) data.mpConnected = false;
  }
  if (patch.resend) {
    const apiKey = patchField(clinic.resendApiKey, patch.resend.apiKey);
    const { fromEmail, fromName } = patch.resend;
    if (apiKey !== undefined) data.resendApiKey = apiKey;
    if (fromEmail !== undefined) data.resendFromEmail = fromEmail;
    if (fromName !== undefined) data.resendFromName = fromName;
    if ([apiKey, fromEmail, fromName].some((v) => v !== undefined)) data.resendConnected = false;
  }
  if (patch.smtp) {
    const { host, port, username, from } = patch.smtp;
    const password = patchField(clinic.smtpPassword, patch.smtp.password);
    if (host !== undefined) data.smtpHost = host;
    if (port !== undefined) data.smtpPort = port;
    if (username !== undefined) data.smtpUsername = username;
    if (password !== undefined) data.smtpPassword = password;
    if (from !== undefined) data.smtpFrom = from;
    if ([host, username, password, from].some((v) => v !== undefined) || port !== undefined) data.smtpConnected = false;
  }
  if (patch.instagram) {
    const { accountId, pageId } = patch.instagram;
    const accessToken = patchField(clinic.igAccessToken, patch.instagram.accessToken);
    const appSecret = patchField(clinic.igAppSecret, patch.instagram.appSecret);
    const verifyToken = patchField(clinic.igVerifyToken, patch.instagram.verifyToken);
    if (accountId !== undefined) data.igAccountId = accountId;
    if (pageId !== undefined) data.igPageId = pageId;
    if (accessToken !== undefined) data.igAccessToken = accessToken;
    if (appSecret !== undefined) data.igAppSecret = appSecret;
    if (verifyToken !== undefined) data.igVerifyToken = verifyToken;
    if ([accountId, pageId, accessToken, appSecret, verifyToken].some((v) => v !== undefined)) data.igConnected = false;
  }
  if (patch.asaas) {
    const apiKey = patchField(clinic.asaasApiKey, patch.asaas.apiKey);
    const { environment } = patch.asaas;
    if (apiKey !== undefined) data.asaasApiKey = apiKey;
    if (environment !== undefined) data.asaasEnvironment = environment;
    if ([apiKey, environment].some((v) => v !== undefined)) data.asaasConnected = false;
  }
  if (patch.remindersEnabled !== undefined) data.remindersEnabled = patch.remindersEnabled;
  if (patch.paymentRequiredAtBooking !== undefined) data.paymentRequiredAtBooking = patch.paymentRequiredAtBooking;

  data.updatedAt = new Date();
  const updated = await prisma.clinic.update({ where: { id: clinic.id }, data });
  return buildIntegrationsDto(updated);
};

export type TestResult = { ok: boolean; message: string; detail?: string | null };

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const testIntegration = async (type: string, payload: Record<string, unknown>): Promise<TestResult> => {
  const clinic = await getOrCreateClinic();

  switch (type) {
    case "gmail": {
      if (!clinic.gmailClientId || !clinic.gmailClientSecret) {
        return { ok: false, message: "Configure Client ID e Client Secret antes de testar." };
      }
      if (!clinic.gmailAccessToken) {
        await prisma.clinic.update({ where: { id: clinic.id }, data: { gmailConnected: false } });
        return { ok: false, message: "Conclua o fluxo OAuth para obter um access token." };
      }
      await prisma.clinic.update({ where: { id: clinic.id }, data: { gmailConnected: true } });
      return { ok: true, message: "Gmail conectado com sucesso." };
    }
    case "pubsub": {
      if (!clinic.pubsubProjectId || !clinic.pubsubTopicName || !clinic.pubsubServiceAccount) {
        return { ok: false, message: "Configure projeto, tópico e service account antes de testar." };
      }
      try {
        JSON.parse(clinic.pubsubServiceAccount);
      } catch {
        return { ok: false, message: "Service account não é um JSON válido." };
      }
      await prisma.clinic.update({ where: { id: clinic.id }, data: { pubsubConnected: true } });
      return { ok: true, message: "Pub/Sub conectado com sucesso." };
    }
    case "whatsapp": {
      if (!clinic.waPhoneNumberId || !clinic.waWabaId || !clinic.waAccessToken) {
        return { ok: false, message: "Configure Phone Number ID, WABA ID e Access Token antes de testar." };
      }
      if (clinic.waAccessToken.length < 40) return { ok: false, message: "Access Token parece inválido (muito curto)." };
      await prisma.clinic.update({ where: { id: clinic.id }, data: { waConnected: true } });
      return { ok: true, message: "WhatsApp conectado com sucesso." };
    }
    case "mercadopago": {
      const token = clinic.mpSandboxMode ? clinic.mpAccessTokenSandbox : clinic.mpAccessTokenProd;
      if (!token || !clinic.mpPublicKey) return { ok: false, message: "Configure Public Key e Access Token antes de testar." };
      if (!token.startsWith("APP_USR") && !token.startsWith("TEST")) {
        return { ok: false, message: "Access Token não parece válido (esperado prefixo APP_USR ou TEST)." };
      }
      await prisma.clinic.update({ where: { id: clinic.id }, data: { mpConnected: true } });
      return { ok: true, message: "Mercado Pago conectado com sucesso." };
    }
    case "resend": {
      if (!clinic.resendApiKey || !clinic.resendFromEmail) {
        return { ok: false, message: "Configure API Key e email de origem antes de testar." };
      }
      if (!clinic.resendApiKey.startsWith("re_")) return { ok: false, message: "API Key não parece válida (esperado prefixo re_)." };
      const testEmail = payload.testEmail as string | undefined;
      if (!testEmail || !isValidEmail(testEmail)) return { ok: false, message: "Informe um email de teste válido." };
      const result = await sendEmail({
        to: testEmail,
        subject: "Teste de integração — AIO",
        html: "<p>Este é um email de teste da integração Resend configurada no painel administrativo.</p>",
      });
      if (!result.ok) {
        await prisma.clinic.update({ where: { id: clinic.id }, data: { resendConnected: false } });
        return { ok: false, message: `Falha ao enviar email de teste: ${result.error}` };
      }
      await prisma.clinic.update({ where: { id: clinic.id }, data: { resendConnected: true } });
      return { ok: true, message: `Email de teste enviado para ${testEmail}.` };
    }
    case "smtp": {
      if (
        !clinic.smtpHost ||
        !clinic.smtpPort ||
        clinic.smtpPort < 1 ||
        clinic.smtpPort > 65535 ||
        !clinic.smtpUsername ||
        !clinic.smtpPassword ||
        !clinic.smtpFrom ||
        !isValidEmail(clinic.smtpFrom)
      ) {
        return { ok: false, message: "Configure host, porta, usuário, senha e remetente válidos antes de testar." };
      }
      const testEmail = payload.testEmail as string | undefined;
      if (!testEmail || !isValidEmail(testEmail)) return { ok: false, message: "Informe um email de teste válido." };
      const result = await sendEmail({
        to: testEmail,
        subject: "Teste de integração — AIO",
        html: "<p>Este é um email de teste da integração SMTP configurada no painel administrativo.</p>",
      });
      if (!result.ok) {
        await prisma.clinic.update({ where: { id: clinic.id }, data: { smtpConnected: false } });
        return { ok: false, message: `Falha ao enviar email de teste: ${result.error}` };
      }
      await prisma.clinic.update({ where: { id: clinic.id }, data: { smtpConnected: true } });
      return { ok: true, message: `Email de teste enviado para ${testEmail}.` };
    }
    case "asaas": {
      if (!clinic.asaasApiKey) return { ok: false, message: "Configure a API Key antes de testar." };
      const base = clinic.asaasEnvironment === "production" ? "https://api.asaas.com/v3" : "https://api-sandbox.asaas.com/v3";
      try {
        const response = await fetch(`${base}/customers?limit=1`, {
          headers: { access_token: clinic.asaasApiKey, "Content-Type": "application/json" },
        });
        if (!response.ok) {
          await prisma.clinic.update({ where: { id: clinic.id }, data: { asaasConnected: false } });
          return { ok: false, message: `Asaas respondeu ${response.status}. Verifique a API Key e o ambiente (sandbox/produção).` };
        }
        await prisma.clinic.update({ where: { id: clinic.id }, data: { asaasConnected: true } });
        return { ok: true, message: `Conectado ao Asaas (${clinic.asaasEnvironment === "production" ? "produção" : "sandbox"}).` };
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : "Falha ao conectar ao Asaas." };
      }
    }
    case "instagram": {
      if (!clinic.igAccountId || !clinic.igPageId || !clinic.igAccessToken) {
        return { ok: false, message: "Configure Account ID, Page ID e Access Token antes de testar." };
      }
      if (clinic.igAccessToken.length < 40) return { ok: false, message: "Access Token parece inválido (muito curto)." };
      await prisma.clinic.update({ where: { id: clinic.id }, data: { igConnected: true } });
      return { ok: true, message: "Instagram conectado com sucesso." };
    }
    default:
      return { ok: false, message: "Tipo de integração desconhecido." };
  }
};
