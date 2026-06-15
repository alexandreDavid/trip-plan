import { useEffect, useState } from 'react';
import { EventType, TripEvent } from '@/types';
import { getAllEventsForTrip } from '@/services/eventService';
import { groupBudgetByType, sumBudgets } from '@/utils/budget';

interface BudgetState {
  total: number;
  byDay: Record<string, number>;
  byType: Record<EventType, number>;
  loading: boolean;
}

export function useTripBudget(tripId: string | undefined): BudgetState {
  const [state, setState] = useState<BudgetState>({
    total: 0,
    byDay: {},
    byType: {
      [EventType.ACCOMMODATION]: 0,
      [EventType.TRANSPORT]: 0,
      [EventType.ACTIVITY]: 0,
      [EventType.RESTAURANT]: 0,
    },
    loading: true,
  });

  useEffect(() => {
    if (!tripId) return;
    let cancelled = false;
    (async () => {
      const events: TripEvent[] = await getAllEventsForTrip(tripId);
      if (cancelled) return;
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
    })();
    return () => {
      cancelled = true;
    };
  }, [tripId]);

  return state;
}
