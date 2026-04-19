'use client';
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import {
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { useUsers } from './use-admin';
import { useToast } from './use-toast';

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

export interface ActiveChallenge {
    id: string;
    userId: string;
    title: string;
    duration: number;
    startDate: string;
    status: 'active' | 'completed' | 'failed';
    checkInTime: string; // HH:mm format
    dailyWorkHourTarget: number;
    plannedTasks: Record<number, PlannedTaskCategory[]>; // Day number -> Tasks
    lifelines: number;
    lastCheckInDay: number;
    penalty: number;
    reward: number;
    badgeToUnlock: string;
    failMessage?: string;
    hasNoFapTracker?: boolean;
    noFapStartDate?: string; 
}

export const CHALLENGE_CONFIGS = [
    {
        id: '7-day-warrior',
        title: '7-Day Warrior',
        duration: 7,
        penalty: 999,
        reward: 2000,
        badgeToUnlock: 'challenger',
        tag: 'RECOMMENDED',
        tagColor: 'bg-blue-500',
        description: 'Build core discipline. Check in daily and meet your work targets.'
    },
    {
        id: '21-day-champion',
        title: '21-Day Champion',
        duration: 21,
        penalty: 3999,
        reward: 6999,
        badgeToUnlock: 'champion',
        tag: "TOPPER'S CHOICE",
        tagColor: 'bg-amber-500',
        description: 'Forge an unbreakable identity. 3 weeks of perfect execution.'
    }
];

export function useChallenges() {
    const { user } = useUser();
    const { toast } = useToast();
    const { addCreditsToUser, currentUserData } = useUsers();
    const [activeChallenge, setActiveChallenge] = useState<ActiveChallenge | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }
        const unsub = onSnapshot(doc(db, 'users', user.id, 'challenges', 'active'), (snap) => {
            if (snap.exists()) {
                setActiveChallenge(snap.data() as ActiveChallenge);
            } else {
                setActiveChallenge(null);
            }
            setLoading(false);
        });
        return unsub;
    }, [user]);

    const startChallenge = async (
        configId: string, 
        checkInTime: string, 
        lifelines: number, 
        dailyWorkHourTarget: number,
        plannedTasks: Record<number, PlannedTaskCategory[]>,
        hasNoFapTracker: boolean
    ) => {
        if (!user || !currentUserData) return;
        const config = CHALLENGE_CONFIGS.find(c => c.id === configId);
        if (!config) return;

        const lifelineCost = lifelines * 300;
        const hasMaster = currentUserData.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();

        if (!hasMaster && currentUserData.credits < lifelineCost) {
            toast({ variant: 'destructive', title: "Credits Required", description: "You need more credits to secure these lifelines." });
            return;
        }

        const newChallenge: ActiveChallenge = {
            id: config.id,
            userId: user.id,
            title: config.title,
            duration: config.duration,
            penalty: config.penalty,
            reward: config.reward,
            badgeToUnlock: config.badgeToUnlock,
            startDate: new Date().toISOString(),
            status: 'active',
            checkInTime,
            dailyWorkHourTarget,
            plannedTasks,
            lifelines,
            lastCheckInDay: 0,
            hasNoFapTracker,
            noFapStartDate: hasNoFapTracker ? new Date().toISOString() : undefined
        };

        if (!hasMaster && lifelineCost > 0) {
            await addCreditsToUser(user.id, -lifelineCost);
        }

        await setDoc(doc(db, 'users', user.id, 'challenges', 'active'), newChallenge);
        toast({ 
            title: "MISSION INITIALIZED", 
            description: "Target locked. Objectives etched. Do not fail the mainframe.",
            className: "bg-black text-white border-primary"
        });
    };

    const consumeLifeline = async (day: number) => {
        if (!user || !activeChallenge) return;
        if (activeChallenge.lifelines <= 0) return;

        await updateDoc(doc(db, 'users', user.id, 'challenges', 'active'), {
            lifelines: increment(-1),
            lastCheckInDay: day
        });
    };

    const performCheckIn = async () => {
        if (!user || !activeChallenge) return;
        
        const now = new Date();
        const startDate = new Date(activeChallenge.startDate);
        const dayDiff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const currentDay = Math.min(dayDiff, activeChallenge.duration);

        if (activeChallenge.lastCheckInDay === currentDay) {
            toast({ title: "Pulse Secured", description: "You have already checked in for today." });
            return;
        }

        const isLastDay = currentDay === activeChallenge.duration;
        const updates: Partial<ActiveChallenge> = {
            lastCheckInDay: currentDay
        };

        if (isLastDay) {
            updates.status = 'completed';
            await addCreditsToUser(user.id, activeChallenge.reward);
            const badgeKey = `is${activeChallenge.badgeToUnlock.charAt(0).toUpperCase() + activeChallenge.badgeToUnlock.slice(1)}`;
            await updateDoc(doc(db, 'users', user.id), { [badgeKey]: true, showcasedBadge: activeChallenge.badgeToUnlock });
            toast({ title: "ASCENSION COMPLETE!", description: `+${activeChallenge.reward} Credits secured. You are a true legend.` });
        } else {
            toast({ title: `Day ${currentDay} Pulse Secured`, description: `${activeChallenge.duration - currentDay} more cycles remain.` });
        }

        await updateDoc(doc(db, 'users', user.id, 'challenges', 'active'), updates);
    };

    const failChallenge = async (reason: string) => {
        if (!user || !activeChallenge) return;
        
        const updates: Partial<ActiveChallenge> = {
            status: 'failed',
            failMessage: reason
        };

        const hasMaster = currentUserData?.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();
        if (!hasMaster) {
            await addCreditsToUser(user.id, -activeChallenge.penalty);
        }
        
        await updateDoc(doc(db, 'users', user.id, 'challenges', 'active'), updates);
        
        toast({ 
            variant: 'destructive', 
            title: "PROTOCOL TERMINATED", 
            description: `You lacked the discipline required. -${activeChallenge.penalty} Credits deducted.` 
        });
    };

    const forfeitChallenge = async (reason: string) => {
        if (!user || !activeChallenge) return;
        await failChallenge(`MISSION ABORTED BY USER. CONFESSION: ${reason}`);
    };

    const resetChallenge = async () => {
        if (!user) return;
        await deleteDoc(doc(db, 'users', user.id, 'challenges', 'active'));
    };

    return { activeChallenge, loading, startChallenge, performCheckIn, failChallenge, forfeitChallenge, resetChallenge, consumeLifeline };
}
