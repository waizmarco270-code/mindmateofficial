'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdmin } from '@/hooks/use-admin';
import { 
    Zap, BrainCircuit, KeyRound, Check, 
    AlertTriangle, CloudRain, Trash2, 
    RefreshCcw, Loader2, Code, ShieldX, Skull
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const CREDIT_PASSWORD = "waizcredit";

export default function SystemOverridesPage() {
    const { 
        triggerAegisPulse, giftCreditsToAllUsers, clearGlobalChat, 
        clearQuizLeaderboard, resetWeeklyStudyTime, resetGameZoneLeaderboard,
        resetAllChallenges
    } = useAdmin();
    const { toast } = useToast();

    const [isCreditUnlocked, setIsCreditUnlocked] = useState(false);
    const [creditPassword, setCreditPassword] = useState('');
    const [giftAmount, setGiftAmount] = useState(100);
    const [isAegisPulseRunning, setIsAegisPulseRunning] = useState(false);
    const [isResettingChallenges, setIsResettingChallenges] = useState(false);

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (creditPassword === CREDIT_PASSWORD) {
            setIsCreditUnlocked(true);
            toast({ title: "System Overrides Unlocked" });
        } else {
            toast({ variant: 'destructive', title: "Incorrect Code" });
        }
    };

    const handleAegisPulse = async () => {
        setIsAegisPulseRunning(true);
        try {
            await triggerAegisPulse();
            toast({ title: "Aegis Sentinel Intelligence Pulse Executed" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Aegis Error", description: error.message });
        } finally {
            setIsAegisPulseRunning(false);
        }
    };

    const handleGiftAll = async () => {
        await giftCreditsToAllUsers(giftAmount);
        toast({ title: "Credits Dispatched", description: `+${giftAmount} granted to all active citizens.` });
    };

    const handleResetAllChallenges = async () => {
        setIsResettingChallenges(true);
        try {
            await resetAllChallenges();
        } finally {
            setIsResettingChallenges(false);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
            {!isCreditUnlocked ? (
                <Card className="border-red-600/50 bg-red-950/10 max-w-md mx-auto">
                    <CardHeader className="text-center">
                        <div className="mx-auto p-4 bg-red-600/10 rounded-full w-fit border-2 border-red-600 mb-4 animate-pulse">
                            <KeyRound className="h-10 w-10 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl font-black uppercase italic">Authentication Required</CardTitle>
                        <CardDescription>Enter the Master Override code to access credit & AI systems.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUnlock} className="space-y-4">
                            <Input 
                                type="password" 
                                value={creditPassword} 
                                onChange={e => setCreditPassword(e.target.value)} 
                                placeholder="Enter override code..." 
                                className="h-12 text-center text-lg font-black border-red-600/30"
                            />
                            <Button type="submit" className="w-full h-12 font-black uppercase bg-red-600 hover:bg-red-700">UNLOCK TERMINAL</Button>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                        <Card className="border-indigo-500/30 bg-indigo-500/5 overflow-hidden group">
                            <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]" />
                            <CardHeader className="relative z-10">
                                <CardTitle className="flex items-center gap-2 text-indigo-400 uppercase italic"><BrainCircuit/> Aegis Sentinel Core</CardTitle>
                                <CardDescription>Trigger the autonomous decision engine to analyze leaderboard & engage users.</CardDescription>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <Button onClick={handleAegisPulse} disabled={isAegisPulseRunning} className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-500/20">
                                    {isAegisPulseRunning ? <Loader2 className="animate-spin mr-2"/> : <Zap className="mr-2"/>}
                                    TRIGGER AEGIS PULSE
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-emerald-500/30 bg-emerald-500/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-emerald-500 uppercase italic"><CloudRain/> Credit Rain Ingress</CardTitle>
                                <CardDescription>Grant bulk credits to every registered citizen in the mainframe.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input type="number" value={giftAmount} onChange={e => setGiftAmount(Number(e.target.value))} className="h-14 text-2xl font-black text-center flex-1" />
                                    <Button onClick={handleGiftAll} className="h-14 px-8 bg-emerald-600 hover:bg-emerald-700 font-black text-lg uppercase shadow-xl">GIFT ALL</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-red-600/20 bg-red-600/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-600 uppercase italic"><ShieldX/> Database Force-Overrides</CardTitle>
                            <CardDescription className="text-red-600/60 font-bold uppercase text-[10px] tracking-widest">Warning: Protocols below are irreversible.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="h-16 border-red-600/40 hover:bg-red-600 hover:text-white font-black uppercase text-xs">
                                        {isResettingChallenges ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Skull className="mr-2 h-4 w-4"/>}
                                        Wipe ALL Challenges
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-red-600">CRITICAL OVERRIDE</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will terminate every active mission for EVERY user in the database. Use only to fix system stalls or deploy major logic updates.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Abort</AlertDialogCancel>
                                        <AlertDialogAction className="bg-red-600" onClick={handleResetAllChallenges}>Execute Wipe</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>

                            <Button variant="outline" className="h-16 border-red-600/20 hover:bg-red-600 hover:text-white font-bold uppercase text-xs" onClick={clearGlobalChat}><Trash2 className="mr-2 h-4 w-4"/> Purge Global Forum</Button>
                            <Button variant="outline" className="h-16 border-red-600/20 hover:bg-red-600 hover:text-white font-bold uppercase text-xs" onClick={clearQuizLeaderboard}><RefreshCcw className="mr-2 h-4 w-4"/> Clear Quiz Board</Button>
                            <Button variant="outline" className="h-16 border-red-600/20 hover:bg-red-600 hover:text-white font-bold uppercase text-xs" onClick={resetWeeklyStudyTime}><Clock className="mr-2 h-4 w-4"/> Reset Weekly Time</Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
