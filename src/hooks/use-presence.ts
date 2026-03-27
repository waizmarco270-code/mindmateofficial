
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';
import { User } from './use-admin';

export type OnlineUser = {
    uid: string;
    lastSeen: Date;
    isOnline: boolean;
};

export const usePresence = () => {
  const { user: currentUser } = useUser();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Update current user's presence
  const updateMyPresence = useCallback(async (isOnline: boolean) => {
    if (!currentUser) return;
    const presenceRef = doc(db, 'presence', currentUser.id);
    await setDoc(presenceRef, {
      uid: currentUser.id,
      isOnline,
      lastSeen: serverTimestamp(),
    }, { merge: true });
  }, [currentUser]);

  // Pulse presence every 2 minutes while active
  useEffect(() => {
    if (!currentUser) return;

    updateMyPresence(true);
    const interval = setInterval(() => updateMyPresence(true), 120000);

    const handleVisibilityChange = () => {
        updateMyPresence(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      updateMyPresence(false);
    };
  }, [currentUser, updateMyPresence]);

  // Listen to all presence data
  useEffect(() => {
    const presenceRef = collection(db, 'presence');
    const unsubscribe = onSnapshot(presenceRef, (snapshot) => {
      const users = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          uid: doc.id,
          isOnline: data.isOnline,
          lastSeen: (data.lastSeen as Timestamp)?.toDate() || new Date(),
        } as OnlineUser;
      });
      setOnlineUsers(users);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { onlineUsers, loading, updateMyPresence };
};
