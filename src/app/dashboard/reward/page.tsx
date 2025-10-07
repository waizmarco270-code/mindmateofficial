
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CrystalGrowth } from '@/components/reward/crystal-growth';
import { ScratchCard } from '@/components/reward/scratch-card';
import { CardFlipGame } from '@/components/reward/gift-box-game';
import { Gift, History, Gem, Layers, VenetianMask, Award, Loader2, CalendarCheck, TreasureChest, CheckCircle, Lock } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useRewards } from '@/hooks/use-rewards';
import { useUsers } from '@/hooks/use-admin';
import { formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';


const REWARDS_CONFIG = [
    { day: 1, rewards: [{ type: 'Credits', value: 10 }] },
    { day: 2, rewards: [{ type: 'Scratch Cards', value: 3 }, { type: 'Credits', value: 5 }] },
    { day: 3, rewards: [{ type: 'Credits', value: 50 }] },
    { day: 4, rewards: [{ type: 'Scratch Jackpot', value: 20 }] },
    { day: 5, rewards: [{ type: 'Credits', value: 100 }] },
    { day: 6, rewards: [{ type: 'VIP Access', value: 3 }] },
    { day: 7, rewards: [{ type: 'Credits', value: 200 }, { type: 'Scratch Cards', value: 10 }, { type: 'Card Flips', value: 10 }] },
];

function DailyTreasury() {
    const { currentUserData } = useUsers();
    const { claimDailyLoginReward } = useRewards();
    const [isClaiming, setIsClaiming] = useState(false);

    const { currentStreak, canClaimToday } = useMemo(() => {
        if (!currentUserData?.dailyLoginRewardState) {
            return { currentStreak: 1, canClaimToday: true };
        }
        const { streak, lastClaimed } = currentUserData.dailyLoginRewardState;
        
        if (!lastClaimed) {
             return { currentStreak: 1, canClaimToday: true };
        }

        const lastClaimedDate = new Date(lastClaimed);
        
        if (isToday(lastClaimedDate)) {
            return { currentStreak: streak, canClaimToday: false };
        }
        if (isYesterday(lastClaimedDate)) {
            const newStreak = streak === 7 ? 1 : streak + 1;
            return { currentStreak: newStreak, canClaimToday: true };
        }
        return { currentStreak: 1, canClaimToday: true };
    }, [currentUserData]);
    
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
                        const isTodayClaim = currentStreak === day && canClaimToday;
                        
                        return (
                            <div key={day} className={cn(
                                "relative border-2 p-4 rounded-xl flex flex-col text-center items-center justify-between min-h-[220px] transition-all duration-300",
                                isTodayClaim ? "border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-105" : "border-dashed",
                                isClaimed ? "border-green-500/50 bg-green-500/10" : "border-muted",
                                !isTodayClaim && !isClaimed && "opacity-60"
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
                                       <Gem className={cn("h-10 w-10", isTodayClaim ? "text-primary" : "text-muted-foreground/50", isClaimed && "text-green-500/70")} />
                                    </div>
                                    <div className="space-y-1 text-xs font-semibold">
                                        {rewards.map(r => (
                                            <p key={r.type}>{r.type === 'VIP Access' ? `${r.value}-Day VIP` : `+${r.value} ${r.type}`}</p>
                                        ))}
                                    </div>
                                </div>
                                
                                {isTodayClaim && (
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

function RecentWinnings() {
    const { rewardHistory, loading } = useRewards();

    const recentWinnings = rewardHistory.slice(0, 5);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary"/>
                    Recent Winnings
                </CardTitle>
                <CardDescription>Your last 5 rewards from the Reward Zone.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin"/>
                    </div>
                ) : recentWinnings.length > 0 ? (
                    <ul className="space-y-3">
                        {recentWinnings.map((item, index) => (
                            <li key={index} className="flex justify-between items-center text-sm p-3 rounded-md bg-muted">
                                <div className="flex flex-col">
                                    <span className="font-semibold">{item.source}</span>
                                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(item.date, { addSuffix: true })}</span>
                                </div>
                                {typeof item.reward === 'number' ? (
                                    <span className="font-bold text-green-500">+{item.reward} Credits</span>
                                ) : (
                                    <span className="text-xs text-muted-foreground">Better Luck</span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p>No recent winnings to show. Play a game to get started!</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}


export default function RewardZoneHubPage() {
    const { availableScratchCards, availableCardFlipPlays } = useRewards();
    
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <Gift className="h-8 w-8 text-primary" />
                  Reward Zone
                </h1>
                <p className="text-muted-foreground">Claim your daily rewards and test your luck for a chance to win prizes!</p>
            </div>
            
            <Tabs defaultValue="daily-login" className="w-full">
                <ScrollArea className="w-full whitespace-nowrap rounded-lg">
                    <TabsList className="inline-flex h-auto">
                        <TabsTrigger value="daily-login" className="w-auto"><TreasureChest className="mr-2"/> Daily Treasury</TabsTrigger>
                        <TabsTrigger value="crystal-growth" className="w-auto"><Gem className="mr-2"/> Crystal Growth</TabsTrigger>
                        <TabsTrigger value="card-flip" className="w-auto flex items-center">
                            <Layers className="mr-2"/> Card Flip
                            {availableCardFlipPlays > 0 && <span className="ml-2 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">{availableCardFlipPlays}</span>}
                        </TabsTrigger>
                        <TabsTrigger value="scratch-card" className="w-auto flex items-center">
                            <VenetianMask className="mr-2"/> Scratch Card
                             {availableScratchCards > 0 && <span className="ml-2 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">{availableScratchCards}</span>}
                        </TabsTrigger>
                    </TabsList>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                    <div className="lg:col-span-2">
                        <TabsContent value="daily-login"><DailyTreasury /></TabsContent>
                        <TabsContent value="crystal-growth"><CrystalGrowth /></TabsContent>
                        <TabsContent value="card-flip"><CardFlipGame /></TabsContent>
                        <TabsContent value="scratch-card"><ScratchCard /></TabsContent>
                    </div>
                    <div className="lg:col-span-1">
                        <RecentWinnings />
                    </div>
                </div>

            </Tabs>

        </div>
    );
}

