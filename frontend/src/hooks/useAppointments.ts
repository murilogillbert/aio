import { useCallback, useEffect, useState } from "react";
import { listAppointments } from "../services/api";
import type { AppointmentRich } from "../types";

export function useAppointmentsRange(start: string, end: string, professionalId?: string) {
  const [appointments, setAppointments] = useState<AppointmentRich[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    if (!start || !end) return;
    setLoading(true);
    setError(null);
    try {
      setAppointments(await listAppointments(start, end, professionalId));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Falha ao carregar agendamentos."));
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [start, end, professionalId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { appointments, loading, error, reload };
}
