
'use client';

import { useState, useEffect } from 'react';
import { useRewards } from '@/hooks/use-rewards';
import { useUsers } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Gem, Gift, Loader2, Lock, Sparkles, TreasureChest, VenetianMask } from 'lucide-react';
import { isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const REWARDS_CONFIG = [
    { day: 1, rewards: [{ type: 'Credits', value: 10 }] },
    { day: 2, rewards: [{ type: 'Scratch Cards', value: 3 }, { type: 'Credits', value: 5 }] },
    { day: 3, rewards: [{ type: 'Credits', value: 50 }] },
    { day: 4, rewards: [{ type: 'Scratch Jackpot', value: 20 }] },
    { day: 5, rewards: [{ type: 'Credits', value: 100 }] },
    { day: 6, rewards: [{ type: 'Elite Access', value: 3 }] },
    { day: 7, rewards: [{ type: 'Credits', value: 200 }, { type: 'Scratch Cards', value: 10 }, { type: 'Card Flips', value: 10 }] },
];

export function DailyLoginReward() {
    const { currentUserData } = useUsers();
    const { claimDailyLoginReward } = useRewards();
    const [isClaiming, setIsClaiming] = useState(false);

    const { currentStreak, canClaimToday } = (() => {
        if (!currentUserData?.dailyLoginRewardState) {
            return { currentStreak: 1, canClaimToday: true };
        }
        const { streak, lastClaimed } = currentUserData.dailyLoginRewardState;
        const lastClaimedDate = new Date(lastClaimed);
        
        if (isToday(lastClaimedDate)) {
            return { currentStreak: streak, canClaimToday: false };
        }
        if (isYesterday(lastClaimedDate)) {
            // If streak is 7, it resets to 1. Otherwise, it increments.
            return { currentStreak: streak === 7 ? 1 : streak + 1, canClaimToday: true };
        }
        // Streak is broken
        return { currentStreak: 1, canClaimToday: true };
    })();
    
    const handleClaim = async () => {
        setIsClaiming(true);
        try {
            await claimDailyLoginReward(currentStreak);
        } catch (error: any) {
            console.error("Failed to claim daily reward:", error);
        } finally {
            setIsClaiming(false);
        }
    };
    
    return (
        <Card className="w-full max-w-4xl mx-auto border-0 bg-transparent shadow-none">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                     <TreasureChest className="h-16 w-16 text-yellow-400 drop-shadow-[0_0_8px_currentColor]"/>
                </div>
                <CardTitle className="text-3xl font-bold">The Daily Treasury</CardTitle>
                <CardDescription>Log in every day to claim increasingly better rewards. Don't break the streak!</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {REWARDS_CONFIG.map(({ day, rewards }) => {
                        const isClaimed = currentStreak > day || (currentStreak === day && !canClaimToday);
                        const isToday = currentStreak === day && canClaimToday;
                        
                        return (
                            <div key={day} className={cn(
                                "relative border-2 p-4 rounded-xl flex flex-col text-center items-center justify-between min-h-[220px] transition-all duration-300",
                                isToday ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-105" : "border-dashed",
                                isClaimed ? "border-green-500/50 bg-green-500/10" : "border-muted",
                                !isToday && !isClaimed && "opacity-60"
                            )}>
                                {isClaimed && (
                                    <div className="absolute top-2 right-2 p-1 bg-green-500 text-white rounded-full">
                                        <CheckCircle className="h-4 w-4" />
                                    </div>
                                )}
                                 {day === 7 && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-3 py-0.5 rounded-full text-xs font-bold shadow-md">
                                        JACKPOT
                                    </div>
                                )}

                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <p className="font-bold text-sm text-muted-foreground mb-3">DAY {day}</p>
                                    <div className="mb-3">
                                       <Gem className={cn("h-10 w-10", isToday ? "text-primary" : "text-muted-foreground/50", isClaimed && "text-green-500/70")} />
                                    </div>
                                    <div className="space-y-1 text-xs font-semibold">
                                        {rewards.map(r => (
                                            <p key={r.type}>{r.value} {r.type}</p>
                                        ))}
                                    </div>
                                </div>
                                
                                {isToday && (
                                     <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 0.5}}>
                                        <Button className="w-full mt-4" onClick={handleClaim} disabled={isClaiming}>
                                            {isClaiming ? <Loader2 className="animate-spin" /> : "Claim"}
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
