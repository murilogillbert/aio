import nodemailer from "nodemailer";
import { prisma } from "../db.js";

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
};

type SendEmailResult = { ok: true } | { ok: false; error: string };

type ClinicRow = NonNullable<Awaited<ReturnType<typeof prisma.clinic.findFirst>>>;

const sendViaSmtp = async (clinic: ClinicRow, { to, subject, html }: SendEmailInput): Promise<SendEmailResult> => {
  if (!clinic.smtpHost || !clinic.smtpPort || !clinic.smtpUsername || !clinic.smtpPassword || !clinic.smtpFrom) {
    return { ok: false, error: "SMTP não configurado (host, porta, usuário, senha ou remetente faltando)." };
  }
  try {
    const transporter = nodemailer.createTransport({
      host: clinic.smtpHost,
      port: clinic.smtpPort,
      secure: clinic.smtpPort === 465,
      auth: { user: clinic.smtpUsername, pass: clinic.smtpPassword },
    });
    await transporter.sendMail({ from: clinic.smtpFrom, to, subject, html });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Falha desconhecida ao enviar email via SMTP." };
  }
};

const sendViaResend = async (clinic: ClinicRow, { to, subject, html }: SendEmailInput): Promise<SendEmailResult> => {
  if (!clinic.resendApiKey || !clinic.resendFromEmail) {
    return { ok: false, error: "Resend não configurado (falta API key ou email de origem)." };
  }
  const fromName = clinic.resendFromName || "AIO";
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clinic.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${clinic.resendFromEmail}>`,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      return { ok: false, error: `Resend respondeu ${response.status}: ${detail}` };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Falha desconhecida ao enviar email via Resend." };
  }
};

/**
 * SMTP é o provedor principal (ex.: Gmail com senha de app); Resend fica como
 * fallback caso alguém prefira configurá-lo no lugar/além do SMTP.
 */
export const sendEmail = async (input: SendEmailInput): Promise<SendEmailResult> => {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic) return { ok: false, error: "Configuração da clínica não encontrada." };

  if (clinic.smtpHost) return sendViaSmtp(clinic, input);
  if (clinic.resendApiKey) return sendViaResend(clinic, input);
  return { ok: false, error: "Nenhum provedor de email configurado (SMTP ou Resend)." };
};

// Envia sem lançar erro — usado em fluxos que não podem falhar por causa de e-mail (ex.: criar agendamento).
export const sendEmailSilently = async (input: SendEmailInput): Promise<void> => {
  const result = await sendEmail(input);
  if (!result.ok) {
    console.error(`[email] falha ao enviar para ${Array.isArray(input.to) ? input.to.join(",") : input.to}: ${result.error}`);
  }
};
