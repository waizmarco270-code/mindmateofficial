
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminMessaging } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

/**
 * Force dynamic execution to prevent build-time errors with Firebase Admin
 */
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { title, message, userId, linkUrl, scheduledAt, imageUrl } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ success: false, message: 'Title and message are required' }, { status: 400 });
    }

    const target = userId ? `user:${userId}` : 'all';
    // Use absolute URL for the logo if possible, but relative works with a proper SW
    const appLogo = '/logo.jpg';

    // Handle scheduled notifications
    if (scheduledAt) {
      await adminDb.collection('scheduledNotifications').add({
        title, 
        message, 
        imageUrl: imageUrl || null, 
        linkUrl: linkUrl || null, 
        target,
        scheduledAt: Timestamp.fromMillis(scheduledAt), 
        status: 'pending',
        createdAt: Timestamp.now(),
      });
      return NextResponse.json({ 
        success: true, 
        title: "Notification Scheduled!", 
        message: `Mission queued for dispatch at ${new Date(scheduledAt).toLocaleString()}` 
      });
    }

    // IMMEDIATE SENDING LOGIC
    let tokens: string[] = [];
    if (userId) {
      const tokenDoc = await adminDb.collection('fcmTokens').doc(userId).get();
      if (tokenDoc.exists) { 
        const token = tokenDoc.data()?.token; 
        if (token) tokens.push(token); 
      }
    } else {
      const tokensSnapshot = await adminDb.collection('fcmTokens').get();
      tokens = tokensSnapshot.docs.map(doc => doc.data().token).filter(token => token);
    }

    if (tokens.length === 0) {
      console.log(`Dispatch: No active tokens found for target: ${target}`);
      await adminDb.collection('sentNotifications').add({ 
          title, message, imageUrl: imageUrl || null, linkUrl: linkUrl || null, 
          sentAt: Timestamp.now(), status: 'Completed', dispatchSummary: '0 sent (no active subscribers)', target 
      });
      return NextResponse.json({ success: true, title: "No Subscribers", message: 'Alert saved but not dispatched - no active legends found.' });
    }

    const messagePayload: admin.messaging.MulticastMessage = {
      notification: {
        title,
        body: message,
        imageUrl: imageUrl || undefined,
      },
      data: {
        title,
        body: message,
        image: imageUrl || '',
        link: linkUrl || '/dashboard'
      },
      webpush: {
        notification: {
          icon: appLogo,
          badge: appLogo,
          image: imageUrl || undefined,
          requireInteraction: true,
        },
        fcmOptions: {
          link: linkUrl || '/dashboard'
        }
      },
      tokens,
    };

    const response = await adminMessaging.sendEachForMulticast(messagePayload);
    const dispatchSummary = `${response.successCount} sent, ${response.failureCount} failed`;
    
    console.log(`FCM Multicast Result: ${dispatchSummary}`);

    await adminDb.collection('sentNotifications').add({ 
        title, 
        message, 
        imageUrl: imageUrl || null, 
        linkUrl: linkUrl || null, 
        sentAt: Timestamp.now(), 
        status: 'Completed',
        dispatchSummary,
        target 
    });

    return NextResponse.json({ 
        success: true, 
        title: "Dispatch Successful!", 
        message: `Results: ${dispatchSummary}` 
    });

  } catch (error: any) {
    console.error("API Dispatch Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
