import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Collections } from '@/config/constants';
import { UserProfile } from '@/types';

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, Collections.USERS, uid));
  if (!snap.exists()) return null;
  return { ...(snap.data() as UserProfile), uid: snap.id };
}

export async function getUsersByIds(uids: string[]): Promise<UserProfile[]> {
  const promises = uids.map((uid) => getUserProfile(uid));
  const results = await Promise.all(promises);
  return results.filter((u): u is UserProfile => u !== null);
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const q = query(
    collection(db, Collections.USERS),
    where('email', '==', email.toLowerCase().trim()),
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { ...(d.data() as UserProfile), uid: d.id };
}

export async function updateUserProfile(
  uid: string,
  data: Partial<Pick<UserProfile, 'displayName' | 'photoURL'>>,
): Promise<void> {
  await updateDoc(doc(db, Collections.USERS, uid), data);
}
