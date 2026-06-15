import { initializeApp, getApps, getApp } from 'firebase/app';
import { Auth, getAuth, initializeAuth } from 'firebase/auth';
// getReactNativePersistence n'est typé que dans l'entrée RN de `firebase/auth`.
// Metro résout bien la fonction au runtime sur natif ; on contourne le typage.
// @ts-ignore
import { getReactNativePersistence } from 'firebase/auth';
import {
  Firestore,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Auth : persistance de la session entre les redémarrages.
// - Web : persistance locale (localStorage) par défaut via getAuth.
// - Natif (iOS/Android) : AsyncStorage via initializeAuth. Le try/catch évite le
//   crash "auth already initialized" lors du Fast Refresh en développement.
function initAuth(): Auth {
  if (Platform.OS === 'web') return getAuth(app);
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}

// Firestore : le cache disque persistant (cross-restart) s'appuie sur IndexedDB,
// disponible uniquement sur web. Sur natif, le SDK JS ne garde qu'un cache mémoire
// (offline en session : les lectures restent servies et les écritures sont mises
// en file pendant une coupure réseau, mais rien ne survit à un redémarrage).
// Une persistance disque durable sur natif nécessiterait @react-native-firebase.
function initDb(): Firestore {
  if (Platform.OS === 'web') {
    try {
      return initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
      });
    } catch {
      return getFirestore(app);
    }
  }
  return getFirestore(app);
}

export const auth = initAuth();
export const db = initDb();
export const storage = getStorage(app);

export default app;
