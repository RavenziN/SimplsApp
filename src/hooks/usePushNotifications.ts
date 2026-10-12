import { useEffect, useCallback, useState } from 'react';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { app, db } from '../services/firebase';

const VAPID_KEY = 'BHUz2vf6LOlkNPdNF_MaFGLjxn1cNAg0RR4eeOS2EzQ7T8Qes6P40kVqfgf9DoJur8s_ek1Ti0QzP1vXo7bJVoA';

async function setupMessaging(userId: string): Promise<boolean> {
  const supported = await isSupported();
  if (!supported) return false;

  const messaging = getMessaging(app);
  const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg });

  if (token) {
    await setDoc(doc(db, 'users', userId), { fcmToken: token }, { merge: true });
  }

  // FCM foreground messages: the SW handles display, nothing extra needed here.
  onMessage(messaging, () => undefined);

  return !!token;
}

export type NotificationPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export function usePushNotifications(userId: string | null) {
  const [permissionState, setPermissionState] = useState<NotificationPermissionState>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission as NotificationPermissionState;
  });

  // On mount: if permission was already granted, silently register to keep token fresh
  useEffect(() => {
    if (!userId) return;
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    if (Notification.permission !== 'granted') return;

    setupMessaging(userId).catch((err) => {
      console.error('[Push] token refresh failed:', err);
    });
  }, [userId]);

  // Must be called from a user gesture (e.g. button click) — iOS requires this
  const requestPermission = useCallback(async (): Promise<NotificationPermissionState> => {
    if (!userId) return 'unsupported';
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'unsupported';

    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission as NotificationPermissionState);
      if (permission !== 'granted') return permission as NotificationPermissionState;

      await setupMessaging(userId);
      return 'granted';
    } catch (err) {
      console.error('[Push] requestPermission failed:', err);
      return 'denied';
    }
  }, [userId]);

  return { permissionState, requestPermission };
}
