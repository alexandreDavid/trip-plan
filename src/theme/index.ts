// Palette "festive" voyage : corail chaleureux + accents tropicaux.
// Couleurs d'accent identiques en clair et sombre (vives, lisibles sur les deux).
// Seuls les neutres (fond, surface, texte, bordure) changent selon le thème.
export const accent = {
  primary: '#FF5A5F', // corail (vibe voyage)
  primaryDark: '#E14C50',
  secondary: '#00A699', // turquoise
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',

  // Couleurs par type d'evenement
  accommodation: '#06B6D4', // cyan
  transport: '#6366F1', // indigo
  activity: '#F59E0B', // ambre
  restaurant: '#EC4899', // rose
};

export const lightColors = {
  ...accent,
  background: '#FFF7F3', // blanc cassé chaud
  surface: '#FFFFFF',
  text: '#1F2430',
  textMuted: '#7A7E8A',
  border: '#F1E7E1',
};

export const darkColors = {
  ...accent,
  primary: '#FF6B70', // corail un peu plus clair sur fond sombre
  background: '#16131A', // sombre légèrement chaud
  surface: '#221E29',
  text: '#F4F1F6',
  textMuted: '#A39FAD',
  border: '#3A3442',
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
  sm: 8,
  md: 14,
  lg: 22,
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
