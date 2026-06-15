import { Trip, TripRole, EffectiveRole } from '@/types';

// Source de vérité côté client pour les permissions. Doit rester cohérent avec
// les règles Firestore (firestore.rules). Les règles restent l'autorité finale ;
// ces helpers servent à piloter l'UI (afficher/masquer les actions).

export function getTripRole(
  trip: Trip | null | undefined,
  uid: string | null | undefined,
): EffectiveRole {
  if (!trip || !uid) return null;
  if (trip.ownerId === uid) return 'owner';
  if (trip.sharedWith.includes(uid)) {
    return trip.roles?.[uid] ?? 'viewer';
  }
  return null;
}

export function canViewTrip(trip: Trip | null | undefined, uid: string | null | undefined): boolean {
  return getTripRole(trip, uid) !== null;
}

export function canEditTrip(trip: Trip | null | undefined, uid: string | null | undefined): boolean {
  const role = getTripRole(trip, uid);
  return role === 'owner' || role === 'editor';
}

export function isTripOwner(trip: Trip | null | undefined, uid: string | null | undefined): boolean {
  return getTripRole(trip, uid) === 'owner';
}

export function roleLabel(role: EffectiveRole): string {
  switch (role) {
    case 'owner':
      return 'Organisateur';
    case 'editor':
      return 'Éditeur';
    case 'viewer':
      return 'Lecteur';
    default:
      return '';
  }
}

// Bascule éditeur <-> lecteur (utilitaire UI).
export function otherRole(role: TripRole): TripRole {
  return role === 'editor' ? 'viewer' : 'editor';
}
