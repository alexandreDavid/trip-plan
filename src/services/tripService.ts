import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  writeBatch,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Collections } from '@/config/constants';
import { Trip, TripInput, Day } from '@/types';
import { getDaysBetween } from '@/utils/dates';

function tripCol() {
  return collection(db, Collections.TRIPS);
}

function daysCol(tripId: string) {
  return collection(db, Collections.TRIPS, tripId, Collections.DAYS);
}

export async function createTrip(ownerId: string, input: TripInput): Promise<string> {
  const tripRef = doc(tripCol());
  const batch = writeBatch(db);

  batch.set(tripRef, {
    name: input.name,
    destination: input.destination,
    startDate: Timestamp.fromDate(input.startDate),
    endDate: Timestamp.fromDate(input.endDate),
    coverImageURL: input.coverImageURL ?? null,
    ownerId,
    sharedWith: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const days = getDaysBetween(input.startDate, input.endDate);
  days.forEach((date, idx) => {
    const dayRef = doc(daysCol(tripRef.id));
    batch.set(dayRef, {
      tripId: tripRef.id,
      date: Timestamp.fromDate(date),
      order: idx,
    });
  });

  await batch.commit();
  return tripRef.id;
}

export async function getTrip(tripId: string): Promise<Trip | null> {
  const snap = await getDoc(doc(db, Collections.TRIPS, tripId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Trip, 'id'>) };
}

export function subscribeToUserTrips(
  userId: string,
  callback: (trips: Trip[]) => void,
  onError?: (err: Error) => void,
): () => void {
  const q = query(
    tripCol(),
    where('ownerId', '==', userId),
    orderBy('startDate', 'desc'),
  );
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Trip, 'id'>) })));
    },
    onError,
  );
}

export function subscribeToSharedTrips(
  userId: string,
  callback: (trips: Trip[]) => void,
  onError?: (err: Error) => void,
): () => void {
  const q = query(
    tripCol(),
    where('sharedWith', 'array-contains', userId),
    orderBy('startDate', 'desc'),
  );
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Trip, 'id'>) })));
    },
    onError,
  );
}

export function subscribeToTrip(
  tripId: string,
  callback: (trip: Trip | null) => void,
  onError?: (err: Error) => void,
): () => void {
  return onSnapshot(
    doc(db, Collections.TRIPS, tripId),
    (snap) => {
      if (!snap.exists()) {
        callback(null);
        return;
      }
      callback({ id: snap.id, ...(snap.data() as Omit<Trip, 'id'>) });
    },
    onError,
  );
}

export function subscribeToDays(
  tripId: string,
  callback: (days: Day[]) => void,
  onError?: (err: Error) => void,
): () => void {
  const q = query(daysCol(tripId), orderBy('order', 'asc'));
  return onSnapshot(
    q,
    (snap) => {
      callback(
        snap.docs.map((d) => ({
          id: d.id,
          tripId,
          ...(d.data() as Omit<Day, 'id' | 'tripId'>),
        })),
      );
    },
    onError,
  );
}

export async function updateTrip(
  tripId: string,
  updates: Partial<Pick<Trip, 'name' | 'destination' | 'coverImageURL'>> & {
    startDate?: Date;
    endDate?: Date;
  },
): Promise<void> {
  const data: Record<string, unknown> = { ...updates, updatedAt: serverTimestamp() };
  if (updates.startDate) data.startDate = Timestamp.fromDate(updates.startDate);
  if (updates.endDate) data.endDate = Timestamp.fromDate(updates.endDate);
  await updateDoc(doc(db, Collections.TRIPS, tripId), data);
  // Note: la regeneration des jours si les dates changent doit ideralement etre
  // geree par une Cloud Function pour garantir l'atomicite et les permissions.
}

export async function deleteTrip(tripId: string): Promise<void> {
  // Supprime le doc trip. La suppression en cascade des sous-collections est faite
  // par la Cloud Function onTripDelete.
  await deleteDoc(doc(db, Collections.TRIPS, tripId));
}

export async function shareTripWithUser(tripId: string, targetUserId: string): Promise<void> {
  await updateDoc(doc(db, Collections.TRIPS, tripId), {
    sharedWith: arrayUnion(targetUserId),
    updatedAt: serverTimestamp(),
  });
}

export async function unshareTripWithUser(tripId: string, targetUserId: string): Promise<void> {
  await updateDoc(doc(db, Collections.TRIPS, tripId), {
    sharedWith: arrayRemove(targetUserId),
    updatedAt: serverTimestamp(),
  });
}

export async function getDaysOnce(tripId: string): Promise<Day[]> {
  const q = query(daysCol(tripId), orderBy('order', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    tripId,
    ...(d.data() as Omit<Day, 'id' | 'tripId'>),
  }));
}
