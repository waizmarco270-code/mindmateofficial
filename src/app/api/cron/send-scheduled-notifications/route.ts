
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminMessaging } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

/**
 * CRON Job Handler
 * This route is triggered by the background heartbeat in layout.tsx
 */
export async function GET(req: NextRequest) {
  console.log('CRON: Heartbeat check for due notifications...');

  try {
    const now = Timestamp.now();
    // Query for pending notifications that are due
    const pendingQuery = adminDb.collection('scheduledNotifications')
      .where('status', '==', 'pending')
      .where('scheduledAt', '<=', now);

    const snapshot = await pendingQuery.get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, message: 'No pending notifications due.' });
    }

    const appLogo = 'https://mindmateofficial.vercel.app/logo.jpg';
    let processedCount = 0;

    for (const doc of snapshot.docs) {
      const notif = doc.data();
      let tokens: string[] = [];

      // Identify targets
      if (notif.target === 'all') {
        const tokensSnap = await adminDb.collection('fcmTokens').get();
        tokens = tokensSnap.docs.map(t => t.data().token).filter(Boolean);
      } else if (notif.target.startsWith('user:')) {
        const userId = notif.target.split(':')[1];
        const tokenDoc = await adminDb.collection('fcmTokens').doc(userId).get();
        if (tokenDoc.exists) {
            const t = tokenDoc.data()?.token;
            if (t) tokens.push(t);
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
            
            // Mark as sent and record summary
            await doc.ref.update({ 
                status: 'sent', 
                sentAt: Timestamp.now(),
                dispatchSummary: summary 
            });

            // Add to history
            await adminDb.collection('sentNotifications').add({
                ...notif,
                sentAt: Timestamp.now(),
                status: 'Completed',
                dispatchSummary: summary
            });

            processedCount++;
        } catch (e: any) {
            await doc.ref.update({ status: 'failed', failureReason: e.message });
        }
      } else {
        await doc.ref.update({ status: 'failed', failureReason: 'No subscriber tokens found.' });
      }
    }

    return NextResponse.json({ success: true, processed: processedCount });

  } catch (error: any) {
    console.error("CRON Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
