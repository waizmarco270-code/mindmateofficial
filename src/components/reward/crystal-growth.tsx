
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gem, Hammer, Sparkles, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useRewards } from '@/hooks/use-rewards';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { differenceInSeconds } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useUsers } from '@/hooks/use-admin';


export const CRYSTAL_TIERS = {
    common: { name: 'Common Crystal', cost: 50, durationDays: 7, harvestValue: 75, breakValue: 25, color: 'text-cyan-400' },
    radiant: { name: 'Radiant Crystal', cost: 200, durationDays: 14, harvestValue: 350, breakValue: 100, color: 'text-purple-400' },
    legendary: { name: 'Legendary Crystal', cost: 500, durationDays: 30, harvestValue: 1000, breakValue: 250, color: 'text-yellow-400' },
};
export type CrystalTier = keyof typeof CRYSTAL_TIERS;


function Countdown({ targetDate }: { targetDate: Date }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const totalSeconds = differenceInSeconds(targetDate, now);

            if (totalSeconds <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(interval);
                return;
            }

            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            
            setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className="grid grid-cols-4 gap-2 text-center font-mono">
            <div><p className="text-3xl font-bold">{String(timeLeft.days).padStart(2, '0')}</p><p className="text-xs text-muted-foreground">Days</p></div>
            <div><p className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</p><p className="text-xs text-muted-foreground">Hours</p></div>
            <div><p className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</p><p className="text-xs text-muted-foreground">Mins</p></div>
            <div><p className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</p><p className="text-xs text-muted-foreground">Secs</p></div>
        </div>
    );
}

export function CrystalGrowth() {
    const { userCrystal, loadingCrystal, plantCrystal, harvestCrystal, breakCrystal } = useRewards();
    const { currentUserData } = useUsers();
    const [isProcessing, setIsProcessing] = useState(false);


    const handlePlant = async (tier: CrystalTier) => {
        setIsProcessing(true);
        await plantCrystal(tier);
        setIsProcessing(false);
    }
    
    const handleHarvest = async () => {
        setIsProcessing(true);
        await harvestCrystal();
        setIsProcessing(false);
    }

    const handleBreak = async () => {
        setIsProcessing(true);
        await breakCrystal();
        setIsProcessing(false);
    }

    if (loadingCrystal) {
        return <Card className="w-full max-w-md mx-auto min-h-[400px] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></Card>
    }

    if (userCrystal) {
        const tierInfo = CRYSTAL_TIERS[userCrystal.tier];
        const maturityDate = userCrystal.maturityDate.toDate();
        const isMature = new Date() >= maturityDate;

        return (
            <Card className="w-full max-w-md mx-auto overflow-hidden bg-transparent border-0 shadow-none">
                <div className="relative p-6 pt-12 flex flex-col items-center justify-center bg-gradient-to-b from-blue-900/50 to-indigo-900/50 rounded-t-xl">
                    <motion.div
                        animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                         <Gem className={cn("h-24 w-24 drop-shadow-[0_0_15px_currentColor]", tierInfo.color)} />
                    </motion.div>
                </div>
                 <CardContent className="p-6 bg-background rounded-b-xl space-y-4">
                    <div className="text-center">
                        <CardTitle className="text-2xl">Your {tierInfo.name} is Growing</CardTitle>
                        <CardDescription>Patience is the key to a greater reward.</CardDescription>
                    </div>

                    {isMature ? (
                        <div className="text-center space-y-2 p-4 bg-green-500/10 rounded-lg">
                           <h3 className="text-xl font-bold text-green-500">Your Crystal is Mature!</h3>
                           <p className="text-sm text-muted-foreground">Harvest it now to claim your reward.</p>
                        </div>
                    ) : (
                        <Countdown targetDate={maturityDate} />
                    )}

                    <div className="grid grid-cols-2 gap-4 text-center pt-4">
                         <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground">Break Value</p>
                            <p className="text-lg font-bold text-destructive">{userCrystal.breakValue} Credits</p>
                         </div>
                         <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground">Harvest Value</p>
                            <p className="text-lg font-bold text-green-500">{userCrystal.harvestValue} Credits</p>
                         </div>
                    </div>
                 </CardContent>
                 <CardFooter className="grid grid-cols-2 gap-4">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full" disabled={isProcessing}>
                                {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <Hammer className="mr-2 h-4 w-4"/>}
                                Break Crystal
                            </Button>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Breaking the crystal early means you will only get {userCrystal.breakValue} credits back. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleBreak}>Yes, break it</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                     </AlertDialog>
                     <Button className="w-full bg-green-600 hover:bg-green-700" disabled={!isMature || isProcessing} onClick={handleHarvest}>
                        {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                         Harvest
                     </Button>
                 </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-3xl mx-auto">
             <CardHeader className="text-center">
                <CardTitle className="text-2xl">Crystal Growth</CardTitle>
                <CardDescription>Invest your credits and watch them grow over time. A test of patience for a greater reward.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {(Object.keys(CRYSTAL_TIERS) as CrystalTier[]).map(tier => {
                   const details = CRYSTAL_TIERS[tier];
                   const canAfford = (currentUserData?.credits ?? 0) >= details.cost;
                   return (
                    <Card key={tier} className={cn("flex flex-col text-center", !canAfford && "opacity-60")}>
                        <CardHeader>
                            <div className="flex justify-center mb-4">
                                <div className="p-4 rounded-full bg-primary/10 border-4 border-primary/20">
                                    <Gem className={cn("h-10 w-10", details.color)}/>
                                </div>
                            </div>
                            <CardTitle className="text-xl">{details.name}</CardTitle>
                            <CardDescription>Matures in {details.durationDays} days</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <div className="p-4 bg-muted rounded-lg border">
                                <p className="text-sm font-medium">Investment Cost</p>
                                <p className="text-2xl font-bold">{details.cost} Credits</p>
                            </div>
                             <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                                <p className="text-sm font-medium text-green-700 dark:text-green-300">Harvest Value</p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{details.harvestValue} Credits</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button 
                                className="w-full"
                                onClick={() => handlePlant(tier)} 
                                disabled={isProcessing || !canAfford}
                            >
                                {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                                Plant Seed
                            </Button>
                        </CardFooter>
                    </Card>
                   )
               })}
            </CardContent>
        </Card>
    );
}
