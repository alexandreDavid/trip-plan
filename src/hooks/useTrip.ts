import { useEffect, useState } from 'react';
import { Trip, Day } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToTrip, subscribeToDays } from '@/services/tripService';

interface TripState {
  trip: Trip | null;
  days: Day[];
  loading: boolean;
  error: Error | null;
  isOwner: boolean;
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

  const isOwner = !!(user && trip && trip.ownerId === user.uid);
  const canView = !!(user && trip && (trip.ownerId === user.uid || trip.sharedWith.includes(user.uid)));

  return { trip, days, loading, error, isOwner, canView };
}
