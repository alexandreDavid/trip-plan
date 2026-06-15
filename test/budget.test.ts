import { EventType, TripEvent } from '@/types';
import { sumBudgets, groupBudgetByType, formatBudget } from '@/utils/budget';

const ev = (type: EventType, budget?: number): TripEvent =>
  ({ type, budget }) as unknown as TripEvent;

describe('sumBudgets', () => {
  it('additionne les budgets en traitant undefined comme 0', () => {
    expect(
      sumBudgets([ev(EventType.ACTIVITY, 10), ev(EventType.TRANSPORT, 20), ev(EventType.RESTAURANT)]),
    ).toBe(30);
  });

  it('retourne 0 sur une liste vide', () => {
    expect(sumBudgets([])).toBe(0);
  });
});

describe('groupBudgetByType', () => {
  it('regroupe par type, 0 pour les types absents', () => {
    const result = groupBudgetByType([
      ev(EventType.ACTIVITY, 10),
      ev(EventType.ACTIVITY, 5),
      ev(EventType.TRANSPORT, 20),
    ]);
    expect(result).toEqual({
      [EventType.ACCOMMODATION]: 0,
      [EventType.TRANSPORT]: 20,
      [EventType.ACTIVITY]: 15,
      [EventType.RESTAURANT]: 0,
    });
  });
});

describe('formatBudget', () => {
  it('affiche un tiret pour une valeur absente', () => {
    expect(formatBudget(undefined)).toBe('-');
  });

  it('formate une valeur numérique', () => {
    expect(formatBudget(0)).toContain('0');
  });
});
