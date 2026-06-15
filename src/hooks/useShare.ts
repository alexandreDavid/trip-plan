import { useEffect, useState, useCallback } from 'react';
import { UserProfile } from '@/types';
import { getUsersByIds, getUserByEmail } from '@/services/userService';
import {
  shareTripWithUser,
  unshareTripWithUser,
  subscribeToTrip,
} from '@/services/tripService';

interface ShareState {
  sharedUsers: UserProfile[];
  loading: boolean;
  error: string | null;
}

export function useShareTrip(tripId: string | undefined) {
  const [state, setState] = useState<ShareState>({
    sharedUsers: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!tripId) return;
    const unsub = subscribeToTrip(tripId, async (trip) => {
      if (!trip) {
        setState({ sharedUsers: [], loading: false, error: null });
        return;
      }
      const users = await getUsersByIds(trip.sharedWith);
      setState({ sharedUsers: users, loading: false, error: null });
    });
    return unsub;
  }, [tripId]);

  const shareWithEmail = useCallback(
    async (email: string): Promise<{ ok: boolean; error?: string }> => {
      if (!tripId) return { ok: false, error: 'Voyage invalide' };
      const user = await getUserByEmail(email);
      if (!user) {
        return { ok: false, error: 'Aucun utilisateur trouve avec cet email' };
      }
      await shareTripWithUser(tripId, user.uid);
      return { ok: true };
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

  return { ...state, shareWithEmail, removeShare };
}
