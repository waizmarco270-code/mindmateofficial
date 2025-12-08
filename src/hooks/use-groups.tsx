

'use client';

import { useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, Timestamp, doc, updateDoc, getDoc, arrayRemove, deleteDoc, getDocs, increment, writeBatch, arrayUnion } from 'firebase/firestore';
import { User, useUsers } from './use-admin';
import { useToast } from './use-toast';
import { GroupsContext, type GroupsContextType, type Group, type GroupJoinRequest } from '@/context/groups-context';

export const GroupsProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useUser();
    const { users, currentUserData, addCreditsToUser, loading: usersLoading } = useUsers();
    const { toast } = useToast();
    const [groups, setGroups] = useState<Group[]>([]);
    const [allPublicGroups, setAllPublicGroups] = useState<Group[]>([]);
    const [joinRequests, setJoinRequests] = useState<GroupJoinRequest[]>([]);
    const [sentJoinRequests, setSentJoinRequests] = useState<GroupJoinRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const CLAN_CREATION_COST = 200;

    useEffect(() => {
        if (usersLoading) return;
        setLoading(true);

        const groupsRef = collection(db, 'groups');
        
        // Listener for user's groups
        const userGroupsQuery = user ? query(groupsRef, where('members', 'array-contains', user.id)) : null;
        const unsubUserGroups = userGroupsQuery ? onSnapshot(userGroupsQuery, (snapshot) => {
            const userGroupsData = snapshot.docs.map(doc => {
                const data = doc.data();
                const memberDetails = (data.members as string[]).map(uid => users.find(u => u.uid === uid)).filter(Boolean) as User[];
                return {
                    id: doc.id, ...data, memberDetails,
                    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
                    lastMessage: data.lastMessage ? { ...data.lastMessage, timestamp: (data.lastMessage.timestamp as Timestamp)?.toDate() || new Date() } : undefined,
                } as Group;
            });
            setGroups(userGroupsData);
        }) : () => {};

        // Listener for all public groups
        const publicGroupsQuery = query(groupsRef, where('isPublic', '==', true));
        const unsubPublicGroups = onSnapshot(publicGroupsQuery, (snapshot) => {
            const publicGroupsData = snapshot.docs.map(doc => {
                const data = doc.data();
                return { id: doc.id, ...data, createdAt: (data.createdAt as Timestamp)?.toDate() || new Date() } as Group;
            });
            setAllPublicGroups(publicGroupsData);
        });

        // Listeners for join requests
        const requestsRef = collection(db, 'groupJoinRequests');
        const receivedRequestsQuery = user ? query(requestsRef, where('clanAdminId', '==', user.id), where('status', '==', 'pending')) : null;
        const sentRequestsQuery = user ? query(requestsRef, where('senderId', '==', user.id), where('status', '==', 'pending')) : null;

        const unsubReceived = receivedRequestsQuery ? onSnapshot(receivedRequestsQuery, (snapshot) => {
            setJoinRequests(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GroupJoinRequest)));
        }) : () => {};

        const unsubSent = sentRequestsQuery ? onSnapshot(sentRequestsQuery, (snapshot) => {
            setSentJoinRequests(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GroupJoinRequest)));
        }) : () => {};

        setLoading(false);

        return () => {
            unsubUserGroups();
            unsubPublicGroups();
            unsubReceived();
            unsubSent();
        };

    }, [user, users, usersLoading]);

    const createGroup = useCallback(async (name: string, memberIds: string[], motto?: string, logoUrl?: string | null, banner?: string) => {
        if (!user || !currentUserData) throw new Error("User not found.");

        const hasMasterCard = currentUserData.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();
        if (!hasMasterCard && currentUserData.credits < CLAN_CREATION_COST) {
            toast({ variant: "destructive", title: "Insufficient Credits", description: `You need ${CLAN_CREATION_COST} credits to create a clan.` });
            throw new Error("Insufficient Credits");
        }

        const groupsRef = collection(db, 'groups');
        const q = query(groupsRef, where('name', '==', name.trim()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty && querySnapshot.docs.some(d => d.data().name.toLowerCase() === name.trim().toLowerCase())) {
            toast({ variant: "destructive", title: "Clan Name Taken" });
            throw new Error("Clan name already exists.");
        }

        await addDoc(groupsRef, {
            name: name.trim(), motto: motto || '', logoUrl: logoUrl || null, banner: banner || 'default',
            createdBy: user.id, createdAt: serverTimestamp(), members: [user.id, ...memberIds], isPublic: true, joinMode: 'auto'
        });
        if (!hasMasterCard) await addCreditsToUser(user.id, -CLAN_CREATION_COST);
        toast({ title: "Clan Created!", description: `"${name}" is ready.` });
    }, [user, currentUserData, toast, addCreditsToUser]);

    const updateGroup = useCallback(async (groupId: string, data: Partial<Group>, isRenaming: boolean = false, renameCost: number = 0) => {
        if (!user || !currentUserData) return;
        const groupRef = doc(db, 'groups', groupId);
        if (isRenaming) {
            const hasMasterCard = currentUserData.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();
            if (!hasMasterCard && currentUserData.credits < renameCost) throw new Error(`Insufficient credits to rename. You need ${renameCost}.`);
            
            const q = query(collection(db, 'groups'), where('name', '==', data.name?.trim()));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty && querySnapshot.docs.some(d => d.id !== groupId && d.data().name.toLowerCase() === data.name?.trim().toLowerCase())) {
                throw new Error("A clan with this name already exists.");
            }
            if (!hasMasterCard) await addCreditsToUser(user.id, -renameCost);
        }
        await updateDoc(groupRef, data);
    }, [user, currentUserData, addCreditsToUser]);

    const removeMember = useCallback(async (groupId: string, memberId: string) => {
        await updateDoc(doc(db, 'groups', groupId), { members: arrayRemove(memberId) });
    }, []);

    const deleteGroup = useCallback(async (groupId: string) => {
        await deleteDoc(doc(db, 'groups', groupId));
    }, []);

    const sendJoinRequest = useCallback(async (group: Group) => {
        if (!user || !currentUserData) throw new Error("Not logged in");
        if (group.members.includes(user.id)) throw new Error("You are already a member.");

        const requestRef = doc(collection(db, 'groupJoinRequests'));
        await setDoc(requestRef, {
            id: requestRef.id, groupId: group.id, groupName: group.name, clanAdminId: group.createdBy,
            senderId: user.id, sender: { uid: user.id, displayName: currentUserData.displayName, photoURL: currentUserData.photoURL },
            status: 'pending', createdAt: serverTimestamp(),
        });
        toast({ title: "Request Sent", description: `Your request to join "${group.name}" has been sent.` });
    }, [user, currentUserData, toast]);
    
    const addMemberToAutoJoinClan = useCallback(async (group: Group) => {
        if (!user) throw new Error("Not logged in");
        await updateDoc(doc(db, 'groups', group.id), { members: arrayUnion(user.id) });
        toast({ title: `Joined "${group.name}"!` });
    }, [user, toast]);

    const approveJoinRequest = useCallback(async (request: GroupJoinRequest) => {
        const batch = writeBatch(db);
        batch.update(doc(db, 'groups', request.groupId), { members: arrayUnion(request.senderId) });
        batch.delete(doc(db, 'groupJoinRequests', request.id));
        await batch.commit();
        toast({ title: "Member Approved" });
    }, [toast]);

    const declineJoinRequest = useCallback(async (requestId: string) => {
        await deleteDoc(doc(db, 'groupJoinRequests', requestId));
        toast({ title: "Request Declined" });
    }, [toast]);

    const value: GroupsContextType = {
        groups, allPublicGroups, joinRequests, sentJoinRequests, loading: loading || usersLoading,
        createGroup, updateGroup, removeMember, deleteGroup, sendJoinRequest, approveJoinRequest,
        declineJoinRequest, addMemberToAutoJoinClan,
    };

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
