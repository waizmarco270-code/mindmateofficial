
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp, collection, Timestamp } from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';

export type OnlineUser = {
    uid: string;
    lastSeen: Date;
    isOnline: boolean;
};

// Protocol Consts: 30s heartbeat, 90s stale threshold
const HEARTBEAT_INTERVAL = 30000;
const ONLINE_THRESHOLD = 90000;

export const usePresence = () => {
  const { user: currentUser } = useUser();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Update current user's presence in the mainframe
  const updateMyPresence = useCallback(async (isOnline: boolean) => {
    if (!currentUser) return;
    const presenceRef = doc(db, 'presence', currentUser.id);
    await setDoc(presenceRef, {
      uid: currentUser.id,
      isOnline,
      lastSeen: serverTimestamp(),
    }, { merge: true });
  }, [currentUser]);

  // Pulse presence heartbeat while active
  useEffect(() => {
    if (!currentUser) return;

    // Ingress Pulse
    updateMyPresence(true);
    
    const interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
            updateMyPresence(true);
        }
    }, HEARTBEAT_INTERVAL);

    const handleVisibilityChange = () => {
        updateMyPresence(document.visibilityState === 'visible');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Optional: don't set false here to allow for tab refresh persistence, 
      // the timestamp logic will handle true departures.
    };
  }, [currentUser, updateMyPresence]);

  // Listen to the global presence frequency
  useEffect(() => {
    const presenceRef = collection(db, 'presence');
    const unsubscribe = onSnapshot(presenceRef, (snapshot) => {
      const now = Date.now();
      const users = snapshot.docs.map(doc => {
        const data = doc.data();
        const lastSeenDate = (data.lastSeen as Timestamp)?.toDate() || new Date();
        
        // Logical verification: Is the pulse within the valid threshold?
        const isActuallyOnline = data.isOnline && (now - lastSeenDate.getTime() < ONLINE_THRESHOLD);

        return {
          uid: doc.id,
          isOnline: isActuallyOnline,
          lastSeen: lastSeenDate,
        } as OnlineUser;
      });
      setOnlineUsers(users);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { onlineUsers, loading, updateMyPresence };
};
