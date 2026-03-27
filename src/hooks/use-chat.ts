
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { 
    collection, 
    query, 
    onSnapshot, 
    orderBy, 
    addDoc, 
    serverTimestamp, 
    Timestamp, 
    limit, 
    doc, 
    updateDoc, 
    startAfter, 
    getDocs, 
    deleteDoc, 
    writeBatch 
} from 'firebase/firestore';
import { useUsers } from './use-admin';

export interface Message {
    id: string;
    chatId: string;
    senderId: string;
    text: string;
    imageUrl?: string;
    voiceUrl?: string;
    timestamp: Date;
    seen: boolean;
    edited?: boolean;
    replyTo?: {
        text: string;
        senderId: string;
        id: string;
    };
}

const getChatId = (uid1: string, uid2: string) => {
  return [uid1, uid2].sort().join('_');
};

const PAGE_SIZE = 30;

export const useChat = (friendId: string) => {
    const { user: currentUser } = useUser();
    const { currentUserData } = useUsers();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [lastDoc, setLastDoc] = useState<any>(null);

    const chatId = useMemo(() => {
        if (!currentUser) return null;
        return getChatId(currentUser.id, friendId);
    }, [currentUser, friendId]);

    useEffect(() => {
        if (!chatId || !currentUser) {
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
            if (snapshot.docs.length > 0) {
                setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
            }
            setHasMore(snapshot.docs.length === PAGE_SIZE);
            setLoading(false);

            // Mark incoming messages as seen
            const unread = snapshot.docs.filter(d => d.data().senderId !== currentUser.id && !d.data().seen);
            if (unread.length > 0) {
                const batch = writeBatch(db);
                unread.forEach(d => batch.update(d.ref, { seen: true }));
                batch.commit();
            }
        });

        return () => unsubscribe();
    }, [chatId, currentUser]);

    const loadMore = useCallback(async () => {
        if (!chatId || !hasMore || !lastDoc || loading) return;

        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'desc'), startAfter(lastDoc), limit(PAGE_SIZE));

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
            setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        }
        setHasMore(snapshot.docs.length === PAGE_SIZE);
    }, [chatId, hasMore, lastDoc, loading]);

    const sendMessage = useCallback(async (
        text: string, 
        imageUrl?: string, 
        voiceUrl?: string, 
        replyTo?: Message['replyTo']
    ) => {
        if (!chatId || !currentUser) return;
        
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        await addDoc(messagesRef, {
            chatId,
            senderId: currentUser.id,
            text,
            imageUrl: imageUrl || null,
            voiceUrl: voiceUrl || null,
            replyTo: replyTo || null,
            timestamp: serverTimestamp(),
            seen: false,
        });

        const chatDocRef = doc(db, 'chats', chatId);
        await updateDoc(chatDocRef, {
            users: [currentUser.id, friendId],
            lastMessage: {
                text: imageUrl ? '📷 Photo' : voiceUrl ? '🎤 Voice note' : text,
                senderId: currentUser.id,
                timestamp: serverTimestamp()
            }
        });

        // Trigger Push Notification
        await fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: `💬 New message from ${currentUserData?.displayName || 'Ally'}`,
                message: text || (imageUrl ? 'Sent an image' : 'Sent a voice note'),
                userId: friendId,
                linkUrl: '/dashboard/social'
            })
        });

    }, [chatId, currentUser, friendId, currentUserData]);

    const editMessage = useCallback(async (messageId: string, newText: string) => {
        if (!chatId) return;
        const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
        await updateDoc(msgRef, { text: newText, edited: true });
    }, [chatId]);

    const deleteMessage = useCallback(async (messageId: string) => {
        if (!chatId) return;
        const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
        await deleteDoc(msgRef);
    }, [chatId]);

    return { messages, loading, hasMore, loadMore, sendMessage, editMessage, deleteMessage };
}
