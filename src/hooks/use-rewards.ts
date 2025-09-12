
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, increment, arrayUnion, Timestamp } from 'firebase/firestore';
import { isToday, parseISO } from 'date-fns';
import { useToast } from './use-toast';
import { useUsers } from './use-admin';

interface RewardRecord {
    reward: number | string;
    date: Date;
}

export const useRewards = () => {
    const { user } = useUser();
    const { currentUserData, addCreditsToUser } = useUsers();
    const { toast } = useToast();
    
    const [lastRewardDate, setLastRewardDate] = useState<Date | null>(null);
    const [freeRewards, setFreeRewards] = useState(0);
    const [rewardHistory, setRewardHistory] = useState<RewardRecord[]>([]);

    useEffect(() => {
        if(currentUserData) {
            setLastRewardDate(currentUserData.lastRewardDate ? parseISO(currentUserData.lastRewardDate) : null);
            setFreeRewards(currentUserData.freeRewards || 0);
            setRewardHistory(
                (currentUserData.rewardHistory || [])
                .map((h: any) => ({ ...h, date: h.date?.toDate() || new Date() }))
                .sort((a: RewardRecord, b: RewardRecord) => b.date.getTime() - a.date.getTime())
            );
        }
    }, [currentUserData]);
    
    const canClaimReward = useMemo(() => {
        if (freeRewards > 0) return true;
        if (!lastRewardDate) return true; // Never claimed before
        return !isToday(lastRewardDate);
    }, [lastRewardDate, freeRewards]);

     const availableRewards = useMemo(() => {
        const dailyReward = lastRewardDate && isToday(lastRewardDate) ? 0 : 1;
        return dailyReward + freeRewards;
    }, [lastRewardDate, freeRewards]);
    
    const claimDailyReward = useCallback(async () => {
        if (!canClaimReward || !user) {
            toast({ variant: 'destructive', title: 'No rewards left for today!' });
            return { prize: 'better luck' };
        }
        
        const weightedPrizes = [
            { value: 'better luck', weight: 40 },
            { value: 2, weight: 30 },
            { value: 5, weight: 20 },
            { value: 10, weight: 9 },
            { value: 100, weight: 1 }
        ];
        
        const totalWeight = weightedPrizes.reduce((sum, p) => sum + p.weight, 0);
        let random = Math.random() * totalWeight;
        
        let chosenPrize: { value: number | string; weight: number } | undefined;
        for (const prize of weightedPrizes) {
            if (random < prize.weight) {
                chosenPrize = prize;
                break;
            }
            random -= prize.weight;
        }
        chosenPrize ??= weightedPrizes[0];
        
        const userDocRef = doc(db, 'users', user.id);
        const newRecord = { reward: chosenPrize.value, date: new Date() };

        if(freeRewards > 0) {
            await updateDoc(userDocRef, { freeRewards: increment(-1), rewardHistory: arrayUnion({ ...newRecord }) });
        } else {
            await updateDoc(userDocRef, { lastRewardDate: new Date().toISOString(), rewardHistory: arrayUnion({ ...newRecord }) });
        }

        if (typeof chosenPrize.value === 'number') {
            await addCreditsToUser(user.id, chosenPrize.value);
            toast({ title: "You Won!", description: `Congratulations! ${chosenPrize.value} credits have been added to your account.`, className: "bg-green-500/10 border-green-500/50" });
        } else {
             toast({ title: "Better Luck Next Time!", description: "Keep trying, your lucky day is coming!" });
        }

        return { prize: chosenPrize.value };

    }, [canClaimReward, user, addCreditsToUser, freeRewards, toast]);

    return { 
        canClaimReward, 
        claimDailyReward, 
        availableRewards,
        rewardHistory 
    };
};
