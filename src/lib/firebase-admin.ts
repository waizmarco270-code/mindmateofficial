
import * as admin from 'firebase-admin';

/**
 * @fileOverview Secure Firebase Admin SDK Initialization
 * This implementation handles raw JSON strings from environment variables ONLY.
 * IT DOES NOT USE A LOCAL FILE TO PREVENT SECURITY LEAKS.
 */

if (!admin.apps.length) {
  try {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (serviceAccountVar) {
      let serviceAccount;
      try {
        // Attempt to parse the JSON string directly
        serviceAccount = JSON.parse(serviceAccountVar);
      } catch (e) {
        // Fallback: If it's Base64 encoded (some environments prefer this)
        try {
            serviceAccount = JSON.parse(Buffer.from(serviceAccountVar, 'base64').toString());
        } catch (err) {
            throw new Error("FIREBASE_SERVICE_ACCOUNT is neither valid JSON nor valid Base64 JSON.");
        }
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'mindmate-80e5c',
      });
      console.log("Firebase Admin Initialized successfully from Environment Variable.");
    } else {
      // For local development, we expect the user to have FIREBASE_SERVICE_ACCOUNT in .env.local
      console.warn("WARNING: FIREBASE_SERVICE_ACCOUNT is missing. Notifications will not be dispatched.");
      admin.initializeApp({
        projectId: 'mindmate-80e5c',
      });
    }
  } catch (error: any) {
    console.error("Firebase Admin Init Failed:", error.message);
  }
}

const adminDb = admin.firestore();
const adminMessaging = admin.messaging();

export { adminDb, adminMessaging };
