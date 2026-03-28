
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminMessaging } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const now = Timestamp.now();
    const pendingQuery = adminDb.collection('scheduledNotifications')
      .where('status', '==', 'pending')
      .where('scheduledAt', '<=', now);

    const snapshot = await pendingQuery.get();

    if (snapshot.empty) {
      return NextResponse.json({ success: true, message: 'No pending notifications due.' });
    }

    const SITE_URL = 'https://mindmate.emitygate.com';
    const appLogo = `${SITE_URL}/logo.jpg`;
    let processedCount = 0;

    for (const doc of snapshot.docs) {
      const notif = doc.data();
      let tokens: string[] = [];

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
                        link: notif.linkUrl ? `${SITE_URL}${notif.linkUrl}` : `${SITE_URL}/dashboard`
                    }
                },
                tokens,
            };

            const response = await adminMessaging.sendEachForMulticast(messagePayload);
            const summary = `${response.successCount} sent, ${response.failureCount} failed`;
            
            await doc.ref.update({ 
                status: 'sent', 
                sentAt: Timestamp.now(),
                dispatchSummary: summary 
            });

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
