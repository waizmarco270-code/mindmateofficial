
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Brain, Clock, ArrowRight, ArrowLeft, 
    Zap, CheckCircle, AlertTriangle, 
    RotateCcw, Info, ShieldCheck, 
    X, Play, Pause, Save, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { useImmersive } from '@/hooks/use-immersive';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

type SprintStage = 'prep' | 'blurt' | 'verify';

const STAGE_CONFIG = {
    prep: { 
        title: 'Stage 1: Survey & Deep Read', 
        desc: '10 Minutes: Actively read your notes. Absorb every detail and construct a mental framework.', 
        duration: 600, // 10 mins
        color: 'text-blue-400',
        bg: 'bg-blue-500/10'
    },
    blurt: { 
        title: 'Stage 2: Forced Recall (BLURT)', 
        desc: '15 Minutes: Type EVERYTHING you remember. The Penalty Aegis is active. Do not look away!', 
        duration: 900, // 15 mins
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10'
    },
    verify: { 
        title: 'Stage 3: Gap Analysis', 
        desc: '5 Minutes: Compare your blurt with your sources. Patch the holes in your knowledge.', 
        duration: 300, // 5 mins
        color: 'text-amber-400',
        bg: 'bg-amber-500/10'
    }
};

const BLURTING_PENALTY = 20;
const BLURTING_REWARD = 10; 

export function BlurtingSprint() {
    const { user } = useUser();
    const { addCreditsToUser, applyFocusPenalty, currentUserData } = useUsers();
    const { toast } = useToast();
    const { setIsImmersive } = useImmersive();

    const [stage, setStage] = useState<SprintStage>('prep');
    const [timeLeft, setTimeLeft] = useState(STAGE_CONFIG.prep.duration);
    const [isActive, setIsActive] = useState(false);
    const [blurtText, setBlurtText] = useState('');
    const [isFinished, setIsFinished] = useState(false);
    const [penaltyResult, setPenaltyResult] = useState<{ type: 'shielded' | 'penalized', message: string } | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const penaltyAppliedRef = useRef(false);

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const handlePenalty = useCallback(async () => {
        if (!user || penaltyAppliedRef.current || !isActive || stage !== 'blurt') return;

        penaltyAppliedRef.current = true;
        const result = await applyFocusPenalty(user.id, BLURTING_PENALTY);
        
        const message = result === 'shielded' 
            ? "Your Penalty Shield saved you! One shield was consumed." 
            : `You have been penalized ${BLURTING_PENALTY} credits for leaving an active Blurt session.`;

        setPenaltyResult({ type: result, message });
        setIsActive(false);
        stopTimer();
    }, [user, applyFocusPenalty, isActive, stage]);

    useEffect(() => {
        const handleVisibility = () => {
            if (isActive && stage === 'blurt' && document.visibilityState === 'hidden') {
                handlePenalty();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [isActive, stage, handlePenalty]);

    useEffect(() => {
        if (!isActive) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    stopTimer();
                    handleNextStage();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return stopTimer;
    }, [isActive, stage]);

    const handleNextStage = () => {
        if (stage === 'prep') {
            setStage('blurt');
            setTimeLeft(STAGE_CONFIG.blurt.duration);
            setIsActive(true);
            toast({ title: "PROTOCOL ALPHA: BLURT!", description: "Recite everything from memory. 15 minutes on the clock." });
        } else if (stage === 'blurt') {
            setStage('verify');
            setTimeLeft(STAGE_CONFIG.verify.duration);
            setIsActive(true);
            toast({ title: "PROTOCOL BETA: VERIFY!", description: "Check your knowledge gaps." });
        } else {
            finishSprint();
        }
    };

    const finishSprint = async () => {
        setIsActive(false);
        setIsFinished(true);
        if (user) {
            await addCreditsToUser(user.id, BLURTING_REWARD);
            toast({ title: "Mission Accomplished!", description: `+${BLURTING_REWARD} credits awarded for your 30-minute focus.` });
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const config = STAGE_CONFIG[stage];
    const progress = (timeLeft / config.duration) * 100;

    if (isFinished) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4 bg-background">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <Card className="max-w-2xl w-full border-primary/20 shadow-2xl rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="text-center p-8 bg-primary/5">
                            <div className="mx-auto w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border-2 border-green-500/20">
                                <CheckCircle className="h-12 w-12 text-green-500 animate-bounce" />
                            </div>
                            <CardTitle className="text-4xl font-black italic uppercase text-primary">Sprint Completed</CardTitle>
                            <CardDescription className="text-lg font-medium">You have successfully mastered 30 minutes of high-intensity recall.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="p-6 rounded-3xl bg-muted/30 border-2 border-dashed border-primary/10">
                                <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-4">Secured Memory Dump</h4>
                                <ScrollArea className="h-60">
                                    <div className="text-sm leading-relaxed whitespace-pre-wrap italic opacity-80 pr-4">
                                        {blurtText || "No text recorded during this session."}
                                    </div>
                                </ScrollArea>
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 pt-0">
                            <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20" onClick={() => window.location.href = '/dashboard/schedule'}>
                                RETURN TO NEXUS
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground select-none">
            <header className="p-4 border-b bg-card/50 backdrop-blur-md flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                        <Brain className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="font-black uppercase text-sm tracking-tight">Blurting Sprint</h2>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Protocol: Scientific Recall</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsImmersive(false)} className="rounded-full font-bold hover:bg-destructive/10 hover:text-destructive">
                    <X className="h-4 w-4 mr-2" /> EXIT SESSION
                </Button>
            </header>

            <main className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full space-y-6 pb-24">
                <Card className={cn("border-none shadow-2xl transition-all duration-700 rounded-[2.5rem] overflow-hidden", config.bg)}>
                    <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]" />
                    <CardHeader className="text-center relative z-10 p-6 sm:p-8">
                        <div className="flex justify-center mb-4">
                            <div className={cn(
                                "flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-inner transition-colors duration-500",
                                isActive ? "bg-background/80 border-green-500/30 text-green-500" : "bg-background/80 border-red-500/30 text-red-500"
                            )}>
                                <div className={cn("h-2 w-2 rounded-full animate-pulse", isActive ? "bg-green-500" : "bg-red-500")} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isActive ? 'Uplink Active' : 'Protocol Paused'}</span>
                            </div>
                        </div>
                        <CardTitle className={cn("text-2xl md:text-4xl font-black italic uppercase tracking-tighter leading-none", config.color)}>
                            {config.title}
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base font-bold mt-2 max-w-xl mx-auto leading-relaxed opacity-80">
                            {config.desc}
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex flex-col items-center gap-6 py-0 pb-8 relative z-10">
                        <div className="relative h-48 w-48 flex items-center justify-center">
                            <svg className="absolute inset-0 h-full w-full drop-shadow-xl" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="46" fill="transparent" stroke="currentColor" strokeWidth="1.5" className="text-white/5" />
                                <motion.circle
                                    cx="50" cy="50" r="46"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeDasharray="289"
                                    animate={{ strokeDashoffset: 289 * (1 - progress / 100) }}
                                    className={cn("transition-all duration-1000", config.color)}
                                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                                />
                            </svg>
                            <div className="flex flex-col items-center">
                                <span className="text-4xl font-black tabular-nums tracking-tighter text-foreground drop-shadow-lg">
                                    {formatTime(timeLeft)}
                                </span>
                                <span className="text-[8px] font-black uppercase tracking-[0.3em] opacity-40">Timer</span>
                            </div>
                        </div>

                        <div className="flex gap-4 w-full max-w-xs">
                            <Button className="flex-1 h-14 rounded-2xl font-black text-base shadow-xl" onClick={() => setIsActive(!isActive)}>
                                {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                                {isActive ? 'PAUSE' : 'START'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="relative">
                    <AnimatePresence mode="wait">
                        {stage === 'blurt' ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center justify-between px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Recall Terminal Active</h3>
                                    </div>
                                    <div className="text-[8px] font-black text-muted-foreground uppercase flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full border border-white/5">
                                        <ShieldCheck className="h-3 w-3 text-emerald-500" /> Integrity Guarded
                                    </div>
                                </div>
                                <Textarea 
                                    value={blurtText}
                                    onChange={(e) => setBlurtText(e.target.value)}
                                    placeholder="EMPTY YOUR CONSCIOUSNESS HERE. Every fact, date, and concept. No cheating. Just your mind."
                                    className="min-h-[300px] text-lg font-medium leading-relaxed bg-emerald-500/5 border-2 border-emerald-500/20 rounded-[2rem] p-6 focus-visible:ring-emerald-500/30 shadow-inner select-text"
                                />
                            </motion.div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-16 text-center border-4 border-dashed rounded-[3rem] opacity-20 border-primary/20"
                            >
                                <ShieldCheck className="h-16 w-16 mx-auto mb-4" />
                                <p className="text-xl font-black uppercase tracking-[0.3em]">Terminal Offline</p>
                                <p className="text-xs mt-2 font-bold">{stage === 'prep' ? 'PROTOCOL: DEEP STUDY MODE' : 'PROTOCOL: VERIFICATION MODE'}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t flex justify-center gap-2 z-40">
                {(['prep', 'blurt', 'verify'] as const).map((s) => (
                    <div 
                        key={s} 
                        className={cn(
                            "h-1 flex-1 max-w-[80px] rounded-full transition-all duration-500",
                            stage === s ? "bg-primary w-10" : "bg-muted w-3"
                        )} 
                    />
                ))}
            </div>

            <Dialog open={!!penaltyResult} onOpenChange={() => setPenaltyResult(null)}>
                <DialogContent className="border-red-600/50 bg-red-950/95 backdrop-blur-2xl rounded-[2.5rem]">
                    <DialogHeader>
                        <div className="flex justify-center mb-6">
                            <div className="p-6 bg-red-600/20 rounded-full border-4 border-red-600 animate-pulse">
                                <AlertTriangle className="h-16 w-16 text-red-600" />
                            </div>
                        </div>
                        <DialogTitle className="text-center text-3xl font-black uppercase italic text-white tracking-tighter">PROTOCOL VIOLATED</DialogTitle>
                        <DialogDescription className="text-center text-lg font-bold text-red-200 mt-2">{penaltyResult?.message}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-4">
                        <Button className="w-full h-14 bg-white text-black font-black text-xl rounded-2xl hover:bg-slate-200" onClick={() => setPenaltyResult(null)}>I UNDERSTAND</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
