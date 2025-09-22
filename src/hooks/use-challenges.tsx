
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot } from 'firebase/firestore';
import { differenceInCalendarDays, startOfDay } from 'date-fns';
import { useUsers } from './use-admin';
import { useToast } from './use-toast';
import { useTimeTracker } from './use-time-tracker';

export interface DailyGoal {
    id: 'studyTime' | 'focusSession' | 'tasks' | 'checkIn';
    description: string;
    target: number;
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
    isCustom?: boolean; // Flag for custom challenges
}

export interface ActiveChallenge extends ChallengeConfig {
    startDate: string; // ISO string
    currentDay: number;
    status: 'active' | 'completed' | 'failed';
    progress: Record<number, Record<string, { current: number; completed: boolean }>>; // { day: { goalId: { current: value, completed: bool } } }
    lastCheckedIn: string; // ISO string for the date
}

interface ChallengesContextType {
    activeChallenge: ActiveChallenge | null;
    startChallenge: (config: ChallengeConfig) => Promise<void>;
    checkIn: () => Promise<void>;
    loading: boolean;
    dailyProgress: Record<string, { current: number; completed: boolean }> | null;
}

const ChallengesContext = createContext<ChallengesContextType | undefined>(undefined);

export const ChallengesProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useUser();
    const { currentUserData, addCreditsToUser, loading: userLoading } = useUsers();
    const { sessions } = useTimeTracker();
    const { toast } = useToast();
    const [activeChallenge, setActiveChallenge] = useState<ActiveChallenge | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch active challenge
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
                
                // Update current day based on start date
                const today = startOfDay(new Date());
                const startDate = startOfDay(new Date(data.startDate));
                const dayDiff = differenceInCalendarDays(today, startDate) + 1;

                if (data.status === 'active' && dayDiff > data.currentDay) {
                     updateDoc(challengeRef, { currentDay: dayDiff });
                     data.currentDay = dayDiff;
                }
                setActiveChallenge(data);
            } else {
                setActiveChallenge(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

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
            challengeId: config.id, // Keep a stable ID for pre-made challenges
            startDate: today,
            currentDay: 1,
            status: 'active',
            progress: {},
            lastCheckedIn: new Date(0).toISOString() // Epoch time
        };

        const challengeRef = doc(db, 'users', user.id, 'challenges', 'activeChallenge');
        await setDoc(challengeRef, newChallenge);
        setActiveChallenge(newChallenge);
        toast({ title: "Challenge Started!", description: `The ${config.title} has begun!` });

    }, [user, currentUserData, activeChallenge, addCreditsToUser, toast]);

    const checkIn = useCallback(async () => {
        if (!user || !activeChallenge || activeChallenge.status !== 'active') return;

        const todayStr = new Date().toISOString().split('T')[0];
        if (activeChallenge.lastCheckedIn.startsWith(todayStr)) {
            toast({ title: "Already Checked In!", description: "You've already checked in for today." });
            return;
        }
        
        const challengeRef = doc(db, 'users', user.id, 'challenges', 'activeChallenge');
        await updateDoc(challengeRef, {
            [`progress.${activeChallenge.currentDay}.checkIn`]: { current: 1, completed: true },
            lastCheckedIn: new Date().toISOString()
        });
        toast({ title: "Checked In!", description: "Today's check-in is complete.", className: "bg-green-500/10 border-green-500/50" });

    }, [user, activeChallenge, toast]);

    const dailyProgress = activeChallenge?.progress[activeChallenge.currentDay] || null;


    const value: ChallengesContextType = {
        activeChallenge,
        startChallenge,
        checkIn,
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
