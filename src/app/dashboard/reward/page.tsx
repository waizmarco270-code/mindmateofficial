
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CrystalGrowth } from '@/components/reward/crystal-growth';
import { ScratchCard } from '@/components/reward/scratch-card';
import { CardFlipGame } from '@/components/reward/gift-box-game';
import { Gift, History, Gem, Layers, VenetianMask, Award, Loader2 } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useRewards } from '@/hooks/use-rewards';
import { formatDistanceToNow } from 'date-fns';

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
            
            <Tabs defaultValue="crystal-growth" className="w-full">
                <ScrollArea className="w-full whitespace-nowrap rounded-lg">
                    <TabsList className="inline-flex h-auto">
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
