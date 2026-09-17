import { prisma } from "../db.js";

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
};

type SendEmailResult = { ok: true } | { ok: false; error: string };

export const sendEmail = async ({ to, subject, html }: SendEmailInput): Promise<SendEmailResult> => {
  const clinic = await prisma.clinic.findFirst();
  if (!clinic?.resendApiKey || !clinic.resendFromEmail) {
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
    return { ok: false, error: error instanceof Error ? error.message : "Falha desconhecida ao enviar email." };
  }
};

// Envia sem lançar erro — usado em fluxos que não podem falhar por causa de e-mail (ex.: criar agendamento).
export const sendEmailSilently = async (input: SendEmailInput): Promise<void> => {
  const result = await sendEmail(input);
  if (!result.ok) {
    console.error(`[email] falha ao enviar para ${Array.isArray(input.to) ? input.to.join(",") : input.to}: ${result.error}`);
  }
};
