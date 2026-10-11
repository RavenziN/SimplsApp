import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { onSchedule } from 'firebase-functions/v2/scheduler';

initializeApp();

const FIRESTORE_DB_ID = 'ai-studio-dayagendadiriami-df797b24-bb81-4f3b-a710-b0cb6470739c';
const db = getFirestore(FIRESTORE_DB_ID);
const messaging = getMessaging();

export const sendTaskNotifications = onSchedule('every 1 minutes', async () => {
  const now = new Date();
  // Round down to the start of the current minute so we always check a full minute window
  const startOfMinute = new Date(now);
  startOfMinute.setSeconds(0, 0);
  const endOfMinute = new Date(startOfMinute.getTime() + 60_000);

  // Query only by startAt range (auto-indexed single field) and filter the
  // rest in-memory to avoid needing a composite index.
  const tasksSnap = await db
    .collection('tasks')
    .where('startAt', '>=', startOfMinute.toISOString())
    .where('startAt', '<', endOfMinute.toISOString())
    .get();

  if (tasksSnap.empty) return;

  const batch = db.batch();
  const sends: Promise<void>[] = [];

  for (const taskDoc of tasksSnap.docs) {
    const task = taskDoc.data();
    if (!task.hasSpecificTime || task.notifiedAt != null) continue;

    const userDoc = await db.collection('users').doc(task.userId as string).get();
    if (!userDoc.exists) continue;

    const fcmToken: string | undefined = (userDoc.data() as { fcmToken?: string })?.fcmToken;
    if (!fcmToken) continue;

    sends.push(
      messaging
        .send({
          token: fcmToken,
          notification: {
            title: task.title as string,
            body: (task.description as string | undefined) || 'Hora do compromisso!',
          },
          webpush: {
            notification: {
              icon: 'https://simplss.netlify.app/pwa-192x192.png',
              badge: 'https://simplss.netlify.app/pwa-192x192.png',
              vibrate: [200, 100, 200],
              requireInteraction: false,
            },
            fcmOptions: {
              link: 'https://simplss.netlify.app',
            },
          },
        })
        .then(() => {
          batch.update(taskDoc.ref, { notifiedAt: new Date().toISOString() });
        })
        .catch((err: Error) => {
          console.error(`Failed to notify task ${task.id as string}:`, err.message);
          // If the token is no longer valid, clear it so we don't retry
          if (err.message.includes('registration-token-not-registered')) {
            db.collection('users')
              .doc(task.userId as string)
              .update({ fcmToken: null })
              .catch(() => undefined);
          }
        })
    );
  }

  await Promise.all(sends);
  await batch.commit().catch(console.error);
});

 
