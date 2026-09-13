import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../env.js";

export type JwtUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
};

export const createAccessToken = (user: JwtUser) =>
  jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
    },
    env.jwt.signingKey,
    {
      issuer: env.jwt.issuer,
      audience: env.jwt.audience,
      expiresIn: `${env.jwt.accessTokenMinutes}m`,
    },
  );

export const createRefreshTokenValue = () => crypto.randomBytes(64).toString("base64url");

export const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

export const refreshTokenExpiry = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.jwt.refreshTokenDays);
  return expiresAt;
};

export type AccessTokenPayload = {
  sub: string;
  email: string;
  name: string;
  role: string;
};

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, env.jwt.signingKey, {
    issuer: env.jwt.issuer,
    audience: env.jwt.audience,
  }) as AccessTokenPayload;
