import crypto from "node:crypto";
import { prisma } from "../db.js";
import { env } from "../env.js";
import { sendEmailSilently } from "./email.js";

const RESET_TOKEN_TTL_HOURS = 1;

const createToken = () => crypto.randomBytes(32).toString("base64url");
const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export const issuePasswordResetToken = async (userId: string): Promise<string> => {
  const token = createToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + RESET_TOKEN_TTL_HOURS);
  await prisma.passwordResetToken.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });
  return token;
};

export const consumePasswordResetToken = async (token: string): Promise<string | null> => {
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) return null;
  await prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return record.userId;
};

const resetLinkHtml = (title: string, intro: string, link: string) => `
  <div style="font-family: sans-serif; max-width: 480px;">
    <h2>${title}</h2>
    <p>${intro}</p>
    <p><a href="${link}" style="display:inline-block;background:#C2410C;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">Definir senha</a></p>
    <p style="color:#78350F;font-size:12px;">Se você não solicitou isso, pode ignorar este email. O link expira em ${RESET_TOKEN_TTL_HOURS}h.</p>
  </div>
`;

export const sendPasswordResetEmail = async (params: { email: string; fullName: string; token: string; welcome?: boolean }) => {
  const link = `${env.frontendUrl}/redefinir-senha?token=${encodeURIComponent(params.token)}`;
  const title = params.welcome ? `Bem-vindo(a), ${params.fullName}` : "Redefinir senha";
  const intro = params.welcome
    ? "Sua conta foi criada. Clique no botão abaixo para definir sua própria senha de acesso."
    : "Recebemos um pedido para redefinir sua senha. Clique no botão abaixo para escolher uma nova.";
  await sendEmailSilently({
    to: params.email,
    subject: params.welcome ? "Bem-vindo(a) — defina sua senha" : "Redefinir senha",
    html: resetLinkHtml(title, intro, link),
  });
};
