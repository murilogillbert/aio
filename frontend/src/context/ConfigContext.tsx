import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ClinicConfig } from "../types";
import { defaultConfig } from "../mocks/config";
import { getConfig, saveConfig } from "../services/api";

type ConfigContextValue = {
  config: ClinicConfig;
  loading: boolean;
  updateConfig: (next: ClinicConfig) => Promise<void>;
};

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r} ${g} ${b}`;
};

const applyConfigToRoot = (config: ClinicConfig) => {
  const root = document.documentElement;
  root.style.setProperty("--color-primary", hexToRgb(config.theme.primary));
  root.style.setProperty("--color-primary-light", hexToRgb(config.theme.primaryLight));
  root.style.setProperty("--color-bg-base", hexToRgb(config.theme.bgBase));
  root.style.setProperty("--color-bg-secondary", hexToRgb(config.theme.bgSecondary));
  root.style.setProperty("--color-brown-dark", hexToRgb(config.theme.brownDark));
  root.style.setProperty("--color-brown-mid", hexToRgb(config.theme.brownMid));
  root.style.setProperty("--color-surface", hexToRgb(config.theme.surface));
  root.style.setProperty("--font-heading", `"${config.theme.headingFont}", serif`);
  root.style.setProperty("--font-body", `"${config.theme.bodyFont}", sans-serif`);
  document.title = config.seo.title || config.clinicName;

  const description = config.seo.description || config.about.text;
  if (description) {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
  }
};

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ClinicConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConfig()
      .then((next) => {
        setConfig(next);
        applyConfigToRoot(next);
      })
      .finally(() => setLoading(false));
  }, []);

  const updateConfig = async (next: ClinicConfig) => {
    setConfig(next);
    applyConfigToRoot(next);
    await saveConfig(next);
  };

  const value = useMemo(() => ({ config, loading, updateConfig }), [config, loading]);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error("useConfig deve ser usado dentro de ConfigProvider");
  return context;
};
