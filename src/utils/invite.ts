// Lien / code d'invitation à un voyage. Le lien profond ouvre l'app ; le code
// (tripId.token) est la solution de secours à coller manuellement.

const SCHEME = 'tripplan';

export function generateInviteToken(): string {
  return (
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 6)
  );
}

export function buildInviteLink(tripId: string, token: string): string {
  return `${SCHEME}://join/${tripId}/${token}`;
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
