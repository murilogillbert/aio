import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/token.js";
import { unauthorized, forbidden } from "../lib/httpError.js";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(unauthorized());

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, fullName: payload.name, role: payload.role };
    next();
  } catch {
    next(unauthorized("Token inválido ou expirado"));
  }
};

export const requireRole = (...roles: string[]) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) return next(unauthorized());
  if (!roles.includes(req.user.role)) return next(forbidden());
  next();
};
