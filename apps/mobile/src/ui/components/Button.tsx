import React from 'react';
import { Pressable, type PressableProps, View } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../theme';

type Props = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export function Button({ label, variant = 'primary', style, ...rest }: Props) {
  const theme = useTheme();
  const palette =
    variant === 'primary'
      ? { bg: theme.colors.accent, fg: theme.colors.accentContrast, border: theme.colors.accent }
      : variant === 'secondary'
      ? { bg: theme.colors.bgElevated, fg: theme.colors.text, border: theme.colors.border }
      : { bg: 'transparent', fg: theme.colors.accent, border: 'transparent' };

  return (
    <Pressable
      {...rest}
      style={(state) => [
        {
          opacity: state.pressed ? 0.8 : 1,
          backgroundColor: palette.bg,
          borderColor: palette.border,
          borderWidth: 1,
          borderRadius: theme.radius.md,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          alignItems: 'center',
          justifyContent: 'center',
        },
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <View>
        <Text style={{ color: palette.fg, fontWeight: '600' }}>{label}</Text>
      </View>
    </Pressable>
  );
}
