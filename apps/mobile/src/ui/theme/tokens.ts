export type ColorTokens = {
  bg: string;
  bgElevated: string;
  bgSubtle: string;
  text: string;
  textSubtle: string;
  textMuted: string;
  accent: string;
  accentContrast: string;
  border: string;
  danger: string;
  highlightYellow: string;
  highlightGreen: string;
  highlightBlue: string;
  highlightPink: string;
  highlightOrange: string;
  highlightPurple: string;
};

export type SpacingTokens = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
};

export type TypographyTokens = {
  body: number;
  verseNumber: number;
  heading: number;
  headingLg: number;
};

export type Theme = {
  name: 'light' | 'dark';
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  radius: { sm: number; md: number; lg: number };
};

const sharedSpacing: SpacingTokens = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
const sharedTypography: TypographyTokens = {
  body: 16,
  verseNumber: 11,
  heading: 18,
  headingLg: 22,
};
const sharedRadius = { sm: 4, md: 8, lg: 14 };

export const lightTheme: Theme = {
  name: 'light',
  colors: {
    bg: '#FFFFFF',
    bgElevated: '#F7F7F9',
    bgSubtle: '#EFEFF3',
    text: '#111217',
    textSubtle: '#3A3D46',
    textMuted: '#6B6F79',
    accent: '#3E5FFF',
    accentContrast: '#FFFFFF',
    border: '#E3E4EA',
    danger: '#C83A3A',
    highlightYellow: '#FFF1A8',
    highlightGreen: '#C8EFC2',
    highlightBlue: '#C4DBFF',
    highlightPink: '#FFCBE4',
    highlightOrange: '#FFD7A8',
    highlightPurple: '#DCC8FF',
  },
  spacing: sharedSpacing,
  typography: sharedTypography,
  radius: sharedRadius,
};

export const darkTheme: Theme = {
  name: 'dark',
  colors: {
    bg: '#0F1014',
    bgElevated: '#171820',
    bgSubtle: '#1F2029',
    text: '#ECEDF2',
    textSubtle: '#C1C3CC',
    textMuted: '#878A95',
    accent: '#7A8BFF',
    accentContrast: '#0F1014',
    border: '#2A2C36',
    danger: '#FF6B6B',
    highlightYellow: '#6A5F23',
    highlightGreen: '#2F5A34',
    highlightBlue: '#2B3F73',
    highlightPink: '#6B2F4C',
    highlightOrange: '#70481F',
    highlightPurple: '#4A3675',
  },
  spacing: sharedSpacing,
  typography: sharedTypography,
  radius: sharedRadius,
};
