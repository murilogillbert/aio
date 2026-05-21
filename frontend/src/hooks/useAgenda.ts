import { useCallback, useEffect, useState } from "react";
import { getAgenda } from "../services/api";
import type { AgendaSlot } from "../types";

export function useAgendaSlots(professionalId?: string, month?: string) {
  const [slots, setSlots] = useState<AgendaSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSlots(await getAgenda(professionalId, month));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Falha ao carregar agenda."));
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [professionalId, month]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { slots, loading, error, reload };
}
