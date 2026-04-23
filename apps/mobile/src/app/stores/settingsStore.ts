import { create } from 'zustand';

export type ThemeOverride = 'system' | 'light' | 'dark';

type SettingsState = {
  themeOverride: ThemeOverride;
  syncProviderId: string;
  setThemeOverride: (t: ThemeOverride) => void;
  setSyncProviderId: (id: string) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  themeOverride: 'system',
  syncProviderId: 'noop',
  setThemeOverride: (themeOverride) => set({ themeOverride }),
  setSyncProviderId: (syncProviderId) => set({ syncProviderId }),
}));
