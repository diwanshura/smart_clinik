// Firebase Cloud Messaging service worker: shows push notifications while the app is closed.
// The public Firebase web config is passed in the registration URL query string
// (see lib/firebase.js), so no keys are hard-coded here.
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const params = new URL(self.location.href).searchParams;
const config = Object.fromEntries(params.entries());

if (config.apiKey && config.projectId && config.messagingSenderId && config.appId) {
  firebase.initializeApp(config);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || 'Smart Clinic';
    self.registration.showNotification(title, {
      body: payload.notification?.body || 'You have a new notification',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: payload.data,
    });
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url.includes('/patient') && 'focus' in client) return client.focus();
      }
      return clients.openWindow('/patient/dashboard');
    })
  );
});
