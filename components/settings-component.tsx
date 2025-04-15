"use client";

import { useState } from "react";

export default function SettingsComponent() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: true,
    autoSave: true,
    language: "pt-BR",
  });

  const handleToggleSetting = (key: keyof typeof settings) => {
    if (typeof settings[key] === "boolean") {
      setSettings({
        ...settings,
        [key]: !settings[key],
      });
    }
  };

  const handleSelectChange = (key: string, value: string) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden mt-6">
      <div className="px-4 py-5 border-b border-zinc-800 sm:px-6">
        <h3 className="text-lg font-medium text-white">Configurações Adicionais</h3>
      </div>
      <div className="px-4 py-5 sm:p-6 space-y-6">
        {/* Notificações */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-white">Notificações</h4>
            <p className="text-sm text-gray-400">Receber notificações do sistema</p>
          </div>
          <button
            onClick={() => handleToggleSetting("notifications")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              settings.notifications ? "bg-blue-600" : "bg-zinc-700"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                settings.notifications ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Auto-save */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-white">Salvamento Automático</h4>
            <p className="text-sm text-gray-400">Salvar alterações automaticamente</p>
          </div>
          <button
            onClick={() => handleToggleSetting("autoSave")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              settings.autoSave ? "bg-blue-600" : "bg-zinc-700"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                settings.autoSave ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Idioma */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-white">Idioma</h4>
            <p className="text-sm text-gray-400">Selecionar idioma da interface</p>
          </div>
          <select
            value={settings.language}
            onChange={(e) => handleSelectChange("language", e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded-md text-white py-1 px-3 text-sm"
          >
            <option value="pt-BR">Português (Brasil)</option>
            <option value="en-US">English (US)</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>
    </div>
  );
}