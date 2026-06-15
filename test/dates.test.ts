import { Timestamp } from 'firebase/firestore';
import { dayKey, getDaysBetween, getDayCount } from '@/utils/dates';

describe('dayKey', () => {
  it('normalise une Date en clé AAAA-MM-JJ', () => {
    expect(dayKey(new Date(2026, 5, 15, 12, 30))).toBe('2026-06-15');
  });

  it('accepte un Timestamp', () => {
    expect(dayKey(Timestamp.fromDate(new Date(2026, 5, 15, 9)))).toBe('2026-06-15');
  });
});

describe('getDaysBetween', () => {
  it('inclut les bornes (3 jours du 15 au 17 juin)', () => {
    const days = getDaysBetween(new Date(2026, 5, 15), new Date(2026, 5, 17));
    expect(days).toHaveLength(3);
    expect(dayKey(days[0])).toBe('2026-06-15');
    expect(dayKey(days[2])).toBe('2026-06-17');
  });

  it('retourne un seul jour quand début = fin', () => {
    expect(getDaysBetween(new Date(2026, 5, 15), new Date(2026, 5, 15))).toHaveLength(1);
  });
});

describe('getDayCount', () => {
  it('compte les jours civils, bornes incluses', () => {
    expect(getDayCount(new Date(2026, 5, 15), new Date(2026, 5, 17))).toBe(3);
    expect(getDayCount(new Date(2026, 5, 15), new Date(2026, 5, 15))).toBe(1);
  });
});
