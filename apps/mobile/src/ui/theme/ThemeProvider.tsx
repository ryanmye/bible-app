import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import { darkTheme, lightTheme, type ThemeTokens } from './tokens';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  tokens: ThemeTokens;
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');

  const tokens = useMemo<ThemeTokens>(() => {
    const resolved =
      preference === 'system'
        ? systemScheme === 'dark'
          ? 'dark'
          : 'light'
        : preference;
    return resolved === 'dark' ? darkTheme : lightTheme;
  }, [preference, systemScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ tokens, preference, setPreference }),
    [tokens, preference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeTokens {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx.tokens;
}

export function useThemePreference(): {
  preference: ThemePreference;
  setPreference: (pref: ThemePreference) => void;
} {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemePreference must be used inside ThemeProvider');
  return { preference: ctx.preference, setPreference: ctx.setPreference };
}
