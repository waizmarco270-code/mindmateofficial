'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, increment, arrayUnion, Timestamp, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { isToday, parseISO, addDays, format as formatDate } from 'date-fns';
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

interface CodebreakerStatus {
    canPlay: boolean;
    lastResult: 'win' | 'loss' | null;
    attempts: number;
    secretCode?: string;
}

export const useRewards = () => {
    const { user } = useUser();
    const { currentUserData, addCreditsToUser } = useUsers();
    const { toast } = useToast();
    
    // State for all games
    const [lastScratchDate, setLastScratchDate] = useState<Date | null>(null);
    const [lastCardFlipDate, setLastCardFlipDate] = useState<Date | null>(null);
    const [lastRpsDate, setLastRpsDate] = useState<Date | null>(null);
    const [lastTriviaTowerDate, setLastTriviaTowerDate] = useState<Date | null>(null);
    const [freeRewards, setFreeRewards] = useState(0); // For scratch cards
    const [freeGuesses, setFreeGuesses] = useState(0); // For Card Flip
    const [rewardHistory, setRewardHistory] = useState<RewardRecord[]>([]);
    const [userCrystal, setUserCrystal] = useState<UserCrystal | null>(null);
    const [loadingCrystal, setLoadingCrystal] = useState(true);
    const [codebreakerStatus, setCodebreakerStatus] = useState<CodebreakerStatus>({ canPlay: false, lastResult: null, attempts: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        if(currentUserData) {
            setLastScratchDate(currentUserData.lastRewardDate ? parseISO(currentUserData.lastRewardDate) : null);
            setLastCardFlipDate(currentUserData.lastGiftBoxDate ? parseISO(currentUserData.lastGiftBoxDate) : null);
            setLastRpsDate(currentUserData.lastRpsDate ? parseISO(currentUserData.lastRpsDate) : null);
            setLastTriviaTowerDate(currentUserData.lastTriviaTowerDate ? parseISO(currentUserData.lastTriviaTowerDate) : null);
            setFreeRewards(currentUserData.freeRewards || 0);
            setFreeGuesses(currentUserData.freeGuesses || 0);
            setRewardHistory(
                (currentUserData.rewardHistory || [])
                .map((h: any) => ({ ...h, date: h.date?.toDate() || new Date(), source: h.source || 'Unknown' }))
                .sort((a: RewardRecord, b: RewardRecord) => b.date.getTime() - a.date.getTime())
            );
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

    // ===== CODEBREAKER LOGIC =====
    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const codebreakerRef = doc(db, 'users', user.id, 'rewards', 'codebreaker');
        const unsubscribe = onSnapshot(codebreakerRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const lastPlayed = data.lastPlayed?.toDate();
                if (lastPlayed && isToday(lastPlayed)) {
                    setCodebreakerStatus({ canPlay: false, lastResult: data.lastResult, attempts: data.attempts, secretCode: data.secretCode });
                } else {
                    // New day, reset
                    const newCode = String(Math.floor(1000 + Math.random() * 9000));
                    setDoc(codebreakerRef, { secretCode: newCode, attempts: 0, lastResult: null, lastPlayed: null });
                    setCodebreakerStatus({ canPlay: true, lastResult: null, attempts: 0, secretCode: newCode });
                }
            } else {
                // First time playing
                const newCode = String(Math.floor(1000 + Math.random() * 9000));
                setDoc(codebreakerRef, { secretCode: newCode, attempts: 0, lastResult: null, lastPlayed: null });
                setCodebreakerStatus({ canPlay: true, lastResult: null, attempts: 0, secretCode: newCode });
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const playCodebreaker = useCallback(async (guess: string) => {
        if (!user || !codebreakerStatus.canPlay || !codebreakerStatus.secretCode) return null;

        const secretCode = codebreakerStatus.secretCode;
        const attempts = codebreakerStatus.attempts + 1;

        let correctPlace = 0;
        let correctDigit = 0;
        const secretCodeCounts: Record<string, number> = {};
        const guessCounts: Record<string, number> = {};
        
        for (let i = 0; i < secretCode.length; i++) {
            if (guess[i] === secretCode[i]) {
                correctPlace++;
            }
            secretCodeCounts[secretCode[i]] = (secretCodeCounts[secretCode[i]] || 0) + 1;
            guessCounts[guess[i]] = (guessCounts[guess[i]] || 0) + 1;
        }

        for(const digit in guessCounts) {
            if (secretCodeCounts[digit]) {
                correctDigit += Math.min(guessCounts[digit], secretCodeCounts[digit]);
            }
        }
        correctDigit -= correctPlace;

        const isWin = correctPlace === 4;
        const isLoss = !isWin && attempts >= 6;
        let reward = 0;

        const rewardTiers = [25, 15, 10, 5, 3, 1];

        if (isWin) {
            reward = rewardTiers[attempts - 1];
            await addCreditsToUser(user.id, reward);
            toast({ title: 'You cracked the code!', description: `+${reward} credits have been awarded.`, className: "bg-green-500/10 border-green-500/50" });
        }

        if (isWin || isLoss) {
            const codebreakerRef = doc(db, 'users', user.id, 'rewards', 'codebreaker');
            await updateDoc(codebreakerRef, {
                lastPlayed: Timestamp.now(),
                lastResult: isWin ? 'win' : 'loss',
                attempts: attempts
            });
        } else {
             const codebreakerRef = doc(db, 'users', user.id, 'rewards', 'codebreaker');
            await updateDoc(codebreakerRef, { attempts });
        }

        return { isWin, clues: { correctPlace, correctDigit } };

    }, [user, codebreakerStatus, addCreditsToUser, toast]);

    // ===== TRIVIA TOWER LOGIC =====
    const canPlayTriviaTower = useMemo(() => {
        if (!lastTriviaTowerDate) return true;
        return !isToday(lastTriviaTowerDate);
    }, [lastTriviaTowerDate]);
    
    const playTriviaTower = useCallback(async (reward: number) => {
        if (!user || !canPlayTriviaTower) return;
        
        const userDocRef = doc(db, 'users', user.id);
        const newRecord = { reward, date: new Date(), source: 'Trivia Tower' };
        
        await updateDoc(userDocRef, {
            credits: increment(reward),
            lastTriviaTowerDate: new Date().toISOString(),
            rewardHistory: arrayUnion(newRecord)
        });
        
        if (reward > 0) {
            toast({ title: `You Won ${reward} credits!`, description: 'They have been added to your account.', className: "bg-green-500/10 border-green-500/50" });
        } else {
             toast({ title: "Tower Challenge Over", description: "Better luck next time!", variant: "destructive" });
        }
    }, [user, canPlayTriviaTower, addCreditsToUser, toast]);


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

    return { 
        loading,
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
        canPlayCodebreaker: codebreakerStatus.canPlay,
        playCodebreaker,
        codebreakerStatus,
        canPlayTriviaTower,
        playTriviaTower,
    };
};
