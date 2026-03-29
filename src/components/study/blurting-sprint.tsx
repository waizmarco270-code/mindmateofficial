
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

type SprintStage = 'prep' | 'blurt' | 'verify';

const STAGE_CONFIG = {
    prep: { 
        title: 'Stage 1: Survey & Read', 
        desc: 'Actively read your notes. Create a mental map of the key concepts.', 
        duration: 300, // 5 mins
        color: 'text-blue-400',
        bg: 'bg-blue-500/10'
    },
    blurt: { 
        title: 'Stage 2: The Blurt', 
        desc: 'FORCED RECALL. Type EVERYTHING you remember. Do not look at your notes!', 
        duration: 600, // 10 mins
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10'
    },
    verify: { 
        title: 'Stage 3: Verify & Patch', 
        desc: 'Compare your blurt with your notes. Highlight and patch your knowledge gaps.', 
        duration: 300, // 5 mins
        color: 'text-amber-400',
        bg: 'bg-amber-500/10'
    }
};

const BLURTING_PENALTY = 20;
const BLURTING_REWARD = 5;

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

    // Visibility Change Listener
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
            toast({ title: "Stage 2: BLURT!", description: "Recite everything from memory." });
        } else if (stage === 'blurt') {
            setStage('verify');
            setTimeLeft(STAGE_CONFIG.verify.duration);
            setIsActive(true);
            toast({ title: "Stage 3: VERIFY!", description: "Check your gaps." });
        } else {
            finishSprint();
        }
    };

    const finishSprint = async () => {
        setIsActive(false);
        setIsFinished(true);
        if (user) {
            await addCreditsToUser(user.id, BLURTING_REWARD);
            toast({ title: "Sprint Complete!", description: `+${BLURTING_REWARD} credits awarded.` });
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
                    <Card className="max-w-2xl w-full border-primary/20 shadow-2xl">
                        <CardHeader className="text-center">
                            <div className="mx-auto w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="h-10 w-10 text-green-500" />
                            </div>
                            <CardTitle className="text-3xl font-black italic uppercase">Sprint Accomplished</CardTitle>
                            <CardDescription>Your active recall session has been successfully logged.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 rounded-xl bg-muted/50 border">
                                <h4 className="text-xs font-black uppercase text-muted-foreground mb-2">Memory Dump</h4>
                                <div className="max-h-60 overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap italic">
                                    {blurtText || "No text recorded."}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full h-12 rounded-xl font-bold" onClick={() => window.location.href = '/dashboard/schedule'}>
                                Back to Nexus
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <header className="p-4 border-b bg-card/50 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Brain className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="font-black uppercase text-sm tracking-tight">Blurting Sprint</h2>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Protocol: Active Recall</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsImmersive(false)} className="rounded-full">
                    <X className="h-4 w-4 mr-2" /> Exit
                </Button>
            </header>

            <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-8">
                <Card className={cn("border-none shadow-2xl transition-colors duration-500", config.bg)}>
                    <CardHeader className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/50 border border-white/5 shadow-inner">
                                <div className={cn("h-2 w-2 rounded-full animate-pulse", isActive ? "bg-green-500" : "bg-red-500")} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{isActive ? 'Uplink Active' : 'Protocol Paused'}</span>
                            </div>
                        </div>
                        <CardTitle className={cn("text-2xl md:text-4xl font-black italic uppercase", config.color)}>
                            {config.title}
                        </CardTitle>
                        <CardDescription className="text-sm font-medium mt-2 max-w-lg mx-auto">
                            {config.desc}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6">
                        <div className="relative h-48 w-48 flex items-center justify-center">
                            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="2" className="text-white/5" />
                                <motion.circle
                                    cx="50" cy="50" r="45"
                                    fill="transparent"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    strokeDasharray="283"
                                    animate={{ strokeDashoffset: 283 * (1 - progress / 100) }}
                                    className={cn("transition-all duration-1000", config.color)}
                                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                                />
                            </svg>
                            <span className="text-5xl font-black tabular-nums tracking-tighter">
                                {formatTime(timeLeft)}
                            </span>
                        </div>

                        <div className="flex gap-4 w-full max-w-xs">
                            <Button className="flex-1 h-12 rounded-xl font-bold" onClick={() => setIsActive(!isActive)}>
                                {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                                {isActive ? 'Pause' : 'Resume'}
                            </Button>
                            <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={handleNextStage}>
                                Skip <ArrowRight className="ml-2 h-4 w-4" />
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
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">Recall Terminal</h3>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                                        <AlertTriangle className="h-3 w-3 text-amber-500" /> Tab monitoring active
                                    </div>
                                </div>
                                <Textarea 
                                    value={blurtText}
                                    onChange={(e) => setBlurtText(e.target.value)}
                                    placeholder="Empty your mind here... Every fact, date, and connection counts."
                                    className="min-h-[300px] text-lg bg-emerald-500/5 border-emerald-500/20 rounded-2xl focus-visible:ring-emerald-500/30"
                                />
                            </motion.div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-12 text-center border-2 border-dashed rounded-[2.5rem] opacity-40"
                            >
                                <ShieldCheck className="h-16 w-16 mx-auto mb-4" />
                                <p className="text-sm font-black uppercase tracking-[0.2em]">Terminal Offline</p>
                                <p className="text-xs mt-2 font-bold">{stage === 'prep' ? 'PROTOCOL: STUDY MODE' : 'PROTOCOL: VERIFICATION MODE'}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <Dialog open={!!penaltyResult} onOpenChange={() => setPenaltyResult(null)}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex justify-center mb-4">
                            <AlertTriangle className="h-12 w-12 text-destructive" />
                        </div>
                        <DialogTitle className="text-center">Protocol Violated</DialogTitle>
                        <DialogDescription className="text-center">{penaltyResult?.message}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button className="w-full" onClick={() => setPenaltyResult(null)}>Acknowledged</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
