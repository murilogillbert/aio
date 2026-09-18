import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { badRequest, conflict, unauthorized } from "../lib/httpError.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { createAccessToken, createRefreshTokenValue, hashToken, refreshTokenExpiry } from "../lib/token.js";
import { buildSafeUser, primaryRole } from "../dto/user.js";
import { consumePasswordResetToken, issuePasswordResetToken, sendPasswordResetEmail } from "../lib/passwordReset.js";
import { notifyPatientRegistered } from "../lib/notifications.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const issueTokens = async (userId: string, email: string, fullName: string, role: string) => {
  const token = createAccessToken({ id: userId, email, fullName, role });
  const refreshTokenValue = createRefreshTokenValue();
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshTokenValue),
      expiresAt: refreshTokenExpiry(),
    },
  });
  const user = await buildSafeUser(userId);
  return { token, refreshToken: refreshTokenValue, user };
};

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, senha } = req.body as { email?: string; senha?: string };
    if (!email || !senha) throw badRequest("Informe email e senha.");

    const user = await prisma.user.findUnique({
      where: { email },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) throw unauthorized("Credenciais inválidas.");
    if (!user.isActive) throw unauthorized("Esta conta está desativada.");

    const valid = await verifyPassword(senha, user.passwordHash);
    if (!valid) throw unauthorized("Credenciais inválidas.");

    const role = primaryRole(user.userRoles);
    res.json(await issueTokens(user.id, user.email, user.fullName, role));
  }),
);

router.post(
  "/cadastro",
  asyncHandler(async (req, res) => {
    const { fullName, email, phone, password } = req.body as {
      fullName?: string;
      email?: string;
      phone?: string;
      password?: string;
    };
    if (!fullName || !email || !password) throw badRequest("Informe nome, email e senha.");

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw conflict("Já existe uma conta com este email.");

    const role = await prisma.role.findUnique({ where: { name: "paciente" } });
    if (!role) throw badRequest("Papel 'paciente' não configurado.");

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone: phone ?? "",
        passwordHash,
        userRoles: { create: { roleId: role.id } },
        patient: { create: {} },
      },
    });

    await notifyPatientRegistered({ email: user.email, fullName: user.fullName });

    res.json(await issueTokens(user.id, user.email, user.fullName, "paciente"));
  }),
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) throw badRequest("Informe o refresh token.");

    const tokenHash = hashToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { include: { userRoles: { include: { role: true } } } } },
    });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw unauthorized("Refresh token inválido ou expirado.");
    }

    const role = primaryRole(stored.user.userRoles);
    const issued = await issueTokens(stored.user.id, stored.user.email, stored.user.fullName, role);
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date(), replacedByTokenHash: hashToken(issued.refreshToken) },
    });

    res.json(issued);
  }),
);

router.post(
  "/esqueci-senha",
  asyncHandler(async (req, res) => {
    const { email } = req.body as { email?: string };
    if (!email) throw badRequest("Informe o email.");

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = await issuePasswordResetToken(user.id);
      await sendPasswordResetEmail({ email: user.email, fullName: user.fullName, token });
    }
    // Sempre responde OK — não revela se o email existe na base.
    res.json({ ok: true });
  }),
);

router.post(
  "/redefinir-senha",
  asyncHandler(async (req, res) => {
    const { token, novaSenha } = req.body as { token?: string; novaSenha?: string };
    if (!token || !novaSenha) throw badRequest("Informe o token e a nova senha.");
    if (novaSenha.length < 6) throw badRequest("A senha deve ter ao menos 6 caracteres.");

    const userId = await consumePasswordResetToken(token);
    if (!userId) throw badRequest("Link inválido ou expirado. Solicite um novo.");

    const passwordHash = await hashPassword(novaSenha);
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);

    res.json({ ok: true });
  }),
);

router.patch(
  "/senha",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { senhaAtual, novaSenha } = req.body as { senhaAtual?: string; novaSenha?: string };
    if (!senhaAtual || !novaSenha) throw badRequest("Informe a senha atual e a nova senha.");
    if (novaSenha.length < 6) throw badRequest("A nova senha deve ter ao menos 6 caracteres.");

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) throw unauthorized();

    const valid = await verifyPassword(senhaAtual, user.passwordHash);
    if (!valid) throw badRequest("Senha atual incorreta.");

    const passwordHash = await hashPassword(novaSenha);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
    res.json({ ok: true });
  }),
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await buildSafeUser(req.user!.id);
    if (!user) throw unauthorized();
    res.json(user);
  }),
);

router.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = req.body as { fullName?: string; phone?: string; bio?: string; specialty?: string; photoUrl?: string };

    if (body.fullName !== undefined || body.phone !== undefined) {
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { fullName: body.fullName, phone: body.phone },
      });
    }

    if (req.user!.role === "profissional" && (body.bio !== undefined || body.specialty !== undefined || body.photoUrl !== undefined)) {
      await prisma.professional.updateMany({
        where: { userId: req.user!.id },
        data: { bio: body.bio, specialty: body.specialty, photoUrl: body.photoUrl },
      });
    }

    const user = await buildSafeUser(req.user!.id);
    res.json(user);
  }),
);

export default router;
