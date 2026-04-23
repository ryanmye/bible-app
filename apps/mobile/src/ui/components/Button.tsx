import React from 'react';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
}

export function Button({ label, variant = 'primary', style, ...rest }: ButtonProps) {
  const theme = useTheme();

  const bg =
    variant === 'primary'
      ? theme.color.accent
      : variant === 'danger'
        ? theme.color.danger
        : variant === 'secondary'
          ? theme.color.surface
          : 'transparent';
  const fg =
    variant === 'primary' || variant === 'danger'
      ? '#FFFFFF'
      : variant === 'secondary'
        ? theme.color.textPrimary
        : theme.color.accent;
  const borderColor =
    variant === 'secondary' ? theme.color.border : 'transparent';

  return (
    <Pressable
      {...rest}
      style={(state) => [
        styles.root,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: variant === 'secondary' ? StyleSheet.hairlineWidth : 0,
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.space(3),
          paddingVertical: theme.space(2),
          opacity: state.pressed ? 0.8 : 1,
        },
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <Text style={{ color: fg, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
});
