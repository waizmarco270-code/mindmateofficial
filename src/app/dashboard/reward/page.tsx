'use client';

import { ScratchCard } from '@/components/reward/scratch-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRewards } from '@/hooks/use-rewards';
import { Gift, History, VenetianMask, Layers, Gem } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardFlipGame } from '@/components/reward/gift-box-game';
import { useState } from 'react';
import { SignedOut } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';
import { CrystalGrowth } from '@/components/reward/crystal-growth';

export default function RewardPage() {
    const { rewardHistory, availableScratchCards, availableCardFlipPlays, userCrystal } = useRewards();
    const [activeTab, setActiveTab] = useState('crystal-growth');
    
    const getCardCount = () => {
        if (activeTab === 'scratch-card') return availableScratchCards;
        if (activeTab === 'card-flip') return availableCardFlipPlays;
        return 0;
    }
     const getCardLabel = () => {
        if (activeTab === 'scratch-card') return 'Cards Left Today';
        if (activeTab === 'card-flip') return 'Plays Left Today';
        if (activeTab === 'crystal-growth') return userCrystal ? 'Active Crystal' : 'None';
        return 'Rewards Left';
    }
     const getCardDescription = () => {
        if (activeTab === 'scratch-card') return '1 free daily card + gifted cards.';
        if (activeTab === 'card-flip') return '1 free play per day.';
        if (activeTab === 'crystal-growth') return userCrystal ? 'Growing...' : 'None';
        return 'Come back tomorrow!';
    }


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Reward Zone</h1>
                <p className="text-muted-foreground">Claim your daily rewards for a chance to win prizes!</p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 relative">
                    <SignedOut>
                         <LoginWall 
                            title="Unlock the Reward Zone"
                            description="Sign up for free to claim daily rewards, play games, and win credits!"
                        />
                    </SignedOut>
                   <Tabs defaultValue="crystal-growth" className="w-full" onValueChange={setActiveTab}>
                      <div className="relative w-full overflow-x-auto pb-1">
                        <TabsList className="grid w-max grid-cols-3">
                            <TabsTrigger value="crystal-growth" className="gap-2">
                                <Gem className="h-4 w-4"/>
                                Crystal Growth
                            </TabsTrigger>
                            <TabsTrigger value="card-flip" className="gap-2">
                                <Layers className="h-4 w-4"/>
                                Card Flip
                            </TabsTrigger>
                            <TabsTrigger value="scratch-card" className="gap-2">
                                <VenetianMask className="h-4 w-4"/>
                                Scratch Card
                            </TabsTrigger>
                        </TabsList>
                      </div>
                      <TabsContent value="crystal-growth" className="mt-6">
                        <CrystalGrowth />
                      </TabsContent>
                      <TabsContent value="scratch-card" className="mt-6">
                        <ScratchCard />
                      </TabsContent>
                      <TabsContent value="card-flip" className="mt-6">
                        <CardFlipGame />
                      </TabsContent>
                    </Tabs>
                </div>
                <div className="lg:col-span-1 space-y-8">
                     <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium flex items-center justify-between">
                                <span>{getCardLabel()}</span>
                                <Gift className="h-4 w-4 text-muted-foreground" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="text-3xl font-bold">{getCardCount()}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {getCardDescription()}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><History /> Reward History</CardTitle>
                            <CardDescription>Your last 7 rewards.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {rewardHistory.length > 0 ? (
                                <ul className="space-y-2">
                                    {rewardHistory.slice(0, 7).map((rewardItem, index) => (
                                        <li key={index} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted">
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {typeof rewardItem.reward === 'number' ? `${rewardItem.reward} Credits` : 'Better Luck!'}
                                                </span>
                                                 <span className="text-xs text-muted-foreground">{rewardItem.source}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground">
                                                {format(rewardItem.date, 'MMM d, h:mm a')}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-muted-foreground py-10">You haven't claimed a reward yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
