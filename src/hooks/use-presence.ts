
'use client';

import { useState, useEffect } from 'react';
import { User } from './use-admin';

export type OnlineUser = Pick<User, 'uid' | 'displayName' | 'photoURL' | 'isAdmin'>;

// This hook is now disabled and returns empty values.
export const usePresence = () => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(false); // Default to false

  return { onlineUsers, loading };
};
