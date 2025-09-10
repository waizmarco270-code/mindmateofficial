
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp, limit } from 'firebase/firestore';
import { useUsers } from './use-admin';
import type { User } from './use-admin';

export interface GlobalMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
}

const GLOBAL_CHAT_COLLECTION = 'global_chat';

export const useGlobalChat = () => {
  const { user } = useUser();
  const { users: allUsers } = useUsers();
  const [messages, setMessages] = useState<GlobalMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const lastMessageRef = useRef<GlobalMessage | null>(null);

  const showNotification = useCallback((message: GlobalMessage) => {
      const sender = allUsers.find(u => u.uid === message.senderId);
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && sender) {
        new Notification(`New message in Global Chat`, {
          body: `${sender.displayName}: ${message.text}`,
          icon: sender.photoURL || '/logo.svg',
        });
      }
    }, [allUsers]);

  // Listen to global chat messages
  useEffect(() => {
    setLoading(true);
    const messagesRef = collection(db, GLOBAL_CHAT_COLLECTION);
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
        } as GlobalMessage;
      }).reverse(); // Reverse to show newest messages at the bottom

      const newMessages = fetchedMessages.filter(
        msg => !lastMessageRef.current || msg.timestamp > lastMessageRef.current.timestamp
      );

      // Check for new incoming messages to show notification
      if (document.visibilityState === 'hidden' && newMessages.length > 0) {
         const incomingMessage = newMessages.find(m => m.senderId !== user?.id);
         if(incomingMessage){
            showNotification(incomingMessage);
         }
      }

       if (fetchedMessages.length > 0) {
        lastMessageRef.current = fetchedMessages[fetchedMessages.length - 1];
      }

      setMessages(fetchedMessages);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching global chat:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, showNotification]);

  const sendMessage = useCallback(async (text: string) => {
    if (!user) return;

     if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    const messagesRef = collection(db, GLOBAL_CHAT_COLLECTION);
    await addDoc(messagesRef, {
      text,
      senderId: user.id,
      timestamp: serverTimestamp(),
    });
  }, [user]);

  return { messages, sendMessage, loading };
};

    