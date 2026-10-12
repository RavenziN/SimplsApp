importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

// Activate new SW immediately so updated builds take effect without
// requiring the user to close all tabs or delete and re-add the PWA.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

firebase.initializeApp({
  apiKey: 'AIzaSyBfZnfQTObRebE4oB92v-Qgj-0lrXbX5JE',
  authDomain: 'simpls-app.firebaseapp.com',
  projectId: 'simpls-app',
  storageBucket: 'simpls-app.firebasestorage.app',
  messagingSenderId: '629003659260',
  appId: '1:629003659260:web:502cf2bde78b87445af479',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Simpls';
  const body = payload.notification?.body || '';
  self.registration.showNotification(title, {
    body,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    tag: 'simpls-task',
    renotify: true,
    data: payload.data,
  });
});
