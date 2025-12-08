
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, Timestamp, doc, orderBy, limit, updateDoc, getDoc, writeBatch } from 'firebase/firestore';
import { User, useUsers } from './use-admin';
import { useToast } from './use-toast';

export interface Group {
    id: string;
    name: string;
    members: string[]; // array of user UIDs
    createdBy: string;
    createdAt: Timestamp;
    memberDetails?: User[]; // Populated client-side
    lastMessage?: {
        text: string;
        senderId: string;
        timestamp: Timestamp;
    };
}

export interface GroupMessage {
    id: string;
    senderId: string;
    text?: string;
    imageUrl?: string; // base64 data URI
    timestamp: Date;
}

interface GroupsContextType {
    groups: Group[];
    loading: boolean;
    createGroup: (name: string, memberIds: string[]) => Promise<void>;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

export const GroupsProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useUser();
    const { users, loading: usersLoading } = useUsers();
    const { toast } = useToast();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || usersLoading) {
            setLoading(usersLoading);
            return;
        }

        setLoading(true);
        const groupsRef = collection(db, 'groups');
        const q = query(groupsRef, where('members', 'array-contains', user.id));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userGroups = snapshot.docs.map(doc => {
                const data = doc.data();
                const memberDetails = (data.members as string[]).map(uid => users.find(u => u.uid === uid)).filter(Boolean) as User[];
                return {
                    id: doc.id,
                    ...data,
                    memberDetails,
                } as Group;
            });
            setGroups(userGroups);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching groups:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, users, usersLoading]);

    const createGroup = useCallback(async (name: string, memberIds: string[]) => {
        if (!user) return;
        try {
            await addDoc(collection(db, 'groups'), {
                name,
                createdBy: user.id,
                createdAt: serverTimestamp(),
                members: [user.id, ...memberIds],
            });
            toast({ title: "Group Created!", description: `"${name}" is ready.` });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not create group." });
            console.error("Error creating group:", error);
        }
    }, [user, toast]);

    const value: GroupsContextType = { groups, loading: loading || usersLoading, createGroup };

    return (
        <GroupsContext.Provider value={value}>
            {children}
        </GroupsContext.Provider>
    );
};

export const useGroups = () => {
    const context = useContext(GroupsContext);
    if (context === undefined) {
        throw new Error('useGroups must be used within a GroupsProvider');
    }
    return context;
};

export const useGroupChat = (groupId: string) => {
    const { user } = useUser();
    const [messages, setMessages] = useState<GroupMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!groupId) {
            setLoading(false);
            return;
        };

        setLoading(true);
        const messagesRef = collection(db, 'groups', groupId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100)); // Get last 100 messages

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: (data.timestamp as Timestamp)?.toDate() || new Date()
                } as GroupMessage;
            });
            setMessages(fetchedMessages);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [groupId]);

    const sendMessage = useCallback(async (text?: string, imageUrl?: string | null) => {
        if (!groupId || !user || (!text?.trim() && !imageUrl)) return;

        const messagesRef = collection(db, 'groups', groupId, 'messages');
        await addDoc(messagesRef, {
            senderId: user.id,
            text: text || '',
            imageUrl: imageUrl || null,
            timestamp: serverTimestamp(),
        });
        
        const groupRef = doc(db, 'groups', groupId);
        await updateDoc(groupRef, {
            lastMessage: {
                text: text ? (text.length > 30 ? text.substring(0, 30) + '...' : text) : 'Sent an image',
                senderId: user.id,
                timestamp: serverTimestamp()
            }
        });

    }, [groupId, user]);

    return { messages, loading, sendMessage };
};
