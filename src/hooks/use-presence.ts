
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUsers, User } from './use-admin';
import { useUser } from '@clerk/nextjs';

export type OnlineUser = Pick<User, 'uid' | 'displayName' | 'photoURL' | 'isAdmin'>;

// This hook simulates a presence system. In a real app, this would
// be replaced with a real-time service like Firebase Realtime Database.
export const usePresence = () => {
  const { users: allUsers, loading: usersLoading } = useUsers();
  const { user: currentUser } = useUser();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);

  const simulatedOnlineUsers = useMemo(() => {
    if (usersLoading || !allUsers.length) return [];
    
    // Ensure the current user is always "online"
    const currentUserData = allUsers.find(u => u.uid === currentUser?.id);
    const online: OnlineUser[] = currentUserData ? [currentUserData] : [];

    // Add a few other random users to simulate them being online
    const otherUsers = allUsers.filter(u => u.uid !== currentUser?.id);
    const nonAdminUsers = otherUsers.filter(u => !u.isAdmin);

    // Add 2-3 random non-admin users to the online list
    const numberOfSimulatedUsers = Math.min(nonAdminUsers.length, Math.floor(Math.random() * 2) + 2);

    for(let i=0; i<numberOfSimulatedUsers; i++) {
        const randomIndex = Math.floor(Math.random() * nonAdminUsers.length);
        const randomUser = nonAdminUsers.splice(randomIndex, 1)[0];
        if (randomUser) {
          online.push(randomUser);
        }
    }

    return online;

  }, [allUsers, usersLoading, currentUser]);


  useEffect(() => {
    if (!usersLoading) {
      setOnlineUsers(simulatedOnlineUsers);
      setLoading(false);
    }
  }, [usersLoading, simulatedOnlineUsers]);

  return { onlineUsers, loading };
};
