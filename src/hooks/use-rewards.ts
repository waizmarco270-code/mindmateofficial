
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, increment, arrayUnion, Timestamp } from 'firebase/firestore';
import { isToday, parseISO, getDayOfYear } from 'date-fns';
import { useToast } from './use-toast';
import { useUsers } from './use-admin';

interface RewardRecord {
    reward: number | string;
    date: Date;
    source: string;
}

export const useRewards = () => {
    const { user } = useUser();
    const { currentUserData, addCreditsToUser } = useUsers();
    const { toast } = useToast();
    
    // State for both games
    const [lastScratchDate, setLastScratchDate] = useState<Date | null>(null);
    const [lastGiftBoxDate, setLastGiftBoxDate] = useState<Date | null>(null);
    const [freeRewards, setFreeRewards] = useState(0);
    const [rewardHistory, setRewardHistory] = useState<RewardRecord[]>([]);

    useEffect(() => {
        if(currentUserData) {
            setLastScratchDate(currentUserData.lastRewardDate ? parseISO(currentUserData.lastRewardDate) : null);
            setLastGiftBoxDate(currentUserData.lastGiftBoxDate ? parseISO(currentUserData.lastGiftBoxDate) : null);
            setFreeRewards(currentUserData.freeRewards || 0);
            setRewardHistory(
                (currentUserData.rewardHistory || [])
                .map((h: any) => ({ ...h, date: h.date?.toDate() || new Date(), source: h.source || 'Unknown' }))
                .sort((a: RewardRecord, b: RewardRecord) => b.date.getTime() - a.date.getTime())
            );
        }
    }, [currentUserData]);
    
    // ===== SCRATCH CARD LOGIC =====
    const canClaimScratchCard = useMemo(() => {
        if (freeRewards > 0) return true;
        if (!lastScratchDate) return true;
        return !isToday(lastScratchDate);
    }, [lastScratchDate, freeRewards]);

    const availableScratchCards = useMemo(() => {
        const dailyReward = lastScratchDate && isToday(lastScratchDate) ? 0 : 1;
        return dailyReward + freeRewards;
    }, [lastScratchDate, freeRewards]);
    
    const claimDailyReward = useCallback(async () => {
        if (!canClaimScratchCard || !user) {
            toast({ variant: 'destructive', title: 'No scratch cards left for today!' });
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
        const newRecord = { reward: chosenPrize.value, date: new Date(), source: 'Scratch Card' };

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
    }, [canClaimScratchCard, user, addCreditsToUser, freeRewards, toast]);

    // ===== GIFT BOX LOGIC =====
    const canClaimGiftBox = useMemo(() => {
        if (!lastGiftBoxDate) return true;
        return !isToday(lastGiftBoxDate);
    }, [lastGiftBoxDate]);
    
    const availableGiftBoxGuesses = useMemo(() => {
        return canClaimGiftBox ? 1 : 0;
    }, [canClaimGiftBox]);
    
    // Determine a consistent winning box for the user for the entire day
    const winningBoxIndex = useMemo(() => {
        if (!user) return 0;
        const day = getDayOfYear(new Date());
        // A simple "hash" to get a number between 0 and 3
        const userNum = user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return (day + userNum) % 4;
    }, [user]);

    const claimGiftBoxReward = useCallback(async (selectedIndex: number) => {
        if (!canClaimGiftBox || !user) {
            toast({ variant: 'destructive', title: 'No guesses left for today!' });
            return { prize: 'better luck', isWin: false };
        }
        
        const prizeAmount = 10; // The prize for the winning box
        const userDocRef = doc(db, 'users', user.id);
        let prize: number | 'better luck' = 'better luck';
        let isWin = false;

        if (selectedIndex === winningBoxIndex) {
            prize = prizeAmount;
            isWin = true;
            await addCreditsToUser(user.id, prizeAmount);
            toast({ title: "You Won!", description: `Congratulations! ${prizeAmount} credits have been added.`, className: "bg-green-500/10 border-green-500/50" });
        } else {
             toast({ title: "Not this one!", description: "Better luck next time!" });
        }
        
        const newRecord = { reward: prize, date: new Date(), source: 'Gift Box' };
        await updateDoc(userDocRef, {
            lastGiftBoxDate: new Date().toISOString(),
            rewardHistory: arrayUnion(newRecord)
        });

        return { prize, isWin };
    }, [canClaimGiftBox, user, addCreditsToUser, toast, winningBoxIndex]);

    return { 
        canClaimScratchCard,
        claimDailyReward, 
        availableScratchCards,
        rewardHistory,
        canClaimGiftBox,
        availableGiftBoxGuesses,
        winningBoxIndex,
        claimGiftBoxReward,
    };
};
