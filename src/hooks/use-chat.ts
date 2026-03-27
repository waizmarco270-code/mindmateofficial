
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, Timestamp, limit, doc, setDoc, startAfter, getDocs } from 'firebase/firestore';

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

const PAGE_SIZE = 30;

export const useChat = (friendId: string) => {
    const { user: currentUser } = useUser();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);

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
        const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(PAGE_SIZE));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: (data.timestamp as Timestamp)?.toDate() || new Date()
                } as Message;
            }).reverse();
            
            setMessages(fetchedMessages);
            setHasMore(snapshot.docs.length === PAGE_SIZE);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [chatId]);

    const loadMore = useCallback(async () => {
        if (!chatId || !hasMore || messages.length === 0) return;

        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const firstMessage = messages[0];
        
        const q = query(
            messagesRef, 
            orderBy('timestamp', 'desc'), 
            startAfter(firstMessage.timestamp), 
            limit(PAGE_SIZE)
        );

        const snapshot = await getDocs(q);
        const olderMessages = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                timestamp: (data.timestamp as Timestamp)?.toDate() || new Date()
            } as Message;
        }).reverse();

        if (olderMessages.length > 0) {
            setMessages(prev => [...olderMessages, ...prev]);
        }
        setHasMore(snapshot.docs.length === PAGE_SIZE);
    }, [chatId, hasMore, messages]);

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

    return { messages, loading, hasMore, loadMore, sendMessage };
}
