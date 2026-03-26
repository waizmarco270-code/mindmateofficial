
import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import serviceAccount from '../../../../../serviceAccountKey.json';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

const db = getFirestore();

// This is the cron job handler
export async function GET(req: NextRequest) {
  // Simple secret to protect the endpoint
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('Cron job started: Checking for scheduled notifications...');

  try {
    const now = Timestamp.now();
    const scheduledNotifsQuery = db.collection('scheduledNotifications')
      .where('scheduledAt', '<=', now)
      .where('status', '==', 'pending');

    const snapshot = await scheduledNotifsQuery.get();

    if (snapshot.empty) {
      console.log('No pending notifications to send.');
      return NextResponse.json({ message: 'No pending notifications.' });
    }

    const promises = snapshot.docs.map(async (doc) => {
      const notif = doc.data() as {
        title: string;
        message: string;
        target: string;
        imageUrl?: string;
        linkUrl?: string;
      };

      let tokens: string[] = [];
      const targetIsAll = notif.target === 'all';

      if (targetIsAll) {
        const tokensSnapshot = await db.collection('fcmTokens').get();
        if (!tokensSnapshot.empty) {
          tokens = tokensSnapshot.docs.map(t => t.data().token);
        }
      } else if (notif.target.startsWith('user:')) {
        const userId = notif.target.split(':')[1];
        const tokenRef = db.collection('fcmTokens').doc(userId);
        const docSnap = await tokenRef.get();
        if (docSnap.exists) {
          tokens.push(docSnap.data()!.token);
        }
      }

      if (tokens.length > 0) {
        const messagePayload: admin.messaging.MulticastMessage = {
          notification: {
            title: notif.title,
            body: notif.message,
            ...(notif.imageUrl && { imageUrl: notif.imageUrl }),
          },
          webpush: {
            notification: {
                ...(notif.imageUrl && { image: notif.imageUrl }),
            },
            fcmOptions: {
                ...(notif.linkUrl && { link: notif.linkUrl })
            }
          },
          tokens,
        };
        
        const response = await admin.messaging().sendEachForMulticast(messagePayload);
        const status = `${response.successCount} sent, ${response.failureCount} failed`;
        
        // Log to main history and update scheduled notification status
        await db.collection('sentNotifications').add({ ...notif, sentAt: FieldValue.serverTimestamp(), status });
        await doc.ref.update({ status: 'sent' });

        console.log(`Sent scheduled notification "${notif.title}": ${status}`)

      } else {
        // If no tokens found, mark as failed
        await doc.ref.update({ status: 'failed', reason: 'No tokens found for target' });
        console.log(`Failed to send scheduled notification "${notif.title}": No tokens found.`);
      }
    });

    await Promise.all(promises);

    return NextResponse.json({ message: `Processed ${snapshot.size} notifications.` });

  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
