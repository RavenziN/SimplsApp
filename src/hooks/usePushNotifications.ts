import { useEffect } from 'react';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { app, db } from '../services/firebase';

const VAPID_KEY = 'BHUz2vf6LOlkNPdNF_MaFGLjxn1cNAg0RR4eeOS2EzQ7T8Qes6P40kVqfgf9DoJur8s_ek1Ti0QzP1vXo7bJVoA';

export function usePushNotifications(userId: string | null) {
  useEffect(() => {
    if (!userId) return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    let unsubOnMessage: (() => void) | undefined;

    (async () => {
      try {
        const supported = await isSupported();
        if (!supported) return;

        const messaging = getMessaging(app);

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swReg,
        });

        if (token) {
          await setDoc(doc(db, 'users', userId), { fcmToken: token }, { merge: true });
        }

        // Show notifications when the app is in the foreground
        unsubOnMessage = onMessage(messaging, (payload) => {
          const title = payload.notification?.title ?? 'Simpls';
          const body = payload.notification?.body ?? '';
          if (Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/pwa-192x192.png' });
          }
        });
      } catch (err) {
        console.error('[Push] setup failed:', err);
      }
    })();

    return () => unsubOnMessage?.();
  }, [userId]);
}
