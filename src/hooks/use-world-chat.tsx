
'use client';
import { useState, useEffect, useCallback, useMemo, createContext, useContext, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { db, storage } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, Timestamp, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface WorldChatMessage {
    id: string;
    senderId: string;
    text?: string;
    imageUrl?: string;
    timestamp: Date;
}

interface WorldChatContextType {
    messages: WorldChatMessage[];
    sendMessage: (text: string, image?: File | null) => Promise<void>;
    loading: boolean;
}

const WorldChatContext = createContext<WorldChatContextType | undefined>(undefined);

export const WorldChatProvider = ({ children }: { children: ReactNode }) => {
    const { user: currentUser } = useUser();
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
        } = {
            senderId: currentUser.id,
            timestamp: serverTimestamp(),
        };

        if (text) messageData.text = text;
        if (imageUrl) messageData.imageUrl = imageUrl;
        
        if (messageData.text || messageData.imageUrl) {
            await addDoc(messagesRef, messageData);
        }

    }, [currentUser]);

    const value = { messages, loading, sendMessage };

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
