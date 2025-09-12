
'use client';

import { ScratchCard } from '@/components/reward/scratch-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRewards } from '@/hooks/use-rewards';
import { Gift, History, VenetianMask } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GiftBoxGame } from '@/components/reward/gift-box-game';
import { useState } from 'react';

export default function RewardPage() {
    const { rewardHistory, availableScratchCards, availableGiftBoxGuesses } = useRewards();
    const [activeTab, setActiveTab] = useState('scratch-card');

    const getCardCount = () => {
        if (activeTab === 'scratch-card') return availableScratchCards;
        if (activeTab === 'guess-box') return availableGiftBoxGuesses;
        return 0;
    }
     const getCardLabel = () => {
        if (activeTab === 'scratch-card') return 'Cards Left Today';
        if (activeTab === 'guess-box') return 'Guesses Left Today';
        return 'Rewards Left';
    }
     const getCardDescription = () => {
        if (activeTab === 'scratch-card') return '1 free daily card + gifted cards.';
        if (activeTab === 'guess-box') return '1 free guess per day.';
        return 'Come back tomorrow!';
    }


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Reward Zone</h1>
                <p className="text-muted-foreground">Claim your daily rewards for a chance to win prizes!</p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                   <Tabs defaultValue="scratch-card" className="w-full" onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="scratch-card">
                            <VenetianMask className="mr-2 h-4 w-4"/>
                            Daily Scratch Card
                        </TabsTrigger>
                        <TabsTrigger value="guess-box">
                            <Gift className="mr-2 h-4 w-4"/>
                            Guess the Box
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="scratch-card" className="mt-6">
                        <ScratchCard />
                      </TabsContent>
                      <TabsContent value="guess-box" className="mt-6">
                        <GiftBoxGame />
                      </TabsContent>
                    </Tabs>
                </div>
                <div className="lg:col-span-1 space-y-8">
                     <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium flex items-center justify-between">
                                <span>{getCardLabel()}</span>
                                <VenetianMask className="h-4 w-4 text-muted-foreground" />
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
                            <CardDescription>Your last 10 rewards.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {rewardHistory.length > 0 ? (
                                <ul className="space-y-2">
                                    {rewardHistory.map((rewardItem, index) => (
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
