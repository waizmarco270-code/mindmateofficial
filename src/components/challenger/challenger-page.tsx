
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ActiveChallenge, useChallenges } from '@/hooks/use-challenges';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Clock, Heart, ShieldAlert, Zap, 
    CheckCircle, XCircle, RotateCcw, 
    ArrowRight, Target, Flame, Skull,
    Loader2, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInMinutes, parseISO, set, addDays, isPast, isToday, subMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ChallengerPageProps {
    config: ActiveChallenge;
}

export function ChallengerPage({ config }: ChallengerPageProps) {
    const { performCheckIn, failChallenge, resetChallenge } = useChallenges();
    const { toast } = useToast();
    
    const [timeLeftInWindow, setTimeLeftInWindow] = useState<string>('');
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const currentDay = useMemo(() => {
        const start = new Date(config.startDate);
        const diff = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return Math.min(diff, config.duration);
    }, [config.startDate, config.duration]);

    // CHECK-IN WINDOW MONITOR
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const [h, m] = config.checkInTime.split(':').map(Number);
            const targetTime = set(now, { hours: h, minutes: m, seconds: 0, milliseconds: 0 });
            const windowStart = subMinutes(targetTime, 10);
            
            if (now >= windowStart && now <= targetTime) {
                setIsWindowOpen(true);
                const diffSecs = Math.floor((targetTime.getTime() - now.getTime()) / 1000);
                const mm = Math.floor(diffSecs / 60);
                const ss = diffSecs % 60;
                setTimeLeftInWindow(`${mm}:${ss.toString().padStart(2, '0')}`);
            } else {
                setIsWindowOpen(false);
                // Check if target time has passed and we haven't checked in today
                if (now > targetTime && config.lastCheckInDay < currentDay) {
                    handleMissedWindow();
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [config, currentDay]);

    const handleMissedWindow = useCallback(async () => {
        if (config.lifelines > 0) {
            // Logic to consume lifeline would happen here or in the hook
            toast({ variant: 'destructive', title: "WINDOW MISSED", description: "A lifeline was consumed to save your mission." });
        } else {
            await failChallenge("You lacked the discipline to sync within your window. Lazy habits have consequences.");
        }
    }, [config.lifelines, failChallenge, toast]);

    const handleCheckIn = async () => {
        setIsProcessing(true);
        try {
            await performCheckIn();
        } finally {
            setIsProcessing(false);
        }
    };

    if (config.status === 'failed') {
        return (
            <div className="flex items-center justify-center min-h-[70vh] p-4">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-xl">
                    <Card className="border-red-600/50 bg-red-950/20 backdrop-blur-3xl rounded-[3rem] text-center p-8 sm:p-12 shadow-2xl">
                        <div className="mx-auto w-24 h-24 bg-red-600/10 rounded-full border-4 border-red-600 flex items-center justify-center mb-8">
                            <Skull className="h-12 w-12 text-red-600" />
                        </div>
                        <h2 className="text-4xl font-black text-red-600 uppercase italic tracking-tighter mb-4">PROTOCOL FAILED</h2>
                        <p className="text-xl text-slate-200 font-bold mb-6 leading-relaxed italic">"{config.failMessage}"</p>
                        <div className="p-6 rounded-2xl bg-black/40 border border-white/5 mb-8">
                            <p className="text-[10px] font-black uppercase text-red-500 tracking-[0.2em] mb-1">Network Penalty Executed</p>
                            <p className="text-4xl font-black text-white">-{config.penalty} Credits</p>
                        </div>
                        <Button size="lg" variant="ghost" className="text-slate-400 hover:text-white" onClick={resetChallenge}>TERMINATE SESSION RECORD</Button>
                    </Card>
                </motion.div>
            </div>
        );
    }

    if (config.status === 'completed') {
        return (
            <div className="flex items-center justify-center min-h-[70vh] p-4">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-xl">
                    <Card className="border-yellow-400/50 bg-yellow-400/5 backdrop-blur-3xl rounded-[3rem] text-center p-8 sm:p-12 shadow-2xl">
                        <div className="mx-auto w-24 h-24 bg-yellow-400/10 rounded-full border-4 border-yellow-400 flex items-center justify-center mb-8">
                            <Trophy className="h-12 w-12 text-yellow-400 animate-bounce" />
                        </div>
                        <h2 className="text-4xl font-black text-yellow-400 uppercase italic tracking-tighter mb-2">CHAMPION ASCENDED</h2>
                        <p className="text-xl text-slate-200 font-bold mb-8">Mission {config.title} conquered successfully.</p>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                                <p className="text-[10px] font-black uppercase text-yellow-400 tracking-widest mb-1">Bounty Secured</p>
                                <p className="text-2xl font-black">+{config.reward} CR</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                                <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Rank Identity</p>
                                <p className="text-lg font-black uppercase text-white">{config.badgeToUnlock}</p>
                            </div>
                        </div>
                        <Button size="lg" className="w-full h-16 rounded-2xl font-black text-xl" onClick={resetChallenge}>COLLECT & EXIT</Button>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* MISSION STATUS */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="relative overflow-hidden bg-slate-900/40 backdrop-blur-3xl border-primary/20 rounded-[2.5rem]">
                        <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                        <CardHeader className="p-8 sm:p-10 relative z-10">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Aegis Monitoring Active</span>
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest opacity-40">Day {currentDay} / {config.duration}</span>
                            </div>
                            <CardTitle className="text-5xl font-black italic uppercase tracking-tighter text-white">{config.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 sm:p-10 pt-0 space-y-10 relative z-10">
                            {/* RELAY TERMINAL */}
                            <div className={cn(
                                "p-8 rounded-[2.5rem] border-2 transition-all duration-500",
                                isWindowOpen ? "bg-primary/10 border-primary animate-pulse shadow-[0_0_40px_rgba(139,92,246,0.3)]" : "bg-black/20 border-white/5 opacity-60"
                            )}>
                                <div className="text-center space-y-6">
                                    <p className="text-sm font-black uppercase tracking-[0.4em] text-primary">Synchronize Pulse</p>
                                    
                                    {isWindowOpen ? (
                                        <div className="space-y-6">
                                            <div className="text-6xl font-black font-mono tracking-tighter">{timeLeftInWindow}</div>
                                            <Button 
                                                className="w-full h-20 rounded-[2rem] text-2xl font-black uppercase bg-primary text-white shadow-2xl group"
                                                onClick={handleCheckIn}
                                                disabled={isProcessing || config.lastCheckInDay === currentDay}
                                            >
                                                {config.lastCheckInDay === currentDay ? (
                                                    <><CheckCircle className="mr-3 h-8 w-8" /> PULSE SECURED</>
                                                ) : (
                                                    <><Zap className="mr-3 h-8 w-8 group-hover:rotate-12 transition-transform" /> TRANSMIT PRESENCE</>
                                                )}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="text-4xl font-black font-mono opacity-20">{config.checkInTime}</div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                Next window opens at {subMinutes(set(new Date(), { 
                                                    hours: parseInt(config.checkInTime.split(':')[0]), 
                                                    minutes: parseInt(config.checkInTime.split(':')[1]) 
                                                }), 10).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-3xl bg-black/40 border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Heart className="h-6 w-6 text-red-500 fill-current" />
                                        <span className="text-xs font-black uppercase tracking-widest">Lifelines</span>
                                    </div>
                                    <span className="text-2xl font-black text-white">x{config.lifelines}</span>
                                </div>
                                <div className="p-6 rounded-3xl bg-black/40 border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="h-6 w-6 text-red-500" />
                                        <span className="text-xs font-black uppercase tracking-widest">Hazard</span>
                                    </div>
                                    <span className="text-2xl font-black text-white">-{config.penalty}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* SIDEBAR ASSETS */}
                <div className="space-y-8">
                    <Card className="bg-muted/30 border-white/10 rounded-[2rem]">
                        <CardHeader><CardTitle className="text-sm font-black uppercase tracking-widest text-primary">Mission Bounty</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-background/50 rounded-2xl border">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500"><Gem className="h-5 w-5"/></div>
                                    <span className="text-xs font-bold uppercase">Mainframe Credits</span>
                                </div>
                                <span className="font-black text-xl">+{config.reward}</span>
                            </div>
                            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 flex flex-col items-center text-center gap-3">
                                <div className="p-4 rounded-full bg-primary/10 border-2 border-primary/30">
                                    <Trophy className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Rank Identity Unlock</p>
                                    <p className="text-xl font-black text-white uppercase italic">{config.badgeToUnlock}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-red-500/30 bg-red-500/5 rounded-[2rem]">
                        <CardHeader>
                            <CardTitle className="text-xs font-black uppercase text-red-500 tracking-widest flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4" /> DEADLY ALERT
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-[11px] leading-relaxed text-muted-foreground font-medium">
                            <p><b>Precision is Law</b>: You have a strict 10-minute window daily. Sync errors or tardiness result in immediate lifeline consumption.</p>
                            <p><b>The Forfeit</b>: If you run out of lifelines or manually abort, the penalty of <b>{config.penalty} credits</b> is enforced immediately across the global registry.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function Gem({ className }: any) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>;
}
