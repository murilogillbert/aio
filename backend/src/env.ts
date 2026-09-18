import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 5088),
  databaseUrl: required("DATABASE_URL"),
  supabaseUrl: required("SUPABASE_URL"),
  supabaseSecretKey: required("SUPABASE_SECRET_KEY"),
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? "uploads",
  frontendUrl: (process.env.FRONTEND_URL ?? "http://localhost:5173").replace(/\/+$/, ""),
  cronSecret: process.env.CRON_SECRET,
  jwt: {
    issuer: process.env.JWT_ISSUER ?? "aio",
    audience: process.env.JWT_AUDIENCE ?? "aio-web",
    signingKey: required("JWT_SIGNING_KEY"),
    accessTokenMinutes: Number(process.env.JWT_ACCESS_TOKEN_MINUTES ?? 60),
    refreshTokenDays: Number(process.env.JWT_REFRESH_TOKEN_DAYS ?? 14),
  },
  corsOrigins: (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean),
};
