import { Router } from "express";
import { prisma } from "../db.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { badRequest, conflict, unauthorized } from "../lib/httpError.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { createAccessToken, createRefreshTokenValue, hashToken, refreshTokenExpiry } from "../lib/token.js";
import { buildSafeUser, primaryRole } from "../dto/user.js";

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

export default router;
