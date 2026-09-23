export class HttpError extends Error {
  status: number;
  payload?: Record<string, unknown>;

  constructor(status: number, message: string, payload?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

export const badRequest = (message: string) => new HttpError(400, message);
export const unauthorized = (message = "Não autorizado") => new HttpError(401, message);
export const forbidden = (message = "Acesso negado") => new HttpError(403, message);
export const notFound = (message = "Não encontrado") => new HttpError(404, message);
export const conflict = (message: string, payload?: Record<string, unknown>) => new HttpError(409, message, payload);
