import { useEffect, useState } from 'react';
import { EventType, TripEvent } from '@/types';
import { subscribeToAllEventsForTrip } from '@/services/eventService';
import { groupBudgetByType, sumBudgets } from '@/utils/budget';

interface BudgetState {
  total: number;
  byDay: Record<string, number>;
  byType: Record<EventType, number>;
  loading: boolean;
}

const emptyByType = (): Record<EventType, number> => ({
  [EventType.ACCOMMODATION]: 0,
  [EventType.TRANSPORT]: 0,
  [EventType.ACTIVITY]: 0,
  [EventType.RESTAURANT]: 0,
});

export function useTripBudget(tripId: string | undefined): BudgetState {
  const [state, setState] = useState<BudgetState>({
    total: 0,
    byDay: {},
    byType: emptyByType(),
    loading: true,
  });

  useEffect(() => {
    if (!tripId) return;
    setState((s) => ({ ...s, loading: true }));
    const unsub = subscribeToAllEventsForTrip(tripId, (events: TripEvent[]) => {
      const byDay: Record<string, number> = {};
      for (const e of events) {
        byDay[e.dayId] = (byDay[e.dayId] ?? 0) + (e.budget ?? 0);
      }
      setState({
        total: sumBudgets(events),
        byDay,
        byType: groupBudgetByType(events),
        loading: false,
      });
    });
    return unsub;
  }, [tripId]);

  return state;
}
