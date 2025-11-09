// Firebase configuration
// TODO: Replace with your Firebase config
// Get these values from Firebase Console > Project Settings > General > Your apps

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Required env vars (exposed to client with NEXT_PUBLIC_ prefix)
const requiredEnv = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
]

const missing = requiredEnv.filter((k) => !process.env[k])

// Fail fast on the server in production-like environments, but avoid throwing
// during client-side hydration which causes React hydration errors.
const isServer = typeof window === 'undefined'
if (missing.length > 0) {
  // On the server, when not in development/test, throw to catch misconfiguration early
  if (isServer && process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  // In other environments (client or development), warn instead of throwing to avoid
  // breaking hydration; features dependent on Firebase will still fail if keys are invalid.
  if (!isServer) {
    // eslint-disable-next-line no-console
    console.warn(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // Fall back to the common <projectId>.appspot.com pattern if storage bucket is not set or looks unusual
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      ? `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`
      : undefined),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// In development, log which config keys are present to help debug auth/configuration-not-found.
if (process.env.NODE_ENV === 'development') {
  const presence = Object.fromEntries(
    Object.entries(firebaseConfig).map(([k, v]) => [k, Boolean(v)])
  )
  // eslint-disable-next-line no-console
  console.debug('[firebase] config presence:', presence)
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app

