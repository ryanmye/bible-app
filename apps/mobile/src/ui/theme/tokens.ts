import type { HighlightColor } from '../../domain/highlights/types';

export interface ThemeTokens {
  mode: 'light' | 'dark';
  color: {
    background: string;
    surface: string;
    surfaceRaised: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    danger: string;
    verseNumber: string;
  };
  highlight: Record<HighlightColor, string>;
  font: {
    body: string;
    reader: string;
    mono: string;
  };
  size: {
    body: number;
    reader: number;
    caption: number;
    title: number;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
  };
  space: (n: number) => number;
}

const baseFont = {
  body: 'System',
  reader: 'Georgia',
  mono: 'Menlo',
};

const baseSize = {
  body: 15,
  reader: 18,
  caption: 12,
  title: 20,
};

const baseRadius = { sm: 4, md: 8, lg: 14 };

const space = (n: number): number => n * 4;

export const lightTheme: ThemeTokens = {
  mode: 'light',
  color: {
    background: '#F7F6F2',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    border: '#E5E2DB',
    textPrimary: '#1C1B1A',
    textSecondary: '#4B4945',
    textMuted: '#8A8884',
    accent: '#1F6FEB',
    danger: '#D0342C',
    verseNumber: '#8A8884',
  },
  highlight: {
    yellow: '#FFF3A6',
    green: '#C6EFC1',
    blue: '#BEDCFB',
    pink: '#F8C7D6',
    orange: '#FFD0A6',
    purple: '#DCCCF5',
  },
  font: baseFont,
  size: baseSize,
  radius: baseRadius,
  space,
};

export const darkTheme: ThemeTokens = {
  mode: 'dark',
  color: {
    background: '#121212',
    surface: '#1B1B1B',
    surfaceRaised: '#242424',
    border: '#2F2F2F',
    textPrimary: '#F5F2EB',
    textSecondary: '#BEBCB7',
    textMuted: '#7D7C78',
    accent: '#4C8DFF',
    danger: '#F87171',
    verseNumber: '#7D7C78',
  },
  highlight: {
    yellow: '#5A4D12',
    green: '#1F4F2A',
    blue: '#1E3C6B',
    pink: '#5B2238',
    orange: '#5B3615',
    purple: '#3C2A5D',
  },
  font: baseFont,
  size: baseSize,
  radius: baseRadius,
  space,
};
