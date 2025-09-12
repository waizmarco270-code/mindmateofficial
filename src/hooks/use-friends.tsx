
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, where, writeBatch, serverTimestamp, getDocs } from 'firebase/firestore';
import { useUsers, User } from './use-admin';
import { useToast } from './use-toast';

export interface FriendRequest {
    id: string; // doc id
    senderId: string;
    receiverId: string;
    status: 'pending';
    createdAt: Date;
    sender: Pick<User, 'uid' | 'displayName' | 'photoURL'>;
}

interface FriendsContextType {
    friends: User[];
    friendRequests: FriendRequest[];
    sentRequests: FriendRequest[];
    loading: boolean;
    sendFriendRequest: (receiverId: string) => Promise<void>;
    acceptFriendRequest: (request: FriendRequest) => Promise<void>;
    declineFriendRequest: (request: FriendRequest) => Promise<void>;
    removeFriend: (friendId: string) => Promise<void>;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const FriendsProvider = ({ children }: { children: ReactNode }) => {
    const { user: currentUser } = useUser();
    const { users: allUsers, currentUserData, loading: usersLoading } = useUsers();
    const { toast } = useToast();

    const [friends, setFriends] = useState<User[]>([]);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
    const [friendsAndRequestsLoading, setFriendsAndRequestsLoading] = useState(true);

    // Fetch friends
    useEffect(() => {
        if (!currentUserData || !allUsers.length) return;
        const friendIds = currentUserData.friends || [];
        const friendsList = allUsers.filter(u => friendIds.includes(u.uid));
        setFriends(friendsList);
    }, [currentUserData, allUsers]);

    // Fetch incoming and sent friend requests
    useEffect(() => {
        if (!currentUser) {
            setFriendsAndRequestsLoading(false);
            return;
        }
        setFriendsAndRequestsLoading(true);
        const requestsRef = collection(db, 'friendRequests');
        
        const qReceived = query(requestsRef, where('receiverId', '==', currentUser.id), where('status', '==', 'pending'));
        const qSent = query(requestsRef, where('senderId', '==', currentUser.id), where('status', '==', 'pending'));

        const unsubReceived = onSnapshot(qReceived, snapshot => {
            const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FriendRequest));
            setFriendRequests(requests);
            // This is the key fix: ensure loading is false after the fetch.
            setFriendsAndRequestsLoading(false);
        }, (error) => {
            console.error("Error fetching received friend requests:", error);
            setFriendsAndRequestsLoading(false);
        });

        const unsubSent = onSnapshot(qSent, snapshot => {
             const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FriendRequest));
             setSentRequests(requests);
        });

        return () => {
            unsubReceived();
            unsubSent();
        };
    }, [currentUser]);

    const sendFriendRequest = useCallback(async (receiverId: string) => {
        if (!currentUser || !currentUserData) return;
        
        try {
            const requestId = [currentUser.id, receiverId].sort().join('_');
            const requestRef = doc(db, 'friendRequests', requestId);

            await setDoc(requestRef, {
                senderId: currentUser.id,
                receiverId: receiverId,
                status: 'pending',
                createdAt: serverTimestamp(),
                sender: {
                    uid: currentUser.id,
                    displayName: currentUserData.displayName,
                    photoURL: currentUserData.photoURL
                }
            });
            toast({ title: "Friend Request Sent!" });
        } catch (error) {
            console.error("Error sending friend request:", error);
            toast({ variant: 'destructive', title: "Error", description: "Could not send friend request." });
        }
    }, [currentUser, currentUserData, toast]);

    const acceptFriendRequest = useCallback(async (request: FriendRequest) => {
        if (!currentUser) return;
        const batch = writeBatch(db);

        // Delete the request
        const requestRef = doc(db, 'friendRequests', request.id);
        batch.delete(requestRef);
        
        // Add friend to both users
        const currentUserRef = doc(db, 'users', currentUser.id);
        const friendUserRef = doc(db, 'users', request.senderId);

        const currentUserFriends = (currentUserData?.friends || []);
        const senderUser = allUsers.find(u => u.uid === request.senderId);
        const senderFriends = (senderUser?.friends || []);

        batch.update(currentUserRef, { friends: [...currentUserFriends, request.senderId] });
        batch.update(friendUserRef, { friends: [...senderFriends, currentUser.id] });

        try {
            await batch.commit();
            toast({ title: "Friend Added!" });
        } catch (error) {
            console.error("Error accepting friend request:", error);
            toast({ variant: 'destructive', title: "Error", description: "Could not accept friend request." });
        }
    }, [currentUser, currentUserData, allUsers, toast]);

    const declineFriendRequest = useCallback(async (request: FriendRequest) => {
        const requestRef = doc(db, 'friendRequests', request.id);
        try {
            await deleteDoc(requestRef);
            toast({ title: "Request Declined" });
        } catch (error) {
            console.error("Error declining friend request:", error);
            toast({ variant: 'destructive', title: "Error", description: "Could not decline request." });
        }
    }, [toast]);

    const removeFriend = useCallback(async (friendId: string) => {
        if (!currentUser || !currentUserData) return;
        const batch = writeBatch(db);

        const currentUserRef = doc(db, 'users', currentUser.id);
        const friendUserRef = doc(db, 'users', friendId);
        
        const currentUserFriends = (currentUserData.friends || []).filter(id => id !== friendId);
        const friendUser = allUsers.find(u => u.uid === friendId);
        const friendFriends = (friendUser?.friends || []).filter(id => id !== currentUser.id);

        batch.update(currentUserRef, { friends: currentUserFriends });
        batch.update(friendUserRef, { friends: friendFriends });

        try {
            await batch.commit();
            toast({ title: "Friend Removed" });
        } catch (error) {
            console.error("Error removing friend:", error);
            toast({ variant: 'destructive', title: "Error", description: "Could not remove friend." });
        }
    }, [currentUser, currentUserData, allUsers, toast]);

    const value: FriendsContextType = { 
        friends, 
        friendRequests, 
        sentRequests, 
        loading: usersLoading || friendsAndRequestsLoading, 
        sendFriendRequest, 
        acceptFriendRequest, 
        declineFriendRequest, 
        removeFriend 
    };

    return (
        <FriendsContext.Provider value={value}>
            {children}
        </FriendsContext.Provider>
    );
}

export const useFriends = () => {
    const context = useContext(FriendsContext);
    if (context === undefined) {
        throw new Error('useFriends must be used within a FriendsProvider');
    }
    return context;
};
