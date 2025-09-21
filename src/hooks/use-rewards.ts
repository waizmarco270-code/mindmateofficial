
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, increment, arrayUnion, Timestamp, setDoc, deleteDoc } from 'firebase/firestore';
import { isToday, parseISO, addDays } from 'date-fns';
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
        
        // New rebalanced prize pool
        const weightedPrizes = [
            { value: 'better luck', weight: 60 },
            { value: 2, weight: 25 },
            { value: 5, weight: 10 },
            { value: 10, weight: 4.5 },
            { value: 20, weight: 0.5 } // 0.5% chance for the max prize
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
        if (rand < 1) return 20;   // 1% chance for 20 credits
        if (rand < 5) return 10;   // 4% chance for 10 credits
        if (rand < 20) return 5;    // 15% chance for 5 credits
        return Math.floor(Math.random() * 3) + 1; // 80% chance for 1-3 credits
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
        if (!user || !currentUserData || currentUserData.credits < tierDetails.cost || userCrystal) {
            if (currentUserData && currentUserData.credits < tierDetails.cost) {
                toast({ title: "Insufficient Credits", description: `You need ${tierDetails.cost} credits to plant this crystal.`, variant: "destructive" });
            }
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
        
        await addCreditsToUser(user.id, -tierDetails.cost);
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

    // ===== GACHAPON MACHINE LOGIC =====
    const playGachapon = useCallback(async () => {
        if (!user || !currentUserData) throw new Error("User not found");
        if (currentUserData.credits < 5) throw new Error("Insufficient credits");

        const weightedPrizes = [
            { prize: 1, weight: 40, type: 'credits' },
            { prize: 5, weight: 25, type: 'credits' }, // Break even
            { prize: 10, weight: 10, type: 'credits' },
            { prize: 25, weight: 5, type: 'credits' },
            { prize: 50, weight: 1, type: 'credits' }, // Jackpot
            { prize: 1, weight: 10, type: 'scratch' }, // 1 free scratch card
            { prize: 1, weight: 9, type: 'flip' },    // 1 free card flip play
        ];

        const totalWeight = weightedPrizes.reduce((sum, p) => sum + p.weight, 0);
        let random = Math.random() * totalWeight;

        let chosenPrize: typeof weightedPrizes[0] | undefined;
        for (const prize of weightedPrizes) {
            if (random < prize.weight) {
                chosenPrize = prize;
                break;
            }
            random -= prize.weight;
        }
        chosenPrize ??= weightedPrizes[0];

        const userDocRef = doc(db, 'users', user.id);
        const updates: any = {
            credits: increment(-5) // Cost to play
        };
        let newRecord: any;

        switch(chosenPrize.type) {
            case 'credits':
                updates.credits = increment(-5 + chosenPrize.prize);
                newRecord = { reward: chosenPrize.prize, date: new Date(), source: 'Gachapon' };
                toast({ title: "You Won!", description: `+${chosenPrize.prize} credits!`, className: "bg-green-500/10 border-green-500/50" });
                break;
            case 'scratch':
                updates.freeRewards = increment(chosenPrize.prize);
                newRecord = { reward: `+${chosenPrize.prize} Scratch Card`, date: new Date(), source: 'Gachapon' };
                toast({ title: "You Won!", description: `+${chosenPrize.prize} Scratch Card!`, className: "bg-green-500/10 border-green-500/50" });
                break;
            case 'flip':
                updates.freeGuesses = increment(chosenPrize.prize);
                newRecord = { reward: `+${chosenPrize.prize} Card Flip Play`, date: new Date(), source: 'Gachapon' };
                toast({ title: "You Won!", description: `+${chosenPrize.prize} Card Flip Play!`, className: "bg-green-500/10 border-green-500/50" });
                break;
        }

        updates.rewardHistory = arrayUnion(newRecord);
        await updateDoc(userDocRef, updates);

        return newRecord.reward;

    }, [user, currentUserData, toast]);


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
        userCrystal,
        loadingCrystal,
        plantCrystal,
        harvestCrystal,
        breakCrystal,
        playGachapon,
    };
};
