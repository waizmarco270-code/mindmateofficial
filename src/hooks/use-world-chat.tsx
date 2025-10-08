

'use client';
import { useState, useEffect, useCallback, useMemo, createContext, useContext, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, Timestamp, limit, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore';
import { useAdmin } from './use-admin';
import { useToast } from './use-toast';

export interface WorldChatMessage {
    id: string;
    senderId: string;
    text?: string;
    imageUrl?: string;
    timestamp: Date;
    reactions?: { [emoji: string]: string[] }; // e.g., { '👍': ['user1', 'user2'] }
}

interface WorldChatContextType {
    messages: WorldChatMessage[];
    sendMessage: (text: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    toggleReaction: (messageId: string, emoji: string) => Promise<void>;
    pinMessage: (messageId: string) => Promise<void>;
    unpinMessage: () => Promise<void>;
    pinnedMessage: WorldChatMessage | null;
    loading: boolean;
}

const WorldChatContext = createContext<WorldChatContextType | undefined>(undefined);

export const WorldChatProvider = ({ children }: { children: ReactNode }) => {
    const { user: currentUser } = useUser();
    const { isAdmin } = useAdmin();
    const { toast } = useToast();
    const [messages, setMessages] = useState<WorldChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [pinnedMessageId, setPinnedMessageId] = useState<string | null>(null);

    const pinnedMessage = useMemo(() => {
        if (!pinnedMessageId) return null;
        return messages.find(m => m.id === pinnedMessageId) || null;
    }, [pinnedMessageId, messages]);

    // Listen for pinned message
    useEffect(() => {
        const configRef = doc(db, 'world_chat', 'config');
        const unsubscribe = onSnapshot(configRef, (doc) => {
            if (doc.exists()) {
                setPinnedMessageId(doc.data().pinnedMessageId || null);
            }
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        const messagesRef = collection(db, 'world_chat');
        const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.filter(doc => doc.id !== 'config').map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: (data.timestamp as Timestamp)?.toDate() || new Date()
                } as WorldChatMessage;
            }).reverse(); // Reverse to show latest messages at the bottom
            setMessages(fetchedMessages);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const sendMessage = useCallback(async (text: string) => {
        if (!currentUser || !text.trim()) return;
        
        const messagesRef = collection(db, 'world_chat');
        
        await addDoc(messagesRef, {
            senderId: currentUser.id,
            text,
            timestamp: serverTimestamp(),
            reactions: {},
        });

    }, [currentUser]);

    const deleteMessage = useCallback(async (messageId: string) => {
        if (!currentUser) return;
        
        const messageToDelete = messages.find(m => m.id === messageId);
        if (!messageToDelete) return;

        const canDelete = messageToDelete.senderId === currentUser.id || isAdmin;

        if (!canDelete) {
            toast({ variant: 'destructive', title: "Permission Denied" });
            return;
        }

        try {
            await deleteDoc(doc(db, 'world_chat', messageId));
            toast({ title: "Message Deleted" });
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Could not delete message." });
        }

    }, [currentUser, messages, isAdmin, toast]);

    const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
        if (!currentUser) return;

        const messageRef = doc(db, 'world_chat', messageId);
        const message = messages.find(m => m.id === messageId);
        if (!message) return;

        const currentReactions = message.reactions || {};
        const usersForEmoji = currentReactions[emoji] || [];

        if (usersForEmoji.includes(currentUser.id)) {
            // User has already reacted, so remove their reaction
            await updateDoc(messageRef, {
                [`reactions.${emoji}`]: arrayRemove(currentUser.id)
            });
        } else {
            // User has not reacted, so add their reaction
            await updateDoc(messageRef, {
                [`reactions.${emoji}`]: arrayUnion(currentUser.id)
            });
        }
    }, [currentUser, messages]);

     const pinMessage = useCallback(async (messageId: string) => {
        if (!isAdmin) return;
        const configRef = doc(db, 'world_chat', 'config');
        await setDoc(configRef, { pinnedMessageId: messageId }, { merge: true });
        toast({ title: "Message Pinned!" });
    }, [isAdmin, toast]);

    const unpinMessage = useCallback(async () => {
        if (!isAdmin) return;
        const configRef = doc(db, 'world_chat', 'config');
        await setDoc(configRef, { pinnedMessageId: null }, { merge: true });
        toast({ title: "Message Unpinned" });
    }, [isAdmin, toast]);


    const value = { messages, loading, sendMessage, deleteMessage, toggleReaction, pinnedMessage, pinMessage, unpinMessage };

    return (
        <WorldChatContext.Provider value={value}>
            {children}
        </WorldChatContext.Provider>
    );
};

export const useWorldChat = () => {
    const context = useContext(WorldChatContext);
    if (!context) {
        throw new Error('useWorldChat must be used within a WorldChatProvider');
    }
    return context;
};
