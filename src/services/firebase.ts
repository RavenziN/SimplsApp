import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
// The database id is the third argument; inside the settings object it is ignored
// and the SDK silently falls back to '(default)', which does not exist in this project.
export const db = initializeFirestore(
  app,
  {
    // Optional fields (description, category, photoUrl) may be undefined; skip them instead of failing the write.
    ignoreUndefinedProperties: true,
  },
  firebaseConfig.firestoreDatabaseId || '(default)'
);
