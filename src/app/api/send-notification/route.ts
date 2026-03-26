import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminMessaging, adminBucket } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import * as admin from 'firebase-admin';

// Helper to upload a base64 image to Firebase Storage.
async function uploadImageFromBase64(base64: string): Promise<string> {
    const base64EncodedImageString = base64.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64EncodedImageString, 'base64');
    const fileId = uuidv4();
    const filePath = `notification-images/${fileId}.png`;
    const file = adminBucket.file(filePath);
    await file.save(imageBuffer, { metadata: { contentType: 'image/png' }, public: true });
    return file.publicUrl();
}

// API route handler for sending notifications.
export async function POST(req: NextRequest) {
  // This top-level try-catch is our last line of defense.
  try {
    console.log("--- API: send-notification invoked ---");
    const { title, message, userId, linkUrl, scheduledAt, imageBase64 } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ success: false, message: 'Title and message are required' }, { status: 400 });
    }

    let finalImageUrl = '';
    if (imageBase64) {
      console.log("Image detected, starting upload...");
      finalImageUrl = await uploadImageFromBase64(imageBase64);
      console.log("Image upload complete. URL:", finalImageUrl);
    }

    const target = userId ? `user:${userId}` : 'all';

    // Handle scheduled notifications (this part is likely not the problem).
    if (scheduledAt) {
      console.log("Scheduling notification for:", new Date(scheduledAt).toISOString());
      await adminDb.collection('scheduledNotifications').add({
        title, message, imageUrl: finalImageUrl || null, linkUrl: linkUrl || null, target,
        scheduledAt: Timestamp.fromMillis(scheduledAt), status: 'pending',
      });
      return NextResponse.json({ success: true, title: "Notification Scheduled!", message: `Will be sent at ${new Date(scheduledAt).toLocaleString()}` });
    }

    // --- IMMEDIATE SENDING LOGIC ---
    console.log("--- Starting Immediate Notification Send ---");

    let tokens: string[] = [];
    if (userId) {
      const tokenDoc = await adminDb.collection('fcmTokens').doc(userId).get();
      if (tokenDoc.exists) { const token = tokenDoc.data()!.token; if (token) tokens.push(token); }
    } else {
      const tokensSnapshot = await adminDb.collection('fcmTokens').get();
      tokens = tokensSnapshot.docs.map(doc => doc.data().token).filter(token => token);
    }
    console.log(`Found ${tokens.length} tokens to send to.`);

    if (tokens.length === 0) {
      console.log("No subscribed users found. Storing notification as 'sent'.");
      await adminDb.collection('sentNotifications').add({ title, message, imageUrl: finalImageUrl || null, linkUrl, sentAt: Timestamp.now(), status: 'No users subscribed', target });
      return NextResponse.json({ success: true, title: "No Users Subscribed", message: 'The notification was not sent as no users are subscribed.' });
    }

    // --- PAYLOAD CONSTRUCTION (DIAGNOSTIC STEP) ---
    // The 'data' payload has been REMOVED to isolate the problem.
    // If the error disappears, we know the 'data' payload was the cause.
    const notificationPayload: admin.messaging.Notification = { title, body: message };
    if (finalImageUrl) {
      notificationPayload.imageUrl = finalImageUrl;
    }

    const messagePayload: admin.messaging.MulticastMessage = {
      notification: notificationPayload,
      tokens,
      // The 'data' property is intentionally omitted for this test.
    };

    console.log("Constructed FCM payload (DIAGNOSTIC - NO DATA):", JSON.stringify(messagePayload, null, 2));

    const response = await adminMessaging.sendEachForMulticast(messagePayload);
    console.log("Successfully received response from FCM.");
    const status = `${response.successCount} sent, ${response.failureCount} failed`;

    await adminDb.collection('sentNotifications').add({ title, message, imageUrl: finalImageUrl || null, linkUrl, sentAt: Timestamp.now(), status, target });

    return NextResponse.json({ success: true, title: "Notification Sent!", message: `Success: ${response.successCount}, Failure: ${response.failureCount}` });

  } catch (error: any) {
    // If this block runs, the user will get a proper JSON error, not a DOCTYPE error.
    console.error("--- CATCH BLOCK TRIGGERED IN send-notification API ---");
    console.error(`This means the crash is catchable. We are getting close.`);
    console.error(`Error Name: ${error.name}`);
    console.error(`Error Message: ${error.message}`);
    console.error(`Error Stack: ${error.stack}`);
    return NextResponse.json({ success: false, message: 'A fatal internal server error occurred. Check the server logs.' }, { status: 500 });
  }
}
