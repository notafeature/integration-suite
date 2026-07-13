import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const ConfigContext = createContext(null);

const FALLBACK = {
  brand: { name: "Cultivate Santa Fe", short: "Cultivate", tagline: "Community for the road back down." },
  region: { label: "Northern New Mexico", defaultCity: "Santa Fe" },
  entity: { name: "Cultivate Platform, LLC", email: "hello@example.com" },
  formats: {},
};

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(FALLBACK);

  useEffect(() => {
    api.get("/config").then(({ data }) => setConfig(data)).catch(() => {});
  }, []);

  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>;
}

export const useConfig = () => useContext(ConfigContext) || FALLBACK;
