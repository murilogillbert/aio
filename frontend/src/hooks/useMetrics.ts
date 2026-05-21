import { useCallback, useEffect, useState } from "react";
import { getMetricBreakdowns, getMetricasGerais, getMovimento } from "../services/api";
import type { MetricsMovimento, MetricsPoint } from "../types";

export function useMovementMetrics(date?: string, autoRefreshMs?: number) {
  const [movement, setMovement] = useState<MetricsMovimento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMovement(await getMovimento(date));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Falha ao carregar movimento."));
      setMovement(null);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    void reload();
    if (!autoRefreshMs) return undefined;
    const id = window.setInterval(() => void reload(), autoRefreshMs);
    return () => window.clearInterval(id);
  }, [reload, autoRefreshMs]);

  return { movement, loading, error, reload };
}

export function useMetricSeries() {
  const [metrics, setMetrics] = useState<MetricsPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMetrics(await getMetricasGerais());
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Falha ao carregar metricas."));
      setMetrics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { metrics, loading, error, reload };
}

export function useMetricBreakdowns() {
  const [serviceRanking, setServiceRanking] = useState<{ label: string; value: number }[]>([]);
  const [professionalRanking, setProfessionalRanking] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMetricBreakdowns();
      setServiceRanking(data.serviceRankingMock);
      setProfessionalRanking(data.professionalRankingMock);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Falha ao carregar distribuicoes."));
      setServiceRanking([]);
      setProfessionalRanking([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { serviceRanking, professionalRanking, loading, error, reload };
}
