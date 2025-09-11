
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { db, rtdb } from '@/lib/firebase';
import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';
import { doc, getDoc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { User } from './use-admin';

export type OnlineUser = Pick<User, 'uid' | 'displayName' | 'photoURL' | 'isAdmin'>;

export const usePresence = () => {
  const { user } = useUser();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        setOnlineUsers([]);
        setLoading(false);
        return;
    };

    // Reference to the user's status in Realtime Database
    const myStatusRef = ref(rtdb, 'status/' + user.id);

    const isOfflineForRTDB = {
        state: 'offline',
        last_changed: serverTimestamp(),
    };

    const isOnlineForRTDB = {
        state: 'online',
        last_changed: serverTimestamp(),
    };
    
    const connRef = ref(rtdb, '.info/connected');
    const presenceUnsubscribe = onValue(connRef, (snapshot) => {
        if (snapshot.val() === false) return;
        
        onDisconnect(myStatusRef).set(isOfflineForRTDB).then(() => {
            set(myStatusRef, isOnlineForRTDB);
        });
    });

    // Listen for changes to the 'status' node in RTDB
    const statusRef = ref(rtdb, 'status');
    const rtdbUnsubscribe = onValue(statusRef, (snapshot) => {
        const statuses = snapshot.val() || {};
        const onlineUIDs = Object.keys(statuses).filter(uid => statuses[uid].state === 'online');

        // Now, we listen to Firestore for the profiles of online users
        if (onlineUIDs.length > 0) {
             const usersRef = collection(db, 'users');
             const q = query(usersRef, where('uid', 'in', onlineUIDs));
             const firestoreUnsubscribe = onSnapshot(q, (usersSnapshot) => {
                 const usersData: OnlineUser[] = [];
                 usersSnapshot.forEach(doc => {
                     const u = doc.data() as User;
                     usersData.push({
                         uid: u.uid,
                         displayName: u.displayName,
                         photoURL: u.photoURL,
                         isAdmin: u.isAdmin,
                     });
                 });
                 setOnlineUsers(usersData);
                 setLoading(false);
             });
             return () => firestoreUnsubscribe();
        } else {
            setOnlineUsers([]);
            setLoading(false);
        }
    });

    return () => {
        presenceUnsubscribe();
        rtdbUnsubscribe();
        set(myStatusRef, isOfflineForRTDB);
    }

  }, [user]);

  return { onlineUsers, loading };
};
