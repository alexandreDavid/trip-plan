import { useEffect, useMemo, useState } from 'react';
import { Trip } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { subscribeToUserTrips, subscribeToSharedTrips } from '@/services/tripService';

interface TripsState {
  trips: Trip[];
  loading: boolean;
  error: Error | null;
}

interface Slice {
  trips: Trip[];
  loading: boolean;
}

// Tous les voyages auxquels l'utilisateur participe : ceux qu'il possède
// (ownerId) ET ceux partagés avec lui (sharedWith). On fusionne les deux
// abonnements Firestore en une seule liste, dédupliquée et triée par date.
// La distinction propriétaire / invité se fait au cas par cas via trip.ownerId
// (badge « partagé » sur la carte), pas via deux onglets séparés.
export function useAllTrips(): TripsState {
  const { user } = useAuth();
  const [owned, setOwned] = useState<Slice>({ trips: [], loading: true });
  const [shared, setShared] = useState<Slice>({ trips: [], loading: true });
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setOwned({ trips: [], loading: false });
      setShared({ trips: [], loading: false });
      return;
    }
    setError(null);
    setOwned((s) => ({ ...s, loading: true }));
    setShared((s) => ({ ...s, loading: true }));
    const unsubOwned = subscribeToUserTrips(
      user.uid,
      (trips) => setOwned({ trips, loading: false }),
      (err) => {
        setError(err);
        setOwned({ trips: [], loading: false });
      },
    );
    const unsubShared = subscribeToSharedTrips(
      user.uid,
      (trips) => setShared({ trips, loading: false }),
      (err) => {
        setError(err);
        setShared({ trips: [], loading: false });
      },
    );
    return () => {
      unsubOwned();
      unsubShared();
    };
  }, [user]);

  const trips = useMemo(() => {
    const byId = new Map<string, Trip>();
    for (const trip of [...owned.trips, ...shared.trips]) byId.set(trip.id, trip);
    return Array.from(byId.values()).sort(
      (a, b) => (b.startDate?.toMillis() ?? 0) - (a.startDate?.toMillis() ?? 0),
    );
  }, [owned.trips, shared.trips]);

  return { trips, loading: owned.loading || shared.loading, error };
}
