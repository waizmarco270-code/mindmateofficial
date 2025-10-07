

'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  query,
  updateDoc,
  getDoc,
  where,
  orderBy
} from 'firebase/firestore';
import { useUsers } from './use-admin';
import { useToast } from './use-toast';
import { addDays, isPast, isToday } from 'date-fns';

export interface PlannedTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface PlannedTaskCategory {
  id: string;
  title: string;
  color: string;
  tasks: PlannedTask[];
}

export interface ChallengeGoal {
    id: 'studyTime' | 'focusSession' | 'tasks' | 'checkIn';
    description: string;
    target: number;
}

export interface DailyProgress {
    [goalId: string]: {
        current: number;
        completed: boolean;
    };
}

export interface ChallengeConfig {
    id: string;
    title: string;
    description: string;
    duration: number;
    entryFee: number;
    reward: number;
    rules: string[];
    dailyGoals: ChallengeGoal[];
    checkInTime?: string; // e.g. "19:00"
}

export interface ActiveChallenge extends ChallengeConfig {
    userId: string;
    startDate: string; // ISO string
    status: 'active' | 'completed' | 'failed';
    currentDay: number;
    progress: Record<number, DailyProgress>; // day -> progress
    plannedTasks?: Record<number, PlannedTaskCategory[]>; // day -> tasks
    lastCheckInDay?: number;
    banUntil?: string; // ISO string
}


const CHALLENGE_CONFIGS: ChallengeConfig[] = [
    {
        id: '7-day-warrior',
        title: '7-Day Warrior',
        description: 'A week-long challenge to build a consistent study habit and boost discipline.',
        duration: 7,
        entryFee: 10,
        reward: 50,
        rules: [
            "Complete all daily goals every day for 7 days.",
            "You must check-in daily within the specified time window after completing all goals.",
            "Missing a single day results in challenge failure.",
            "Failure results in a 3-day ban from starting a new challenge.",
        ],
        dailyGoals: [
            { id: 'studyTime', description: 'Total Study Time', target: 3600 },
            { id: 'focusSession', description: 'Focus Sessions', target: 1 },
            { id: 'tasks', description: 'Planned Tasks', target: 3 },
        ],
        checkInTime: '21:00'
    },
];

export function useChallenges() {
    const { user } = useUser();
    const { toast } = useToast();
    const { addCreditsToUser, currentUserData, makeUserChallenger } = useUsers();
    const [allChallenges] = useState<ChallengeConfig[]>(CHALLENGE_CONFIGS);
    const [activeChallenge, setActiveChallenge] = useState<ActiveChallenge | null>(null);
    const [loading, setLoading] = useState(true);

    const challengeDocRef = useMemo(() => {
        if (!user) return null;
        return doc(db, 'users', user.id, 'challenges', 'active_challenge');
    }, [user]);

    // Fetch active challenge
    useEffect(() => {
        if (!challengeDocRef) {
            setLoading(false);
            return;
        }
        const unsubscribe = onSnapshot(challengeDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data() as ActiveChallenge;
                // Calculate current day
                const startDate = new Date(data.startDate);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - startDate.getTime());
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
                const currentDay = Math.min(diffDays, data.duration);

                setActiveChallenge({ ...data, currentDay });
            } else {
                setActiveChallenge(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, [challengeDocRef]);

    const startChallenge = useCallback(async (challengeConfig: ChallengeConfig, plannedTasks: Record<number, PlannedTaskCategory[]>) => {
        if (!user || !currentUserData) throw new Error("User not found");
        if (activeChallenge) throw new Error("You already have an active challenge.");
        
        if (currentUserData.credits < challengeConfig.entryFee) {
            throw new Error(`Insufficient credits. You need ${challengeConfig.entryFee} credits.`);
        }
        
        // Deduct entry fee
        await addCreditsToUser(user.id, -challengeConfig.entryFee);

        const newChallenge: ActiveChallenge = {
            ...challengeConfig,
            userId: user.id,
            startDate: new Date().toISOString(),
            status: 'active',
            currentDay: 1,
            progress: {},
            plannedTasks: plannedTasks,
        };
        if(challengeDocRef) await setDoc(challengeDocRef, newChallenge);
        setActiveChallenge(newChallenge);
    }, [user, currentUserData, activeChallenge, challengeDocRef, addCreditsToUser]);

    const checkIn = useCallback(async () => {
        if (!user || !activeChallenge || !challengeDocRef) return;
        
        const today = activeChallenge.currentDay;
        const todayProgress = activeChallenge.progress[today] || {};
        
        const allGoalsMet = activeChallenge.dailyGoals.every(goal => todayProgress[goal.id]?.completed);

        if (!allGoalsMet) {
            toast({ variant: 'destructive', title: "Goals Not Met", description: "You must complete all daily goals before checking in." });
            return;
        }

        if (activeChallenge.lastCheckInDay === today) {
            toast({ title: "Already Checked In!", description: "You've already secured your progress for today." });
            return;
        }
        
        // Final day check-in
        if (today === activeChallenge.duration) {
            await updateDoc(challengeDocRef, {
                status: 'completed',
                lastCheckInDay: today
            });
            // Award prize
            await addCreditsToUser(user.id, activeChallenge.reward + activeChallenge.entryFee);
            await makeUserChallenger(user.id);

            toast({ title: "Challenge Complete!", description: `Congratulations! ${activeChallenge.reward + activeChallenge.entryFee} credits have been awarded.` });

        } else {
             await updateDoc(challengeDocRef, {
                lastCheckInDay: today
            });
            toast({ title: "Checked In!", description: "Your progress for today has been saved. Keep it up!" });
        }
    }, [user, activeChallenge, challengeDocRef, toast, addCreditsToUser, makeUserChallenger]);

    const failChallenge = useCallback(async (isAutoFail: boolean = true) => {
        if (!user || !activeChallenge || !challengeDocRef) return;

        await updateDoc(challengeDocRef, {
            status: 'failed',
            banUntil: addDays(new Date(), 3).toISOString()
        });
        
        if (!isAutoFail) { // Manual forfeit
            await addCreditsToUser(user.id, -50);
            toast({ variant: 'destructive', title: "Challenge Forfeited", description: "50 credits have been deducted." });
        }

    }, [user, activeChallenge, challengeDocRef, addCreditsToUser, toast]);

    // Auto-fail logic
    useEffect(() => {
        if (activeChallenge && activeChallenge.status === 'active') {
            const startDate = new Date(activeChallenge.startDate);
            // Check previous days
            for (let i = 1; i < activeChallenge.currentDay; i++) {
                if (activeChallenge.lastCheckInDay !== i) {
                    failChallenge();
                    break;
                }
            }
            // Check if current day check-in was missed
            const checkInDate = addDays(startDate, activeChallenge.currentDay - 1);
            if (activeChallenge.checkInTime) {
                const [h, m] = activeChallenge.checkInTime.split(':').map(Number);
                const checkInEnd = new Date(checkInDate);
                checkInEnd.setHours(h, m + 10, 0, 0); // 10 min window
                if (isPast(checkInEnd) && activeChallenge.lastCheckInDay !== activeChallenge.currentDay) {
                     failChallenge();
                }
            }
        }
    }, [activeChallenge, failChallenge]);
    
    const liftChallengeBan = useCallback(async () => {
        if (!user || !currentUserData || !activeChallenge || activeChallenge.status !== 'failed') return;

        if (currentUserData.credits < 100) {
            toast({ variant: 'destructive', title: "Insufficient Credits", description: "You need 100 credits to lift the ban." });
            return;
        }

        await addCreditsToUser(user.id, -100);
        await deleteDoc(challengeDocRef!); // Delete the failed challenge doc
        toast({ title: "Ban Lifted", description: "You can now start a new challenge." });
    }, [user, currentUserData, activeChallenge, challengeDocRef, addCreditsToUser, toast]);
    
    const toggleTaskCompletion = useCallback(async (day: number, taskId: string) => {
        if (!user || !activeChallenge || !challengeDocRef) return;

        const newMilestones = (activeChallenge.plannedTasks || {})[day].map(cat => ({
            ...cat,
            tasks: cat.tasks.map(task => 
                task.id === taskId ? { ...task, completed: !task.completed } : task
            )
        }));
        
        await updateDoc(challengeDocRef, {
            [`plannedTasks.${day}`]: newMilestones
        });

    }, [user, activeChallenge, challengeDocRef]);
    
     const dailyProgress = useMemo(() => {
        if (!activeChallenge) return null;
        return activeChallenge.progress[activeChallenge.currentDay] || {};
    }, [activeChallenge]);


    return { allChallenges, activeChallenge, loading, startChallenge, checkIn, failChallenge, liftChallengeBan, dailyProgress, toggleTaskCompletion };
}

```
  </change>
  <change>
    <file>/src/hooks/use-friends.tsx</file>
    <content><![CDATA[

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

        const unsubReceived = onSnapshot(qReceived, (snapshot) => {
            const requests = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                } as FriendRequest
            });
            setFriendRequests(requests);
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
