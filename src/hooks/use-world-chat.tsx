
'use client';
import { useState, useEffect, useCallback, useMemo, createContext, useContext, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, Timestamp, limit, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc, writeBatch, increment, getDocs, where } from 'firebase/firestore';
import { useAdmin, SUPER_ADMIN_UID } from './use-admin';
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
    sendPoll: (question: string, options: string[]) => Promise<void>;
    claimRain: (messageId: string) => Promise<void>;
    editMessage: (messageId: string, newText: string) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    toggleReaction: (messageId: string, emoji: string) => Promise<void>;
    toggleNugget: (messageId: string) => Promise<void>;
    submitPollVote: (messageId: string, option: string) => Promise<void>;
    pinMessage: (messageId: string) => Promise<void>;
    unpinMessage: () => Promise<void>;
    clearMessages: () => Promise<void>;
    toggleLock: () => Promise<void>;
    setSlowMode: (seconds: number) => Promise<void>;
    isLocked: boolean;
    slowMode: number;
    pinnedMessage: WorldChatMessage | null;
    typingUsers: { id: string; displayName: string }[];
    updateTypingStatus: (isTyping: boolean) => void;
    loading: boolean;
}

const WorldChatContext = createContext<WorldChatContextType | undefined>(undefined);

export const WorldChatProvider = ({ children }: { children: ReactNode }) => {
    const { user: currentUser } = useUser();
    const { users, isAdmin, isSuperAdmin, currentUserData } = useAdmin();
    const { toast } = useToast();
    const [messages, setMessages] = useState<WorldChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [pinnedMessageId, setPinnedMessageId] = useState<string | null>(null);
    const [isLocked, setIsLocked] = useState(false);
    const [slowMode, setSlowModeState] = useState(0);
    const [typingUsers, setTypingUsers] = useState<{ id: string; displayName: string }[]>([]);

    const pinnedMessage = useMemo(() => {
        if (!pinnedMessageId) return null;
        return messages.find(m => m.id === pinnedMessageId) || null;
    }, [pinnedMessageId, messages]);

    useEffect(() => {
        const configRef = doc(db, 'world_chat', 'config');
        const unsubscribe = onSnapshot(configRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setPinnedMessageId(data.pinnedMessageId || null);
                setIsLocked(data.isLocked || false);
                setSlowModeState(data.slowMode || 0);
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

    const sendRain = useCallback(async (amount: number, maxClaims: number) => {
        if (!currentUser || !(isAdmin || isSuperAdmin)) return;
        
        const messagesRef = collection(db, 'world_chat');
        await addDoc(messagesRef, {
            senderId: currentUser.id,
            timestamp: serverTimestamp(),
            type: 'rain',
            rainData: {
                amount: amount,
                maxClaims,
                claimedBy: []
            }
        });

        await fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "⛈️ CREDIT RAIN IS HERE!",
                message: `Grab ${amount} credits before they're gone!`,
                linkUrl: '/dashboard/world'
            })
        });
    }, [currentUser, isAdmin, isSuperAdmin]);

    const sendMessage = useCallback(async (text: string, replyingTo?: ReplyContext | null) => {
        if (!currentUser || !text.trim()) return;
        
        // Secret Rain Command Protocol - ONLY SUPER ADMIN
        if (text.startsWith('/rain') && currentUser.id === SUPER_ADMIN_UID) {
            const parts = text.split(' ');
            const amt = parseInt(parts[1]);
            const clm = parseInt(parts[2]);
            if (!isNaN(amt) && !isNaN(clm)) {
                await sendRain(amt, clm);
                return;
            }
        }

        if (isLocked && !isAdmin && !isSuperAdmin) {
            toast({ variant: 'destructive', title: "Chat Locked", description: "Only administrators can send messages right now." });
            return;
        }

        const messagesRef = collection(db, 'world_chat');
        await addDoc(messagesRef, {
            senderId: currentUser.id,
            text,
            timestamp: serverTimestamp(),
            reactions: {},
            ...(replyingTo && { replyingTo }),
        });

        const mentions = text.match(/@(\w+)|@all/g);
        if (mentions) {
            for (const mention of mentions) {
                if (mention === '@all') {
                    await fetch('/api/send-notification', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title: `📢 ${currentUserData?.displayName} mentioned everyone`,
                            message: text,
                            linkUrl: '/dashboard/world'
                        })
                    });
                } else {
                    const targetName = mention.slice(1).toLowerCase();
                    const targetUser = users.find(u => u.displayName.replace(/\s+/g, '').toLowerCase() === targetName);
                    if (targetUser) {
                        await fetch('/api/send-notification', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                title: `💬 ${currentUserData?.displayName} mentioned you`,
                                message: text,
                                userId: targetUser.uid,
                                linkUrl: '/dashboard/world'
                            })
                        });
                    }
                }
            }
        }
    }, [currentUser, users, currentUserData, isLocked, isAdmin, isSuperAdmin, toast, sendRain]);

    const sendPoll = useCallback(async (question: string, options: string[]) => {
        if (!currentUser || !(isAdmin || isSuperAdmin)) return;
        
        const initialResults: Record<string, string[]> = {};
        options.forEach(opt => {
            initialResults[opt] = [];
        });

        const messagesRef = collection(db, 'world_chat');
        await addDoc(messagesRef, {
            senderId: currentUser.id,
            timestamp: serverTimestamp(),
            type: 'poll',
            pollData: {
                question,
                options,
                results: initialResults
            }
        });

        await fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "📊 NEW WORLD POLL",
                message: question,
                linkUrl: '/dashboard/world'
            })
        });
    }, [currentUser, isAdmin, isSuperAdmin]);

    const claimRain = useCallback(async (messageId: string) => {
        if (!currentUser || !currentUserData) return;
        
        const messageRef = doc(db, 'world_chat', messageId);
        const userRef = doc(db, 'users', currentUser.id);

        const messageSnap = await getDoc(messageRef);
        if (!messageSnap.exists()) return;
        const data = messageSnap.data() as WorldChatMessage;
        
        if (!data.rainData) return;
        if (data.rainData.claimedBy.includes(currentUser.id)) {
            toast({ variant: 'destructive', title: 'Already Claimed', description: 'You have already harvested your credits from this rain.' });
            return;
        }
        if (data.rainData.claimedBy.length >= data.rainData.maxClaims) {
            toast({ variant: 'destructive', title: 'Rain Ended', description: 'All available credits have been harvested.' });
            return;
        }

        const batch = writeBatch(db);
        batch.update(messageRef, { 'rainData.claimedBy': arrayUnion(currentUser.id) });
        batch.update(userRef, { credits: increment(data.rainData.amount) });
        
        try {
            await batch.commit();
            toast({ title: 'Success!', description: `You claimed ${data.rainData.amount} credits from the rain!`, className: "bg-green-500/10 border-green-500/50" });
        } catch (e) {
            toast({ variant: 'destructive', title: 'Sovereign Error', description: 'Failed to claim credits. Chat may be restricted.' });
        }
    }, [currentUser, currentUserData, toast]);

    const submitPollVote = useCallback(async (messageId: string, option: string) => {
        if (!currentUser) return;
        const messageRef = doc(db, 'world_chat', messageId);
        
        const snap = await getDoc(messageRef);
        if (!snap.exists()) return;
        const data = snap.data() as WorldChatMessage;
        if (!data.pollData) return;

        const hasVoted = Object.values(data.pollData.results).some(uids => uids.includes(currentUser.id));
        if (hasVoted) {
            toast({ variant: 'destructive', title: "Vote Denied", description: "You have already voted in this poll." });
            return;
        }

        await updateDoc(messageRef, { [`pollData.results.${option}`]: arrayUnion(currentUser.id) });
        toast({ title: "Vote Cast!", description: `You voted for: ${option}` });
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
        if (!isAdmin && !isSuperAdmin) return;
        await setDoc(doc(db, 'world_chat', 'config'), { pinnedMessageId: messageId }, { merge: true });
        toast({ title: "Message Pinned" });
    }, [isAdmin, isSuperAdmin, toast]);

    const unpinMessage = useCallback(async () => {
        if (!isAdmin && !isSuperAdmin) return;
        await setDoc(doc(db, 'world_chat', 'config'), { pinnedMessageId: null }, { merge: true });
        toast({ title: "Message Unpinned" });
    }, [isAdmin, isSuperAdmin, toast]);

    const clearMessages = useCallback(async () => {
        if (!isAdmin && !isSuperAdmin) return;
        const q = query(collection(db, 'world_chat'));
        const snap = await getDocs(q);
        const batch = writeBatch(db);
        snap.docs.forEach(d => {
            if (d.id !== 'config') batch.delete(d.ref);
        });
        await batch.commit();
        toast({ title: "Nexus Purged", description: "All messages have been cleared." });
    }, [isAdmin, isSuperAdmin, toast]);

    const toggleLock = useCallback(async () => {
        if (!isAdmin && !isSuperAdmin) return;
        await setDoc(doc(db, 'world_chat', 'config'), { isLocked: !isLocked }, { merge: true });
        toast({ title: isLocked ? "Chat Unlocked" : "Chat Locked" });
    }, [isAdmin, isSuperAdmin, isLocked, toast]);

    const setSlowMode = useCallback(async (seconds: number) => {
        if (!isAdmin && !isSuperAdmin) return;
        await setDoc(doc(db, 'world_chat', 'config'), { slowMode: seconds }, { merge: true });
        toast({ title: "Slow Mode Updated", description: `${seconds}s cooldown active.` });
    }, [isAdmin, isSuperAdmin, toast]);
    
    const updateTypingStatus = useCallback(async (isTyping: boolean) => {
        if (!currentUser) return;
        const typingRef = doc(db, 'typing_status', 'world_chat');
        await setDoc(typingRef, { 
            users: { 
                [currentUser.id]: { 
                    displayName: currentUserData?.displayName || 'A user', 
                    timestamp: isTyping ? Date.now() : 0 
                } 
            } 
        }, { merge: true });
    }, [currentUser, currentUserData]);

    const value = { messages, loading, sendMessage, sendRain, sendPoll, claimRain, editMessage, deleteMessage, toggleReaction, toggleNugget, submitPollVote, pinnedMessage, pinMessage, unpinMessage, clearMessages, toggleLock, setSlowMode, isLocked, slowMode, typingUsers, updateTypingStatus };
    return <WorldChatContext.Provider value={value}>{children}</WorldChatContext.Provider>;
};

export const useWorldChat = () => {
    const context = useContext(WorldChatContext);
    if (!context) throw new Error('useWorldChat must be used within a WorldChatProvider');
    return context;
};
