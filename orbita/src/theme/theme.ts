export const colors = {
  background: '#0E0F13',
  surface: '#14161C',
  surfaceAlt: '#1B1E26',
  primary: '#6EA8FE',
  secondary: '#9AA4B2',
  accent: '#7CD4FD',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  border: '#2A2F3A',
  text: '#E6EAF2',
  textMuted: '#AAB2C0',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  pill: 999,
};

export const shadows = {
  soft: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
};

export type Theme = {
  colors: typeof colors;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
};

export const theme: Theme = { colors, spacing, radius, shadows };