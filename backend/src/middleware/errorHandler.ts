import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/httpError.js";

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).type("text/plain").send(err.message);
    return;
  }
  console.error(err);
  res.status(500).type("text/plain").send("Erro interno do servidor");
};
