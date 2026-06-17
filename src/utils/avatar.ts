// Couleur d'avatar déterministe à partir d'un nom (ou de tout identifiant
// stable) : même entrée -> même couleur. Palette vive, lisible avec du texte
// blanc, piochée dans les accents du thème (cf. src/theme).
const AVATAR_COLORS = [
  '#FF5A5F', // corail
  '#00A699', // turquoise
  '#06B6D4', // cyan
  '#6366F1', // indigo
  '#F59E0B', // ambre
  '#EC4899', // rose
  '#10B981', // vert
];

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}
