import { Timestamp } from 'firebase/firestore';
import { EventType, TripEvent } from '@/types';
import {
  getEventPrimaryTime,
  sortEventsChronologically,
  getEventGeocodeQuery,
  getEventCoords,
} from '@/utils/events';

const ts = (h: number) => Timestamp.fromMillis(h * 3600_000);

const accommodation = (p: Record<string, unknown> = {}): TripEvent =>
  ({ id: 'a', type: EventType.ACCOMMODATION, address: '1 rue X', order: 0, ...p }) as unknown as TripEvent;
const transport = (p: Record<string, unknown> = {}): TripEvent =>
  ({ id: 't', type: EventType.TRANSPORT, departureLocation: 'CDG', arrivalLocation: 'LIS', order: 0, ...p }) as unknown as TripEvent;
const activity = (p: Record<string, unknown> = {}): TripEvent =>
  ({ id: 'c', type: EventType.ACTIVITY, order: 0, ...p }) as unknown as TripEvent;
const restaurant = (p: Record<string, unknown> = {}): TripEvent =>
  ({ id: 'r', type: EventType.RESTAURANT, order: 0, ...p }) as unknown as TripEvent;

describe('getEventPrimaryTime', () => {
  it('retourne le bon champ horaire selon le type', () => {
    expect(getEventPrimaryTime(accommodation({ checkInTime: ts(14) }))?.toMillis()).toBe(ts(14).toMillis());
    expect(getEventPrimaryTime(transport({ departureTime: ts(8) }))?.toMillis()).toBe(ts(8).toMillis());
    expect(getEventPrimaryTime(activity({ startTime: ts(10) }))?.toMillis()).toBe(ts(10).toMillis());
    expect(getEventPrimaryTime(restaurant({ time: ts(20) }))?.toMillis()).toBe(ts(20).toMillis());
    expect(getEventPrimaryTime(activity())).toBeUndefined();
  });
});

describe('sortEventsChronologically', () => {
  it('trie par heure, les événements sans heure à la fin', () => {
    const noTime = activity({ id: 'noTime', order: 1 });
    const morning = transport({ id: 'morning', departureTime: ts(8) });
    const evening = restaurant({ id: 'evening', time: ts(20) });
    const sorted = sortEventsChronologically([evening, noTime, morning]);
    expect(sorted.map((e) => e.id)).toEqual(['morning', 'evening', 'noTime']);
  });

  it('départage par ordre manuel les événements sans heure', () => {
    const a = activity({ id: 'second', order: 2 });
    const b = activity({ id: 'first', order: 1 });
    expect(sortEventsChronologically([a, b]).map((e) => e.id)).toEqual(['first', 'second']);
  });

  it('ne mute pas le tableau d’entrée', () => {
    const input = [restaurant({ id: 'r', time: ts(20) }), transport({ id: 't', departureTime: ts(8) })];
    const copy = [...input];
    sortEventsChronologically(input);
    expect(input).toEqual(copy);
  });
});

describe('getEventGeocodeQuery', () => {
  it('retourne l’adresse/lieu pour les lieux, null pour le transport', () => {
    expect(getEventGeocodeQuery(accommodation({ address: '10 Downing St' }))).toBe('10 Downing St');
    expect(getEventGeocodeQuery(activity({ location: 'Belém' }))).toBe('Belém');
    expect(getEventGeocodeQuery(restaurant({ address: 'Time Out Market' }))).toBe('Time Out Market');
    expect(getEventGeocodeQuery(transport({}))).toBeNull();
    expect(getEventGeocodeQuery(activity({}))).toBeNull(); // pas de lieu
  });
});

describe('getEventCoords', () => {
  it('retourne les coordonnées si présentes, sinon null', () => {
    expect(getEventCoords(activity({ latitude: 38.7, longitude: -9.2 }))).toEqual({
      latitude: 38.7,
      longitude: -9.2,
    });
    expect(getEventCoords(activity({}))).toBeNull();
  });
});
