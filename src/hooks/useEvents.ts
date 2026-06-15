import { useEffect, useState } from 'react';
import { TripEvent } from '@/types';
import { subscribeToEventsForDay } from '@/services/eventService';

interface EventsState {
  events: TripEvent[];
  loading: boolean;
  error: Error | null;
}

export function useEvents(tripId: string | undefined, dayId: string | undefined): EventsState {
  const [state, setState] = useState<EventsState>({ events: [], loading: true, error: null });

  useEffect(() => {
    if (!tripId || !dayId) {
      setState({ events: [], loading: false, error: null });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    const unsub = subscribeToEventsForDay(
      tripId,
      dayId,
      (events) => setState({ events, loading: false, error: null }),
      (error) => setState({ events: [], loading: false, error }),
    );
    return unsub;
  }, [tripId, dayId]);

  return state;
}
