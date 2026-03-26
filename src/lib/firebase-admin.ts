
import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

if (!admin.apps.length) {
  // THE CORRECT APPROACH: Check if we are inside the Firebase Emulator Suite
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    console.log("Firebase Emulator detected. Initializing Admin SDK for local development...");
    // If in the emulator, initialize without credentials. 
    // The SDK will automatically discover the running emulators.
    admin.initializeApp({
      projectId: 'mindmate-80e5c', // Use the actual project ID
      storageBucket: 'mindmate-80e5c.appspot.com',
    });
    console.log("SUCCESS: Firebase Admin SDK initialized for Emulator Suite.");
  } else {
    // FOR PRODUCTION: When deployed, use the service account file.
    console.log("No Firebase Emulator detected. Initializing for a deployed environment...");
    try {
      const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
      if (!fs.existsSync(serviceAccountPath)) {
        throw new Error(`PRODUCTION ERROR: serviceAccountKey.json not found in project root.`);
      }
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'mindmate-80e5c.appspot.com',
      });
      console.log("SUCCESS: Firebase Admin SDK initialized for production from file.");
    } catch (error: any) {
      console.error("--- !!! FATAL: PRODUCTION INITIALIZATION FAILED !!! ---");
      console.error(`Error Message: ${error.message}`);
      throw error;
    }
  }
}

const adminDb = admin.firestore();
const adminMessaging = admin.messaging();
const adminBucket = admin.storage().bucket();

export { adminDb, adminMessaging, adminBucket };
