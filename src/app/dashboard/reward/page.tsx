
'use client';

import { SpinWheel } from '@/components/reward/spin-wheel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRewards } from '@/hooks/use-rewards';
import { Gift, History } from 'lucide-react';
import { format } from 'date-fns';

export default function RewardPage() {
    const { spinHistory } = useRewards();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Reward Zone</h1>
                <p className="text-muted-foreground">Spin the wheel for a chance to win daily prizes!</p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <SpinWheel />
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><History /> Spin History</CardTitle>
                            <CardDescription>Your last 10 rewards.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {spinHistory.length > 0 ? (
                                <ul className="space-y-2">
                                    {spinHistory.map((spin, index) => (
                                        <li key={index} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted">
                                            <span className="font-medium">
                                                {typeof spin.reward === 'number' ? `${spin.reward} Credits` : 'Better Luck!'}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(spin.date, 'MMM d, h:mm a')}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-muted-foreground py-10">You haven't spun the wheel yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
