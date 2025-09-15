
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
    source: string;
}

export const useRewards = () => {
    const { user } = useUser();
    const { currentUserData, addCreditsToUser } = useUsers();
    const { toast } = useToast();
    
    // State for all games
    const [lastScratchDate, setLastScratchDate] = useState<Date | null>(null);
    const [lastCardFlipDate, setLastCardFlipDate] = useState<Date | null>(null);
    const [lastRpsDate, setLastRpsDate] = useState<Date | null>(null);
    const [freeRewards, setFreeRewards] = useState(0); // For scratch cards
    const [freeGuesses, setFreeGuesses] = useState(0); // For Card Flip
    const [rewardHistory, setRewardHistory] = useState<RewardRecord[]>([]);

    useEffect(() => {
        if(currentUserData) {
            setLastScratchDate(currentUserData.lastRewardDate ? parseISO(currentUserData.lastRewardDate) : null);
            setLastCardFlipDate(currentUserData.lastGiftBoxDate ? parseISO(currentUserData.lastGiftBoxDate) : null);
            setLastRpsDate(currentUserData.lastRpsDate ? parseISO(currentUserData.lastRpsDate) : null);
            setFreeRewards(currentUserData.freeRewards || 0);
            setFreeGuesses(currentUserData.freeGuesses || 0);
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

    // ===== CARD FLIP GAME LOGIC =====
    const canPlayCardFlip = useMemo(() => {
        if (freeGuesses > 0) return true;
        if (!lastCardFlipDate) return true;
        return !isToday(lastCardFlipDate);
    }, [lastCardFlipDate, freeGuesses]);

    const availableCardFlipPlays = useMemo(() => {
        const dailyPlay = (lastCardFlipDate && isToday(lastCardFlipDate)) ? 0 : 1;
        return dailyPlay + freeGuesses;
    }, [lastCardFlipDate, freeGuesses]);

    const generateCardFlipPrize = useCallback(() => {
        const rand = Math.random() * 100;
        if (rand < 2) return 100; // 2% chance for 100 credits
        if (rand < 10) return Math.floor(Math.random() * 5) + 5; // 8% chance for 5-9 credits
        return Math.floor(Math.random() * 4) + 1; // 90% chance for 1-4 credits
    }, []);

    const playCardFlip = useCallback(async (isWin: boolean, prizeAmount: number) => {
        if (!user) return;
        
        const userDocRef = doc(db, 'users', user.id);
        
        const newRecord = { 
            reward: isWin ? prizeAmount : 'better luck', 
            date: new Date(), 
            source: 'Card Flip Game' 
        };

        if (isWin) {
            await addCreditsToUser(user.id, prizeAmount);
            toast({ title: "You Won!", description: `+${prizeAmount} credits! You can advance to the next level.`, className: "bg-green-500/10 border-green-500/50" });
        } else {
            toast({ title: "Not this one!", description: "Better luck tomorrow!" });
        }
        
        if (!isWin) {
            if (freeGuesses > 0) {
                 await updateDoc(userDocRef, {
                    freeGuesses: increment(-1),
                    rewardHistory: arrayUnion(newRecord)
                });
            } else {
                 await updateDoc(userDocRef, {
                    lastGiftBoxDate: new Date().toISOString(),
                    rewardHistory: arrayUnion(newRecord)
                });
            }
        } else {
             await updateDoc(userDocRef, {
                rewardHistory: arrayUnion(newRecord)
            });
        }
        
        return { prize: isWin ? prizeAmount : 'better luck' };
    }, [user, addCreditsToUser, toast, freeGuesses]);

    // ===== ROCK PAPER SCISSORS LOGIC =====
    const hasClaimedRpsWinToday = useCallback(() => {
        return !!(lastRpsDate && isToday(lastRpsDate));
    }, [lastRpsDate]);
    
    const playRpsMatch = useCallback(async (playerWonMatch: boolean) => {
        if (!user) return;
    
        const alreadyClaimed = hasClaimedRpsWinToday();
    
        if (playerWonMatch && !alreadyClaimed) {
            const userDocRef = doc(db, 'users', user.id);
            const newRecord = { 
                reward: 10,
                date: new Date(), 
                source: 'RPS Win' 
            };
    
            await updateDoc(userDocRef, {
                credits: increment(10),
                lastRpsDate: new Date().toISOString(),
                rewardHistory: arrayUnion(newRecord)
            });
    
            toast({ 
                title: "You Won the Match!", 
                description: "+10 credits have been added to your account.", 
                className: "bg-green-500/10 border-green-500/50" 
            });
        } else if (playerWonMatch && alreadyClaimed) {
             toast({ 
                title: "You Won Again!", 
                description: "You've already claimed your daily reward for this game.", 
            });
        } else if (!playerWonMatch) {
            toast({ title: "You Lost the Match!", description: "Better luck next time." });
        }
    
    }, [user, hasClaimedRpsWinToday, toast]);


    return { 
        canClaimReward: canClaimScratchCard,
        claimDailyReward, 
        availableScratchCards,
        rewardHistory,
        canPlayCardFlip,
        availableCardFlipPlays,
        generateCardFlipPrize,
        playCardFlip,
        playRpsMatch,
        hasClaimedRpsWinToday,
    };
};
