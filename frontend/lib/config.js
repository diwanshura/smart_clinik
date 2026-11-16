// Central, environment-based configuration.
// NEXT_PUBLIC_* values are inlined by Next.js at build time and are visible in the browser,
// so only public identifiers belong here - never secrets.

const trimSlash = (value = '') => value.replace(/\/+$/, '');

// Local development falls back to the Express default port. Production has NO fallback:
// the URL must be provided through NEXT_PUBLIC_API_URL (e.g. on Vercel).
const devFallback = process.env.NODE_ENV !== 'production' ? 'http://localhost:5000' : '';

export const API_URL = trimSlash(process.env.NEXT_PUBLIC_API_URL || devFallback);
export const SOCKET_URL = trimSlash(process.env.NEXT_PUBLIC_SOCKET_URL || API_URL);

export const SHOW_DEMO_LOGINS = process.env.NEXT_PUBLIC_SHOW_DEMO_LOGINS === 'true';

export const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};
export const FIREBASE_VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';

export const FIREBASE_ENABLED = Boolean(
  FIREBASE_CONFIG.apiKey &&
    FIREBASE_CONFIG.projectId &&
    FIREBASE_CONFIG.messagingSenderId &&
    FIREBASE_CONFIG.appId &&
    FIREBASE_VAPID_KEY
);

export const DEMO_ACCOUNTS = [
  { role: 'Patient', email: 'patient@clinic.com', password: 'patient123' },
  { role: 'Doctor', email: 'doctor@clinic.com', password: 'doctor123' },
  { role: 'Admin', email: 'admin@clinic.com', password: 'admin123' },
];
