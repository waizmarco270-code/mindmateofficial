
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
  serverTimestamp,
  increment,
  Timestamp
} from 'firebase/firestore';
import { useUsers } from './use-admin';
import { useToast } from './use-toast';
import { addDays, isPast, isToday, differenceInMinutes, set, subMinutes } from 'date-fns';

export interface ActiveChallenge {
    id: string;
    userId: string;
    title: string;
    duration: number;
    startDate: string;
    status: 'active' | 'completed' | 'failed';
    checkInTime: string; // HH:mm format
    lifelines: number;
    lastCheckInDay: number;
    penalty: number;
    reward: number;
    badgeToUnlock: string;
    failMessage?: string;
}

export const CHALLENGE_CONFIGS = [
    {
        id: '7-day-warrior',
        title: '7-Day Warrior',
        duration: 7,
        penalty: 999,
        reward: 2000,
        badgeToUnlock: 'challenger',
        description: 'Build core discipline. Check in daily at your chosen hour.'
    },
    {
        id: '21-day-champion',
        title: '21-Day Champion',
        duration: 21,
        penalty: 3999,
        reward: 6999,
        badgeToUnlock: 'champion',
        description: 'Forge an unbreakable identity. 3 weeks of perfect execution.'
    }
];

export function useChallenges() {
    const { user } = useUser();
    const { toast } = useToast();
    const { addCreditsToUser, currentUserData, setShowcaseBadge } = useUsers();
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

    const startChallenge = async (configId: string, checkInTime: string, lifelines: number) => {
        if (!user || !currentUserData) return;
        const config = CHALLENGE_CONFIGS.find(c => c.id === configId);
        if (!config) return;

        const lifelineCost = lifelines * 300;
        if (currentUserData.credits < lifelineCost) {
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
            lifelines,
            lastCheckInDay: 0
        };

        if (lifelineCost > 0) {
            await addCreditsToUser(user.id, -lifelineCost);
        }

        await setDoc(doc(db, 'users', user.id, 'challenges', 'active'), newChallenge);
        toast({ title: "MISSION INITIALIZED", description: "Your path to legend begins now. Do not miss your window." });
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
            // Badge logic here if needed
            toast({ title: "ASCENSION COMPLETE!", description: `+${activeChallenge.reward} Credits secured. You are a true legend.` });
        } else {
            toast({ title: "Day " + currentDay + " Secured", description: "Maintain focus for " + (activeChallenge.duration - currentDay) + " more days." });
        }

        await updateDoc(doc(db, 'users', user.id, 'challenges', 'active'), updates);
    };

    const failChallenge = async (reason: string) => {
        if (!user || !activeChallenge) return;
        
        const updates: Partial<ActiveChallenge> = {
            status: 'failed',
            failMessage: reason
        };

        await addCreditsToUser(user.id, -activeChallenge.penalty);
        await updateDoc(doc(db, 'users', user.id, 'challenges', 'active'), updates);
        
        toast({ 
            variant: 'destructive', 
            title: "PROTOCOL TERMINATED", 
            description: `You failed the mission. -${activeChallenge.penalty} Credits deducted.` 
        });
    };

    const resetChallenge = async () => {
        if (!user) return;
        await deleteDoc(doc(db, 'users', user.id, 'challenges', 'active'));
    };

    return { activeChallenge, loading, startChallenge, performCheckIn, failChallenge, resetChallenge };
}
