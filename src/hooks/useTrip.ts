import { useEffect, useState } from 'react';
import { Trip, Day, EffectiveRole } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToTrip, subscribeToDays } from '@/services/tripService';
import { getTripRole, canEditTrip, canViewTrip, isTripOwner } from '@/utils/permissions';

interface TripState {
  trip: Trip | null;
  days: Day[];
  loading: boolean;
  error: Error | null;
  role: EffectiveRole;
  isOwner: boolean;
  canEdit: boolean;
  canView: boolean;
}

export function useTrip(tripId: string | undefined): TripState {
  const { user } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [days, setDays] = useState<Day[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tripId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubTrip = subscribeToTrip(
      tripId,
      (t) => {
        setTrip(t);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
    const unsubDays = subscribeToDays(tripId, setDays, setError);
    return () => {
      unsubTrip();
      unsubDays();
    };
  }, [tripId]);

  const role = getTripRole(trip, user?.uid);
  const isOwner = isTripOwner(trip, user?.uid);
  const canEdit = canEditTrip(trip, user?.uid);
  const canView = canViewTrip(trip, user?.uid);

  return { trip, days, loading, error, role, isOwner, canEdit, canView };
}
