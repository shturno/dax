"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type SettingsContextType = {
  color: string;
  setColor: (color: string) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [color, setColor] = useState<string>("green"); // Valor padrão

  // Carregar configurações do Local Storage ao montar
  useEffect(() => {
    const savedColor = localStorage.getItem("dashboard-color");
    if (savedColor) {
      setColor(savedColor);
    }
  }, []);

  // Salvar configurações no Local Storage sempre que mudar
  useEffect(() => {
    localStorage.setItem("dashboard-color", color);
  }, [color]);

  return (
    <SettingsContext.Provider value={{ color, setColor }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}