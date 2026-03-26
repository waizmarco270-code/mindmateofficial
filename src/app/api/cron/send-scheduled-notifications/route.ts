
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminMessaging } from '@/lib/firebase-admin';
import { Timestamp, FieldValue } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

/**
 * CRON Job Handler
 * This route should be triggered periodically (e.g. every 1 minute)
 */
export async function GET(req: NextRequest) {
  console.log('CRON: Checking for due notifications...');

  try {
    const now = Timestamp.now();
    const pendingQuery = adminDb.collection('scheduledNotifications')
      .where('status', '==', 'pending')
      .where('scheduledAt', '<=', now);

    const snapshot = await pendingQuery.get();

    if (snapshot.empty) {
      return NextResponse.json({ message: 'No pending notifications due.' });
    }

    const appLogo = 'https://mindmateofficial.vercel.app/logo.jpg';
    let processedCount = 0;

    for (const doc of snapshot.docs) {
      const notif = doc.data();
      const tokens: string[] = [];

      // Get target tokens
      if (notif.target === 'all') {
        const tokensSnap = await adminDb.collection('fcmTokens').get();
        tokensSnap.docs.forEach(t => {
            const token = t.data().token;
            if(token) tokens.push(token);
        });
      } else if (notif.target.startsWith('user:')) {
        const userId = notif.target.split(':')[1];
        const tokenDoc = await adminDb.collection('fcmTokens').doc(userId).get();
        if (tokenDoc.exists) {
            const token = tokenDoc.data()?.token;
            if(token) tokens.push(token);
        }
      }

      if (tokens.length > 0) {
        try {
            const messagePayload: admin.messaging.MulticastMessage = {
                notification: {
                    title: notif.title,
                    body: notif.message,
                    imageUrl: notif.imageUrl || undefined,
                },
                webpush: {
                    notification: {
                        icon: appLogo,
                        badge: appLogo,
                        image: notif.imageUrl || undefined,
                    },
                    fcmOptions: {
                        link: notif.linkUrl || 'https://mindmateofficial.vercel.app/dashboard'
                    }
                },
                tokens,
            };

            const response = await adminMessaging.sendEachForMulticast(messagePayload);
            const summary = `${response.successCount} sent, ${response.failureCount} failed`;
            
            // Move to history and mark as sent
            await adminDb.collection('sentNotifications').add({
                ...notif,
                sentAt: Timestamp.now(),
                status: 'Completed',
                dispatchSummary: summary
            });
            await doc.ref.update({ status: 'sent', sentAt: Timestamp.now() });
            processedCount++;
        } catch (e: any) {
            await doc.ref.update({ status: 'failed', failureReason: e.message });
        }
      } else {
        await doc.ref.update({ status: 'failed', failureReason: 'No subscriber tokens found for target.' });
      }
    }

    return NextResponse.json({ success: true, processed: processedCount });

  } catch (error: any) {
    console.error("CRON Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
