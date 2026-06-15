import { useEffect, useState } from 'react';
import { Trip } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToUserTrips, subscribeToSharedTrips } from '@/services/tripService';

interface TripsState {
  trips: Trip[];
  loading: boolean;
  error: Error | null;
}

export function useMyTrips(): TripsState {
  const { user } = useAuth();
  const [state, setState] = useState<TripsState>({ trips: [], loading: true, error: null });

  useEffect(() => {
    if (!user) {
      setState({ trips: [], loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    const unsub = subscribeToUserTrips(
      user.uid,
      (trips) => setState({ trips, loading: false, error: null }),
      (error) => setState({ trips: [], loading: false, error }),
    );
    return unsub;
  }, [user]);

  return state;
}

export function useSharedTrips(): TripsState {
  const { user } = useAuth();
  const [state, setState] = useState<TripsState>({ trips: [], loading: true, error: null });

  useEffect(() => {
    if (!user) {
      setState({ trips: [], loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    const unsub = subscribeToSharedTrips(
      user.uid,
      (trips) => setState({ trips, loading: false, error: null }),
      (error) => setState({ trips: [], loading: false, error }),
    );
    return unsub;
  }, [user]);

  return state;
}
