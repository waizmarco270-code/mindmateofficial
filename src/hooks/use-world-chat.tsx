
'use client';
import { useState, useEffect, useCallback, useMemo, createContext, useContext, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, Timestamp, limit } from 'firebase/firestore';

export interface WorldChatMessage {
    id: string;
    senderId: string;
    text: string;
    timestamp: Date;
}

interface WorldChatContextType {
    messages: WorldChatMessage[];
    sendMessage: (text: string) => Promise<void>;
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

    const sendMessage = useCallback(async (text: string) => {
        if (!currentUser) return;
        
        const messagesRef = collection(db, 'world_chat');
        await addDoc(messagesRef, {
            senderId: currentUser.id,
            text,
            timestamp: serverTimestamp(),
        });
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
