
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CrystalGrowth } from '@/components/reward/crystal-growth';
import { ScratchCard } from '@/components/reward/scratch-card';
import { CardFlipGame } from '@/components/reward/gift-box-game';
import { Gift, History, Gem, Layers, VenetianMask, Award, Loader2, CheckCircle } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useRewards } from '@/hooks/use-rewards';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

function DailyTreasury() {
    const { dailyLoginState, claimDailyLoginReward, loading } = useRewards();
    const [isClaiming, setIsClaiming] = useState(false);

    const handleClaim = async () => {
        if (!dailyLoginState.canClaim) return;
        setIsClaiming(true);
        try {
            await claimDailyLoginReward();
        } catch (error) {
            // Toast is handled within the hook
        } finally {
            setIsClaiming(false);
        }
    };
    
    const rewardsConfig: Record<number, string> = {
        1: "+10 Credits",
        2: "+5 Credits, +3 Scratch",
        3: "+50 Credits",
        4: "+20 Scratch",
        5: "+100 Credits",
        6: "3 Days VIP",
        7: "Legendary Reward!",
    };
    
    if (loading) {
        return <Skeleton className="h-48 w-full" />;
    }

    return (
        <Card className="w-full overflow-hidden bg-gradient-to-br from-red-900/80 via-slate-900 to-slate-900 border-red-700/50">
             <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(to_bottom,white_10%,transparent_70%)]"></div>
            <CardHeader className="relative z-10 text-center">
                <CardTitle className="text-2xl font-bold text-white">Daily Treasury</CardTitle>
                <CardDescription className="text-red-300/80">Log in daily to claim increasing rewards. Don't break the streak!</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-6">
                <div className="flex justify-center items-end gap-2">
                    {Array.from({ length: 7 }).map((_, i) => {
                        const day = i + 1;
                        const isCompleted = dailyLoginState.streak >= day;
                        const isNext = dailyLoginState.streak + 1 === day && !dailyLoginState.hasClaimedToday;

                        return (
                            <div key={day} className="flex flex-col items-center gap-2 text-center">
                                <div className={cn(
                                    "h-20 w-16 rounded-lg flex flex-col items-center justify-center border-2 transition-all duration-300",
                                    isCompleted ? "bg-red-500/20 border-red-400" : "bg-black/20 border-white/10",
                                    isNext && "border-amber-400 scale-110 shadow-lg shadow-amber-400/30"
                                )}>
                                    {isCompleted ? <CheckCircle className="h-6 w-6 text-red-400"/> : <Gift className="h-6 w-6 text-white/50"/>}
                                     <p className="text-white/80 font-bold mt-1 text-sm">{rewardsConfig[day]}</p>
                                </div>
                                <p className="text-xs font-bold text-white">Day {day}</p>
                            </div>
                        )
                    })}
                </div>
                 <div className="text-center bg-black/20 p-3 rounded-lg border border-white/10">
                    <p className="text-sm font-semibold text-muted-foreground">Today's Reward (Day {dailyLoginState.hasClaimedToday ? dailyLoginState.streak : dailyLoginState.streak + 1}):</p>
                    <p className="font-bold text-lg text-amber-400">{rewardsConfig[dailyLoginState.hasClaimedToday ? dailyLoginState.streak : dailyLoginState.streak + 1] || "Come back tomorrow!"}</p>
                 </div>
            </CardContent>
            <CardFooter className="relative z-10">
                <Button
                    className="w-full h-14 text-lg font-bold"
                    onClick={handleClaim}
                    disabled={!dailyLoginState.canClaim || isClaiming}
                >
                    {isClaiming ? <Loader2 className="animate-spin mr-2"/> : (dailyLoginState.canClaim && <Award className="mr-2"/>)}
                    {dailyLoginState.hasClaimedToday ? "Claimed for Today" : (dailyLoginState.canClaim ? "Claim Reward" : "Complete Tasks to Claim")}
                </Button>
            </CardFooter>
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
            
            <Tabs defaultValue="daily-treasury" className="w-full">
                <ScrollArea className="w-full whitespace-nowrap rounded-lg">
                    <TabsList className="inline-flex h-auto">
                        <TabsTrigger value="daily-treasury" className="w-auto"><Award className="mr-2"/> Daily Treasury</TabsTrigger>
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
                        <TabsContent value="daily-treasury"><DailyTreasury /></TabsContent>
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

function Skeleton({ className }: { className?: string }) {
    return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}
