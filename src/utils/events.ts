import { Timestamp } from 'firebase/firestore';
import { EventType, TripEvent } from '@/types';
import { GeoCoords } from '@/utils/geocode';

// Heure "principale" d'un événement, pour le tri chronologique et les rappels.
export function getEventPrimaryTime(event: TripEvent): Timestamp | undefined {
  switch (event.type) {
    case EventType.ACCOMMODATION:
      return event.checkInTime;
    case EventType.TRANSPORT:
      return event.departureTime;
    case EventType.ACTIVITY:
      return event.startTime;
    case EventType.RESTAURANT:
      return event.time;
  }
}

// Adresse/lieu géocodable d'un événement (les transports sont des trajets, pas
// un point unique → ignorés sur la carte).
export function getEventGeocodeQuery(event: TripEvent): string | null {
  switch (event.type) {
    case EventType.ACCOMMODATION:
      return event.address || null;
    case EventType.ACTIVITY:
      return event.location || null;
    case EventType.RESTAURANT:
      return event.address || null;
    case EventType.TRANSPORT:
      return null;
  }
}

// Coordonnées déjà connues d'un événement, si présentes.
export function getEventCoords(event: TripEvent): GeoCoords | null {
  if (event.latitude != null && event.longitude != null) {
    return { latitude: event.latitude, longitude: event.longitude };
  }
  return null;
}

// Tri d'une liste d'événements d'une même journée : par heure si disponible
// (les événements sans heure passent après), puis par `order` manuel.
export function sortEventsChronologically(events: TripEvent[]): TripEvent[] {
  return [...events].sort((a, b) => {
    const ta = getEventPrimaryTime(a)?.toMillis();
    const tb = getEventPrimaryTime(b)?.toMillis();
    if (ta != null && tb != null) return ta - tb;
    if (ta != null) return -1;
    if (tb != null) return 1;
    return a.order - b.order;
  });
}
