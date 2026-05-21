import { useCallback, useEffect, useState } from "react";
import { searchPatients } from "../services/api";
import type { PatientRich } from "../types";

export function usePatientsSearch(search: string, includeInactive = false, delayMs = 250) {
  const [patients, setPatients] = useState<PatientRich[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPatients(await searchPatients(search, includeInactive));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Falha ao carregar pacientes."));
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, [search, includeInactive]);

  useEffect(() => {
    const timer = window.setTimeout(() => void reload(), delayMs);
    return () => window.clearTimeout(timer);
  }, [reload, delayMs]);

  return { patients, loading, error, reload };
}
