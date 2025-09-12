
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, Timestamp, limit, doc, setDoc } from 'firebase/firestore';
import { useFriends } from './use-friends';

export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    text: string;
    timestamp: Date;
    seen: boolean;
}

const getChatId = (uid1: string, uid2: string) => {
  return [uid1, uid2].sort().join('_');
};

export const useChat = (friendId: string) => {
    const { user: currentUser } = useUser();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    const chatId = useMemo(() => {
        if (!currentUser) return null;
        return getChatId(currentUser.id, friendId);
    }, [currentUser, friendId]);

    useEffect(() => {
        if (!chatId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: (data.timestamp as Timestamp)?.toDate() || new Date()
                } as Message;
            });
            setMessages(fetchedMessages);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [chatId]);

    const sendMessage = useCallback(async (text: string) => {
        if (!chatId || !currentUser) return;
        
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        await addDoc(messagesRef, {
            chatId,
            senderId: currentUser.id,
            text,
            timestamp: serverTimestamp(),
            seen: false,
        });

        // Use setDoc with merge:true to either create a new chat doc or update an existing one.
        const chatDocRef = doc(db, 'chats', chatId);
        await setDoc(chatDocRef, {
            users: [currentUser.id, friendId],
            lastMessage: {
                text,
                senderId: currentUser.id,
                timestamp: serverTimestamp()
            }
        }, { merge: true });

    }, [chatId, currentUser, friendId]);

    return { messages, loading, sendMessage };
}
