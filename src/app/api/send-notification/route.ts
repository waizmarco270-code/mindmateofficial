
import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminMessaging, adminBucket } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import * as admin from 'firebase-admin';

// Helper to upload a base64 image to Firebase Storage.
async function uploadImageFromBase64(base64: string): Promise<string> {
    try {
        const base64EncodedImageString = base64.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64EncodedImageString, 'base64');
        const fileId = uuidv4();
        const filePath = `notification-images/${fileId}.png`;
        const file = adminBucket.file(filePath);
        
        await file.save(imageBuffer, { 
            metadata: { contentType: 'image/png' }, 
            public: true,
            resumable: false // Better for small serverless uploads
        });
        
        return `https://storage.googleapis.com/${adminBucket.name}/${filePath}`;
    } catch (e: any) {
        console.error("Storage Upload Error:", e.message);
        throw new Error("Failed to upload image. Ensure Firebase Storage is initialized in your console.");
    }
}

export async function POST(req: NextRequest) {
  try {
    const { title, message, userId, linkUrl, scheduledAt, imageBase64 } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ success: false, message: 'Title and message are required' }, { status: 400 });
    }

    let finalImageUrl = '';
    if (imageBase64) {
      finalImageUrl = await uploadImageFromBase64(imageBase64);
    }

    const target = userId ? `user:${userId}` : 'all';
    const appLogo = 'https://mindmateofficial.vercel.app/logo.jpg';

    // Handle scheduled notifications
    if (scheduledAt) {
      const docRef = await adminDb.collection('scheduledNotifications').add({
        title, 
        message, 
        imageUrl: finalImageUrl || null, 
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
      return NextResponse.json({ success: true, title: "No Users Found", message: 'The alert was not dispatched as no legends are currently subscribed.' });
    }

    const messagePayload: admin.messaging.MulticastMessage = {
      notification: {
        title,
        body: message,
        imageUrl: finalImageUrl || undefined,
      },
      webpush: {
        notification: {
          icon: appLogo,
          badge: appLogo,
          image: finalImageUrl || undefined,
          requireInteraction: true,
        },
        fcmOptions: {
          link: linkUrl || 'https://mindmateofficial.vercel.app/dashboard'
        }
      },
      tokens,
    };

    const response = await adminMessaging.sendEachForMulticast(messagePayload);
    const dispatchSummary = `${response.successCount} sent, ${response.failureCount} failed`;

    // Save to history
    await adminDb.collection('sentNotifications').add({ 
        title, 
        message, 
        imageUrl: finalImageUrl || null, 
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
