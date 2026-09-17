// Cliente HTTP fino para a API do Asaas (https://docs.asaas.com).
// Autenticação: header `access_token` (sem "Bearer"), nunca Authorization.
// Sandbox e Produção são contas/dados totalmente separados — a base URL muda conforme
// `Clinic.asaasEnvironment`.

type AsaasConfig = { apiKey: string; environment: string };

const baseUrl = (environment: string) =>
  environment === "production" ? "https://api.asaas.com/v3" : "https://api-sandbox.asaas.com/v3";

class AsaasError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

const request = async <T>(config: AsaasConfig, path: string, init: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${baseUrl(config.environment)}${path}`, {
    ...init,
    headers: {
      access_token: config.apiKey,
      "Content-Type": "application/json",
      "User-Agent": "AIO-Clinica",
      ...init.headers,
    },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new AsaasError(`Asaas ${path} respondeu ${response.status}: ${detail}`, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

export type AsaasCustomer = { id: string; name: string; email: string; cpfCnpj: string };

export const createCustomer = (config: AsaasConfig, data: { name: string; email: string; cpfCnpj: string }) =>
  request<AsaasCustomer>(config, "/customers", { method: "POST", body: JSON.stringify(data) });

export const getCustomer = (config: AsaasConfig, id: string) => request<AsaasCustomer>(config, `/customers/${id}`);

export type AsaasPayment = { id: string; status: string; value: number; billingType: string };

export const createPixCharge = (config: AsaasConfig, data: { customer: string; value: number; dueDate: string; description?: string }) =>
  request<AsaasPayment>(config, "/payments", { method: "POST", body: JSON.stringify({ ...data, billingType: "PIX" }) });

export type PixQrCode = { encodedImage: string; payload: string; expirationDate: string };

export const getPixQrCode = (config: AsaasConfig, paymentId: string) =>
  request<PixQrCode>(config, `/payments/${paymentId}/pixQrCode`);

export type CreditCardInput = {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
};

export type CreditCardHolderInfo = {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  phone: string;
};

export const createCardCharge = (
  config: AsaasConfig,
  data: {
    customer: string;
    value: number;
    dueDate: string;
    description?: string;
    remoteIp: string;
    creditCard?: CreditCardInput;
    creditCardHolderInfo?: CreditCardHolderInfo;
    creditCardToken?: string;
  },
) =>
  request<AsaasPayment & { creditCardToken?: string }>(config, "/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: data.customer,
      value: data.value,
      dueDate: data.dueDate,
      description: data.description,
      billingType: "CREDIT_CARD",
      remoteIp: data.remoteIp,
      creditCard: data.creditCard,
      creditCardHolderInfo: data.creditCardHolderInfo,
      creditCardToken: data.creditCardToken,
    }),
  });

export const getPayment = (config: AsaasConfig, id: string) => request<AsaasPayment>(config, `/payments/${id}`);

export { AsaasError };
