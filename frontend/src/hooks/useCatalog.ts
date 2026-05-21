import { useCallback, useEffect, useState } from "react";
import { getProfissionais, getServicos } from "../services/api";
import type { Professional, Service } from "../types";

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setServices(await getServicos());
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Falha ao carregar servicos."));
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { services, loading, error, reload };
}

export function useProfessionals(onlyCareProviders = false) {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await getProfissionais();
      setProfessionals(onlyCareProviders ? items.filter((item) => item.role === "profissional") : items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Falha ao carregar profissionais."));
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  }, [onlyCareProviders]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { professionals, loading, error, reload };
}
