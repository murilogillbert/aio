import { app } from "./app.js";
import { env } from "./env.js";
import "./jobs/notificationDispatch.js";
import "./jobs/metricsSnapshot.js";

app.listen(env.port, () => {
  console.log(`AIO API rodando em http://127.0.0.1:${env.port}`);
});
