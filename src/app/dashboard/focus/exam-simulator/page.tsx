
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trophy, Clock, AlertTriangle, ShieldAlert, 
    X, Play, ShieldCheck, ChevronRight,
    Loader2, Zap, Info, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useUser } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { useImmersive } from '@/hooks/use-immersive';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
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

const EXAM_DURATION = 10800; // 3 Hours in seconds
const REVISION_TIME = 900; // 15 Minutes remaining
const SIMULATOR_PENALTY = 200;
const SIMULATOR_REWARD = 100;

export default function ApexExamSimulator() {
    const { user } = useUser();
    const { addCreditsToUser, applyFocusPenalty, currentUserData } = useUsers();
    const { toast } = useToast();
    const { setIsImmersive } = useImmersive();

    const [isStarted, setIsStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
    const [isActive, setIsActive] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [penaltyResult, setPenaltyResult] = useState<{ type: 'shielded' | 'penalized', message: string } | null>(null);
    const [isRulesAccepted, setIsRulesAccepted] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const penaltyAppliedRef = useRef(false);

    // Initial setup
    useEffect(() => {
        setIsImmersive(true);
        return () => setIsImmersive(false);
    }, [setIsImmersive]);

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const handlePenalty = useCallback(async () => {
        if (!user || penaltyAppliedRef.current || !isActive) return;

        penaltyAppliedRef.current = true;
        
        const result = await applyFocusPenalty(user.id, SIMULATOR_PENALTY);
        
        const message = result === 'shielded' 
            ? "Your Penalty Shield saved you! One shield was consumed." 
            : `PROTOCOL VIOLATED: You have been penalized ${SIMULATOR_PENALTY} credits for leaving the exam hall.`;

        setPenaltyResult({ type: result, message });
        setIsActive(false);
        stopTimer();
    }, [user, applyFocusPenalty, isActive]);

    useEffect(() => {
        const handleVisibility = () => {
            if (isActive && document.visibilityState === 'hidden') {
                handlePenalty();
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [isActive, handlePenalty]);

    useEffect(() => {
        if (!isActive) return;

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    stopTimer();
                    finishExam();
                    return 0;
                }
                
                // Revision alert at 15 mins remaining
                if (prev === REVISION_TIME) {
                    toast({
                        title: "🕒 REVISION PROTOCOL",
                        description: "15 Minutes Remaining. Finalize your answers now.",
                        className: "bg-blue-500 text-white font-bold"
                    });
                }

                return prev - 1;
            });
        }, 1000);

        return stopTimer;
    }, [isActive]);

    const startExam = () => {
        setIsStarted(true);
        setIsActive(true);
        penaltyAppliedRef.current = false;
        toast({ title: "EXAM COMMENCED", description: "The 3-hour clock is running. Silence is mandatory." });
    };

    const finishExam = async () => {
        setIsActive(false);
        setIsFinished(true);
        if (user) {
            await addCreditsToUser(user.id, SIMULATOR_REWARD);
            toast({ 
                title: "LEGENDARY PERFORMANCE", 
                description: `You conquered the 3-hour simulator! +${SIMULATOR_REWARD} credits awarded.`,
                className: "bg-green-500 text-white"
            });
        }
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const progress = (timeLeft / EXAM_DURATION) * 100;
    const isRevisionTime = timeLeft <= REVISION_TIME;

    if (isFinished) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4 bg-[#0a0a0a]">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-2xl text-center space-y-8">
                    <div className="mx-auto w-32 h-32 bg-green-500/10 rounded-full flex items-center justify-center border-4 border-green-500/30">
                        <ShieldCheck className="h-16 w-16 text-green-500" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black italic uppercase text-white tracking-tighter">MISSION ACCOMPLISHED</h1>
                        <p className="text-xl text-muted-foreground font-medium uppercase tracking-[0.2em]">Exams Stamina Verified</p>
                    </div>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-xl p-8 rounded-3xl">
                        <div className="text-6xl font-black text-primary mb-2">+100</div>
                        <p className="text-muted-foreground font-bold uppercase tracking-widest">Sovereign Credits Awarded</p>
                    </Card>
                    <Button size="lg" className="h-16 px-12 rounded-2xl font-black text-lg shadow-2xl" onClick={() => window.location.href = '/dashboard/focus'}>
                        EXIT TERMINAL
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (!isStarted) {
        return (
            <div className="flex items-center justify-center min-h-screen p-4 bg-[#0a0a0a]">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-2xl">
                    <Card className="border-purple-500/30 bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.15)]">
                        <CardHeader className="text-center p-8 sm:p-12">
                            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mb-6 border-2 border-primary/20">
                                <Trophy className="h-10 w-10 text-primary" />
                            </div>
                            <CardTitle className="text-4xl font-black italic uppercase tracking-tighter text-white">APEX EXAM SIMULATOR</CardTitle>
                            <CardDescription className="text-lg font-medium text-slate-400 mt-2">Protocol: High-Stakes Focus Maintenance</CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 sm:px-12 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Duration</p>
                                    <p className="text-2xl font-black text-white">3 HOURS</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/20 text-center">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Reward</p>
                                    <p className="text-2xl font-black text-green-500">+100 CR</p>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
                                <h4 className="flex items-center gap-2 text-red-500 font-black uppercase text-xs tracking-widest mb-3">
                                    <ShieldAlert className="h-4 w-4" /> DEADLY DISCIPLINE RULES
                                </h4>
                                <ul className="space-y-3 text-xs font-medium text-slate-300">
                                    <li className="flex items-start gap-2">
                                        <div className="h-1 w-1 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                        <span>Navigating away or switching tabs will trigger an immediate <b className="text-red-500">-200 Credit Penalty</b>.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="h-1 w-1 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                        <span>No pause functionality. This is a continuous 180-minute mission.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="h-1 w-1 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                        <span>If your balance is low, credits will go into negative. Choose wisely.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                                <LocalCheckbox 
                                    id="rules" 
                                    checked={isRulesAccepted} 
                                    onCheckedChange={(checked) => setIsRulesAccepted(!!checked)}
                                    className="border-white/20 data-[state=checked]:bg-primary"
                                />
                                <label htmlFor="rules" className="text-xs font-bold text-slate-400 cursor-pointer">
                                    I acknowledge the risks and am prepared for the 3-hour trial.
                                </label>
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 sm:p-12 pt-0">
                            <Button 
                                className="w-full h-16 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 group" 
                                disabled={!isRulesAccepted}
                                onClick={startExam}
                            >
                                INITIALIZE PROTOCOL <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 sm:p-8 w-full">
            <div className="fixed top-8 left-8 flex items-center gap-3 opacity-40">
                <Trophy className="h-6 w-6 text-primary" />
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none">Apex Simulator</p>
                    <p className="text-xs font-bold">STAMINA TEST</p>
                </div>
            </div>

            <div className="fixed top-8 right-8 text-right opacity-40">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none text-red-500">Hazard Level</p>
                <p className="text-xs font-bold">MAXIMUM</p>
            </div>

            <div className="relative w-full max-w-4xl flex flex-col items-center space-y-12">
                {isRevisionTime && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-blue-500/10 border-2 border-blue-500/30 text-blue-400 font-black uppercase text-sm tracking-[0.2em] flex items-center gap-3 animate-pulse"
                    >
                        <Clock className="h-5 w-5" /> REVISION PROTOCOL ACTIVE
                    </motion.div>
                )}

                <div className="relative">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                        className="absolute -inset-16 border-2 border-dashed border-white/5 rounded-full pointer-events-none"
                    />
                    <div className="relative flex flex-col items-center">
                        <span className={cn(
                            "text-[8rem] md:text-[12rem] font-black tracking-tighter leading-none tabular-nums select-none",
                            isRevisionTime ? "text-blue-500" : "text-white"
                        )}>
                            {formatTime(timeLeft)}
                        </span>
                        <div className="flex gap-12 mt-4 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground opacity-50">
                            <span>Hours</span>
                            <span>Mins</span>
                            <span>Secs</span>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-md space-y-4">
                    <div className="flex justify-between items-end px-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Session Fidelity</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">100% SECURE</p>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-white/5" indicatorClassName={cn("transition-all duration-1000", isRevisionTime ? "bg-blue-500" : "bg-primary")} />
                </div>

                <div className="p-8 rounded-[2rem] border-2 border-dashed border-white/5 bg-white/[0.02] text-center max-w-lg">
                    <p className="text-slate-500 font-medium italic text-lg leading-relaxed">
                        {isRevisionTime 
                            ? '"The final stretch. Review your work with the precision of a master."' 
                            : '"True intelligence is the product of sustained focus. Do not break the silence."'}
                    </p>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="text-red-500/40 hover:text-red-500 hover:bg-red-500/10 font-bold uppercase tracking-widest text-[10px]">
                            <X className="h-3 w-3 mr-2" /> ABANDON MISSION (-200 CR)
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-red-600 bg-red-950/95 text-white">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl font-black uppercase italic">ARE YOU SURE?</AlertDialogTitle>
                            <AlertDialogDescription className="text-red-200">
                                Abandoning this session will execute the <b>-200 Credit Penalty</b> immediately.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white text-black font-bold">CONTINUE EXAM</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 font-black uppercase" onClick={handlePenalty}>ABANDON SESSION</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {/* Penalty UI Overlay */}
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
                        <Button className="w-full h-14 bg-white text-black font-black text-xl rounded-2xl hover:bg-slate-200" onClick={() => window.location.href = '/dashboard/focus'}>I UNDERSTAND</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function LocalCheckbox({ id, checked, onCheckedChange, className }: { id: string, checked: boolean, onCheckedChange: (checked: boolean) => void, className?: string }) {
    return (
        <button 
            id={id}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                "h-5 w-5 rounded border-2 flex items-center justify-center transition-all",
                checked ? "bg-primary border-primary" : "border-white/20 hover:border-white/40",
                className
            )}
        >
            {checked && <LocalCheck className="h-3.5 w-3.5 text-white" strokeWidth={4} />}
        </button>
    );
}

function LocalCheck({ className, strokeWidth }: { className?: string, strokeWidth?: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth || 2} strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M20 6 9 17l-5-5"/>
        </svg>
    );
}
