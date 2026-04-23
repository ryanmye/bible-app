import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { AppDrawer } from './AppDrawer';
import { useTheme } from '../ui/theme';

export function RootNavigator() {
  const theme = useTheme();
  const navTheme = theme.name === 'dark' ? DarkTheme : DefaultTheme;
  return (
    <NavigationContainer
      theme={{
        ...navTheme,
        colors: {
          ...navTheme.colors,
          background: theme.colors.bg,
          card: theme.colors.bgElevated,
          text: theme.colors.text,
          border: theme.colors.border,
          primary: theme.colors.accent,
        },
      }}
    >
      <AppDrawer />
    </NavigationContainer>
  );
}
