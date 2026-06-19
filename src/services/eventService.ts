import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Collections } from '@/config/constants';
import { TripEvent, EventInput } from '@/types';
import { dateToTimestamp } from '@/utils/dates';

function eventsCol(tripId: string, dayId: string) {
  return collection(db, Collections.TRIPS, tripId, Collections.DAYS, dayId, Collections.EVENTS);
}

// Convertit les champs Date en Timestamp Firestore (recursivement sur les champs connus).
function serializeEventInput(input: EventInput): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value instanceof Date) {
      out[key] = dateToTimestamp(value);
    } else if (value === undefined) {
      // ignore - Firestore refuse undefined
    } else {
      out[key] = value;
    }
  }
  return out;
}

export function subscribeToEventsForDay(
  tripId: string,
  dayId: string,
  callback: (events: TripEvent[]) => void,
  onError?: (err: Error) => void,
): () => void {
  const q = query(eventsCol(tripId, dayId), orderBy('order', 'asc'));
  return onSnapshot(
    q,
    (snap) => {
      callback(
        snap.docs.map((d) => ({
          id: d.id,
          tripId,
          dayId,
          ...(d.data() as object),
        })) as TripEvent[],
      );
    },
    onError,
  );
}

export async function createEvent(
  tripId: string,
  dayId: string,
  input: EventInput,
  order: number,
): Promise<string> {
  const ref = await addDoc(eventsCol(tripId, dayId), {
    ...serializeEventInput(input),
    tripId,
    dayId,
    order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateEvent(
  tripId: string,
  dayId: string,
  eventId: string,
  input: EventInput,
): Promise<void> {
  await updateDoc(doc(eventsCol(tripId, dayId), eventId), {
    ...serializeEventInput(input),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteEvent(tripId: string, dayId: string, eventId: string): Promise<void> {
  await deleteDoc(doc(eventsCol(tripId, dayId), eventId));
}

// Met à jour uniquement les coordonnées (utilisé par le géocodage de la carte).
export async function updateEventCoords(
  tripId: string,
  dayId: string,
  eventId: string,
  latitude: number,
  longitude: number,
): Promise<void> {
  await updateDoc(doc(eventsCol(tripId, dayId), eventId), {
    latitude,
    longitude,
    updatedAt: serverTimestamp(),
  });
}

export async function reorderEvents(
  tripId: string,
  dayId: string,
  orderedEventIds: string[],
): Promise<void> {
  const batch = writeBatch(db);
  orderedEventIds.forEach((id, idx) => {
    batch.update(doc(eventsCol(tripId, dayId), id), { order: idx });
  });
  await batch.commit();
}

// Abonnement temps reel a tous les evenements d'un voyage (timeline, depenses),
// agrege jour par jour. On lit les sous-collections par jour (autorisees par les
// regles existantes : tripId concret dans le chemin) plutot qu'une requete
// collectionGroup, qui n'est pas simplement autorisable cote regles (la condition
// canViewTrip s'appuie sur un get() du trip parent que Firestore ne relie pas au
// filtre where('tripId') d'une requete collection-group).
export function subscribeToAllEventsForTrip(
  tripId: string,
  callback: (events: TripEvent[]) => void,
  onError?: (err: Error) => void,
): () => void {
  const daysRef = collection(db, Collections.TRIPS, tripId, Collections.DAYS);
  const dayUnsubs = new Map<string, () => void>();
  const eventsByDay = new Map<string, TripEvent[]>();
  const emit = () => callback(Array.from(eventsByDay.values()).flat());

  const daysUnsub = onSnapshot(
    daysRef,
    (daysSnap) => {
      const currentIds = new Set(daysSnap.docs.map((d) => d.id));
      // Retire les jours supprimes.
      for (const [dayId, unsub] of Array.from(dayUnsubs.entries())) {
        if (!currentIds.has(dayId)) {
          unsub();
          dayUnsubs.delete(dayId);
          eventsByDay.delete(dayId);
        }
      }
      // Abonne les nouveaux jours.
      for (const dayDoc of daysSnap.docs) {
        if (dayUnsubs.has(dayDoc.id)) continue;
        const dayId = dayDoc.id;
        const unsub = onSnapshot(
          eventsCol(tripId, dayId),
          (evSnap) => {
            eventsByDay.set(
              dayId,
              evSnap.docs.map((e) => ({
                id: e.id,
                tripId,
                dayId,
                ...(e.data() as object),
              })) as TripEvent[],
            );
            emit();
          },
          onError,
        );
        dayUnsubs.set(dayId, unsub);
      }
      emit();
    },
    onError,
  );

  return () => {
    daysUnsub();
    for (const unsub of dayUnsubs.values()) unsub();
  };
}
