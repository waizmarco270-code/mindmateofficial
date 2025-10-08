

'use client';
import { useState, useEffect, useCallback, useMemo, createContext, useContext, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { db, storage } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, Timestamp, limit, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
    sendMessage: (text: string, image?: File | null) => Promise<void>;
    deleteMessage: (messageId: string) => Promise<void>;
    toggleReaction: (messageId: string, emoji: string) => Promise<void>;
    loading: boolean;
}

const WorldChatContext = createContext<WorldChatContextType | undefined>(undefined);

export const WorldChatProvider = ({ children }: { children: ReactNode }) => {
    const { user: currentUser } = useUser();
    const { isAdmin } = useAdmin();
    const { toast } = useToast();
    const [messages, setMessages] = useState<WorldChatMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const messagesRef = collection(db, 'world_chat');
        const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => {
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

    const sendMessage = useCallback(async (text: string, image: File | null = null) => {
        if (!currentUser) return;
        
        const messagesRef = collection(db, 'world_chat');
        
        let imageUrl: string | undefined = undefined;

        if(image) {
            const filePath = `world_chat_images/${currentUser.id}_${Date.now()}_${image.name}`;
            const imageRef = ref(storage, filePath);
            const uploadResult = await uploadBytes(imageRef, image);
            imageUrl = await getDownloadURL(uploadResult.ref);
        }

        const messageData: {
            senderId: string;
            text?: string;
            imageUrl?: string;
            timestamp: any;
            reactions: {};
        } = {
            senderId: currentUser.id,
            timestamp: serverTimestamp(),
            reactions: {},
        };

        if (text) messageData.text = text;
        if (imageUrl) messageData.imageUrl = imageUrl;
        
        if (messageData.text || messageData.imageUrl) {
            await addDoc(messagesRef, messageData);
        }

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


    const value = { messages, loading, sendMessage, deleteMessage, toggleReaction };

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
