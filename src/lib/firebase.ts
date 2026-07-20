import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

const ENV_KEYS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

type FirebaseEnvKey = (typeof ENV_KEYS)[number];

function readEnv(key: FirebaseEnvKey): string {
  const value = import.meta.env[key];
  return typeof value === 'string' ? value.trim() : '';
}

const config = {
  apiKey: readEnv('VITE_FIREBASE_API_KEY'),
  authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: readEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: readEnv('VITE_FIREBASE_APP_ID'),
};

const missingKeys = ENV_KEYS.filter((key) => !readEnv(key));

export const isFirebaseConfigured = missingKeys.length === 0;

export const firebaseConfigStatus = {
  configured: isFirebaseConfigured,
  missingKeys,
  projectId: config.projectId || null,
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let initError: string | null = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(config);
    db = getFirestore(app);
  } catch (err) {
    initError = err instanceof Error ? err.message : 'Firebase failed to initialize.';
    if (import.meta.env.DEV) {
      console.warn('[Nocturne] Firebase init failed — using local inventory.', initError);
    }
  }
} else if (import.meta.env.DEV) {
  console.info(
    '[Nocturne] Firebase not configured. Copy .env.example → .env and add your credentials. Using local inventory.',
  );
}

export function getDb(): Firestore {
  if (db) return db;
  if (initError) throw new Error(initError);
  throw new Error(
    `Firebase is not configured. Missing: ${missingKeys.join(', ')}. See .env.example.`,
  );
}

export function getFirebaseInitError(): string | null {
  return initError;
}
