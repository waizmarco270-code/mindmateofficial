
'use client';
import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, updateDoc, query, where, arrayUnion, arrayRemove, writeBatch } from 'firebase/firestore';
import { User } from './use-admin';
import { useToast } from './use-toast';

interface FriendContextType {
    allUsers: User[];
    friends: User[];
    nonFriends: User[];
    friendRequests: User[];
    sentRequests: User[];
    sendFriendRequest: (friendId: string) => Promise<void>;
    acceptFriendRequest: (friendId: string) => Promise<void>;
    rejectFriendRequest: (friendId: string) => Promise<void>;
    removeFriend: (friendId: string) => Promise<void>;
    cancelFriendRequest: (friendId: string) => Promise<void>;
}

const FriendContext = createContext<FriendContextType | undefined>(undefined);

export const FriendProvider = ({ children }: { children: ReactNode }) => {
    const { user: authUser } = useUser();
    const { toast } = useToast();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [currentUserData, setCurrentUserData] = useState<any>(null);

    // Listen to all users
    useEffect(() => {
        if (!authUser) {
            setAllUsers([]);
            return;
        }
        const usersCol = collection(db, 'users');
        const unsubscribe = onSnapshot(usersCol, (snapshot) => {
            const usersList = snapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as User))
                                     .filter(u => u.uid !== authUser.id);
            setAllUsers(usersList);
        });
        return () => unsubscribe();
    }, [authUser]);
    
    // Listen to current user's friend data
    useEffect(() => {
        if (!authUser) {
            setCurrentUserData(null);
            return;
        }
        const userDocRef = doc(db, 'users', authUser.id);
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            setCurrentUserData(doc.data());
        });
        return () => unsubscribe();

    }, [authUser]);

    const friends = useMemo(() => {
        if (!currentUserData) return [];
        return allUsers.filter(u => currentUserData.friends?.includes(u.uid))
    }, [allUsers, currentUserData]);

    const friendRequests = useMemo(() => {
        if (!currentUserData) return [];
        return allUsers.filter(u => currentUserData.friendRequests?.includes(u.uid))
    }, [allUsers, currentUserData]);

    const sentRequests = useMemo(() => {
        if (!currentUserData) return [];
        return allUsers.filter(u => currentUserData.sentRequests?.includes(u.uid))
    }, [allUsers, currentUserData]);
    
    const nonFriends = useMemo(() => {
        if (!currentUserData) return [];
        return allUsers.filter(u => 
            !currentUserData.friends?.includes(u.uid) &&
            !currentUserData.friendRequests?.includes(u.uid) &&
            !currentUserData.sentRequests?.includes(u.uid)
        )
    }, [allUsers, currentUserData]);


    const sendFriendRequest = useCallback(async (friendId: string) => {
        if (!authUser) return;
        const currentUserRef = doc(db, 'users', authUser.id);
        const friendRef = doc(db, 'users', friendId);

        const batch = writeBatch(db);
        batch.update(currentUserRef, { sentRequests: arrayUnion(friendId) });
        batch.update(friendRef, { friendRequests: arrayUnion(authUser.id) });
        await batch.commit();

        toast({ title: 'Success', description: 'Friend request sent!' });
    }, [authUser, toast]);

    const acceptFriendRequest = useCallback(async (friendId: string) => {
        if (!authUser) return;
        const currentUserRef = doc(db, 'users', authUser.id);
        const friendRef = doc(db, 'users', friendId);

        const batch = writeBatch(db);
        // Add each other to friends list
        batch.update(currentUserRef, { friends: arrayUnion(friendId) });
        batch.update(friendRef, { friends: arrayUnion(authUser.id) });
        // Remove from requests lists
        batch.update(currentUserRef, { friendRequests: arrayRemove(friendId) });
        batch.update(friendRef, { sentRequests: arrayRemove(authUser.id) });
        await batch.commit();

        toast({ title: 'Friend Added!', description: 'You are now friends.' });
    }, [authUser, toast]);
    
    const rejectFriendRequest = useCallback(async (friendId: string) => {
        if (!authUser) return;
        const currentUserRef = doc(db, 'users', authUser.id);
        const friendRef = doc(db, 'users', friendId);

        const batch = writeBatch(db);
        batch.update(currentUserRef, { friendRequests: arrayRemove(friendId) });
        batch.update(friendRef, { sentRequests: arrayRemove(authUser.id) });
        await batch.commit();

        toast({ title: 'Request Rejected', description: 'The friend request has been rejected.' });
    }, [authUser, toast]);

     const cancelFriendRequest = useCallback(async (friendId: string) => {
        if (!authUser) return;
        const currentUserRef = doc(db, 'users', authUser.id);
        const friendRef = doc(db, 'users', friendId);

        const batch = writeBatch(db);
        batch.update(currentUserRef, { sentRequests: arrayRemove(friendId) });
        batch.update(friendRef, { friendRequests: arrayRemove(authUser.id) });
        await batch.commit();

        toast({ title: 'Request Cancelled', description: 'Your friend request has been cancelled.' });
    }, [authUser, toast]);

    const removeFriend = useCallback(async (friendId: string) => {
        if (!authUser) return;
        const currentUserRef = doc(db, 'users', authUser.id);
        const friendRef = doc(db, 'users', friendId);

        const batch = writeBatch(db);
        batch.update(currentUserRef, { friends: arrayRemove(friendId) });
        batch.update(friendRef, { friends: arrayRemove(authUser.id) });
        await batch.commit();
        
        toast({ title: 'Friend Removed', variant: 'destructive'});
    }, [authUser, toast]);

    const value: FriendContextType = {
        allUsers,
        friends,
        nonFriends,
        friendRequests,
        sentRequests,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
        cancelFriendRequest,
    };

    return (
        <FriendContext.Provider value={value}>
            {children}
        </FriendContext.Provider>
    );
};

export const useFriends = () => {
    const context = useContext(FriendContext);
    if (!context) {
        throw new Error('useFriends must be used within a FriendProvider');
    }
    return context;
};
