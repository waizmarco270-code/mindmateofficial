

'use client';

import { useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { User, useUsers } from './use-admin';
import { useToast } from './use-toast';
import { GroupsContext, type GroupsContextType, type Group } from '@/context/groups-context';


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
                    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
                    lastMessage: data.lastMessage ? {
                        ...data.lastMessage,
                        timestamp: (data.lastMessage.timestamp as Timestamp)?.toDate() || new Date(),
                    } : undefined,
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

    const createGroup = useCallback(async (name: string, memberIds: string[], motto?: string, logoUrl?: string | null, banner?: string) => {
        if (!user) return;
        try {
            await addDoc(collection(db, 'groups'), {
                name,
                motto: motto || '',
                logoUrl: logoUrl || null,
                banner: banner || 'default',
                createdBy: user.id,
                createdAt: serverTimestamp(),
                members: [user.id, ...memberIds],
            });
            toast({ title: "Clan Created!", description: `"${name}" is ready.` });
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Could not create clan." });
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
