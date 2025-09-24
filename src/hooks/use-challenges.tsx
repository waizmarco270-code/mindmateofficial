
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot, Timestamp, deleteDoc } from 'firebase/firestore';
import { differenceInCalendarDays, startOfDay, addDays, format as formatDate, set } from 'date-fns';
import { useUsers } from './use-admin';
import { useToast } from './use-toast';
import { useTimeTracker } from './use-time-tracker';
import { useRouter } from 'next/navigation';

export interface DailyGoal {
    id: 'studyTime' | 'focusSession' | 'tasks' | 'checkIn';
    description: string;
    target: number;
}

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


export interface ChallengeConfig {
    id: string;
    title: string;
    duration: number; // in days
    entryFee: number;
    reward: number;
    description: string;
    dailyGoals: DailyGoal[];
    rules: string[];
    eliteBadgeDays: number;
    isCustom?: boolean;
    checkInTime?: string; // HH:mm format
    plannedTasks?: Record<number, PlannedTaskCategory[]>;
}

export interface ActiveChallenge extends ChallengeConfig {
    startDate: string; // ISO string
    currentDay: number;
    status: 'active' | 'completed' | 'failed';
    progress: Record<number, Record<string, { current: number; completed: boolean }>>;
    lastCheckedIn: string; // ISO string for the date
    banUntil?: string; // ISO string for ban expiry
}

interface ChallengesContextType {
    activeChallenge: ActiveChallenge | null;
    startChallenge: (config: ChallengeConfig) => Promise<void>;
    checkIn: () => Promise<void>;
    failChallenge: (silent?: boolean) => Promise<void>;
    liftChallengeBan: () => Promise<void>;
    toggleTaskCompletion: (day: number, taskId: string) => Promise<void>;
    loading: boolean;
    dailyProgress: Record<string, { current: number; completed: boolean }> | null;
}

const ChallengesContext = createContext<ChallengesContextType | undefined>(undefined);

export const ChallengesProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useUser();
    const router = useRouter();
    const { currentUserData, addCreditsToUser, loading: userLoading, makeUserChallenger } = useUsers();
    const { totalTimeToday } = useTimeTracker(); // Integrate time tracker
    const { toast } = useToast();
    const [activeChallenge, setActiveChallenge] = useState<ActiveChallenge | null>(null);
    const [loading, setLoading] = useState(true);
    
    const PENALTY_ON_FAIL = 50;
    const BAN_LIFT_COST = 100;

    const resetInvalidChallenge = useCallback(async () => {
        if (!user) return;
        const challengeRef = doc(db, 'users', user.id, 'challenges', 'activeChallenge');
        await deleteDoc(challengeRef);
        setActiveChallenge(null);
        console.log("Invalid challenge data detected and cleared.");
    }, [user]);

     const failChallenge = useCallback(async (silent = false) => {
        if (!user || !activeChallenge) return;
        
        const banExpiry = addDays(new Date(), 3).toISOString();
        const challengeRef = doc(db, 'users', user.id, 'challenges', 'activeChallenge');

        await updateDoc(challengeRef, {
            status: 'failed',
            banUntil: banExpiry,
        });
        
        await addCreditsToUser(user.id, -PENALTY_ON_FAIL);

        if (!silent) {
             toast({
                variant: "destructive",
                title: "Challenge Failed!",
                description: `You have been penalized ${PENALTY_ON_FAIL} credits and banned from challenges for 3 days.`,
                duration: 10000,
            });
        }

    }, [user, activeChallenge, addCreditsToUser, toast]);
    
    const completeChallenge = useCallback(async (challenge: ActiveChallenge) => {
        if (!user) return;
        
        const challengeRef = doc(db, 'users', user.id, 'challenges', 'activeChallenge');
        const refund = challenge.entryFee + challenge.reward;
        
        await addCreditsToUser(user.id, refund);
        await makeUserChallenger(user.id);
        
        await updateDoc(challengeRef, {
            status: 'completed'
        });

        toast({
            title: "Challenge Completed!",
            description: `Congratulations! You have earned ${refund} credits and the 'Challenger' badge!`,
            className: "bg-green-500/10 border-green-500/50"
        });

    }, [user, addCreditsToUser, makeUserChallenger, toast]);

    // Main challenge state and auto-fail logic
    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const challengeRef = doc(db, 'users', user.id, 'challenges', 'activeChallenge');
        
        const unsubscribe = onSnapshot(challengeRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as ActiveChallenge;
                
                setActiveChallenge(data);

            } else {
                setActiveChallenge(null);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching challenge:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, resetInvalidChallenge, failChallenge, completeChallenge]);

    // Effect to sync study time with challenge progress
    useEffect(() => {
        if (!user || !activeChallenge || activeChallenge.status !== 'active') return;

        const studyGoal = activeChallenge.dailyGoals.find(g => g.id === 'studyTime');
        if (!studyGoal) return;
        
        const currentProgress = activeChallenge.progress[activeChallenge.currentDay]?.studyTime?.current || 0;
        
        if (totalTimeToday > currentProgress) {
             const challengeRef = doc(db, 'users', user.id, 'challenges', 'activeChallenge');
             const isCompleted = totalTimeToday >= studyGoal.target;
             updateDoc(challengeRef, {
                 [`progress.${activeChallenge.currentDay}.studyTime`]: { current: totalTimeToday, completed: isCompleted }
             });
        }

    }, [totalTimeToday, activeChallenge, user]);


    const startChallenge = useCallback(async (config: ChallengeConfig) => {
        if (!user || !currentUserData || activeChallenge) return;

        if (currentUserData.credits < config.entryFee) {
            toast({ variant: 'destructive', title: "Insufficient Credits", description: `You need ${config.entryFee} credits to start.` });
            return;
        }

        await addCreditsToUser(user.id, -config.entryFee);

        const today = new Date().toISOString();
        const newChallenge: ActiveChallenge = {
            ...config,
            startDate: today,
            currentDay: 1,
            status: 'active',
            progress: {},
            lastCheckedIn: new Date(0).toISOString()
        };

        const challengeRef = doc(db, 'users', user.id, 'challenges', 'activeChallenge');
        await setDoc(challengeRef, newChallenge);
        
        // This will trigger the onSnapshot listener, which will update state and cause redirection.
        toast({ title: "Challenge Started!", description: `The ${config.title} has begun!` });
        router.push('/dashboard/challenger/custom');

    }, [user, currentUserData, activeChallenge, addCreditsToUser, toast, router]);
    

    const checkIn = useCallback(async () => {
        if (!user || !activeChallenge || activeChallenge.status !== 'active') return;

        const today = new Date();
        const currentDayProgress = activeChallenge.progress[activeChallenge.currentDay];
        
        if(!currentDayProgress) {
             toast({ variant: 'destructive', title: "Goals Not Met", description: "You must complete all other daily goals before checking in." });
            return;
        }

        const allGoalsMetForToday = activeChallenge.dailyGoals
                .filter(g => g.id !== 'checkIn')
                .every(g => currentDayProgress[g.id]?.completed);


        if (!allGoalsMetForToday) {
             toast({ variant: 'destructive', title: "Goals Not Met", description: "You must complete all other daily goals before checking in." });
            return;
        }

        if(activeChallenge.checkInTime) {
            const [hours, minutes] = activeChallenge.checkInTime.split(':').map(Number);
            const checkInStart = set(today, { hours, minutes, seconds: 0, milliseconds: 0 });
            const checkInEnd = set(today, { hours, minutes: minutes + 10 }); // 10 min window

            if (today < checkInStart || today > checkInEnd) {
                toast({
                    variant: 'destructive',
                    title: "Check-in Window Closed",
                    description: `You can only check in between ${formatDate(checkInStart, 'HH:mm')} and ${formatDate(checkInEnd, 'HH:mm')}.`
                });
                return;
            }
        }
        
        const challengeRef = doc(db, 'users', user.id, 'challenges', 'activeChallenge');
        await updateDoc(challengeRef, {
            [`progress.${activeChallenge.currentDay}.checkIn`]: { current: 1, completed: true },
        });
        
        toast({ title: "Checked In!", description: "Today's check-in is complete.", className: "bg-green-500/10 border-green-500/50" });
        
        // If it's the last day and all goals are met, complete the challenge
        if(activeChallenge.currentDay === activeChallenge.duration) {
            await completeChallenge(activeChallenge);
        }

    }, [user, activeChallenge, toast, completeChallenge]);

    const liftChallengeBan = useCallback(async () => {
        if (!user || !currentUserData || !activeChallenge || activeChallenge.status !== 'failed') return;
        
        if (currentUserData.credits < BAN_LIFT_COST) {
            toast({ variant: 'destructive', title: "Insufficient Credits", description: `You need ${BAN_LIFT_COST} credits to lift the ban.` });
            return;
        }

        await addCreditsToUser(user.id, -BAN_LIFT_COST);

        const challengeRef = doc(db, 'users', user.id, 'challenges', 'activeChallenge');
        await deleteDoc(challengeRef);
        setActiveChallenge(null);

        toast({ title: "Ban Lifted!", description: "You can now start a new challenge." });

    }, [user, currentUserData, activeChallenge, addCreditsToUser, toast]);
    
    const toggleTaskCompletion = useCallback(async (day: number, taskId: string) => {
        if (!user || !activeChallenge || activeChallenge.status !== 'active' || day !== activeChallenge.currentDay) return;

        const newPlannedTasks = JSON.parse(JSON.stringify(activeChallenge.plannedTasks || {}));
        const dayCategories: PlannedTaskCategory[] | undefined = newPlannedTasks[day];
        if(!dayCategories) return;

        let taskFound = false;
        for (const category of dayCategories) {
            const taskIndex = category.tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                category.tasks[taskIndex].completed = !category.tasks[taskIndex].completed;
                taskFound = true;
                break;
            }
        }

        if (!taskFound) return;

        // Check if all tasks for the day are now complete
        const allTasksCompleted = dayCategories.every((c: PlannedTaskCategory) => c.tasks.every((t: PlannedTask) => t.completed));
        const tasksGoal = activeChallenge.dailyGoals.find(g => g.id === 'tasks');

        const challengeRef = doc(db, 'users', user.id, 'challenges', 'activeChallenge');
        
        const updates: any = {
            plannedTasks: newPlannedTasks
        };
        
        if (tasksGoal) {
            updates[`progress.${day}.tasks`] = {
                current: allTasksCompleted ? 1 : 0,
                completed: allTasksCompleted
            }
        }
        
        await updateDoc(challengeRef, updates);

    }, [user, activeChallenge]);

    const dailyProgress = activeChallenge?.progress[activeChallenge.currentDay] || null;

    const value: ChallengesContextType = {
        activeChallenge,
        startChallenge,
        checkIn,
        failChallenge,
        liftChallengeBan,
        toggleTaskCompletion,
        loading: userLoading || loading,
        dailyProgress
    };

    return <ChallengesContext.Provider value={value}>{children}</ChallengesContext.Provider>;
};

export const useChallenges = () => {
    const context = useContext(ChallengesContext);
    if (!context) {
        throw new Error('useChallenges must be used within a ChallengesProvider');
    }
    return context;
};
