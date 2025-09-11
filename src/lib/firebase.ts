
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "mindmate-255b5.firebaseapp.com",
  projectId: "mindmate-255b5",
  storageBucket: "mindmate-255b5.appspot.com",
  messagingSenderId: "34938363632",
  appId: "1:34938363632:web:65d386189912759929213c",
  databaseURL: "https://mindmate-255b5-default-rtdb.firebaseio.com"
};

// Initialize Firebase App (Singleton Pattern)
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);

export { app as firebaseApp, auth, db, storage, rtdb };
