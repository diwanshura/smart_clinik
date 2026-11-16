// Firebase Cloud Messaging (push notifications), loaded lazily in the browser only.
import { FIREBASE_CONFIG, FIREBASE_ENABLED, FIREBASE_VAPID_KEY } from '@/lib/config';

export function isPushSupported() {
  return (
    FIREBASE_ENABLED &&
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function getPushPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

/**
 * Registers the service worker, (optionally) asks for permission, and returns an FCM token.
 *
 * @param {object}   opts
 * @param {boolean}  opts.requestPermission  Ask the browser for permission if it is still "default".
 * @param {Function} opts.onForeground       Called with {title, body} when a push arrives while the app is open.
 * @returns {Promise<string|null>} the FCM token, or null when unavailable / not permitted.
 */
export async function registerPush({ requestPermission = false, onForeground } = {}) {
  if (!isPushSupported()) return null;

  let permission = Notification.permission;
  if (permission === 'default' && requestPermission) {
    permission = await Notification.requestPermission();
  }
  if (permission !== 'granted') return null;

  const [{ initializeApp, getApps, getApp }, { getMessaging, getToken, onMessage, isSupported }] =
    await Promise.all([import('firebase/app'), import('firebase/messaging')]);

  if (!(await isSupported())) return null;

  const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
  const messaging = getMessaging(app);

  // The service worker cannot read process.env, so the public config is passed in the URL.
  const swUrl = `/firebase-messaging-sw.js?${new URLSearchParams(FIREBASE_CONFIG).toString()}`;
  const registration = await navigator.serviceWorker.register(swUrl);

  const token = await getToken(messaging, {
    vapidKey: FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (onForeground) {
    onMessage(messaging, (payload) => {
      onForeground({
        title: payload.notification?.title || 'Smart Clinic',
        body: payload.notification?.body || 'You have a new notification',
      });
    });
  }

  return token || null;
}
