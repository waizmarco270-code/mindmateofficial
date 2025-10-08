

'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, increment, arrayUnion, Timestamp, setDoc, deleteDoc, getDoc, writeBatch } from 'firebase/firestore';
import { isToday, parseISO, addDays, isYesterday } from 'date-fns';
import { useToast } from './use-toast';
import { useUsers } from './use-admin';
import { CRYSTAL_TIERS, type CrystalTier } from '@/components/reward/crystal-growth';


interface RewardRecord {
    reward: number | string;
    date: Date;
    source: string;
}

export interface UserCrystal {
    tier: CrystalTier;
    investment: number;
    maturityDate: Timestamp;
    breakValue: number;
    harvestValue: number;
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
    const [userCrystal, setUserCrystal] = useState<UserCrystal | null>(null);
    const [loadingCrystal, setLoadingCrystal] = useState(true);
    const [loading, setLoading] = useState(true);
    const [codebreakerStatus, setCodebreakerStatus] = useState({
        playedToday: false,
        lastResult: null as 'win' | 'loss' | null,
        attempts: 0,
        secretCode: ''
    });
     const [dailyLoginState, setDailyLoginState] = useState({
        streak: 0,
        canClaim: false,
        hasClaimedToday: false,
        isCompleted: false,
    });

    useEffect(() => {
        setLoading(true);
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

            // Daily Login Treasury State
            const streak = currentUserData.dailyLoginRewardState?.streak || 0;
            const lastClaimedStr = currentUserData.dailyLoginRewardState?.lastClaimed;
            const lastClaimedDate = lastClaimedStr ? new Date(lastClaimedStr) : null;
            const hasClaimedToday = lastClaimedDate ? isToday(lastClaimedDate) : false;

            // If their last claim was not yesterday, their streak should reset (unless it's their very first claim).
            const streakContinued = !lastClaimedDate || isYesterday(lastClaimedDate) || isToday(lastClaimedDate);
            const actualStreak = streakContinued ? streak : 0;
            
            const isCompleted = actualStreak >= 7;
            const canClaimToday = !isCompleted && !hasClaimedToday;

            setDailyLoginState({
                streak: actualStreak,
                canClaim: canClaimToday,
                hasClaimedToday: hasClaimedToday,
                isCompleted: isCompleted,
            });

        }
        setLoading(false);
    }, [currentUserData]);
    
    // Listen to user's crystal data
    useEffect(() => {
        if (!user) {
            setLoadingCrystal(false);
            return;
        };
        const crystalRef = doc(db, 'users', user.id, 'rewards', 'crystal');
        const unsubscribe = onSnapshot(crystalRef, (doc) => {
            if (doc.exists()) {
                setUserCrystal(doc.data() as UserCrystal);
            } else {
                setUserCrystal(null);
            }
            setLoadingCrystal(false);
        });
        return () => unsubscribe();
    }, [user]);

    // ===== SCRATCH CARD LOGIC =====
    const canClaimReward = useMemo(() => {
        if (freeRewards > 0) return true;
        if (!lastScratchDate) return true;
        return !isToday(lastScratchDate);
    }, [lastScratchDate, freeRewards]);

    const availableScratchCards = useMemo(() => {
        const dailyReward = lastScratchDate && isToday(lastScratchDate) ? 0 : 1;
        return dailyReward + freeRewards;
    }, [lastScratchDate, freeRewards]);
    
    const claimDailyReward = useCallback(async () => {
        if (!canClaimReward || !user) {
            toast({ variant: 'destructive', title: 'No scratch cards left for today!' });
            return { prize: 'better luck' };
        }
        
        const weightedPrizes = [
            { value: 'better luck', weight: 60 },
            { value: 2, weight: 25 },
            { value: 5, weight: 10 },
            { value: 10, weight: 4.5 },
            { value: 20, weight: 0.5 }
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
    }, [canClaimReward, user, addCreditsToUser, freeRewards, toast]);

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
        if (rand < 1) return 20;   // 1% chance
        if (rand < 5) return 10;   // 4% chance
        if (rand < 20) return 5;    // 15% chance
        return Math.floor(Math.random() * 3) + 1; // 80% chance
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

    // ===== CRYSTAL GROWTH LOGIC =====
    const plantCrystal = useCallback(async (tier: CrystalTier) => {
        const tierDetails = CRYSTAL_TIERS[tier];
        if (!user || !currentUserData || userCrystal) return;

        const hasMasterCard = currentUserData.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();
        if (!hasMasterCard && currentUserData.credits < tierDetails.cost) {
            toast({ title: "Insufficient Credits", description: `You need ${tierDetails.cost} credits to plant this crystal.`, variant: "destructive" });
            return;
        }

        const maturityDate = addDays(new Date(), tierDetails.durationDays);
        
        const newCrystal: UserCrystal = {
            tier,
            investment: tierDetails.cost,
            maturityDate: Timestamp.fromDate(maturityDate),
            breakValue: tierDetails.breakValue,
            harvestValue: tierDetails.harvestValue,
        };

        const crystalRef = doc(db, 'users', user.id, 'rewards', 'crystal');
        
        if (!hasMasterCard) {
            await addCreditsToUser(user.id, -tierDetails.cost);
        }
        await setDoc(crystalRef, newCrystal);

        toast({ title: "Crystal Seed Planted!", description: `Come back in ${tierDetails.durationDays} days to harvest your reward.` });
    }, [user, currentUserData, userCrystal, toast, addCreditsToUser]);


    const harvestCrystal = useCallback(async () => {
        if (!user || !userCrystal || new Date() < userCrystal.maturityDate.toDate()) return;

        const crystalRef = doc(db, 'users', user.id, 'rewards', 'crystal');
        
        await addCreditsToUser(user.id, userCrystal.harvestValue);
        await deleteDoc(crystalRef);
        
        await updateDoc(doc(db, 'users', user.id), {
            rewardHistory: arrayUnion({ reward: userCrystal.harvestValue, date: new Date(), source: 'Crystal Harvest' })
        });
        
        toast({ title: "Crystal Harvested!", description: `+${userCrystal.harvestValue} credits have been added to your account!`, className: "bg-green-500/10 border-green-500/50" });
    }, [user, userCrystal, addCreditsToUser, toast]);
    
    const breakCrystal = useCallback(async () => {
        if (!user || !userCrystal) return;
        
        const crystalRef = doc(db, 'users', user.id, 'rewards', 'crystal');

        await addCreditsToUser(user.id, userCrystal.breakValue);
        await deleteDoc(crystalRef);
        
        await updateDoc(doc(db, 'users', user.id), {
            rewardHistory: arrayUnion({ reward: userCrystal.breakValue, date: new Date(), source: 'Crystal Break' })
        });
        
        toast({ title: "Crystal Broken", description: `You recovered ${userCrystal.breakValue} credits.`, variant: "destructive" });
    }, [user, userCrystal, addCreditsToUser, toast]);

    // ===== CODEBREAKER LOGIC =====
    useEffect(() => {
        if (!user) {
            setCodebreakerStatus({ playedToday: true, lastResult: null, attempts: 0, secretCode: '' });
            return;
        }
        const gameRef = doc(db, 'users', user.id, 'dailyClaims', 'codebreaker');
        const unsubscribe = onSnapshot(gameRef, (doc) => {
            if (doc.exists() && isToday(doc.data().lastPlayed.toDate())) {
                setCodebreakerStatus(doc.data() as any);
            } else {
                // Reset for a new day
                const newCode = [...Array(4)].map(() => Math.floor(Math.random() * 10)).join('');
                const newStatus = { playedToday: false, lastResult: null, attempts: 0, secretCode: newCode };
                setCodebreakerStatus(newStatus);
                setDoc(gameRef, { ...newStatus, lastPlayed: Timestamp.now() });
            }
        });
        return unsubscribe;
    }, [user]);

    const canPlayCodebreaker = !codebreakerStatus.playedToday;

    const playCodebreaker = useCallback(async (guess: string) => {
        if (!user || !canPlayCodebreaker) return null;

        const gameRef = doc(db, 'users', user.id, 'dailyClaims', 'codebreaker');
        let gameData = codebreakerStatus;

        if (!codebreakerStatus.secretCode) {
            const newCode = [...Array(4)].map(() => Math.floor(Math.random() * 10)).join('');
            gameData = { ...gameData, secretCode: newCode };
        }

        const { secretCode } = gameData;
        let correctPlace = 0;
        let correctDigit = 0;
        const secretCodeCounts: Record<string, number> = {};
        const guessCounts: Record<string, number> = {};

        for (let i = 0; i < secretCode.length; i++) {
            if (guess[i] === secretCode[i]) {
                correctPlace++;
            } else {
                secretCodeCounts[secretCode[i]] = (secretCodeCounts[secretCode[i]] || 0) + 1;
                guessCounts[guess[i]] = (guessCounts[guess[i]] || 0) + 1;
            }
        }

        for (const digit in guessCounts) {
            if (secretCodeCounts[digit]) {
                correctDigit += Math.min(guessCounts[digit], secretCodeCounts[digit]);
            }
        }
        
        const newAttempts = codebreakerStatus.attempts + 1;
        const isWin = correctPlace === 4;
        const isLoss = !isWin && newAttempts >= 6;
        
        const newStatus = {
            ...gameData,
            attempts: newAttempts,
            playedToday: isWin || isLoss,
            lastResult: isWin ? 'win' : (isLoss ? 'loss' : null)
        };

        setCodebreakerStatus(newStatus);
        
        // Update Firestore
        await setDoc(gameRef, {
            ...newStatus,
            lastPlayed: Timestamp.now(),
        }, { merge: true });

        // Add reward on win
        if (isWin) {
            const rewardTiers = [25, 15, 10, 5, 3, 1];
            const reward = rewardTiers[newAttempts - 1];
            await addCreditsToUser(user.id, reward);
            await updateDoc(doc(db, 'users', user.id), {
                rewardHistory: arrayUnion({ reward, date: new Date(), source: 'Codebreaker Win' })
            });
        }
        
        return { clues: { correctPlace, correctDigit }, isWin };

    }, [user, canPlayCodebreaker, codebreakerStatus, addCreditsToUser]);
    
    const claimDailyLoginReward = useCallback(async () => {
        if (!user || !currentUserData) throw new Error("User not found");

        const streak = dailyLoginState.streak;
        if (streak >= 7) {
             throw new Error("You have already completed the 7-day reward cycle.");
        }
         if (dailyLoginState.hasClaimedToday) {
            throw new Error("Reward already claimed for today.");
        }

        const newStreak = streak + 1;

        const rewardsConfig: Record<number, { credits?: number; scratch?: number; flip?: number; vip?: number }> = {
            1: { credits: 10 },
            2: { credits: 5, scratch: 3 },
            3: { credits: 50 },
            4: { scratch: 20 },
            5: { credits: 100 },
            6: { vip: 3 },
            7: { credits: 200, scratch: 10, flip: 10 },
        };

        const reward = rewardsConfig[newStreak];
        if (!reward) throw new Error("Invalid streak day for reward.");

        const userRef = doc(db, 'users', user.id);
        
        const batch = writeBatch(db);

        batch.update(userRef, {
            'dailyLoginRewardState.streak': newStreak,
            'dailyLoginRewardState.lastClaimed': new Date().toISOString().split('T')[0],
             rewardHistory: arrayUnion({
                reward: `Day ${newStreak} Login`,
                date: new Date(),
                source: 'Daily Treasury'
            })
        });

        if (reward.credits) batch.update(userRef, { credits: increment(reward.credits) });
        if (reward.scratch) batch.update(userRef, { freeRewards: increment(reward.scratch) });
        if (reward.flip) batch.update(userRef, { freeGuesses: increment(reward.flip) });

        await batch.commit();
        
        // This function must be awaited separately from the batch
        if (reward.vip && 'grantVipAccess' in (window as any)) {
            await (window as any).grantVipAccess(user.id, reward.vip);
        }
        
        toast({ title: `Day ${newStreak} Reward Claimed!`, description: "Your rewards have been added. Keep the streak going!" });
        return reward;

    }, [user, currentUserData, toast, dailyLoginState]);
    

    return { 
        loading,
        canClaimReward,
        claimDailyReward, 
        availableScratchCards,
        rewardHistory,
        canPlayCardFlip,
        availableCardFlipPlays,
        generateCardFlipPrize,
        playCardFlip,
        playRpsMatch,
        hasClaimedRpsWinToday,
        userCrystal,
        loadingCrystal,
        plantCrystal,
        harvestCrystal,
        breakCrystal,
        canPlayCodebreaker,
        playCodebreaker,
        codebreakerStatus,
        dailyLoginState,
        claimDailyLoginReward,
    };
};
