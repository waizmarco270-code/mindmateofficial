
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, increment, arrayUnion, Timestamp } from 'firebase/firestore';
import { isToday, parseISO } from 'date-fns';
import { useToast } from './use-toast';
import { useUsers } from './use-admin';

interface SpinRecord {
    reward: number | string;
    date: Date;
}

export const useRewards = () => {
    const { user } = useUser();
    const { currentUserData, addCreditsToUser } = useUsers();
    const { toast } = useToast();
    
    const [lastSpinDate, setLastSpinDate] = useState<Date | null>(null);
    const [freeSpins, setFreeSpins] = useState(0);
    const [spinHistory, setSpinHistory] = useState<SpinRecord[]>([]);

    useEffect(() => {
        if(currentUserData) {
            setLastSpinDate(currentUserData.lastSpinDate ? parseISO(currentUserData.lastSpinDate) : null);
            setFreeSpins(currentUserData.freeSpins || 0);
            setSpinHistory(
                (currentUserData.spinHistory || [])
                .map((h: any) => ({ ...h, date: h.date?.toDate() || new Date() }))
                .sort((a: SpinRecord, b: SpinRecord) => b.date.getTime() - a.date.getTime())
            );
        }
    }, [currentUserData]);
    
    const canSpin = useMemo(() => {
        if (freeSpins > 0) return true;
        if (!lastSpinDate) return true; // Never spun before
        return !isToday(lastSpinDate);
    }, [lastSpinDate, freeSpins]);

     const availableSpins = useMemo(() => {
        const dailySpin = lastSpinDate && isToday(lastSpinDate) ? 0 : 1;
        return dailySpin + freeSpins;
    }, [lastSpinDate, freeSpins]);
    
    const spin = useCallback(async () => {
        if (!canSpin || !user) {
            toast({ variant: 'destructive', title: 'No spins left for today!' });
            return { finalRotation: 0, prizeIndex: 0 };
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

        const possibleIndexes = prizes
            .map((p, i) => (p.value === chosenPrize!.value ? i : -1))
            .filter(i => i !== -1);
        const prizeIndex = possibleIndexes[Math.floor(Math.random() * possibleIndexes.length)];
        
        const segmentAngle = 360 / prizes.length;
        const randomOffset = (Math.random() - 0.5) * (segmentAngle * 0.8);
        const finalRotation = 360 - (prizeIndex * segmentAngle) - (segmentAngle / 2) - randomOffset;
        
        const userDocRef = doc(db, 'users', user.id);
        const newRecord = { reward: chosenPrize.value, date: new Date() };

        if(freeSpins > 0) {
            await updateDoc(userDocRef, { freeSpins: increment(-1), spinHistory: arrayUnion({ ...newRecord }) });
        } else {
            await updateDoc(userDocRef, { lastSpinDate: new Date().toISOString(), spinHistory: arrayUnion({ ...newRecord }) });
        }

        if (typeof chosenPrize.value === 'number') {
            await addCreditsToUser(user.id, chosenPrize.value);
            toast({ title: "You Won!", description: `Congratulations! ${chosenPrize.value} credits have been added to your account.`, className: "bg-green-500/10 border-green-500/50" });
        } else {
             toast({ title: "Better Luck Next Time!", description: "Keep trying, your lucky day is coming!" });
        }

        return { finalRotation, prizeIndex };

    }, [canSpin, user, addCreditsToUser, freeSpins, toast]);

    return { 
        canSpin, 
        spin, 
        availableSpins,
        spinHistory 
    };
};


// MOCK DATA for the wheel UI
const prizes = [
    { value: 5, label: '5' },
    { value: 'better luck', label: '😭' },
    { value: 10, label: '10' },
    { value: 2, label: '2' },
    { value: 100, label: '100' },
    { value: 'better luck', label: '😭' },
    { value: 5, label: '5' },
    { value: 2, label: '2' },
];
