
import { useState, useEffect } from 'react';
import { getMessaging, getToken } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { firebaseApp, db } from '@/lib/firebase'; 
import { useUser } from '@clerk/nextjs';

// I have set your VAPID key here as requested.
// For production, it is highly recommended to move this to your environment variables.
const VAPID_KEY = "BKtzKIJPfG9H4t7xr7Xzj-zJ697vs3w8KHSLdcadoSgs4e7qny9hAndaAGS8N6hFB6KZQtVKzIBi7O7TIbA5Dr4";

export const useFCM = () => {
  const { user } = useUser();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [error, setError] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const retrieveToken = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !VAPID_KEY) {
      console.error("VAPID key is missing or Service Worker is not supported.");
      setError("Firebase VAPID key not configured or browser not supported.");
      return null;
    }

    try {
      const messaging = getMessaging(firebaseApp);
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      
      if (token && user) {
        console.log("FCM Token retrieved:", token);
        setFcmToken(token);
        // Save the token to Firestore
        const tokenRef = doc(db, 'fcmTokens', user.id);
        await setDoc(tokenRef, { token, userId: user.id }, { merge: true });
        console.log("Token saved to Firestore for user:", user.id);
      } else if (!user) {
        console.log("User not logged in. Cannot save FCM token.");
      }
      
      return token;
    } catch (err) {
      console.error('An error occurred while retrieving token. ', err);
      setError(err);
      return null;
    }
  };

  const requestPermission = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        if (permission === 'granted') {
          await retrieveToken();
        }
        return permission;
      } catch (err) {
        setError(err);
        return null;
      }
    } else {
      console.error('Notifications not supported in this browser.');
      return null;
    }
  };

  return { fcmToken, notificationPermission, requestPermission, error };
};
