'use client';
import { useState, useEffect, useCallback, useMemo, createContext, useContext, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, Timestamp, limit, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc, writeBatch, increment } from 'firebase/firestore';
import { useAdmin } from './use-admin';
import { useToast } from './use-toast';

export interface ReplyContext {
    messageId: string;
    senderId: string;
    senderName: string;
    textSnippet: string;
}

export interface PollData {
    question: string;
    options: string[];
    results: Record<string, string[]>; 
}

export interface RainData {
    amount: number;
    maxClaims: number;
    claimedBy: string[];
}

export interface WorldChatMessage {
    id: string;
    senderId: string;
    timestamp: Date;
    text?: string;
    imageUrl?: string;
    type?: 'text' | 'poll' | 'rain';
    pollData?: PollData;
    rainData?: RainData;
    reactions?: { [emoji: string]: string[] };
    replyingTo?: ReplyContext;
    editedAt?: Date;
    nuggetMarkedBy?: string[];
}

interface WorldChatContextType {
    messages: WorldChatMessage[];
    sendMessage: (text: string, replyingTo?: ReplyContext | null) => Promise<void>;
    sendRain: (amount: number, limit: number) => Promise<void>;
    claimRain: (messageId: string) => Promise<void>;
    editMessage: (messageId: string, newText: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    toggleReaction: (messageId: string, emoji: string) => Promise<void>;
    toggleNugget: (messageId: string) => Promise<void>;
    submitPollVote: (messageId: string, option: string) => Promise<void>;
    pinMessage: (messageId: string) => Promise<void>;
    unpinMessage: () => Promise<void>;
    pinnedMessage: WorldChatMessage | null;
    typingUsers: { id: string; displayName: string }[];
    updateTypingStatus: (isTyping: boolean) => void;
    loading: boolean;
}

const WorldChatContext = createContext<WorldChatContextType | undefined>(undefined);

export const WorldChatProvider = ({ children }: { children: ReactNode }) => {
    const { user: currentUser } = useUser();
    const { users, isAdmin, currentUserData } = useAdmin();
    const { toast } = useToast();
    const [messages, setMessages] = useState<WorldChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [pinnedMessageId, setPinnedMessageId] = useState<string | null>(null);
    const [typingUsers, setTypingUsers] = useState<{ id: string; displayName: string }[]>([]);

    const pinnedMessage = useMemo(() => {
        if (!pinnedMessageId) return null;
        return messages.find(m => m.id === pinnedMessageId) || null;
    }, [pinnedMessageId, messages]);

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
        const typingRef = doc(db, 'typing_status', 'world_chat');
        const unsubscribe = onSnapshot(typingRef, (doc) => {
            if (doc.exists()) {
                const typingData = doc.data().users || {};
                const now = Date.now();
                const typing = Object.entries(typingData)
                    .filter(([uid, data]: [string, any]) => now - data.timestamp < 5000 && uid !== currentUser?.id)
                    .map(([uid, data]: [string, any]) => ({ id: uid, displayName: data.displayName }));
                setTypingUsers(typing);
            }
        });
        return unsubscribe;
    }, [currentUser?.id]);

    useEffect(() => {
        const messagesRef = collection(db, 'world_chat');
        const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.filter(doc => doc.id !== 'config').map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: (data.timestamp as Timestamp)?.toDate() || new Date(),
                    editedAt: (data.editedAt as Timestamp)?.toDate() || undefined,
                } as WorldChatMessage;
            }).reverse();
            setMessages(fetchedMessages);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const sendMessage = useCallback(async (text: string, replyingTo?: ReplyContext | null) => {
        if (!currentUser || !text.trim()) return;
        const messagesRef = collection(db, 'world_chat');
        await addDoc(messagesRef, {
            senderId: currentUser.id,
            text,
            timestamp: serverTimestamp(),
            reactions: {},
            ...(replyingTo && { replyingTo }),
        });
    }, [currentUser]);

    const sendRain = useCallback(async (amount: number, maxClaims: number) => {
        if (!currentUser || !isAdmin) return;
        const messagesRef = collection(db, 'world_chat');
        await addDoc(messagesRef, {
            senderId: currentUser.id,
            timestamp: serverTimestamp(),
            type: 'rain',
            rainData: {
                amount,
                maxClaims,
                claimedBy: []
            }
        });
    }, [currentUser, isAdmin]);

    const claimRain = useCallback(async (messageId: string) => {
        if (!currentUser) return;
        const messageRef = doc(db, 'world_chat', messageId);
        const userRef = doc(db, 'users', currentUser.id);

        const messageSnap = await getDoc(messageRef);
        if (!messageSnap.exists()) return;
        const data = messageSnap.data() as WorldChatMessage;
        if (!data.rainData || data.rainData.claimedBy.includes(currentUser.id) || data.rainData.claimedBy.length >= data.rainData.maxClaims) {
            toast({ variant: 'destructive', title: 'Already claimed or rain ended!' });
            return;
        }

        const batch = writeBatch(db);
        batch.update(messageRef, { 'rainData.claimedBy': arrayUnion(currentUser.id) });
        batch.update(userRef, { credits: increment(data.rainData.amount) });
        await batch.commit();
        toast({ title: 'Success!', description: `You claimed ${data.rainData.amount} credits from the rain!` });
    }, [currentUser, toast]);

    const editMessage = useCallback(async (messageId: string, newText: string) => {
        if (!currentUser || !newText.trim()) return;
        const messageRef = doc(db, 'world_chat', messageId);
        await updateDoc(messageRef, { text: newText, editedAt: serverTimestamp() });
    }, [currentUser]);

    const deleteMessage = useCallback(async (messageId: string) => {
        if (!currentUser) return;
        await deleteDoc(doc(db, 'world_chat', messageId));
    }, [currentUser]);

    const toggleReaction = useCallback(async (messageId: string, emoji: string) => {
        if (!currentUser) return;
        const messageRef = doc(db, 'world_chat', messageId);
        const message = messages.find(m => m.id === messageId);
        if (!message) return;
        const usersForEmoji = message.reactions?.[emoji] || [];
        if (usersForEmoji.includes(currentUser.id)) {
            await updateDoc(messageRef, { [`reactions.${emoji}`]: arrayRemove(currentUser.id) });
        } else {
            await updateDoc(messageRef, { [`reactions.${emoji}`]: arrayUnion(currentUser.id) });
        }
    }, [currentUser, messages]);
    
    const toggleNugget = useCallback(async (messageId: string) => {
        if (!currentUser) return;
        const messageRef = doc(db, 'world_chat', messageId);
        const message = messages.find(m => m.id === messageId);
        if (!message) return;
        const currentMarkers = message.nuggetMarkedBy || [];
        if(currentMarkers.includes(currentUser.id)) {
            await updateDoc(messageRef, { nuggetMarkedBy: arrayRemove(currentUser.id) });
        } else {
            await updateDoc(messageRef, { nuggetMarkedBy: arrayUnion(currentUser.id) });
            toast({ title: "Marked as a Wisdom Nugget!" });
        }
    }, [currentUser, messages, toast]);

    const pinMessage = useCallback(async (messageId: string) => {
        if (!isAdmin) return;
        await setDoc(doc(db, 'world_chat', 'config'), { pinnedMessageId: messageId }, { merge: true });
    }, [isAdmin]);

    const unpinMessage = useCallback(async () => {
        if (!isAdmin) return;
        await setDoc(doc(db, 'world_chat', 'config'), { pinnedMessageId: null }, { merge: true });
    }, [isAdmin]);
    
    const updateTypingStatus = useCallback(async (isTyping: boolean) => {
        if (!currentUser) return;
        const typingRef = doc(db, 'typing_status', 'world_chat');
        if(isTyping) {
             await setDoc(typingRef, { users: { [currentUser.id]: { displayName: currentUserData?.displayName || 'A user', timestamp: Date.now() } } }, { merge: true });
        }
    }, [currentUser, currentUserData]);

    const submitPollVote = useCallback(async (messageId: string, option: string) => {
        if (!currentUser) return;
        const messageRef = doc(db, 'world_chat', messageId);
        await updateDoc(messageRef, { [`pollData.results.${option}`]: arrayUnion(currentUser.id) });
    }, [currentUser]);

    const value = { messages, loading, sendMessage, sendRain, claimRain, editMessage, deleteMessage, toggleReaction, toggleNugget, submitPollVote, pinnedMessage, pinMessage, unpinMessage, typingUsers, updateTypingStatus };
    return <WorldChatContext.Provider value={value}>{children}</WorldChatContext.Provider>;
};

export const useWorldChat = () => {
    const context = useContext(WorldChatContext);
    if (!context) throw new Error('useWorldChat must be used within a WorldChatProvider');
    return context;
};
