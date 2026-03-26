
import * as admin from 'firebase-admin';

/**
 * @fileOverview Secure Firebase Admin SDK Initialization
 * This implementation EXCLUSIVELY uses environment variables for security.
 * Local serviceAccountKey.json is ignored to prevent leaks.
 */

if (!admin.apps.length) {
  try {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (serviceAccountVar) {
      // Handle both stringified JSON and potential escaped characters from Vercel
      const serviceAccount = serviceAccountVar.startsWith('{') 
        ? JSON.parse(serviceAccountVar) 
        : JSON.parse(Buffer.from(serviceAccountVar, 'base64').toString());

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'mindmate-80e5c.firebasestorage.app', 
      });
      console.log("Firebase Admin Initialized via Environment Variable.");
    } else {
      // Fallback for local emulator development only
      if (process.env.NODE_ENV === 'development' && process.env.FIREBASE_AUTH_EMULATOR_HOST) {
        admin.initializeApp({
          projectId: 'mindmate-80e5c',
        });
      } else {
        console.warn("CRITICAL: FIREBASE_SERVICE_ACCOUNT environment variable is missing.");
      }
    }
  } catch (error: any) {
    console.error("Firebase Admin Init Failed:", error.message);
  }
}

const adminDb = admin.firestore();
const adminMessaging = admin.messaging();
const adminBucket = admin.storage().bucket();

export { adminDb, adminMessaging, adminBucket };
