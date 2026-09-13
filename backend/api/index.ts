import { app } from "../src/app.js";

// Entry point usado pela Vercel (Serverless Function). Não chama app.listen();
// a plataforma cuida do ciclo de vida da requisição. Os jobs de heartbeat
// (setInterval) de src/index.ts propositalmente não são importados aqui —
// não fazem sentido em um processo que só vive durante uma requisição.
export default app;
