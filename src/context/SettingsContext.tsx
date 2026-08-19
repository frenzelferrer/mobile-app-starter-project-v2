import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { darkColors, lightColors, type AppColors } from "@/theme/colors";

const SETTINGS_KEY = "studyflow.settings.v1";

export interface ProfileSettings {
  name: string;
  course: string;
  yearLevel: string;
  studentNumber: string;
  darkMode: boolean;
}

interface SettingsContextValue {
  settings: ProfileSettings;
  colors: AppColors;
  loading: boolean;
  updateSettings: (updates: Partial<ProfileSettings>) => void;
  toggleDarkMode: () => void;
  resetSettings: () => void;
}

const defaultSettings: ProfileSettings = {
  name: "Your Name",
  course: "BS Information Technology",
  yearLevel: "3rd Year",
  studentNumber: "2025XXXXX",
  darkMode: false,
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<ProfileSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY)
      .then((stored) => {
        if (!stored) return;
        try {
          const parsed = JSON.parse(stored) as Partial<ProfileSettings>;
          setSettings((current) => ({ ...current, ...parsed }));
        } catch {
          // Invalid local settings are ignored and replaced with safe defaults.
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = useCallback((next: ProfileSettings) => {
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const updateSettings = useCallback((updates: Partial<ProfileSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...updates };
      persist(next);
      return next;
    });
  }, [persist]);

  const toggleDarkMode = useCallback(() => updateSettings({ darkMode: !settings.darkMode }), [settings.darkMode, updateSettings]);
  const resetSettings = useCallback(() => { setSettings(defaultSettings); persist(defaultSettings); }, [persist]);
  const colors = settings.darkMode ? darkColors : lightColors;

  const value = useMemo(() => ({ settings, colors, loading, updateSettings, toggleDarkMode, resetSettings }), [settings, colors, loading, updateSettings, toggleDarkMode, resetSettings]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used inside SettingsProvider");
  return context;
}
