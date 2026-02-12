export const colors = {
  background: '#0A0D14',
  surface: '#0F121A',
  surfaceAlt: '#141826',
  primary: '#4DA3FF',
  secondary: '#9AA4B2',
  accent: '#70C6FF',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  border: '#202636',
  text: '#E7ECF5',
  textMuted: '#A8B3C5',
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
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
};

export type Theme = {
  colors: typeof colors;
  spacing: typeof spacing;
  radius: typeof radius;
  shadows: typeof shadows;
};

export const theme: Theme = { colors, spacing, radius, shadows };