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
    ChevronLeft, ChevronRight, Calendar, BarChart3, Timer,
    PanelLeftClose, PanelLeftOpen, LayoutDashboard, Sparkles,
    ShieldCheck, Crown, Flame, Smartphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useIsolation, ISOLATION_CONFIGS, type IsolationDuration, type ActiveIsolation } from '@/hooks/use-isolation';
import { useUsers, SUPER_ADMIN_UID } from '@/hooks/use-admin';
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
    dev: { name: 'Developer', badge: <span className="dev-badge"><Code className="h-3 w-3" /> DEV</span> },
    admin: { name: 'Admin', badge: <span className="admin-badge"><ShieldCheck className="h-3 w-3" /> ADMIN</span> },
    vip: { name: 'Elite Member', badge: <span className="elite-badge"><Crown className="h-3 w-3" /> ELITE</span> },
    gm: { name: 'Game Master', badge: <span className="gm-badge">GM</span> },
    challenger: { name: 'Challenger', badge: <span className="challenger-badge"><Swords className="h-3 w-3"/> Challenger</span> },
    'co-dev': { name: 'Co-Developer', badge: <span className="co-dev-badge"><Code className="h-3 w-3"/> Co-Dev</span> },
    'early-bird': { name: 'Early Bird', badge: <span className="early-bird-badge"><Bird className="h-3 w-3"/> EARLY BIRD</span> },
    'night-owl': { name: 'Night Owl', badge: <span className="night-owl-badge"><Moon className="h-3 w-3"/> NIGHT OWL</span> },
    'knowledge-knight': { name: 'Knowledge Knight', badge: <span className="knowledge-knight-badge"><ShieldCheck className="h-3 w-3"/> KNIGHT</span> },
    streaker: { name: 'Streaker', badge: <span className="streaker-badge"><Flame className="h-3 w-3"/> STREAKER</span> },
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
    const { activeSession, startIsolation, updateProgress, setSessionVideoId, emergeVictory, failIsolation, loading, payForEarlyExit, addIsolationTask, toggleIsolationTask } = useIsolation();
    const { currentUserData, addCreditsToUser } = useUsers();
    const { toast } = useToast();

    const [selectedDuration, setSelectedDuration] = useState<IsolationDuration | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [timerActive, setTimerActive] = useState(false);
    const [viewingDate, setViewingDate] = useState<Date>(new Date());
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    const [isRestDialogOpen, setIsRestDialogOpen] = useState(false);
    const lastInteractionTime = useRef<number>(Date.now());

    const [isExtractionOpen, setIsExtractionOpen] = useState(false);
    const [extractionMode, setExtractionMode] = useState<'selection' | 'credits' | 'money'>('selection');
    const [isProcessingExit, setIsProcessingExit] = useState(false);

    const [ytInput, setYtInput] = useState('');
    const lastTickRef = useRef<number>(Date.now());

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

    useEffect(() => {
        if (!timerActive || activeSession?.status !== 'active') return;

        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                const now = Date.now();
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

    const handleIngress = async (method: 'credits' | 'money' | 'free') => {
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
                await startIsolation(selectedDuration, method);
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
                    handler: async function (response: any) {
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

        const dayIsCurrent = isToday(viewingDate);

        return (
            <div className="min-h-screen bg-[#050505] p-4 sm:p-8 flex flex-col items-center overflow-y-auto">
                <TacticalCalculator />
                
                <div className="max-w-7xl w-full space-y-8 pb-20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="text-red-500 animate-pulse" />
                            <h1 className="text-2xl font-black uppercase tracking-tighter text-white">ISOLATION ACTIVE</h1>
                        </div>
                        <Badge className="bg-red-500 text-black font-black uppercase">Phase: {config.label}</Badge>
                    </div>

                    <Card className="bg-slate-900/50 border-primary/20 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
                        <motion.div layout className="grid grid-cols-1 lg:grid-cols-12 gap-0 border-b border-white/5 relative">
                            
                            <motion.div 
                                layout
                                initial={false}
                                animate={{ width: isSidebarOpen ? 'auto' : '64px' }}
                                className={cn(
                                    "lg:col-span-3 border-r border-white/5 p-6 space-y-8 bg-black/20 transition-all duration-500 overflow-hidden",
                                    !isSidebarOpen && "lg:col-span-1 items-center"
                                )}
                            >
                                <div className="flex items-center justify-between min-w-[200px]">
                                    <AnimatePresence mode="wait">
                                        {isSidebarOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                className="space-y-1"
                                            >
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2"><BarChart3 className="h-3 w-3"/> Tactical Intel</p>
                                                <h3 className="text-xl font-black text-white italic truncate">{format(viewingDate, 'MMM do, yyyy')}</h3>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 hover:bg-primary/20 text-primary"
                                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    >
                                        {isSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                                    </Button>
                                </div>

                                <AnimatePresence>
                                    {isSidebarOpen ? (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="space-y-6"
                                        >
                                            <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-4 shadow-inner">
                                                <div className="flex justify-between items-center">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Logged Time</p>
                                                    <Badge variant="outline" className={cn("text-[8px] font-black uppercase", targetMet ? "text-green-500 border-green-500/30" : "text-amber-500 border-amber-500/30")}>
                                                        {targetMet ? "Objective Met" : "In Progress"}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-5xl font-black text-white tracking-tighter">{viewingDayHours.toFixed(1)}</span>
                                                    <span className="text-sm font-bold text-muted-foreground uppercase">Hours</span>
                                                </div>
                                                <Progress value={(viewingDayHours / 10) * 100} className="h-1 bg-white/5" indicatorClassName={targetMet ? "bg-green-500" : "bg-primary"} />
                                            </div>
                                            <TaskTerminal dateKey={viewingDateKey} isCurrentDay={dayIsCurrent} />
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            initial={{ opacity: 0 }} 
                                            animate={{ opacity: 1 }} 
                                            className="flex flex-col items-center gap-8 pt-4"
                                        >
                                            <div className="flex flex-col items-center gap-1">
                                                <BarChart3 className="h-5 w-5 text-primary opacity-40" />
                                                <span className="text-[8px] font-black uppercase vertical-text tracking-widest text-muted-foreground">INTEL</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <LayoutDashboard className="h-5 w-5 text-primary opacity-40" />
                                                <span className="text-[8px] font-black uppercase vertical-text tracking-widest text-muted-foreground">TASKS</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            <motion.div 
                                layout
                                className={cn(
                                    "flex flex-col items-center justify-center text-center p-8 md:p-12 transition-all duration-500",
                                    isSidebarOpen ? "lg:col-span-6" : "lg:col-span-8"
                                )}
                            >
                                <div className="space-y-2 relative">
                                    <motion.div 
                                        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                        className="absolute inset-0 bg-primary/10 rounded-full blur-3xl -z-10"
                                    />
                                    <p className="text-sm font-black uppercase text-muted-foreground tracking-[0.3em]">Scientific Objective</p>
                                    <h2 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-none [text-shadow:0_0_30px_rgba(139,92,246,0.3)]">{config.targetHours} HOURS</h2>
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="h-px w-8 bg-primary/30" />
                                        <p className="text-primary font-black uppercase text-sm tracking-widest">{hoursRemaining.toFixed(1)} Hours to Emergence</p>
                                        <div className="h-px w-8 bg-primary/30" />
                                    </div>
                                </div>
                            </motion.div>

                            <div className="lg:col-span-3 p-6 space-y-6 border-l border-white/5 bg-black/10">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2"><Calendar className="h-3 w-3"/> Temporal Path</p>
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
                                                            isCurrent && "border-[#8b5cf6] bg-[#8b5cf6]/5 animate-pulse", 
                                                            dayTasksDone && isPastDate && "bg-green-500/10 border-green-500/20", 
                                                            dayTasksFailed && "bg-red-500/10 border-red-500/20" 
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
                        </motion.div>

                        <div className="p-8 md:p-12 text-center space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between text-xs font-black uppercase tracking-[0.2em]"><span>Convergence Progress</span><span>{percent.toFixed(1)}%</span></div>
                                <Progress value={percent} className="h-4 bg-white/5" indicatorClassName="animated-rainbow-progress" />
                            </div>

                            <div className="py-8 border-y border-white/5 grid grid-cols-2 gap-8 bg-white/[0.01]">
                                <div className="space-y-1"><p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Pulse</p><p className="text-4xl font-black text-white font-mono tracking-tighter tabular-nums">{formatSecondsToTime(activeSession.accumulatedSeconds)}</p></div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Signal Integrity</p>
                                    <AnimatePresence mode="wait">
                                        {timerActive ? (
                                            <motion.p key="secure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-black text-green-500 tracking-tight">SECURE</motion.p>
                                        ) : (
                                            <motion.button key="lost" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-xl font-black text-red-500 flex items-center justify-center gap-2 animate-pulse uppercase italic" onClick={() => { const el = document.getElementById('tracking-trigger'); el?.scrollIntoView({ behavior: 'smooth' }); }}>
                                                <WifiOff className="h-5 w-5" /> OFFLINE
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="space-y-4 py-4 max-w-4xl mx-auto w-full">
                                {activeSession.currentVideoId ? (
                                    <div className="relative group">
                                        <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden border-2 border-primary/20 shadow-2xl">
                                            <iframe src={`https://www.youtube.com/embed/${activeSession.currentVideoId}?autoplay=1&rel=0&modestbranding=1`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                                        </div>
                                        <Button variant="ghost" size="sm" className="absolute -top-3 -right-2 h-10 w-10 rounded-full bg-black/80 text-white border border-white/10 hover:bg-red-500 shadow-xl" onClick={() => setSessionVideoId(null)}><X className="h-5 w-5" /></Button>
                                    </div>
                                ) : (
                                    <div className="p-12 border-4 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02] flex flex-col items-center gap-6 group hover:border-primary/20 transition-colors">
                                        <div className="p-6 rounded-3xl bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform"><Youtube className="h-12 w-12" /></div>
                                        <div className="space-y-1"><h4 className="text-xl font-black text-white uppercase italic">Tactical Briefing Uplink</h4><p className="text-sm text-muted-foreground font-medium">Inject educational signals without breaching protocol.</p></div>
                                        <div className="flex gap-3 w-full max-w-lg">
                                            <Input value={ytInput} onChange={e => setYtInput(e.target.value)} placeholder="Enter Mission URL (YouTube)..." className="bg-black/40 border-white/10 rounded-2xl h-14 px-6 text-sm font-medium" />
                                            <Button onClick={handleYtUplink} className="h-14 w-14 rounded-2xl shadow-xl"><LinkIcon className="h-6 w-6"/></Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto w-full">
                                <Button id="tracking-trigger" size="lg" className={cn("flex-1 h-20 rounded-[2rem] text-2xl font-black uppercase shadow-2xl transition-all duration-500", timerActive ? "bg-amber-500 hover:bg-amber-600 text-black" : "bg-primary text-white shadow-primary/20 ring-4 ring-primary/20 animate-bounce")} onClick={() => { setTimerActive(!timerActive); lastTickRef.current = Date.now(); lastInteractionTime.current = Date.now(); }}>
                                    {timerActive ? <><Pause className="mr-3 h-8 w-8" /> PAUSE PULSE</> : <><Play className="mr-3 h-8 w-8" /> INITIALIZE PULSE</>}
                                </Button>
                                {percent >= 100 && <Button size="lg" variant="secondary" className="flex-1 h-20 rounded-[2rem] text-2xl font-black uppercase bg-green-500 hover:bg-green-600 text-black shadow-xl" onClick={emergeVictory}>EMERGE VICTORIOUS</Button>}
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-center pt-10">
                        <Button variant="ghost" className="text-red-500/40 hover:text-red-500 hover:bg-red-500/10 font-black uppercase text-[10px] tracking-[0.3em]" onClick={() => { setIsExtractionOpen(true); setExtractionMode('selection'); }}>
                            <ShieldX className="mr-2 h-4 w-4" /> EMERGENCY EXTRACTION PROTOCOL
                        </Button>
                    </div>
                </div>

                <Dialog open={isRestDialogOpen} onOpenChange={setIsRestDialogOpen}>
                    <DialogContent className="max-w-md bg-slate-950 border-amber-500/50 rounded-[2.5rem] text-center p-8">
                        <DialogHeader>
                            <div className="flex justify-center mb-6"><div className="p-6 bg-amber-500/10 rounded-full border-4 border-amber-500/20"><Timer className="h-16 w-16 text-amber-500 animate-pulse"/></div></div>
                            <DialogTitle className="text-3xl font-black uppercase italic text-amber-500">Temporal Alert</DialogTitle>
                            <DialogDescription className="text-slate-300 text-lg font-medium mt-2">Maximum focus threshold reached. Verify presence to maintain mission integrity.</DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="mt-8"><Button className="w-full h-16 bg-amber-500 hover:bg-amber-600 text-black font-black text-xl rounded-2xl shadow-xl" onClick={() => { setIsRestDialogOpen(false); setTimerActive(true); lastInteractionTime.current = Date.now(); lastTickRef.current = Date.now(); }}>UPLINK ACTIVE</Button></DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isExtractionOpen} onOpenChange={setIsExtractionOpen}>
                    <DialogContent className="max-w-lg bg-slate-950 border-red-600/50 rounded-[3rem] p-10">
                        <DialogHeader><DialogTitle className="text-3xl font-black uppercase italic text-red-500 flex items-center gap-3"><AlertTriangle className="h-8 w-8" /> Termination Request</DialogTitle><DialogDescription className="text-lg font-bold text-red-200/60 mt-2">Select your extraction method. Every failure has a cost.</DialogDescription></DialogHeader>
                        <div className="py-8">
                            <AnimatePresence mode="wait">
                                {extractionMode === 'selection' && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                                        <Button variant="outline" className="w-full h-20 justify-between rounded-2xl border-white/10 bg-white/5 hover:bg-red-500/10 px-6 group" onClick={() => setExtractionMode('credits')}><div className="flex items-center gap-4"><Gem className="text-primary group-hover:scale-110 transition-transform"/><span className="font-black text-lg">Sacrifice Credits</span></div><span className="font-black text-xl">{config.exitCreditCost} CR</span></Button>
                                        <Button variant="outline" className="w-full h-20 justify-between rounded-2xl border-white/10 bg-white/5 hover:bg-emerald-500/10 px-6 group" onClick={() => setExtractionMode('money')}><div className="flex items-center gap-4"><Wallet className="text-emerald-500 group-hover:scale-110 transition-transform"/><span className="font-black text-lg">Financial Forfeit</span></div><span className="font-black text-xl">₹{config.exitMoneyCost}</span></Button>
                                    </motion.div>
                                )}
                                {extractionMode === 'credits' && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 text-center"><p className="text-slate-300 text-xl font-bold">Burn <span className="text-red-500">{config.exitCreditCost} Credits</span> to terminate exile?</p><div className="flex gap-4"><Button variant="ghost" className="flex-1 h-14 rounded-xl font-black uppercase" onClick={() => setExtractionMode('selection')}>Abort</Button><Button className="flex-1 bg-red-600 hover:bg-red-700 h-14 rounded-xl font-black uppercase text-lg shadow-xl shadow-red-600/20" onClick={() => handleEarlyExit('credits')} disabled={isProcessingExit}>{isProcessingExit ? <Loader2 className="animate-spin" /> : 'Confirm Sacrifice'}</Button></div></motion.div>
                                )}
                                {extractionMode === 'money' && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 text-center"><p className="text-xl font-bold text-slate-300">Authorization required for <span className="text-emerald-500">₹{config.exitMoneyCost}</span> forfeit.</p><div className="grid grid-cols-2 gap-4"><Button variant="outline" className="h-16 rounded-2xl font-black uppercase bg-white/5 border-white/10" onClick={() => handleEarlyExit('wallet')}>MM Vault</Button><Button className="h-16 rounded-2xl font-black uppercase bg-emerald-600 hover:bg-emerald-700 text-lg shadow-xl" onClick={() => handleEarlyExit('razorpay')}>Pay Now</Button></div><Button variant="ghost" className="w-full font-bold uppercase mt-4" onClick={() => setExtractionMode('selection')}>Back to Selection</Button></motion.div>
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
                        <Card className="border-primary/30 bg-primary/5 animate-in slide-in-from-bottom-4 rounded-[2rem]">
                            <CardHeader>
                                <CardTitle>Protocol: {ISOLATION_CONFIGS[selectedDuration].label}</CardTitle>
                                <CardDescription>Confirm your ingress method to begin the lockdown.</CardDescription>
                            </CardHeader>
                            <CardContent className={cn("grid gap-4", currentUserData?.hasFreeIsolation !== false ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2")}>
                                {currentUserData?.hasFreeIsolation !== false && (
                                    <Button size="lg" variant="outline" className="h-24 flex-col gap-2 rounded-2xl border-emerald-500/50 bg-emerald-500/10 hover:bg-emerald-500/20 shadow-xl shadow-emerald-500/10" onClick={() => handleIngress('free')} disabled={isStarting}>
                                        <div className="flex items-center gap-2 font-black text-lg text-emerald-500"><Sparkles className="h-5 w-5"/> FREE CHANCE</div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">One-Time Gift</span>
                                    </Button>
                                )}
                                <Button size="lg" variant="outline" className="h-24 flex-col gap-2 rounded-2xl border-primary/20 hover:bg-primary/10" onClick={() => handleIngress('credits')} disabled={isStarting}>
                                    <div className="flex items-center gap-2 font-black text-lg"><Gem className="text-primary" /> {ISOLATION_CONFIGS[selectedDuration].creditCost}</div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Sovereign Credits</span>
                                </Button>
                                <Button size="lg" className="h-24 flex-col gap-2 rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-xl shadow-primary/20" onClick={() => handleIngress('money')} disabled={isStarting}>
                                    <div className="flex items-center gap-2 font-black text-lg">₹{ISOLATION_CONFIGS[selectedDuration].moneyCost}</div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Real-World Ingress</span>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
                <div className="space-y-6">
                    <Card className="border-red-500/30 bg-red-500/5 rounded-[2rem]">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase text-red-500 tracking-widest flex items-center gap-2">
                                <ShieldAlert className="h-4 w-4" /> THE DEADLY RULES
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-xs leading-relaxed text-muted-foreground font-medium">
                            <div className="flex items-start gap-3 p-3 bg-black/20 rounded-xl">
                                <Smartphone className="h-4 w-4 text-primary shrink-0" />
                                <p><b>Hard Lockdown</b>: Navigation disabled. No World Chat or Games.</p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-black/20 rounded-xl">
                                <Trophy className="h-4 w-4 text-primary shrink-0" />
                                <p><b>Proof of Work</b>: Must meet 10h/day target or rewards forfeit.</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-muted/30 border-dashed border-2 rounded-[2rem]"><CardHeader className="text-center pb-2"><CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Emergence Bounty</CardTitle></CardHeader><CardContent className="space-y-4">{selectedDuration ? (<div className="space-y-3"><div className="flex justify-between items-center bg-background p-3 rounded-xl border"><div className="flex items-center gap-2"><Gem className="h-4 w-4 text-primary"/><span className="text-xs font-bold uppercase">Credits</span></div><span className="font-black text-green-500">+{ISOLATION_CONFIGS[selectedDuration].rewardCredits}</span></div><div className="flex justify-between items-center bg-background p-3 rounded-xl border"><div className="flex items-center gap-2"><Wallet className="h-4 w-4 text-primary"/><span className="text-xs font-bold uppercase">Vault</span></div><span className="font-black text-green-500">+₹{ISOLATION_CONFIGS[selectedDuration].rewardWallet}</span></div><div className="flex flex-col items-center p-6 bg-primary/5 rounded-2xl border border-primary/20 group"><div className="scale-125 mb-4 group-hover:scale-150 transition-transform duration-500">{badgeDetails[ISOLATION_CONFIGS[selectedDuration].badge]?.badge}</div><p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-60">Elite Identity Rank</p></div></div>) : (<div className="text-center py-10 opacity-30"><Trophy className="h-12 w-12 mx-auto mb-2" /><p className="text-[10px] font-black uppercase tracking-widest">Select Phase</p></div>)}</CardContent></Card>
                </div>
            </div>
        </div>
    );
}