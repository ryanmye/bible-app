import React, { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme/ThemeProvider';

interface ScreenProps {
  children: ReactNode;
  padded?: boolean;
}

export function Screen({ children, padded = true }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.color.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: padded ? theme.space(4) : 0,
          paddingRight: padded ? theme.space(4) : 0,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
