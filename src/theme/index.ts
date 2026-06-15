// Couleurs d'accent : identiques en clair et sombre (vives, lisibles sur les deux).
// Seuls les neutres (fond, surface, texte, bordure) changent selon le thème.
export const accent = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  secondary: '#64748B',
  danger: '#DC2626',
  success: '#16A34A',
  warning: '#F59E0B',

  // Couleurs par type d'evenement
  accommodation: '#16A34A',
  transport: '#2563EB',
  activity: '#F59E0B',
  restaurant: '#DC2626',
};

export const lightColors = {
  ...accent,
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
};

export const darkColors = {
  ...accent,
  primary: '#3B82F6',
  background: '#0B1120',
  surface: '#1E293B',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  border: '#334155',
};

export type Palette = typeof lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  full: 999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
};
