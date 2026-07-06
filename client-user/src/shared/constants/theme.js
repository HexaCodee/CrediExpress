// src/shared/constants/theme.js

export const COLORS = {
  primary: '#08316D',
  primaryDark: '#0A1F44',
  secondary: '#64748b',
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  textLight: '#64748b',
  error: '#dc2626',
  success: '#16a34a',
  warning: '#f59e0b',
  border: '#e2e8f0',
  white: '#ffffff',
  black: '#000000',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  title: 34,
};

export const SHADOWS = {
  card: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  button: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};
