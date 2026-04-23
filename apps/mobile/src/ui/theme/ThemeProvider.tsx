import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type Theme } from './tokens';
import { useSettingsStore } from '../../app/stores/settingsStore';

const ThemeContext = createContext<Theme>(lightTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const override = useSettingsStore((s) => s.themeOverride);

  const theme = useMemo(() => {
    const effective = override === 'system' ? systemScheme : override;
    return effective === 'dark' ? darkTheme : lightTheme;
  }, [override, systemScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
