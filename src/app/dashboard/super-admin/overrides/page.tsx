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
    RefreshCcw, Loader2, Code, ShieldX, Skull,
    Coins, Lock, ShieldAlert, BellRing, Package,
    Wallet, UserMinus, History, Flame, ShieldCheck,
    MessageSquare, Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle, 
    AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';

const MASTER_OVERRIDE_CODE = "waizcredit";

export default function SystemOverridesPage() {
    const { 
        triggerAegisPulse, giftCreditsToAllUsers, clearGlobalChat, 
        clearQuizLeaderboard, resetWeeklyStudyTime, resetGameZoneLeaderboard,
        resetAllChallenges, resetAllIsolationSessions, resetAllUserCredits,
        injectArtifactToAll, broadcastGlobalMessage, topUpAllWallets,
        appSettings
    } = useAdmin();
    const { toast } = useToast();

    const [isUnlocked, setIsUnlocked] = useState(false);
    const [overrideCode, setOverrideCode] = useState('');
    const [isProcessing, setIsProcessing] = useState<string | null>(null);

    // Dynamic Input States
    const [giftAmount, setGiftAmount] = useState(100);
    const [walletAmount, setWalletAmount] = useState(10);
    const [broadcastMsg, setBroadcastMsg] = useState('');

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (overrideCode === MASTER_OVERRIDE_CODE) {
            setIsUnlocked(true);
            toast({ title: "Mainframe Overrides Unlocked" });
        } else {
            toast({ variant: 'destructive', title: "Authentication Failed", description: "Invalid override code." });
        }
    };

    const executeDirective = async (id: string, action: () => Promise<any>, successMsg: string) => {
        setIsProcessing(id);
        try {
            await action();
            toast({ title: "Directive Executed", description: successMsg });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Directive Failed", description: error.message });
        } finally {
            setIsProcessing(null);
        }
    };

    if (!isUnlocked) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="border-red-600/50 bg-red-950/10 w-full max-w-md shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto p-4 bg-red-600/10 rounded-full w-fit border-2 border-red-600 mb-4 animate-pulse">
                            <KeyRound className="h-10 w-10 text-red-600" />
                        </div>
                        <CardTitle className="text-2xl font-black uppercase italic text-white">Authorization Required</CardTitle>
                        <CardDescription className="text-red-200/60 font-bold uppercase text-[10px] tracking-widest">Protocol: Master Override</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUnlock} className="space-y-4">
                            <Input 
                                type="password" 
                                value={overrideCode} 
                                onChange={e => setOverrideCode(e.target.value)} 
                                placeholder="Enter override code..." 
                                className="h-14 text-center text-2xl font-black border-red-600/30 bg-black/40 text-white placeholder:text-red-900"
                            />
                            <Button type="submit" className="w-full h-14 font-black uppercase bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/20 rounded-2xl">
                                UNLOCK OVERRIDE TERMINAL
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* TOP ROW: INTELLIGENCE & BROADCAST */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
                <Card className="lg:col-span-4 border-indigo-500/30 bg-indigo-500/5 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-400 uppercase italic"><BrainCircuit className="h-5 w-5"/> Aegis Sentinel Core</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Autonomous Governance Engine</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button 
                            onClick={() => executeDirective('aegis', triggerAegisPulse, "Intelligence pulse dispatched to the network.")} 
                            disabled={!!isProcessing} 
                            className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-500/20 rounded-2xl"
                        >
                            {isProcessing === 'aegis' ? <Loader2 className="animate-spin mr-2"/> : <Zap className="mr-2"/>}
                            TRIGGER AEGIS PULSE
                        </Button>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-8 border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-primary uppercase italic"><MessageSquare className="h-5 w-5"/> Global Message Pulse</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Dispatch High-Priority Briefing to All Citizens</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-3">
                        <Input 
                            value={broadcastMsg} 
                            onChange={e => setBroadcastMsg(e.target.value)} 
                            placeholder="Enter system briefing..." 
                            className="h-14 bg-black/20 border-primary/20 flex-1"
                        />
                        <Button 
                            onClick={() => executeDirective('broadcast', () => broadcastGlobalMessage(broadcastMsg), "Global transmission complete.")}
                            disabled={!!isProcessing || !broadcastMsg.trim()}
                            className="h-14 px-8 font-black uppercase shadow-lg shadow-primary/20 rounded-xl"
                        >
                            <Send className="mr-2 h-4 w-4"/> BROADCAST
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {/* ECONOMY HUB */}
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                    <CardHeader className="border-b border-emerald-500/10 mb-4 bg-emerald-500/5">
                        <CardTitle className="text-sm font-black uppercase text-emerald-500 tracking-[0.2em] flex items-center gap-2">
                            <Coins className="h-4 w-4"/> Economy Hub
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase opacity-40">Credit Rain Injection</Label>
                            <div className="flex gap-2">
                                <Input type="number" value={giftAmount} onChange={e => setGiftAmount(Number(e.target.value))} className="h-12 text-lg font-black bg-black/20 text-center" />
                                <Button onClick={() => executeDirective('gift-all', () => giftCreditsToAllUsers(giftAmount), "Credits gifted to all.")} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12">GIFT ALL</Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase opacity-40">Global Vault Ingress (₹)</Label>
                            <div className="flex gap-2">
                                <Input type="number" value={walletAmount} onChange={e => setWalletAmount(Number(e.target.value))} className="h-12 text-lg font-black bg-black/20 text-center" />
                                <Button onClick={() => executeDirective('wallet-all', () => topUpAllWallets(walletAmount), "Vaults topped up.")} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold h-12">VAULT ALL</Button>
                            </div>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10 font-black uppercase text-xs h-12 rounded-xl">
                                    Reset ALL Credits to Default
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-950 border-red-600/50">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-red-500">ECONOMY RE-CALIBRATION</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will set every user's credit balance back to the configured sign-up default ({appSettings?.startingCredits || 200}).
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Abort</AlertDialogCancel>
                                    <AlertDialogAction className="bg-red-600" onClick={() => executeDirective('reset-credits', resetAllUserCredits, "All credits re-calibrated.")}>EXECUTE RESET</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>

                {/* DISCIPLINE HUB */}
                <Card className="border-red-600/20 bg-red-600/5">
                    <CardHeader className="border-b border-red-600/10 mb-4 bg-red-600/5">
                        <CardTitle className="text-sm font-black uppercase text-red-600 tracking-[0.2em] flex items-center gap-2">
                            <Lock className="h-4 w-4"/> Discipline Hub
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" className="h-14 font-black uppercase text-[10px] border-primary/20" onClick={() => executeDirective('shields', () => injectArtifactToAll('penalty-shield'), "Penalty Shields distributed.")}>
                                <ShieldCheck className="mr-2 h-4 w-4 text-blue-400"/> Gifting Shields
                            </Button>
                            <Button variant="outline" className="h-14 font-black uppercase text-[10px] border-primary/20" onClick={() => executeDirective('freezes', () => injectArtifactToAll('streak-freeze'), "Streak Freezes distributed.")}>
                                <Snowflake className="mr-2 h-4 w-4 text-cyan-400"/> Gifting Freezes
                            </Button>
                        </div>
                        
                        <Separator className="bg-red-600/10" />

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full h-12 font-black uppercase text-xs">Reset Challenger Zone</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-950 border-red-600/50">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Wipe ALL Active Challenges?</AlertDialogTitle>
                                    <AlertDialogDescription>Terminates every current mission on the network. Use for system stalls.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Abort</AlertDialogCancel>
                                    <AlertDialogAction className="bg-red-600" onClick={() => executeDirective('reset-challenges', resetAllChallenges, "Challenges purged.")}>PURGE ALL</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full h-12 font-black uppercase text-xs">Reset Isolation Mode</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-950 border-red-600/50">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Wipe ALL Isolation Sessions?</AlertDialogTitle>
                                    <AlertDialogDescription>Ends every digital exile session immediately. No penalties executed.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Abort</AlertDialogCancel>
                                    <AlertDialogAction className="bg-red-600" onClick={() => executeDirective('reset-isolation', resetAllIsolationSessions, "Isolation sessions ended.")}>PURGE ALL</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>

                {/* MAINFRAME MAINTENANCE */}
                <Card className="border-amber-500/20 bg-amber-500/5">
                    <CardHeader className="border-b border-amber-500/10 mb-4 bg-amber-500/5">
                        <CardTitle className="text-sm font-black uppercase text-amber-500 tracking-[0.2em] flex items-center gap-2">
                            <History className="h-4 w-4"/> Registry Maintenance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full h-12 border-amber-500/20 font-bold uppercase text-[10px]" onClick={clearGlobalChat}>
                            <Trash2 className="mr-2 h-4 w-4 text-red-500"/> Purge Global Forum
                        </Button>
                        <Button variant="outline" className="w-full h-12 border-amber-500/20 font-bold uppercase text-[10px]" onClick={clearQuizLeaderboard}>
                            <RefreshCcw className="mr-2 h-4 w-4 text-blue-500"/> Reset Quiz Records
                        </Button>
                        <Button variant="outline" className="w-full h-12 border-amber-500/20 font-bold uppercase text-[10px]" onClick={resetWeeklyStudyTime}>
                            <Clock className="mr-2 h-4 w-4 text-sky-500"/> Reset Weekly Study
                        </Button>
                        <Button variant="outline" className="w-full h-12 border-amber-500/20 font-bold uppercase text-[10px]" onClick={resetGameZoneLeaderboard}>
                            <Gamepad2 className="mr-2 h-4 w-4 text-rose-500"/> Reset Arcade Board
                        </Button>
                        
                        <Separator className="bg-amber-500/10" />
                        
                        <Button variant="ghost" className="w-full h-10 text-[9px] font-black uppercase tracking-[0.3em] text-red-500/60 hover:bg-red-500/10">
                            <UserMinus className="mr-2 h-3.5 w-3.5"/> Purge Inactive Legends
                        </Button>
                    </CardContent>
                </Card>
            </div>
            
            <div className="p-8 rounded-[3rem] bg-slate-900 border-2 border-red-600/30 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
                <div className="relative z-10 space-y-4">
                    <h3 className="text-2xl font-black uppercase italic text-red-600 flex items-center justify-center gap-3">
                        <ShieldAlert className="h-8 w-8 animate-pulse" /> CRITICAL MAINFRAME OVERRIDE
                    </h3>
                    <p className="text-slate-400 font-medium italic text-sm max-w-2xl mx-auto">
                        "As the Master of MindMate, these protocols allow you to bypass all system constraints. Use them to maintain order, reward loyalty, and ensure the survival of the Empire."
                    </p>
                </div>
            </div>
        </div>
    );
}
