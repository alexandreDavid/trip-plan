import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/config/firebase';

export async function uploadTripCoverImage(tripId: string, localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const imageRef = ref(storage, `trips/${tripId}/cover.jpg`);
  await uploadBytes(imageRef, blob);
  return getDownloadURL(imageRef);
}

export async function deleteTripCoverImage(tripId: string): Promise<void> {
  try {
    await deleteObject(ref(storage, `trips/${tripId}/cover.jpg`));
  } catch (err) {
    // fichier inexistant : on ignore
  }
}
