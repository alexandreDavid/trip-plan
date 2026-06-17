// Lien / code d'invitation à un voyage. Le lien est une URL https du web app,
// ouvrable dans n'importe quel navigateur (et non un schéma natif tripplan://
// qui n'ouvre que l'app installée). Le code (tripId.token) reste la solution de
// secours à coller manuellement dans l'écran "Rejoindre".

// URL publique du web app (Firebase Hosting). Surchargeable via
// EXPO_PUBLIC_WEB_URL (ex. domaine personnalisé). Sans slash final.
export const WEB_URL = (
  process.env.EXPO_PUBLIC_WEB_URL ?? 'https://trip-plan-4a18a.web.app'
).replace(/\/+$/, '');

export function generateInviteToken(): string {
  return (
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 6)
  );
}

export function buildInviteLink(tripId: string, token: string): string {
  return `${WEB_URL}/join/${tripId}/${token}`;
}

export function buildInviteCode(tripId: string, token: string): string {
  return `${tripId}.${token}`;
}

// Accepte un lien profond (tripplan://join/<tripId>/<token>) ou un code
// (<tripId>.<token>). Retourne null si non reconnu.
export function parseInvite(input: string): { tripId: string; token: string } | null {
  const s = input.trim();
  const link = s.match(/join\/([^/]+)\/([^/?#\s]+)/);
  if (link) return { tripId: link[1], token: link[2] };
  const dot = s.indexOf('.');
  if (dot > 0 && dot < s.length - 1) {
    return { tripId: s.slice(0, dot), token: s.slice(dot + 1) };
  }
  return null;
}
