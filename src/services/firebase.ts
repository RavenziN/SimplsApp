import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = initializeFirestore(app, {
  databaseId: (firebaseConfig as any).firestoreDatabaseId || '(default)',
  // Optional fields (description, category, photoUrl) may be undefined; skip them instead of failing the write.
  ignoreUndefinedProperties: true,
} as any);
