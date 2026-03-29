
'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldAlert, Lock, Zap, Trophy, Clock, 
    Gem, Wallet, Star, ArrowRight, Loader2,
    CheckCircle, AlertTriangle, Info, Play, Pause,
    Monitor, CreditCard, Award, X, ShieldX,
    MessageSquare, Send, Check, Code, Swords, Bird, Moon,
    Youtube, Link as LinkIcon, PlayCircle, WifiOff,
    ChevronLeft, ChevronRight, Calendar, BarChart3, Timer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useIsolation, ISOLATION_CONFIGS, type IsolationDuration, type ActiveIsolation } from '@/hooks/use-isolation';
import { useUsers } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, differenceInSeconds, addDays, isSameDay, eachDayOfInterval, isPast, isToday } from 'date-fns';
import { createRazorpayOrder } from '@/app/actions/razorpay';
import Script from 'next/script';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { TacticalCalculator } from '@/components/isolation/tactical-calculator';
import { TaskTerminal } from '@/components/isolation/task-terminal';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const badgeDetails: Record<string, { name: string, badge: JSX.Element }> = {
    isolater: { name: 'Isolater', badge: <span className="isolater-badge">ISOLATER</span> },
    'iso-warrior': { name: 'ISO-Warrior', badge: <span className="iso-warrior-badge">ISO-WARRIOR</span> },
    warrior: { name: 'Warrior', badge: <span className="warrior-badge">WARRIOR</span> },
    'iso-master': { name: 'ISO-Master', badge: <span className="iso-master-badge">ISO-MASTER</span> },
    sovereign: { name: 'Sovereign', badge: <span className="sovereign-badge">Sovereign</span> }
};

const formatSecondsToTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function IsolationHub() {
    const { user } = useUser();
    const { activeSession, startIsolation, updateProgress, setSessionVideoId, emergeVictory, failIsolation, loading, payForEarlyExit } = useIsolation();
    const { currentUserData } = useUsers();
    const { toast } = useToast();

    const [selectedDuration, setSelectedDuration] = useState<IsolationDuration | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [timerActive, setTimerActive] = useState(false);
    const [viewingDate, setViewingDate] = useState<Date>(new Date());
    
    // Vigilance Monitor
    const [isRestDialogOpen, setIsRestDialogOpen] = useState(false);
    const lastInteractionTime = useRef<number>(Date.now());

    // Extraction State
    const [isExtractionOpen, setIsExtractionOpen] = useState(false);
    const [extractionMode, setExtractionMode] = useState<'selection' | 'credits' | 'money'>('selection');
    const [isProcessingExit, setIsProcessingExit] = useState(false);

    const [ytInput, setYtInput] = useState('');
    const lastTickRef = useRef<number>(Date.now());

    // Presence Tracking
    useEffect(() => {
        const resetInteraction = () => {
            lastInteractionTime.current = Date.now();
        };
        window.addEventListener('mousemove', resetInteraction);
        window.addEventListener('keydown', resetInteraction);
        return () => {
            window.removeEventListener('mousemove', resetInteraction);
            window.removeEventListener('keydown', resetInteraction);
        };
    }, []);

    // Heartbeat & Vigilance Loop
    useEffect(() => {
        if (!timerActive || activeSession?.status !== 'active') return;

        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                const now = Date.now();
                
                // Vigilance Check: 3 Hours (10800 seconds)
                if (now - lastInteractionTime.current > 10800000) {
                    setTimerActive(false);
                    setIsRestDialogOpen(true);
                    return;
                }

                const delta = Math.floor((now - lastTickRef.current) / 1000);
                if (delta >= 1) {
                    updateProgress(delta);
                    lastTickRef.current = now;
                }
            } else {
                setTimerActive(false);
                toast({ variant: 'destructive', title: "SIGNAL LOST", description: "Isolation requires active presence.", className: "bg-red-600 text-white font-black" });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [timerActive, activeSession, updateProgress, toast]);

    const handleIngress = async (method: 'credits' | 'money') => {
        if (!selectedDuration || !user) return;
        setIsStarting(true);
        try {
            if (method === 'money') {
                const config = ISOLATION_CONFIGS[selectedDuration];
                const order = await createRazorpayOrder(config.moneyCost, { userId: user.id, packName: `Isolation: ${config.label}`, credits: 0 });
                const options = {
                    key: order.keyId,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'MindMate Isolation',
                    description: `Ingress for ${config.label}`,
                    order_id: order.id,
                    handler: async (response: any) => {
                        await startIsolation(selectedDuration, 'money', response.razorpay_payment_id);
                    },
                    theme: { color: '#8b5cf6' }
                };
                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            } else {
                await startIsolation(selectedDuration, 'credits');
            }
        } catch (e: any) {
            toast({ variant: 'destructive', title: "Ingress Failed", description: e.message });
        } finally {
            setIsStarting(false);
        }
    };

    const handleEarlyExit = async (method: 'credits' | 'wallet' | 'razorpay') => {
        if (!activeSession) return;
        const config = ISOLATION_CONFIGS[activeSession.durationId];
        setIsProcessingExit(true);
        try {
            if (method === 'razorpay') {
                const order = await createRazorpayOrder(config.exitMoneyCost, { userId: user!.id, packName: 'Isolation Early Exit', credits: 0 });
                const options = {
                    key: order.keyId,
                    amount: order.amount,
                    currency: order.currency,
                    name: 'MindMate Extraction',
                    description: `Early Exit for ${config.label}`,
                    order_id: order.id,
                    handler: async (response: any) => {
                        await payForEarlyExit('razorpay', response.razorpay_payment_id);
                        setIsExtractionOpen(false);
                    },
                    theme: { color: '#ef4444' }
                };
                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            } else {
                await payForEarlyExit(method);
                setIsExtractionOpen(false);
            }
        } catch (e: any) {
            toast({ variant: 'destructive', title: "Exit Failed", description: e.message });
        } finally {
            setIsProcessingExit(false);
        }
    };

    const handleYtUplink = () => {
        const idMatch = ytInput.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/))([\w-]{11})/);
        if (idMatch && idMatch[1]) {
            setSessionVideoId(idMatch[1]);
            setYtInput('');
            toast({ title: "Video Uplink Secured" });
        } else {
            toast({ variant: 'destructive', title: "Invalid Signal" });
        }
    };

    const allDates = useMemo(() => {
        if (!activeSession) return [];
        return eachDayOfInterval({ start: new Date(activeSession.startTime), end: new Date(activeSession.endTime) });
    }, [activeSession]);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>;

    if (activeSession && activeSession.status === 'active') {
        const config = ISOLATION_CONFIGS[activeSession.durationId];
        const percent = Math.min(100, (activeSession.accumulatedSeconds / activeSession.totalTargetSeconds) * 100);
        const hoursRemaining = Math.max(0, (activeSession.totalTargetSeconds - activeSession.accumulatedSeconds) / 3600);
        
        const viewingDateKey = format(viewingDate, 'yyyy-MM-dd');
        const viewingDaySeconds = activeSession.dailyLogs?.[viewingDateKey] || 0;
        const viewingDayHours = viewingDaySeconds / 3600;
        const targetMet = viewingDayHours >= 10;

        // Task Status Analysis
        const tasks = activeSession.dailyTasks?.[viewingDateKey] || [];
        const tasksDone = tasks.length > 0 && tasks.every(t => t.completed);
        const dayIsCurrent = isToday(viewingDate);
        const dayIsPast = isPast(viewingDate) && !dayIsCurrent;
        const tasksFailed = dayIsPast && tasks.length > 0 && !tasksDone;

        return (
            <div className="min-h-screen bg-[#050505] p-4 sm:p-8 flex flex-col items-center overflow-y-auto">
                <TacticalCalculator />
                
                <div className="max-w-6xl w-full space-y-8 pb-20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="text-red-500 animate-pulse" />
                            <h1 className="text-2xl font-black uppercase tracking-tighter text-white">ISOLATION ACTIVE</h1>
                        </div>
                        <Badge className="bg-red-500 text-black font-black uppercase">Phase: {config.label}</Badge>
                    </div>

                    <Card className="bg-slate-900/50 border-primary/20 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 md:p-12 border-b border-white/5">
                            {/* LEFT AREA: DAILY DATA BRIEFING */}
                            <div className="lg:col-span-3 space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><BarChart3 className="h-3 w-3"/> Temporal Data</p>
                                    <h3 className="text-2xl font-black text-white italic">{format(viewingDate, 'MMM do, yyyy')}</h3>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Logged Time</p>
                                        <Badge variant="outline" className={cn("text-[8px] font-black uppercase", targetMet ? "text-green-500 border-green-500/30" : "text-amber-500 border-amber-500/30")}>
                                            {targetMet ? "Objective Met" : "In Progress"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-white tracking-tighter">{viewingDayHours.toFixed(1)}</span>
                                        <span className="text-sm font-bold text-muted-foreground uppercase">Hours</span>
                                    </div>
                                    <Progress value={(viewingDayHours / 10) * 100} className="h-1 bg-white/5" indicatorClassName={targetMet ? "bg-green-500" : "bg-primary"} />
                                </div>
                                <TaskTerminal dateKey={viewingDateKey} isCurrentDay={dayIsCurrent} />
                            </div>

                            {/* CENTER AREA: MAIN GOAL */}
                            <div className="lg:col-span-6 flex flex-col items-center justify-center text-center space-y-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-black uppercase text-muted-foreground tracking-widest">Scientific Goal</p>
                                    <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">{config.targetHours} HOURS</h2>
                                    <p className="text-primary font-bold">{hoursRemaining.toFixed(1)} Hours Remaining</p>
                                </div>
                            </div>

                            {/* RIGHT AREA: MISSION TIMELINE */}
                            <div className="lg:col-span-3 space-y-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2"><Calendar className="h-3 w-3"/> Mission Timeline</p>
                                </div>
                                
                                <Carousel opts={{ align: 'start' }} className="w-full">
                                    <CarouselContent className="-ml-2">
                                        {allDates.map((date, i) => {
                                            const isPastDate = isPast(date) && !isToday(date);
                                            const isCurrent = isToday(date);
                                            const isViewing = isSameDay(date, viewingDate);
                                            
                                            const dayKey = format(date, 'yyyy-MM-dd');
                                            const dayTasks = activeSession.dailyTasks?.[dayKey] || [];
                                            const dayTasksDone = dayTasks.length > 0 && dayTasks.every(t => t.completed);
                                            const dayTasksFailed = isPastDate && dayTasks.length > 0 && !dayTasksDone;

                                            return (
                                                <CarouselItem key={i} className="pl-2 basis-1/5">
                                                    <button 
                                                        onClick={() => setViewingDate(date)}
                                                        className={cn(
                                                            "w-full aspect-[2/3] rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
                                                            isViewing ? "border-primary bg-primary/10" : "border-white/5 bg-black/20",
                                                            isCurrent && "border-[#8b5cf6] bg-[#8b5cf6]/5 animate-pulse", // Purple for current
                                                            dayTasksDone && isPastDate && "bg-green-500/10 border-green-500/20", // Green for Success
                                                            dayTasksFailed && "bg-red-500/10 border-red-500/20" // Red for Fail
                                                        )}
                                                    >
                                                        <span className="text-[8px] font-black uppercase opacity-40">{format(date, 'EEE')}</span>
                                                        <span className={cn("text-lg font-black", dayTasksDone && isPastDate && "text-green-500", dayTasksFailed && "text-red-500", isCurrent && "text-[#a78bfa]")}>
                                                            {format(date, 'd')}
                                                        </span>
                                                        {dayTasksDone && isPastDate && <CheckCircle className="h-3 w-3 text-green-500"/>}
                                                        {dayTasksFailed && <X className="h-3 w-3 text-red-500"/>}
                                                    </button>
                                                </CarouselItem>
                                            );
                                        })}
                                    </CarouselContent>
                                    <div className="flex justify-center gap-4 mt-4">
                                        <CarouselPrevious className="static translate-y-0 h-8 w-8 bg-white/5 border-white/10" />
                                        <CarouselNext className="static translate-y-0 h-8 w-8 bg-white/5 border-white/10" />
                                    </div>
                                </Carousel>
                            </div>
                        </div>

                        <div className="p-8 md:p-12 text-center space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs font-black uppercase"><span>Global Progress</span><span>{percent.toFixed(1)}%</span></div>
                                <Progress value={percent} className="h-4 bg-white/5" indicatorClassName="animated-rainbow-progress" />
                            </div>

                            <div className="py-8 border-y border-white/5 grid grid-cols-2 gap-8">
                                <div className="space-y-1"><p className="text-[10px] font-black text-muted-foreground uppercase">Live Clock</p><p className="text-3xl font-black text-white font-mono tracking-tighter">{formatSecondsToTime(activeSession.accumulatedSeconds)}</p></div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase">Session Integrity</p>
                                    <AnimatePresence mode="wait">
                                        {timerActive ? (
                                            <motion.p key="secure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-green-500">100% SECURE</motion.p>
                                        ) : (
                                            <motion.button key="lost" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-xl font-black text-red-500 flex items-center gap-2 animate-pulse uppercase italic" onClick={() => { const el = document.getElementById('tracking-trigger'); el?.scrollIntoView({ behavior: 'smooth' }); }}>
                                                <WifiOff className="h-5 w-5" /> SIGNAL LOST
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="space-y-4 py-4">
                                {activeSession.currentVideoId ? (
                                    <div className="relative group">
                                        <div className="aspect-video w-full rounded-2xl overflow-hidden border-2 border-primary/20 shadow-2xl">
                                            <iframe src={`https://www.youtube.com/embed/${activeSession.currentVideoId}?autoplay=1&rel=0&modestbranding=1`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                                        </div>
                                        <Button variant="ghost" size="sm" className="absolute -top-3 -right-2 h-8 w-8 rounded-full bg-black/80 text-white border border-white/10 hover:bg-red-500" onClick={() => setSessionVideoId(null)}><X className="h-4 w-4" /></Button>
                                    </div>
                                ) : (
                                    <div className="p-8 border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02] flex flex-col items-center gap-4">
                                        <div className="p-4 rounded-full bg-red-500/10 text-red-500"><Youtube className="h-8 w-8" /></div>
                                        <div className="space-y-1"><h4 className="font-bold text-white">Tactical Video Uplink</h4><p className="text-xs text-muted-foreground">Watch lectures without leaving the monastery.</p></div>
                                        <div className="flex gap-2 w-full max-w-md">
                                            <Input value={ytInput} onChange={e => setYtInput(e.target.value)} placeholder="https://youtube.com/live/..." className="bg-black/40 border-white/10 rounded-xl" />
                                            <Button onClick={handleYtUplink} className="rounded-xl"><LinkIcon className="h-4 w-4"/></Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button id="tracking-trigger" size="lg" className={cn("flex-1 h-20 rounded-3xl text-2xl font-black uppercase shadow-2xl transition-all duration-500", timerActive ? "bg-amber-500 hover:bg-amber-600 text-black" : "bg-primary text-white shadow-primary/20 ring-4 ring-primary/20 animate-bounce")} onClick={() => { setTimerActive(!timerActive); lastTickRef.current = Date.now(); lastInteractionTime.current = Date.now(); }}>
                                    {timerActive ? <><Pause className="mr-3 h-8 w-8" /> PAUSE TIMER</> : <><Play className="mr-3 h-8 w-8" /> START TRACKING</>}
                                </Button>
                                {percent >= 100 && <Button size="lg" variant="secondary" className="flex-1 h-20 rounded-3xl text-2xl font-black uppercase bg-green-500 hover:bg-green-600 text-black" onClick={emergeVictory}>EMERGE VICTORIOUS</Button>}
                            </div>
                        </div>
                    </Card>

                    <Button variant="ghost" className="text-red-500/40 hover:text-red-500 hover:bg-red-500/10 font-black uppercase text-xs tracking-widest" onClick={() => { setIsExtractionOpen(true); setExtractionMode('selection'); }}>
                        <ShieldX className="mr-2 h-4 w-4" /> EMERGENCY EXTRACTION PROTOCOL
                    </Button>
                </div>

                <Dialog open={isRestDialogOpen} onOpenChange={setIsRestDialogOpen}>
                    <DialogContent className="max-w-md bg-slate-950 border-amber-500/50 rounded-[2rem] text-center">
                        <DialogHeader>
                            <div className="flex justify-center mb-4"><div className="p-4 bg-amber-500/10 rounded-full"><Timer className="h-12 w-12 text-amber-500 animate-pulse"/></div></div>
                            <DialogTitle className="text-2xl font-black uppercase text-amber-500">Take Some Rest?</DialogTitle>
                            <DialogDescription className="text-slate-300">You've been studying for 3 hours straight without interaction. Confirm your presence to continue the session.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter><Button className="w-full h-14 bg-amber-500 text-black font-black text-xl rounded-2xl" onClick={() => { setIsRestDialogOpen(false); setTimerActive(true); lastInteractionTime.current = Date.now(); lastTickRef.current = Date.now(); }}>I'M STILL HERE</Button></DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isExtractionOpen} onOpenChange={setIsExtractionOpen}>
                    <DialogContent className="max-w-lg bg-slate-950 border-red-600/50 rounded-[2rem]">
                        <DialogHeader><DialogTitle className="text-2xl font-black uppercase italic text-red-500 flex items-center gap-2"><AlertTriangle /> Protocol Breach Request</DialogTitle><DialogDescription>Select extraction method. Dishonor is inevitable.</DialogDescription></DialogHeader>
                        <div className="py-6">
                            <AnimatePresence mode="wait">
                                {extractionMode === 'selection' && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                                        <Button variant="outline" className="w-full h-16 justify-between rounded-2xl border-white/10" onClick={() => setExtractionMode('credits')}><div className="flex items-center gap-3"><Gem className="text-primary"/><span className="font-bold">Pay Credit Fine</span></div><span className="font-black">{config.exitCreditCost} CR</span></Button>
                                        <Button variant="outline" className="w-full h-16 justify-between rounded-2xl border-white/10" onClick={() => setExtractionMode('money')}><div className="flex items-center gap-3"><Wallet className="text-emerald-500"/><span className="font-bold">Protocol Forfeit Fee</span></div><span className="font-black">₹{config.exitMoneyCost}</span></Button>
                                    </motion.div>
                                )}
                                {extractionMode === 'credits' && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 text-center"><p className="text-slate-300 font-medium">Sacrifice <b>{config.exitCreditCost} Credits</b> to end session?</p><div className="flex gap-3"><Button variant="ghost" className="flex-1" onClick={() => setExtractionMode('selection')}>Back</Button><Button className="flex-1 bg-red-600 font-bold" onClick={() => handleEarlyExit('credits')} disabled={isProcessingExit}>{isProcessingExit ? <Loader2 className="animate-spin" /> : 'Confirm Sacrifice'}</Button></div></motion.div>
                                )}
                                {extractionMode === 'money' && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6"><p className="text-center text-slate-300 font-medium">Termination requires a <b>₹{config.exitMoneyCost}</b> transaction.</p><div className="grid grid-cols-2 gap-3"><Button variant="outline" className="rounded-xl" onClick={() => handleEarlyExit('wallet')}>Use Vault</Button><Button className="rounded-xl bg-emerald-600" onClick={() => handleEarlyExit('razorpay')}>Pay Now</Button></div><Button variant="ghost" className="w-full" onClick={() => setExtractionMode('selection')}>Back</Button></motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div><h1 className="text-4xl font-black tracking-tight italic uppercase flex items-center gap-3"><Lock className="text-red-500" /> ISOLATION TERMINAL</h1><p className="text-muted-foreground font-medium">Protocol: Voluntary Digital Exile for Absolute Mastery.</p></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{(Object.entries(ISOLATION_CONFIGS)).map(([id, config]) => (<button key={id} onClick={() => setSelectedDuration(id as IsolationDuration)} className={cn("p-6 rounded-[2rem] border-2 transition-all text-left space-y-4 group", selectedDuration === id ? "bg-primary/10 border-primary shadow-xl" : "bg-muted/30 border-white/5 hover:border-primary/30")}><div className="flex justify-between items-start"><div className="p-3 rounded-2xl bg-black/20 border border-white/5 group-hover:scale-110 transition-transform"><Clock className="h-6 w-6 text-primary" /></div>{id === '1y' && <Star className="h-5 w-5 text-yellow-400 fill-yellow-400 animate-pulse" />}</div><div><h3 className="text-2xl font-black tracking-tighter uppercase">{config.label}</h3><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{config.targetHours} Study Hours</p></div></button>))}</div>
                    {selectedDuration && (
                        <Card className="border-primary/30 bg-primary/5 animate-in slide-in-from-bottom-4 rounded-[2rem]"><CardHeader><CardTitle>Protocol: {ISOLATION_CONFIGS[selectedDuration].label}</CardTitle><CardDescription>Confirm your ingress method to begin the lockdown.</CardDescription></CardHeader><CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4"><Button size="lg" variant="outline" className="h-24 flex-col gap-2 rounded-2xl border-primary/20 hover:bg-primary/10" onClick={() => handleIngress('credits')} disabled={isStarting}><div className="flex items-center gap-2 font-black text-lg"><Gem className="text-primary" /> {ISOLATION_CONFIGS[selectedDuration].creditCost}</div><span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Sovereign Credits</span></Button><Button size="lg" className="h-24 flex-col gap-2 rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-xl shadow-primary/20" onClick={() => handleIngress('money')} disabled={isStarting}><div className="flex items-center gap-2 font-black text-lg">₹{ISOLATION_CONFIGS[selectedDuration].moneyCost}</div><span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Real-World Ingress</span></Button></CardContent></Card>
                    )}
                </div>
                <div className="space-y-6">
                    <Card className="border-red-500/30 bg-red-500/5 rounded-[2rem]"><CardHeader><CardTitle className="text-sm font-black uppercase text-red-500 tracking-widest flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> THE DEADLY RULES</CardTitle></CardHeader><CardContent className="space-y-4 text-xs leading-relaxed text-muted-foreground font-medium"><div className="flex items-start gap-3 p-3 bg-black/20 rounded-xl"><Smartphone className="h-4 w-4 text-primary shrink-0" /><p><b>Hard Lockdown</b>: Navigation disabled. No World Chat or Games.</p></div><div className="flex items-start gap-3 p-3 bg-black/20 rounded-xl"><Trophy className="h-4 w-4 text-primary shrink-0" /><p><b>Proof of Work</b>: Must meet 10h/day target or rewards forfeit.</p></div></CardContent></Card>
                    <Card className="bg-muted/30 border-dashed border-2 rounded-[2rem]"><CardHeader className="text-center pb-2"><CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Emergence Bounty</CardTitle></CardHeader><CardContent className="space-y-4">{selectedDuration ? (<div className="space-y-3"><div className="flex justify-between items-center bg-background p-3 rounded-xl border"><div className="flex items-center gap-2"><Gem className="h-4 w-4 text-primary"/><span className="text-xs font-bold uppercase">Credits</span></div><span className="font-black text-green-500">+{ISOLATION_CONFIGS[selectedDuration].rewardCredits}</span></div><div className="flex justify-between items-center bg-background p-3 rounded-xl border"><div className="flex items-center gap-2"><Wallet className="h-4 w-4 text-primary"/><span className="text-xs font-bold uppercase">Vault</span></div><span className="font-black text-green-500">+₹{ISOLATION_CONFIGS[selectedDuration].rewardWallet}</span></div><div className="flex flex-col items-center p-6 bg-primary/5 rounded-2xl border border-primary/20 group"><div className="scale-125 mb-4 group-hover:scale-150 transition-transform duration-500">{badgeDetails[ISOLATION_CONFIGS[selectedDuration].badge]?.badge}</div><p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Elite Identity Rank</p></div></div>) : (<div className="text-center py-10 opacity-30"><Trophy className="h-12 w-12 mx-auto mb-2" /><p className="text-[10px] font-black uppercase tracking-widest">Select Phase</p></div>)}</CardContent></Card>
                </div>
            </div>
        </div>
    );
}

function Smartphone({ className }: { className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>;
}
