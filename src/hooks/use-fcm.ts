
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMessaging, getToken } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { firebaseApp, db } from '@/lib/firebase'; 
import { useUser } from '@clerk/nextjs';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "BKtzKIJPfG9H4t7xr7Xzj-zJ697vs3w8KHSLdcadoSgs4e7qny9hAndaAGS8N6hFB6KZQtVKzIBi7O7TIbA5Dr4";

export const useFCM = () => {
  const { user } = useUser();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [error, setError] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      // Auto-retrieve if already granted
      if (Notification.permission === 'granted' && user) {
          retrieveToken();
      }
    }
  }, [user]);

  const retrieveToken = useCallback(async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;

    try {
      const messaging = getMessaging(firebaseApp);
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      
      if (token && user) {
        const tokenRef = doc(db, 'fcmTokens', user.id);
        await setDoc(tokenRef, { token, userId: user.id, lastUpdated: new Date().toISOString() }, { merge: true });
      }
      return token;
    } catch (err) {
      console.error('FCM Token Retrieval Error:', err);
      setError(err);
      return null;
    }
  }, [user]);

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'default';
    
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        await retrieveToken();
      }
      return permission;
    } catch (err) {
      setError(err);
      return 'default';
    }
  };

  return { notificationPermission, requestPermission, error, retrieveToken };
};
