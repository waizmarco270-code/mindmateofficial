
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyATUcEV5XGgj5oMkAv1a5Xh-6jZApOXVBw",
  authDomain: "mindmate-80e5c.firebaseapp.com",
  projectId: "mindmate-80e5c",
  storageBucket: "mindmate-80e5c.appspot.com",
  messagingSenderId: "1040365164281",
  appId: "1:1040365164281:web:3cf995fb97fe775c33b428"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize Firebase Cloud Messaging
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export { app as firebaseApp, db, auth, messaging };
