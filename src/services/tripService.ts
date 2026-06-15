import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  writeBatch,
  WriteBatch,
  serverTimestamp,
  Timestamp,
  arrayUnion,
  arrayRemove,
  updateDoc,
  deleteDoc,
  deleteField,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Collections, DEFAULT_CURRENCY } from '@/config/constants';
import { Trip, TripInput, Day, TripRole } from '@/types';
import { getDaysBetween, dayKey } from '@/utils/dates';

function tripCol() {
  return collection(db, Collections.TRIPS);
}

function daysCol(tripId: string) {
  return collection(db, Collections.TRIPS, tripId, Collections.DAYS);
}

function eventsCol(tripId: string, dayId: string) {
  return collection(db, Collections.TRIPS, tripId, Collections.DAYS, dayId, Collections.EVENTS);
}

// Firestore limite un batch a 500 operations. On decoupe pour rester sous la
// limite (suppressions en cascade, regeneration de jours sur de longs voyages).
async function commitInChunks(ops: Array<(batch: WriteBatch) => void>): Promise<void> {
  const CHUNK = 450;
  for (let i = 0; i < ops.length; i += CHUNK) {
    const batch = writeBatch(db);
    for (const op of ops.slice(i, i + CHUNK)) op(batch);
    await batch.commit();
  }
}

export async function createTrip(
  ownerId: string,
  input: TripInput,
  ownerName?: string,
): Promise<string> {
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
    roles: {},
    baseCurrency: DEFAULT_CURRENCY,
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

  // L'owner est d'office un participant au partage des dépenses.
  const participantRef = doc(collection(db, Collections.TRIPS, tripRef.id, Collections.PARTICIPANTS));
  batch.set(participantRef, {
    displayName: ownerName?.trim() || 'Moi',
    uid: ownerId,
    createdAt: serverTimestamp(),
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

  // Si les dates changent, on resynchronise les jours cote client (pas de Cloud
  // Function sur le plan gratuit). Les jours conserves gardent leurs evenements.
  if (updates.startDate || updates.endDate) {
    const trip = await getTrip(tripId);
    if (trip) {
      const newStart = updates.startDate ?? trip.startDate.toDate();
      const newEnd = updates.endDate ?? trip.endDate.toDate();
      await syncTripDays(tripId, newStart, newEnd);
    }
  }
}

// Aligne la sous-collection `days` sur l'intervalle [start, end] :
// - cree les jours manquants,
// - supprime les jours hors plage (et leurs evenements en cascade),
// - reordonne chronologiquement les jours conserves.
async function syncTripDays(tripId: string, start: Date, end: Date): Promise<void> {
  const existing = await getDaysOnce(tripId);
  const existingByKey = new Map(existing.map((d) => [dayKey(d.date.toDate()), d]));

  const targetDates = getDaysBetween(start, end);
  const targetKeys = new Set(targetDates.map((d) => dayKey(d)));

  const ops: Array<(batch: WriteBatch) => void> = [];

  // Suppression des jours hors plage + leurs evenements.
  for (const day of existing) {
    if (targetKeys.has(dayKey(day.date.toDate()))) continue;
    const eventsSnap = await getDocs(eventsCol(tripId, day.id));
    eventsSnap.forEach((e) => ops.push((batch) => batch.delete(e.ref)));
    ops.push((batch) => batch.delete(doc(daysCol(tripId), day.id)));
  }

  // Creation des jours manquants + reordonnancement chronologique.
  targetDates.forEach((date, idx) => {
    const existingDay = existingByKey.get(dayKey(date));
    if (existingDay) {
      if (existingDay.order !== idx) {
        ops.push((batch) => batch.update(doc(daysCol(tripId), existingDay.id), { order: idx }));
      }
    } else {
      const ref = doc(daysCol(tripId));
      ops.push((batch) =>
        batch.set(ref, { tripId, date: Timestamp.fromDate(date), order: idx }),
      );
    }
  });

  await commitInChunks(ops);
}

export async function deleteTrip(tripId: string): Promise<void> {
  // Suppression en cascade cote client (pas de Cloud Function sur le plan
  // gratuit) : evenements -> jours -> doc trip (le doc trip en dernier pour que
  // les regles de securite puissent encore le lire pendant les suppressions).
  const eventsSnap = await getDocs(
    query(collectionGroup(db, Collections.EVENTS), where('tripId', '==', tripId)),
  );
  const daysSnap = await getDocs(daysCol(tripId));
  const participantsSnap = await getDocs(
    collection(db, Collections.TRIPS, tripId, Collections.PARTICIPANTS),
  );
  const expensesSnap = await getDocs(
    collection(db, Collections.TRIPS, tripId, Collections.EXPENSES),
  );

  const ops: Array<(batch: WriteBatch) => void> = [];
  eventsSnap.forEach((e) => ops.push((batch) => batch.delete(e.ref)));
  daysSnap.forEach((d) => ops.push((batch) => batch.delete(d.ref)));
  participantsSnap.forEach((p) => ops.push((batch) => batch.delete(p.ref)));
  expensesSnap.forEach((x) => ops.push((batch) => batch.delete(x.ref)));
  ops.push((batch) => batch.delete(doc(db, Collections.TRIPS, tripId)));

  await commitInChunks(ops);
}

export async function shareTripWithUser(
  tripId: string,
  targetUserId: string,
  role: TripRole = 'editor',
): Promise<void> {
  await updateDoc(doc(db, Collections.TRIPS, tripId), {
    sharedWith: arrayUnion(targetUserId),
    [`roles.${targetUserId}`]: role,
    updatedAt: serverTimestamp(),
  });
}

export async function unshareTripWithUser(tripId: string, targetUserId: string): Promise<void> {
  await updateDoc(doc(db, Collections.TRIPS, tripId), {
    sharedWith: arrayRemove(targetUserId),
    [`roles.${targetUserId}`]: deleteField(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateTripMemberRole(
  tripId: string,
  targetUserId: string,
  role: TripRole,
): Promise<void> {
  await updateDoc(doc(db, Collections.TRIPS, tripId), {
    [`roles.${targetUserId}`]: role,
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
