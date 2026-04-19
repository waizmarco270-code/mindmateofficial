'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ActiveChallenge, useChallenges } from '@/hooks/use-challenges';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Clock, Heart, ShieldAlert, Zap, 
    CheckCircle, XCircle, RotateCcw, 
    ArrowRight, Target, Flame, Skull,
    Loader2, AlertTriangle, ShieldCheck,
    ListTodo, BarChart3, ChevronRight,
    Trophy, Gem, Flag, LogOut, MessageSquare, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, set, subMinutes, isToday, differenceInSeconds } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { badgeMeta } from '@/components/leaderboard/shared/badge-renderer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface ChallengerPageProps {
    config: ActiveChallenge;
}

export function ChallengerPage({ config }: ChallengerPageProps) {
    const { performCheckIn, failChallenge, forfeitChallenge, resetChallenge, consumeLifeline } = useChallenges();
    const { toast } = useToast();
    
    const [timeLeftInWindow, setTimeLeftInWindow] = useState<string>('');
    const [isWindowOpen, setIsWindowOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isForfeitOpen, setIsForfeitOpen] = useState(false);
    const [forfeitReason, setForfeitReason] = useState('');

    // NoFap Streak Logic
    const [noFapTime, setNoFapTime] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

    const currentDay = useMemo(() => {
        const start = new Date(config.startDate);
        const diff = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return Math.min(diff, config.duration);
    }, [config.startDate, config.duration]);

    const todayTasks = config.plannedTasks?.[currentDay] || [];

    // NOFAP TIMER
    useEffect(() => {
        if (!config.hasNoFapTracker || !config.noFapStartDate) return;

        const interval = setInterval(() => {
            const start = new Date(config.noFapStartDate!);
            const now = new Date();
            const diff = Math.max(0, differenceInSeconds(now, start));

            setNoFapTime({
                days: Math.floor(diff / 86400),
                hours: Math.floor((diff % 86400) / 3600),
                mins: Math.floor((diff % 3600) / 60),
                secs: diff % 60
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [config.hasNoFapTracker, config.noFapStartDate]);

    // HANDLE MISSED WINDOW
    const handleMissedWindow = useCallback(async () => {
        if (isProcessing) return; 
        
        setIsProcessing(true);
        try {
            if (config.lifelines > 0) {
                await consumeLifeline(currentDay);
                toast({ 
                    variant: 'destructive', 
                    title: "WINDOW MISSED", 
                    description: "A lifeline was consumed to save your mission." 
                });
            } else {
                await failChallenge("You lacked the discipline to sync within your window. Lazy habits have consequences.");
            }
        } finally {
            setIsProcessing(false);
        }
    }, [config.lifelines, currentDay, consumeLifeline, failChallenge, toast, isProcessing]);

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
                if (now > targetTime && config.lastCheckInDay < currentDay) {
                    handleMissedWindow();
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [config, currentDay, handleMissedWindow]);

    const handleCheckIn = async () => {
        setIsProcessing(true);
        try {
            await performCheckIn();
        } finally {
            setIsProcessing(false);
        }
    };

    const handleForfeit = async () => {
        if (!forfeitReason.trim()) {
            toast({ variant: 'destructive', title: "CONFESSION REQUIRED", description: "You must explain why you are abandoning your path." });
            return;
        }
        setIsProcessing(true);
        try {
            await forfeitChallenge(forfeitReason);
            setIsForfeitOpen(false);
        } catch (e) {
            console.error(e);
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
                        <Button size="lg" variant="ghost" className="text-slate-400 font-black uppercase" onClick={resetChallenge}>TERMINATE SESSION RECORD</Button>
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
                                <p className="text-2xl font-black text-white">+{config.reward} CR</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                                <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Rank Identity</p>
                                <p className="text-lg font-black uppercase text-white">{config.badgeToUnlock}</p>
                            </div>
                        </div>
                        <Button size="lg" className="w-full h-16 rounded-2xl font-black text-xl italic" onClick={resetChallenge}>COLLECT & EXIT</Button>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <Card className="relative overflow-hidden bg-slate-900/40 backdrop-blur-3xl border-primary/20 rounded-[2.5rem] shadow-2xl">
                        <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                        <CardHeader className="p-8 sm:p-10 relative z-10 border-b border-white/5 bg-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Sentinel Uplink Active</span>
                                </div>
                                <Badge variant="outline" className="font-black tracking-widest px-4 py-1">PHASE {currentDay} / {config.duration}</Badge>
                            </div>
                            <CardTitle className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter text-white">{config.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 sm:p-10 space-y-10 relative z-10">
                            <div className={cn(
                                "p-10 rounded-[3rem] border-2 transition-all duration-700",
                                isWindowOpen ? "bg-primary/10 border-primary shadow-[0_0_50px_rgba(139,92,246,0.3)]" : "bg-black/20 border-white/5 opacity-60"
                            )}>
                                <div className="text-center space-y-8">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary">Daily Sync Protocol</p>
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">Temporal Target: {config.checkInTime}</h4>
                                    </div>
                                    
                                    {isWindowOpen ? (
                                        <div className="space-y-8">
                                            <div className="text-8xl font-black font-mono tracking-tighter text-white drop-shadow-lg">{timeLeftInWindow}</div>
                                            <Button 
                                                className="w-full h-24 rounded-[2.5rem] text-3xl font-black uppercase bg-primary text-white shadow-2xl group active:scale-95 transition-all"
                                                onClick={handleCheckIn}
                                                disabled={isProcessing || config.lastCheckInDay === currentDay}
                                            >
                                                {config.lastCheckInDay === currentDay ? (
                                                    <><CheckCircle className="mr-4 h-10 w-10" /> PULSE SECURED</>
                                                ) : (
                                                    <><Zap className="mr-4 h-10 w-10 group-hover:rotate-12 transition-transform" /> TRANSMIT PRESENCE</>
                                                )}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="text-6xl font-black font-mono opacity-10">{config.checkInTime}</div>
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    Status: Waiting for Relay Window
                                                </div>
                                                {config.lastCheckInDay === currentDay && (
                                                    <p className="text-green-500 font-black uppercase text-[10px] tracking-[0.2em] flex items-center gap-2 mt-2">
                                                        <ShieldCheck className="h-4 w-4" /> Operational Cycle Secured for Day {currentDay}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <h3 className="text-xl font-black uppercase italic tracking-tight flex items-center gap-3">
                                        <ListTodo className="text-primary"/> Day {currentDay} Objectives
                                    </h3>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground opacity-60">Verified Records Only</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {todayTasks.length > 0 ? todayTasks.map(cat => (
                                        <div key={cat.id} className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3" style={{ borderLeft: `4px solid ${cat.color}` }}>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{cat.title}</p>
                                            <div className="space-y-2">
                                                {cat.tasks.map(t => (
                                                    <div key={t.id} className="flex items-center gap-3">
                                                        <div className={cn("h-4 w-4 rounded border flex items-center justify-center", t.completed ? "bg-primary border-primary" : "border-white/20")}>
                                                            {t.completed && <CheckCircle className="h-3 w-3 text-white"/>}
                                                        </div>
                                                        <span className={cn("text-sm font-medium", t.completed ? "text-slate-500 line-through" : "text-slate-200")}>{t.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-3xl opacity-20">
                                            <Target className="h-10 w-10 mx-auto mb-3" />
                                            <p className="text-xs font-black uppercase tracking-widest">No Tactical objectives set for today</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <AnimatePresence>
                        {config.hasNoFapTracker && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                <Card className="bg-gradient-to-br from-purple-900/40 via-slate-900/60 to-slate-900 border-purple-500/30 rounded-[2.5rem] overflow-hidden shadow-xl group">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-purple-400 flex items-center gap-2">
                                            <ShieldCheck className="h-4 w-4" /> NOFAP DISCIPLINE
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-6 text-center space-y-4">
                                        <div className="grid grid-cols-4 gap-2">
                                            <NoFapPill label="Days" val={noFapTime.days} />
                                            <NoFapPill label="Hours" val={noFapTime.hours} />
                                            <NoFapPill label="Mins" val={noFapTime.mins} />
                                            <NoFapPill label="Secs" val={noFapTime.secs} />
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic group-hover:text-purple-400 transition-colors">"Biological preservation active."</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Card className="bg-slate-900/60 backdrop-blur-2xl border-white/10 rounded-[3rem] overflow-hidden">
                        <CardHeader className="bg-white/5 border-b border-white/5"><CardTitle className="text-xs font-black uppercase tracking-[0.3em] text-primary">Session Assets</CardTitle></CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="flex justify-between items-center p-5 bg-black/40 rounded-2xl border border-white/5 group transition-colors hover:border-primary/30">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-red-500/10 text-red-500"><Heart className="h-6 w-6 fill-current"/></div>
                                    <span className="text-xs font-black uppercase tracking-widest">Lifelines</span>
                                </div>
                                <span className="font-black text-3xl tabular-nums">x{config.lifelines}</span>
                            </div>
                            
                            <div className="flex justify-between items-center p-5 bg-black/40 rounded-2xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-primary/10 text-primary"><Target className="h-6 w-6"/></div>
                                    <span className="text-xs font-black uppercase tracking-widest">Target Work</span>
                                </div>
                                <span className="font-black text-2xl tabular-nums italic">{config.dailyWorkHourTarget}h</span>
                            </div>

                            <div className="h-px w-full bg-white/5" />

                            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/30 flex flex-col items-center text-center gap-4 group">
                                <div className="p-5 rounded-full bg-primary/10 border-2 border-primary/20 shadow-2xl transition-transform group-hover:scale-110 duration-500">
                                    <Trophy className="h-10 w-10 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em] mb-2">Target Asset</p>
                                    <div className="scale-150 py-2">{badgeMeta[config.badgeToUnlock as any]?.badge}</div>
                                    <div className="mt-6 flex items-center justify-center gap-3 text-emerald-500 font-black text-xl">
                                        <Gem className="h-5 w-5"/> +{config.reward} CR
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-red-500/30 bg-red-500/5 rounded-[2.5rem] p-8">
                        <h4 className="flex items-center gap-2 text-red-500 font-black uppercase text-xs tracking-widest mb-4">
                            <ShieldAlert className="h-5 w-5" /> EXTREME HAZARD
                        </h4>
                        <div className="space-y-4 text-[11px] leading-relaxed text-slate-400 font-medium italic">
                            <p>"Missing your relay window results in immediate lifeline extraction. If lifelines hit zero, the mainframe executes a <b>{config.penalty} Credit</b> penalty."</p>
                        </div>
                    </Card>

                    <Button 
                        variant="ghost" 
                        onClick={() => setIsForfeitOpen(true)}
                        className="w-full text-red-500/40 hover:text-red-500 hover:bg-red-500/10 font-black uppercase text-[10px] tracking-[0.3em] h-12 rounded-2xl"
                    >
                        <Flag className="mr-2 h-4 w-4" /> FORFEIT PROTOCOL
                    </Button>
                </div>
            </div>

            {/* FORFEIT DIALOG */}
            <Dialog open={isForfeitOpen} onOpenChange={setIsForfeitOpen}>
                <DialogContent className="max-w-lg bg-slate-950 border-red-600/50 rounded-[3rem] p-8 sm:p-12 overflow-hidden relative">
                    <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
                    <DialogHeader className="relative z-10 text-left">
                        <div className="flex justify-center mb-6">
                            <div className="p-6 bg-red-600/20 rounded-full border-4 border-red-600 animate-pulse">
                                <AlertTriangle className="h-12 w-12 text-red-600" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-3xl font-black uppercase italic text-white tracking-tighter">SURRENDER REQUESTED</DialogTitle>
                        <DialogDescription className="text-center text-base font-bold text-red-200 mt-2">
                             Retreat is the silent killer of legends. A penalty of <span className="text-white">-{config.penalty} Credits</span> will be authorized.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-6 relative z-10">
                        <div className="p-6 rounded-3xl bg-white/5 border-2 border-dashed border-white/10 text-center italic text-sm text-slate-400">
                            "A champion is simply someone who didn't give up when they wanted to. Are you certain this is your end?"
                        </div>
                        
                        <div className="space-y-3">
                            <Label className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Confession of Failure</Label>
                            <Textarea 
                                value={forfeitReason}
                                onChange={e => setForfeitReason(e.target.value)}
                                placeholder="Why are you abandoning your path?"
                                className="bg-black/40 border-white/10 rounded-2xl min-h-[120px] focus-visible:ring-red-600/30"
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-3 relative z-10">
                        <DialogClose asChild><Button variant="outline" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest border-white/10">STAY ON PATH</Button></DialogClose>
                        <Button 
                            variant="destructive" 
                            disabled={isProcessing || !forfeitReason.trim()} 
                            onClick={handleForfeit}
                            className="flex-1 h-14 rounded-2xl font-black uppercase bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/20"
                        >
                            {isProcessing ? <Loader2 className="animate-spin" /> : <><LogOut className="mr-2 h-5 w-5" /> AUTHORIZE FORFEIT</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function NoFapPill({ label, val }: { label: string, val: number }) {
    return (
        <div className="p-2 rounded-xl bg-black/40 border border-white/5 text-center">
            <p className="text-[12px] font-black text-white tabular-nums leading-none">{String(val).padStart(2, '0')}</p>
            <p className="text-[7px] font-black uppercase text-purple-400 tracking-tighter mt-0.5">{label}</p>
        </div>
    );
}
