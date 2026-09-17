import express from "express";
import cors from "cors";
import { env } from "./env.js";
import { errorHandler } from "./middleware/errorHandler.js";

import authRouter from "./routes/auth.js";
import catalogRouter from "./routes/catalog.js";
import agendaRouter from "./routes/agenda.js";
import appointmentsRouter from "./routes/appointments.js";
import blocksRouter from "./routes/blocks.js";
import patientsRouter from "./routes/patients.js";
import medicalRecordsRouter from "./routes/medicalRecords.js";
import metricsRouter from "./routes/metrics.js";
import configRouter from "./routes/config.js";
import adminRouter from "./routes/admin.js";
import servicesAdminRouter from "./routes/services.js";
import clinicRouter from "./routes/clinic.js";
import jobsRouter from "./routes/jobs.js";
import recruitmentRouter from "./routes/recruitment.js";
import uploadsRouter from "./routes/uploads.js";
import messagesRouter from "./routes/messages.js";
import documentsRouter from "./routes/documents.js";
import dependentsRouter from "./routes/dependents.js";
import myPatientsRouter from "./routes/myPatients.js";
import paymentsRouter from "./routes/payments.js";
import webhooksRouter from "./routes/webhooks.js";

export const app = express();

const localOrigins = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

app.use(
  cors({
    origin(origin, callback) {
      const normalized = origin?.replace(/\/+$/, "");
      if (!normalized || localOrigins.test(normalized) || env.corsOrigins.includes(normalized)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
  }),
);
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/catalogo", catalogRouter);
app.use("/api/agenda", agendaRouter);
app.use("/api/agendamentos", appointmentsRouter);
app.use("/api/bloqueios", blocksRouter);
app.use("/api/pacientes/meus", myPatientsRouter);
app.use("/api/pacientes", patientsRouter);
app.use("/api/prontuarios", medicalRecordsRouter);
app.use("/api/metricas", metricsRouter);
app.use("/api/configuracoes", configRouter);
app.use("/api/admin/servicos", servicesAdminRouter);
app.use("/api/admin/clinica", clinicRouter);
app.use("/api/admin", adminRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/recrutamento", recruitmentRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/conversas", messagesRouter);
app.use("/api/documentos", documentsRouter);
app.use("/api/dependentes", dependentsRouter);
app.use("/api/pagamentos", paymentsRouter);
app.use("/api/webhooks", webhooksRouter);

app.use(errorHandler);
