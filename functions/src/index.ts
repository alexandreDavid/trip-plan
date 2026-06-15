import * as admin from 'firebase-admin';
import { onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { beforeUserCreated } from 'firebase-functions/v2/identity';

admin.initializeApp();
const db = admin.firestore();

/**
 * Suppression en cascade : quand un trip est supprime, on supprime tous les
 * sous-documents (days + events).
 */
export const onTripDelete = onDocumentDeleted('trips/{tripId}', async (event) => {
  const { tripId } = event.params;
  const daysRef = db.collection('trips').doc(tripId).collection('days');
  const daysSnap = await daysRef.get();

  const batch = db.batch();
  for (const dayDoc of daysSnap.docs) {
    const eventsSnap = await dayDoc.ref.collection('events').get();
    eventsSnap.docs.forEach((e) => batch.delete(e.ref));
    batch.delete(dayDoc.ref);
  }
  await batch.commit();
});

/**
 * Creation automatique du document user dans Firestore a la creation du compte.
 * Note : le client cree deja le document (authService.ensureUserDocument), mais
 * cette function sert de filet de securite pour les inscriptions OAuth.
 */
export const onUserCreate = beforeUserCreated(async (event) => {
  const user = event.data;
  if (!user) return;
  const userRef = db.collection('users').doc(user.uid);
  const existing = await userRef.get();
  if (existing.exists) return;
  await userRef.set({
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? user.email?.split('@')[0] ?? 'Utilisateur',
    photoURL: user.photoURL ?? null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
});
