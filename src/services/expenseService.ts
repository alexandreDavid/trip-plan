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
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Collections } from '@/config/constants';
import { Participant, ParticipantInput, Expense, ExpenseInput } from '@/types';

function participantsCol(tripId: string) {
  return collection(db, Collections.TRIPS, tripId, Collections.PARTICIPANTS);
}

function expensesCol(tripId: string) {
  return collection(db, Collections.TRIPS, tripId, Collections.EXPENSES);
}

// --- Participants ---

export function subscribeToParticipants(
  tripId: string,
  callback: (participants: Participant[]) => void,
  onError?: (err: Error) => void,
): () => void {
  const q = query(participantsCol(tripId), orderBy('createdAt', 'asc'));
  return onSnapshot(
    q,
    (snap) => {
      callback(
        snap.docs.map((d) => ({
          id: d.id,
          tripId,
          ...(d.data() as Omit<Participant, 'id' | 'tripId'>),
        })),
      );
    },
    onError,
  );
}

export async function addParticipant(tripId: string, input: ParticipantInput): Promise<string> {
  const ref = await addDoc(participantsCol(tripId), {
    displayName: input.displayName.trim(),
    uid: input.uid ?? null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function removeParticipant(tripId: string, participantId: string): Promise<void> {
  await deleteDoc(doc(participantsCol(tripId), participantId));
}

// --- Dépenses ---

// Convertit les champs Date en Timestamp et retire les undefined (Firestore les refuse).
function serializeExpenseInput(input: ExpenseInput): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value instanceof Date) {
      out[key] = Timestamp.fromDate(value);
    } else if (value !== undefined) {
      out[key] = value;
    }
  }
  return out;
}

export function subscribeToExpenses(
  tripId: string,
  callback: (expenses: Expense[]) => void,
  onError?: (err: Error) => void,
): () => void {
  const q = query(expensesCol(tripId), orderBy('date', 'desc'));
  return onSnapshot(
    q,
    (snap) => {
      callback(
        snap.docs.map((d) => ({
          id: d.id,
          tripId,
          ...(d.data() as Omit<Expense, 'id' | 'tripId'>),
        })),
      );
    },
    onError,
  );
}

export async function createExpense(
  tripId: string,
  input: ExpenseInput,
  createdBy: string,
): Promise<string> {
  const ref = await addDoc(expensesCol(tripId), {
    ...serializeExpenseInput(input),
    tripId,
    createdBy,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateExpense(
  tripId: string,
  expenseId: string,
  input: ExpenseInput,
): Promise<void> {
  await updateDoc(doc(expensesCol(tripId), expenseId), {
    ...serializeExpenseInput(input),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteExpense(tripId: string, expenseId: string): Promise<void> {
  await deleteDoc(doc(expensesCol(tripId), expenseId));
}
