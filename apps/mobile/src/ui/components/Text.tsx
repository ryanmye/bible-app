import React from 'react';
import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme';

type Variant = 'body' | 'subtle' | 'muted' | 'heading' | 'headingLg' | 'verseNumber';

type Props = TextProps & { variant?: Variant; style?: TextStyle | TextStyle[] };

export function Text({ variant = 'body', style, ...rest }: Props) {
  const theme = useTheme();
  const base: TextStyle = { color: theme.colors.text, fontSize: theme.typography.body };

  const map: Record<Variant, TextStyle> = {
    body: base,
    subtle: { ...base, color: theme.colors.textSubtle },
    muted: { ...base, color: theme.colors.textMuted, fontSize: theme.typography.body - 2 },
    heading: {
      ...base,
      fontSize: theme.typography.heading,
      fontWeight: '600',
    },
    headingLg: {
      ...base,
      fontSize: theme.typography.headingLg,
      fontWeight: '700',
    },
    verseNumber: {
      ...base,
      color: theme.colors.textMuted,
      fontSize: theme.typography.verseNumber,
      fontWeight: '600',
    },
  };

  return <RNText {...rest} style={[map[variant], style]} />;
}
