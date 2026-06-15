import { EventType, TripEvent } from '@/types';

export function formatBudget(amount: number | undefined): string {
  if (amount == null) return '-';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function sumBudgets(events: TripEvent[]): number {
  return events.reduce((sum, e) => sum + (e.budget ?? 0), 0);
}

export function groupBudgetByType(events: TripEvent[]): Record<EventType, number> {
  const result: Record<EventType, number> = {
    [EventType.ACCOMMODATION]: 0,
    [EventType.TRANSPORT]: 0,
    [EventType.ACTIVITY]: 0,
    [EventType.RESTAURANT]: 0,
  };
  for (const e of events) {
    result[e.type] += e.budget ?? 0;
  }
  return result;
}
