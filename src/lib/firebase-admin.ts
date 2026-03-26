
import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

if (!admin.apps.length) {
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    admin.initializeApp({
      projectId: 'mindmate-80e5c',
    });
  } else {
    try {
      const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
      if (!fs.existsSync(serviceAccountPath)) {
        throw new Error(`serviceAccountKey.json not found.`);
      }
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // Simplified Storage Initialization
        storageBucket: 'mindmate-80e5c.appspot.com', 
      });
    } catch (error: any) {
      console.error("Firebase Admin Init Failed:", error.message);
      throw error;
    }
  }
}

const adminDb = admin.firestore();
const adminMessaging = admin.messaging();
// Use the default bucket directly
const adminBucket = admin.storage().bucket();

export { adminDb, adminMessaging, adminBucket };
