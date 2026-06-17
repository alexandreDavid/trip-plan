import { dayKey, getDaysBetween, getDayCount, dateToTimestamp, toDate } from '@/utils/dates';

describe('dayKey', () => {
  it('normalise une Date en clé AAAA-MM-JJ', () => {
    expect(dayKey(new Date(2026, 5, 15, 12, 30))).toBe('2026-06-15');
  });

  it('accepte un Timestamp (heure murale)', () => {
    expect(dayKey(dateToTimestamp(new Date(2026, 5, 15, 9)))).toBe('2026-06-15');
  });
});

describe('heure murale (indépendante du fuseau)', () => {
  it("dateToTimestamp encode les composantes locales dans l'UTC", () => {
    const ts = dateToTimestamp(new Date(2026, 5, 17, 14, 30));
    const d = ts.toDate();
    expect(d.getUTCFullYear()).toBe(2026);
    expect(d.getUTCMonth()).toBe(5);
    expect(d.getUTCDate()).toBe(17);
    expect(d.getUTCHours()).toBe(14);
    expect(d.getUTCMinutes()).toBe(30);
  });

  it('round-trip date -> Timestamp -> date conserve les composantes murales', () => {
    const original = new Date(2026, 5, 17, 14, 30);
    const back = toDate(dateToTimestamp(original));
    expect(dayKey(back)).toBe('2026-06-17');
    expect(back.getHours()).toBe(14);
    expect(back.getMinutes()).toBe(30);
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
