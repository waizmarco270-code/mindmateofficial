

'use client';
import { useState, useEffect, useCallback, useMemo, createContext, useContext, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, Timestamp, limit, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove, getDoc, setDoc } from 'firebase/firestore';
import { useAdmin } from './use-admin';
import { useToast } from './use-toast';

export interface ReplyContext {
    messageId: string;
    senderName: string;
    textSnippet: string;
}

export interface PollData {
    question: string;
    options: string[];
    // Storing user IDs who voted for each option
    results: Record<string, string[]>; 
}

export interface WorldChatMessage {
    id: string;
    senderId: string;
    timestamp: Date;
    
    // For regular messages
    text?: string;
    imageUrl?: string;

    // For polls
    type?: 'text' | 'poll';
    pollData?: PollData;

    reactions?: { [emoji: string]: string[] };
    replyingTo?: ReplyContext;
    editedAt?: Date;
    nuggetMarkedBy?: string[];
}


interface WorldChatContextType {
    messages: WorldChatMessage[];
    sendMessage: (text: string, replyingTo?: ReplyContext | null) => Promise<void>;
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
    const { users, isAdmin } = useAdmin();
    const { toast } = useToast();
    const [messages, setMessages] = useState<WorldChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [pinnedMessageId, setPinnedMessageId] = useState<string | null>(null);
    const [typingUsers, setTypingUsers] = useState<{ id: string; displayName: string }[]>([]);

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

    // Listen for typing status
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
            }).reverse(); // Reverse to show latest messages at the bottom
            setMessages(fetchedMessages);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const sendMessage = useCallback(async (text: string, replyingTo?: ReplyContext | null) => {
        if (!currentUser || !text.trim()) return;
        
        const messagesRef = collection(db, 'world_chat');
        
        // Admin Poll Command
        if (isAdmin && text.startsWith('/poll ')) {
             // Regex to capture the question and options, handles quotes correctly
            const pollRegex = /\/poll "([^"]+)"((?:\s*"[^"]+")+)/;
            const match = text.match(pollRegex);
            
            if (match && match[1] && match[2]) {
                const question = match[1];
                const options = match[2].match(/"([^"]+)"/g)?.map(opt => opt.slice(1, -1)) || [];
                
                if (options.length >= 2) {
                    const pollData: PollData = {
                        question,
                        options,
                        results: options.reduce((acc, option) => ({ ...acc, [option]: [] }), {})
                    };
                    await addDoc(messagesRef, {
                        senderId: currentUser.id,
                        timestamp: serverTimestamp(),
                        type: 'poll',
                        pollData: pollData,
                    });
                    return;
                }
            }
             toast({ variant: 'destructive', title: 'Invalid Poll Format', description: 'Use: /poll "Question" "Option 1" "Option 2" ...' });
            return;
        }

        await addDoc(messagesRef, {
            senderId: currentUser.id,
            text,
            timestamp: serverTimestamp(),
            reactions: {},
            ...(replyingTo && { replyingTo }),
        });

    }, [currentUser, isAdmin, toast]);

    const editMessage = useCallback(async (messageId: string, newText: string) => {
        if (!currentUser || !newText.trim()) return;

        const messageRef = doc(db, 'world_chat', messageId);
        const message = messages.find(m => m.id === messageId);
        
        if (!message || message.senderId !== currentUser.id) {
            toast({ variant: 'destructive', title: "Permission Denied" });
            return;
        }

        try {
            await updateDoc(messageRef, {
                text: newText,
                editedAt: serverTimestamp()
            });
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Could not edit message." });
        }
    }, [currentUser, messages, toast]);


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
    
    const toggleNugget = useCallback(async (messageId: string) => {
        if (!currentUser) return;
        
        const messageRef = doc(db, 'world_chat', messageId);
        const message = messages.find(m => m.id === messageId);
        if (!message) return;

        const currentMarkers = message.nuggetMarkedBy || [];
        
        if(currentMarkers.includes(currentUser.id)) {
            await updateDoc(messageRef, { nuggetMarkedBy: arrayRemove(currentUser.id) });
            toast({ title: "Nugget Unmarked" });
        } else {
            await updateDoc(messageRef, { nuggetMarkedBy: arrayUnion(currentUser.id) });
            toast({ title: "Marked as a Wisdom Nugget!" });
        }

    }, [currentUser, messages, toast]);


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
    
    const updateTypingStatus = useCallback(async (isTyping: boolean) => {
        if (!currentUser) return;
        const typingRef = doc(db, 'typing_status', 'world_chat');
        const userTypingData = {
            displayName: users.find(u => u.uid === currentUser.id)?.displayName || 'A user',
            timestamp: Date.now()
        };

        if(isTyping) {
             await setDoc(typingRef, {
                users: {
                    [currentUser.id]: userTypingData
                }
            }, { merge: true });
        }
        // Let the useEffect cleanup handle removal after timeout
    }, [currentUser, users]);

    const submitPollVote = useCallback(async (messageId: string, option: string) => {
        if (!currentUser) return;
        const messageRef = doc(db, 'world_chat', messageId);
        const message = messages.find(m => m.id === messageId);
        if (!message || message.type !== 'poll' || !message.pollData) return;

        const pollData = message.pollData;
        const results = pollData.results;
        
        // Check if user has already voted
        const hasVoted = Object.values(results).some(voters => voters.includes(currentUser.id));
        if (hasVoted) {
            toast({ variant: 'destructive', title: "You have already voted in this poll." });
            return;
        }

        const newResults = { ...results, [option]: [...(results[option] || []), currentUser.id] };

        await updateDoc(messageRef, {
            'pollData.results': newResults
        });

    }, [currentUser, messages, toast]);


    const value = { messages, loading, sendMessage, editMessage, deleteMessage, toggleReaction, toggleNugget, submitPollVote, pinnedMessage, pinMessage, unpinMessage, typingUsers, updateTypingStatus };

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
