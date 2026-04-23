import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
};

export function Screen({ children, style, padded = true }: Props) {
  const theme = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View
        style={[
          { flex: 1 },
          padded && {
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.md,
          },
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
