'use client';

import { useState, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, Timestamp, doc, updateDoc, getDoc, arrayRemove, deleteDoc, getDocs, increment, writeBatch, arrayUnion, setDoc, runTransaction } from 'firebase/firestore';
import { User, useUsers } from './use-admin';
import { useToast } from './use-toast';
import { GroupsContext, type GroupsContextType, type Group, type GroupJoinRequest, type GroupMember, type GroupRole } from '@/context/groups-context';
import { clanLevelConfig } from '@/app/lib/clan-levels';
import { addDays, format } from 'date-fns';

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
        
        const userGroupsQuery = user ? query(groupsRef, where('memberUids', 'array-contains', user.id)) : null;
        const unsubUserGroups = userGroupsQuery ? onSnapshot(userGroupsQuery, (snapshot) => {
            const userGroupsData = snapshot.docs.map(doc => {
                const data = doc.data();
                const members = data.members || [];
                const memberDetails = members.map((m: GroupMember) => {
                    const ud = users.find(u => u.uid === m.uid);
                    return ud ? { ...ud, role: m.role, studyContribution: m.studyContribution || 0 } : null;
                }).filter(Boolean);

                return {
                    id: doc.id, ...data, memberDetails,
                    level: data.level || 1,
                    xp: data.xp || 0,
                    todayStudySeconds: data.todayStudySeconds || 0,
                    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
                    lastMessage: data.lastMessage ? { ...data.lastMessage, timestamp: (data.lastMessage.timestamp as Timestamp)?.toDate() || new Date() } : undefined,
                } as Group;
            });
            setGroups(userGroupsData);
        }) : () => {};

        const publicGroupsQuery = query(groupsRef, where('isPublic', '==', true));
        const unsubPublicGroups = onSnapshot(publicGroupsQuery, (snapshot) => {
             const publicGroupsData = snapshot.docs.map(doc => {
                const data = doc.data();
                const members = data.members || [];
                const memberUids = members.map((m: GroupMember) => m.uid);
                return { 
                    id: doc.id, ...data,
                    level: data.level || 1,
                    xp: data.xp || 0,
                    todayStudySeconds: data.todayStudySeconds || 0,
                    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date() 
                } as Group;
            });
            setAllPublicGroups(publicGroupsData);
        });

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
    
    const logXp = useCallback(async (groupId: string, durationSeconds: number) => {
        if (!user || durationSeconds <= 0) return;

        const todayKey = format(new Date(), 'yyyy-MM-dd');
        
        try {
            await runTransaction(db, async (transaction) => {
                const groupRef = doc(db, 'groups', groupId);
                const groupSnap = await transaction.get(groupRef);
                if (!groupSnap.exists()) return;

                const groupData = groupSnap.data() as Group;
                
                // 1. Calculate XP (1 hour = 50 XP)
                const xpGain = (durationSeconds / 3600) * 50;
                
                // 2. Daily Hours Reset logic
                let todayStudySeconds = groupData.todayStudySeconds || 0;
                if (groupData.lastResetDate !== todayKey) {
                    todayStudySeconds = 0;
                }
                todayStudySeconds += durationSeconds;

                // 3. Member Contribution
                const newMembers = groupData.members.map(m => {
                    if (m.uid === user.id) {
                        return {
                            ...m,
                            xpContribution: (m.xpContribution || 0) + xpGain,
                            studyContribution: (m.studyContribution || 0) + durationSeconds
                        };
                    }
                    return m;
                });

                // 4. Level Up logic
                let newXp = (groupData.xp || 0) + xpGain;
                let newLevel = groupData.level || 1;
                const isTempMax = groupData.tempMaxLevelExpires && new Date(groupData.tempMaxLevelExpires) > new Date();

                if (!isTempMax) {
                    let nextLevelInfo = clanLevelConfig.find(l => l.level === newLevel + 1);
                    while (nextLevelInfo && newXp >= nextLevelInfo.xpRequired) {
                        newXp -= nextLevelInfo.xpRequired;
                        newLevel++;
                        nextLevelInfo = clanLevelConfig.find(l => l.level === newLevel + 1);
                    }
                }

                transaction.update(groupRef, {
                    xp: newXp,
                    level: newLevel,
                    todayStudySeconds,
                    lastResetDate: todayKey,
                    members: newMembers
                });
            });
        } catch (e) {
            console.error("Clan XP Log Failed:", e);
        }
    }, [user]);

    const createGroup = useCallback(async (name: string, memberIds: string[], motto?: string, logoUrl?: string | null, banner?: string) => {
        if (!user || !currentUserData) throw new Error("User not found.");

        if (groups.length > 0) {
            toast({ variant: "destructive", title: "Forbidden", description: "You are already a member of a clan. Leave your current clan to create a new one." });
            throw new Error("Already in a clan");
        }

        const hasMasterCard = currentUserData.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();
        if (!hasMasterCard && currentUserData.credits < CLAN_CREATION_COST) {
            toast({ variant: "destructive", title: "Insufficient Credits", description: `You need ${CLAN_CREATION_COST} credits to create a clan.` });
            throw new Error("Insufficient Credits");
        }

        const groupsRef = collection(db, 'groups');
        const q = query(groupsRef, where('name', '==', name.trim()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty && querySnapshot.docs.some(d => d.data().name.toLowerCase() === name.trim().toLowerCase())) {
            toast({ variant: "destructive", title: "Clan Name Taken", description: "Please choose a different name." });
            throw new Error("Clan name already exists.");
        }

        const initialMembers: GroupMember[] = [
            { uid: user.id, role: 'leader', xpContribution: 0, studyContribution: 0 },
            ...memberIds.map(id => ({ uid: id, role: 'member' as const, xpContribution: 0, studyContribution: 0 }))
        ];
        
        const newDocRef = doc(collection(db, 'groups'));
        const todayKey = format(new Date(), 'yyyy-MM-dd');
        
        await setDoc(newDocRef, {
            id: newDocRef.id, name: name.trim(), motto: motto || '', logoUrl: logoUrl || null, banner: banner || 'default',
            createdBy: user.id, createdAt: serverTimestamp(), members: initialMembers, memberUids: [user.id, ...memberIds],
            isPublic: true, joinMode: 'auto',
            level: 1, xp: 0, todayStudySeconds: 0, lastResetDate: todayKey
        });

        if (!hasMasterCard) await addCreditsToUser(user.id, -CLAN_CREATION_COST);
        toast({ title: "Clan Created!", description: `"${name}" is ready for battle.` });
        return newDocRef.id;
    }, [user, currentUserData, groups, toast, addCreditsToUser]);

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

    const updateMemberRole = useCallback(async (groupId: string, memberId: string, role: GroupRole) => {
        const groupRef = doc(db, 'groups', groupId);
        const groupDoc = await getDoc(groupRef);
        if (!groupDoc.exists()) return;

        const groupData = groupDoc.data() as Group;
        const newMembers = groupData.members.map(m => m.uid === memberId ? { ...m, role } : m);
        await updateDoc(groupRef, { members: newMembers });
    }, []);

    const removeMember = useCallback(async (groupId: string, memberId: string) => {
        const groupRef = doc(db, 'groups', groupId);
        const groupDoc = await getDoc(groupRef);
        if (!groupDoc.exists()) return;
        
        const groupData = groupDoc.data() as Group;
        const newMembers = groupData.members.filter(m => m.uid !== memberId);
        const newMemberUids = groupData.memberUids.filter(uid => uid !== memberId);

        await updateDoc(groupRef, { members: newMembers, memberUids: newMemberUids });
    }, []);

    const leaveGroup = useCallback(async (groupId: string) => {
        if (!user) return;
        await removeMember(groupId, user.id);
    }, [user, removeMember]);

    const deleteGroup = useCallback(async (groupId: string) => {
        await deleteDoc(doc(db, 'groups', groupId));
    }, []);

    const sendJoinRequest = useCallback(async (group: Group) => {
        if (!user || !currentUserData) throw new Error("Not logged in");
        
        if (groups.length > 0) {
            toast({ variant: "destructive", title: "Action Denied", description: "You are already in a clan. You must leave it before requesting to join another." });
            return;
        }

        const memberUids = group.memberUids || [];
        if (memberUids.includes(user.id)) throw new Error("You are already a member.");

        const requestRef = doc(collection(db, 'groupJoinRequests'));
        await setDoc(requestRef, {
            id: requestRef.id, groupId: group.id, groupName: group.name, clanAdminId: group.createdBy,
            senderId: user.id, sender: { uid: user.id, displayName: currentUserData.displayName, photoURL: currentUserData.photoURL },
            status: 'pending', createdAt: serverTimestamp(),
        });
        toast({ title: "Request Sent", description: `Your request to join "${group.name}" has been sent.` });
    }, [user, currentUserData, groups, toast]);
    
    const addMemberToAutoJoinClan = useCallback(async (group: Group) => {
        if (!user) throw new Error("Not logged in");

        if (groups.length > 0) {
            toast({ variant: "destructive", title: "Action Denied", description: "You are already in a clan." });
            return;
        }

        const newMember: GroupMember = { uid: user.id, role: 'member', xpContribution: 0, studyContribution: 0 };
        await updateDoc(doc(db, 'groups', group.id), { 
            members: arrayUnion(newMember), 
            memberUids: arrayUnion(user.id) 
        });
        toast({ title: `Welcome to "${group.name}"!` });
    }, [user, groups, toast]);

    const approveJoinRequest = useCallback(async (request: GroupJoinRequest) => {
        const batch = writeBatch(db);
        const newMember: GroupMember = { uid: request.senderId, role: 'member', xpContribution: 0, studyContribution: 0 };
        batch.update(doc(db, 'groups', request.groupId), { 
            members: arrayUnion(newMember), 
            memberUids: arrayUnion(request.senderId) 
        });
        batch.delete(doc(db, 'groupJoinRequests', request.id));
        await batch.commit();
        toast({ title: "Member Approved", description: "The clan grows stronger!" });
    }, [toast]);

    const declineJoinRequest = useCallback(async (requestId: string) => {
        await deleteDoc(doc(db, 'groupJoinRequests', requestId));
        toast({ title: "Request Declined" });
    }, [toast]);

    const applyXpBooster = useCallback(async (groupId: string) => {
        if (!user || !currentUserData) return false;
        if ((currentUserData.inventory?.clanXpBoosters || 0) <= 0) {
            toast({ variant: "destructive", title: "No Booster Found", description: "Purchase an XP Booster from the store to use this." });
            return false;
        }

        try {
            await runTransaction(db, async (transaction) => {
                const userRef = doc(db, 'users', user.id);
                const groupRef = doc(db, 'groups', groupId);
                
                const groupSnap = await transaction.get(groupRef);
                if (!groupSnap.exists()) throw new Error("Group not found");
                
                transaction.update(userRef, { 'inventory.clanXpBoosters': increment(-1) });
                
                const groupData = groupSnap.data() as Group;
                const newXp = (groupData.xp || 0) + 500;
                
                let newLevel = groupData.level;
                let xpRemaining = newXp;
                
                let nextLevelInfo = clanLevelConfig.find(l => l.level === newLevel + 1);
                while (nextLevelInfo && xpRemaining >= nextLevelInfo.xpRequired) {
                    xpRemaining -= nextLevelInfo.xpRequired;
                    newLevel++;
                    nextLevelInfo = clanLevelConfig.find(l => l.level === newLevel + 1);
                }
                
                transaction.update(groupRef, { xp: xpRemaining, level: newLevel });
            });
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }, [user, currentUserData, toast]);

    const applyLevelMaxer = useCallback(async (groupId: string) => {
        if (!user || !currentUserData) return false;
        if ((currentUserData.inventory?.clanLevelMaxers || 0) <= 0) {
            toast({ variant: "destructive", title: "No Ascender Found", description: "Purchase a Clan Ascender from the store." });
            return false;
        }

        try {
            const userRef = doc(db, 'users', user.id);
            const groupRef = doc(db, 'groups', groupId);
            const expiry = addDays(new Date(), 7).toISOString();

            const batch = writeBatch(db);
            batch.update(userRef, { 'inventory.clanLevelMaxers': increment(-1) });
            batch.update(groupRef, { tempMaxLevelExpires: expiry });
            await batch.commit();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }, [user, currentUserData, toast]);

    const pinMessage = useCallback(async (groupId: string, messageId: string, status: boolean) => {
        const msgRef = doc(db, 'groups', groupId, 'messages', messageId);
        await updateDoc(msgRef, { isPinned: status });
        toast({ title: status ? "Message Pinned" : "Message Unpinned" });
    }, [toast]);

    const value: GroupsContextType = {
        groups, allPublicGroups, joinRequests, sentJoinRequests, loading: loading || usersLoading,
        createGroup, updateGroup, updateMemberRole, removeMember, leaveGroup, deleteGroup, sendJoinRequest, approveJoinRequest,
        declineJoinRequest, addMemberToAutoJoinClan, logXp, applyXpBooster, applyLevelMaxer, pinMessage
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
