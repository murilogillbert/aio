const SIX_HOURS = 6 * 60 * 60 * 1000;

setInterval(() => {
  console.debug("[metrics-snapshot] heartbeat — geração de snapshot fica a cargo do seed nesta fase");
}, SIX_HOURS);
