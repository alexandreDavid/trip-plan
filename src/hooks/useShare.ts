import { useEffect, useState, useCallback } from 'react';
import { UserProfile, TripRole } from '@/types';
import { getUsersByIds, getUserByEmail } from '@/services/userService';
import {
  shareTripWithUser,
  unshareTripWithUser,
  updateTripMemberRole,
  subscribeToTrip,
} from '@/services/tripService';

export interface TripMember {
  user: UserProfile;
  role: TripRole;
}

interface ShareState {
  members: TripMember[];
  loading: boolean;
  error: string | null;
}

export function useShareTrip(tripId: string | undefined) {
  const [state, setState] = useState<ShareState>({
    members: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!tripId) return;
    const unsub = subscribeToTrip(tripId, async (trip) => {
      if (!trip) {
        setState({ members: [], loading: false, error: null });
        return;
      }
      const users = await getUsersByIds(trip.sharedWith);
      const members: TripMember[] = users.map((user) => ({
        user,
        role: trip.roles?.[user.uid] ?? 'viewer',
      }));
      setState({ members, loading: false, error: null });
    });
    return unsub;
  }, [tripId]);

  const shareWithEmail = useCallback(
    async (email: string, role: TripRole = 'editor'): Promise<{ ok: boolean; error?: string }> => {
      if (!tripId) return { ok: false, error: 'Voyage invalide' };
      const user = await getUserByEmail(email);
      if (!user) {
        return { ok: false, error: 'Aucun utilisateur trouve avec cet email' };
      }
      await shareTripWithUser(tripId, user.uid, role);
      return { ok: true };
    },
    [tripId],
  );

  const changeRole = useCallback(
    async (userId: string, role: TripRole) => {
      if (!tripId) return;
      await updateTripMemberRole(tripId, userId, role);
    },
    [tripId],
  );

  const removeShare = useCallback(
    async (userId: string) => {
      if (!tripId) return;
      await unshareTripWithUser(tripId, userId);
    },
    [tripId],
  );

  return { ...state, shareWithEmail, changeRole, removeShare };
}
