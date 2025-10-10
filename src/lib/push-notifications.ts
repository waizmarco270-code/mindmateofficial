
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { firebaseApp, db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

export const initializePushNotifications = async (userId: string) => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('Notification' in window)) {
    console.log("Push notifications are not supported in this environment.");
    return;
  }

  try {
    const messaging = getMessaging(firebaseApp);
    
    // 1. Request Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission not granted.');
      return;
    }

    // 2. Get Device Token
    // Make sure you have the VAPID key from your Firebase project settings
    const currentToken = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });
    
    if (currentToken) {
      console.log('FCM Token:', currentToken);
      // 3. Save the token to Firestore for the current user
      const tokenRef = doc(db, 'fcmTokens', currentToken);
      await setDoc(tokenRef, {
        token: currentToken,
        userId: userId,
        createdAt: new Date().toISOString(),
      }, { merge: true });
    } else {
      console.log('No registration token available. Request permission to generate one.');
    }

    // 4. Handle foreground messages
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      // You can display a custom in-app notification here if you want
      // For example, using a toast notification library
      const notificationTitle = payload.notification?.title || 'New Message';
      const notificationOptions = {
        body: payload.notification?.body || '',
        icon: payload.notification?.icon || '/logo.jpg',
      };
      
      new Notification(notificationTitle, notificationOptions);
    });

  } catch (error) {
    console.error('An error occurred while setting up push notifications.', error);
  }
};
