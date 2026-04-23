import React from 'react';
import {
  Text as RNText,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';

import { useTheme } from '../theme/ThemeProvider';

type Variant = 'title' | 'body' | 'caption' | 'mono' | 'reader' | 'verseNumber';

export interface TextProps extends RNTextProps {
  variant?: Variant;
  muted?: boolean;
}

export function Text({ variant = 'body', muted, style, ...rest }: TextProps) {
  const theme = useTheme();
  const variantStyle: TextStyle = (() => {
    switch (variant) {
      case 'title':
        return {
          fontFamily: theme.font.body,
          fontSize: theme.size.title,
          fontWeight: '600',
          color: theme.color.textPrimary,
        };
      case 'caption':
        return {
          fontFamily: theme.font.body,
          fontSize: theme.size.caption,
          color: theme.color.textMuted,
        };
      case 'mono':
        return {
          fontFamily: theme.font.mono,
          fontSize: theme.size.body,
          color: theme.color.textSecondary,
        };
      case 'reader':
        return {
          fontFamily: theme.font.reader,
          fontSize: theme.size.reader,
          lineHeight: theme.size.reader * 1.5,
          color: theme.color.textPrimary,
        };
      case 'verseNumber':
        return {
          fontFamily: theme.font.body,
          fontSize: theme.size.caption,
          color: theme.color.verseNumber,
          fontWeight: '600',
        };
      case 'body':
      default:
        return {
          fontFamily: theme.font.body,
          fontSize: theme.size.body,
          color: muted ? theme.color.textMuted : theme.color.textPrimary,
        };
    }
  })();

  return <RNText {...rest} style={[variantStyle, style]} />;
}
