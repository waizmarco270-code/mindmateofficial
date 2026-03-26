
import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

/**
 * @fileOverview Firebase Admin SDK Initialization
 * Handles both local development (using serviceAccountKey.json) 
 * and production (using FIREBASE_SERVICE_ACCOUNT environment variable).
 */

if (!admin.apps.length) {
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    admin.initializeApp({
      projectId: 'mindmate-80e5c',
    });
  } else {
    try {
      let serviceAccount;

      // 1. Check for Service Account JSON string in Environment Variables (Best for Vercel)
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      } 
      // 2. Fallback to local file (Best for local dev)
      else {
        const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
        if (fs.existsSync(serviceAccountPath)) {
          serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        }
      }

      if (serviceAccount) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: 'mindmate-80e5c.appspot.com', 
        });
      } else {
        throw new Error("No Firebase Service Account credentials found. Set FIREBASE_SERVICE_ACCOUNT env var or add serviceAccountKey.json.");
      }
    } catch (error: any) {
      console.error("Firebase Admin Init Failed:", error.message);
      throw error;
    }
  }
}

const adminDb = admin.firestore();
const adminMessaging = admin.messaging();
const adminBucket = admin.storage().bucket();

export { adminDb, adminMessaging, adminBucket };
