
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlarmClock, AlertTriangle, Award, Zap, X, Pause, Play, Music, Volume2, VolumeX } from 'lucide-react';
import { useUser, SignedIn, SignedOut } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useBeforeunload } from 'react-beforeunload';
import { LoginWall } from '@/components/ui/login-wall';
import { AnimatePresence, motion } from 'framer-motion';
import { useVisibilityChange } from '@/hooks/use-visibility-change';
import { usePathname } from 'next/navigation';

interface FocusSlot {
    duration: number; // in seconds
    label: string;
    reward: number;
}

const focusSlots: FocusSlot[] = [
    { duration: 3600, label: '1 Hour', reward: 5 },
    { duration: 7200, label: '2 Hours', reward: 20 },
    { duration: 10800, label: '3 Hours', reward: 30 },
];

const PENALTY = 20;
export const FOCUS_PENALTY_SESSION_KEY = 'focusPenaltyApplied';
export const FOCUS_SESSION_ACTIVE_KEY = 'focusSessionActive';


const quotes = [
    "The secret of getting ahead is getting started.",
    "Jo kal kare so aaj kar, jo aaj kare so ab.",
    "Don't watch the clock; do what it does. Keep going.",
    "Padhai ek tapasya hai.",
    "The only way to do great work is to love what you do.",
    "Mehnat itni khamoshi se karo ki safalta shor macha de.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Mushkilein hamesha behtareen logo ke hisse me aati hai, kyunki wo use behtareen tarike se anjaam dene ki taqat rakhte hai.",
    "Believe you can and you're halfway there.",
    "Waqt tera hai, chahe to sona bana le, ya sone me guzaar de."
];

export default function FocusModePage() {
    const { user, isSignedIn } = useUser();
    const { currentUserData, addCreditsToUser, incrementFocusSessions } = useUsers();
    const { toast } = useToast();
    const pathname = usePathname();

    const [activeSlot, setActiveSlot] = useState<FocusSlot | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);
    const penaltyAppliedRef = useRef(false);

    const applyPenalty = useCallback(() => {
        if (!user || penaltyAppliedRef.current) return;
        
        penaltyAppliedRef.current = true; 
        addCreditsToUser(user.id, -PENALTY);
        
        const penaltyMessage = `You have been penalized ${PENALTY} credits for leaving an active focus session.`;

        if (typeof window !== 'undefined') {
            sessionStorage.setItem(FOCUS_PENALTY_SESSION_KEY, penaltyMessage);
            sessionStorage.removeItem(FOCUS_SESSION_ACTIVE_KEY);
        }

    }, [user, addCreditsToUser]);


    const handleStopSession = () => {
        applyPenalty();
        setIsSessionActive(false);
        setActiveSlot(null);
        setTimeLeft(0);
        if(audioRef.current) audioRef.current.pause();
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(FOCUS_SESSION_ACTIVE_KEY);
        }
        toast({
            variant: 'destructive',
            title: 'Session Stopped Early',
            description: `You have been penalized ${PENALTY} credits.`,
        });
    };

    // Unload penalty logic (for closing tab/browser)
    useBeforeunload(event => {
        if (isSessionActive && !isPaused) {
            applyPenalty();
            event.preventDefault();
        }
    });

    // More reliable penalty system for tab switching or backgrounding
    useVisibilityChange(() => {
        if (isSessionActive && !isPaused && document.visibilityState === 'hidden') {
            applyPenalty();
            // Since we can't guarantee a reload will work here, we just apply the penalty.
            // The toast will be shown if they navigate back to the app via the layout.
        }
    });
    
    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        
        if (isSessionActive && !isPaused && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (isSessionActive && !isPaused && timeLeft === 0) {
            if (user && activeSlot) {
                addCreditsToUser(user.id, activeSlot.reward);
                incrementFocusSessions(user.id);
                toast({
                    title: `Session Complete! +${activeSlot.reward} Credits!`,
                    description: 'Great job on your focused study session!',
                    className: "bg-green-500/10 text-green-700 border-green-500/50 dark:text-green-300"
                });
            }
            setIsSessionActive(false);
            setActiveSlot(null);
            if(audioRef.current) audioRef.current.pause();
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem(FOCUS_SESSION_ACTIVE_KEY);
            }
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isSessionActive, isPaused, timeLeft, user, activeSlot, addCreditsToUser, incrementFocusSessions, toast]);
    
     // Logic to handle navigation away from the page
    useEffect(() => {
        if (typeof window !== 'undefined' && isSessionActive && !isPaused) {
            const isActive = sessionStorage.getItem(FOCUS_SESSION_ACTIVE_KEY);
            if (isActive && pathname !== '/dashboard/tracker') {
                applyPenalty();
            }
        }
    }, [pathname, isSessionActive, isPaused, applyPenalty]);
    
    // Quote rotation logic
    useEffect(() => {
        if (isSessionActive && !isPaused) {
            const quoteInterval = setInterval(() => {
                setCurrentQuoteIndex(prev => (prev + 1) % quotes.length);
            }, 10000); // Change quote every 10 seconds
            return () => clearInterval(quoteInterval);
        }
    }, [isSessionActive, isPaused]);


    const handleSelectSlot = (slot: FocusSlot) => {
        if (currentUserData && currentUserData.credits < PENALTY) {
            toast({
                variant: 'destructive',
                title: 'Insufficient Credits for Penalty',
                description: `You must have at least ${PENALTY} credits to start a session in case of a penalty.`,
            });
            return;
        }
        setActiveSlot(slot);
        setTimeLeft(slot.duration);
        setIsSessionActive(true);
        setIsPaused(false);
        penaltyAppliedRef.current = false; // Reset penalty lock
        if (audioRef.current && !isMuted) {
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        }
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(FOCUS_SESSION_ACTIVE_KEY, 'true');
        }
    };

    const togglePause = () => {
        const newPausedState = !isPaused;
        setIsPaused(newPausedState);
        if(audioRef.current) {
            newPausedState ? audioRef.current.pause() : audioRef.current.play();
        }
        // Update session storage based on pause state
        if (typeof window !== 'undefined') {
            if (newPausedState) {
                sessionStorage.removeItem(FOCUS_SESSION_ACTIVE_KEY);
            } else {
                sessionStorage.setItem(FOCUS_SESSION_ACTIVE_KEY, 'true');
            }
        }
    }
    
    const toggleMute = () => {
        const shouldMute = !isMuted;
        setIsMuted(shouldMute);
        if(audioRef.current) {
            audioRef.current.muted = shouldMute;
        }
    }

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (activeSlot) {
        const progress = (timeLeft / activeSlot.duration) * 100;
        return (
             <div className="flex justify-center items-center h-full">
                 <audio ref={audioRef} src="/audio/ambient-music.mp3" loop muted={isMuted} />
                 <Card className="w-full max-w-lg text-center animate-in fade-in-50 bg-background/70 backdrop-blur-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl">Focusing: {activeSlot.label}</CardTitle>
                        <CardDescription>Keep this page open. Closing it or navigating away will result in a penalty.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-8">
                         <div className="relative h-64 w-64">
                            <svg className="h-full w-full" viewBox="0 0 100 100">
                              <circle className="text-muted" strokeWidth="7" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50"/>
                              <motion.circle
                                className="text-primary transition-all duration-1000 ease-linear"
                                strokeWidth="7"
                                strokeDasharray="283"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="45"
                                cx="50"
                                cy="50"
                                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                                initial={{ strokeDashoffset: 283 }}
                                animate={{ strokeDashoffset: 283 * (1 - progress / 100) }}
                                transition={{ duration: 1, ease: 'linear'}}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-bold font-mono tabular-nums tracking-tighter">
                                    {formatTime(timeLeft)}
                                </span>
                                 <motion.button onClick={togglePause} className="text-sm font-semibold text-primary mt-1 px-4 py-2 rounded-full hover:bg-primary/10">
                                    {isPaused ? 'Resume' : 'Pause'}
                                </motion.button>
                            </div>
                        </div>

                        <div className="min-h-[4rem] flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.p 
                                    key={currentQuoteIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-lg italic text-muted-foreground text-center"
                                >
                                    "{quotes[currentQuoteIndex]}"
                                </motion.p>
                            </AnimatePresence>
                        </div>
                        
                        <div className="w-full flex justify-between items-center">
                             <Button variant="destructive" onClick={handleStopSession}>
                                <X className="mr-2 h-4 w-4"/> Stop Session
                            </Button>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={togglePause}>
                                    {isPaused ? <Play /> : <Pause />}
                                </Button>
                                <Button variant="outline" size="icon" onClick={toggleMute}>
                                    {isMuted ? <VolumeX /> : <Volume2 />}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }


    return (
        <div className="space-y-8 relative">
             <SignedOut>
                <LoginWall 
                    title="Unlock Focus Mode"
                    description="Sign up for a free account to start rewarded study sessions, eliminate distractions, and boost your productivity."
                />
            </SignedOut>
            <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-primary"/>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Focus Mode</h1>
                    <p className="text-muted-foreground">Choose a focus slot to start a distraction-free study session.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Select a Focus Slot</CardTitle>
                    <CardDescription>Complete a session to earn credits. Leaving early will result in a penalty.</CardDescription>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-3 gap-6">
                    {focusSlots.map(slot => (
                        <button
                            key={slot.label}
                            className="p-6 border rounded-lg text-center hover:shadow-lg hover:-translate-y-1 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleSelectSlot(slot)}
                            disabled={!isSignedIn}
                        >
                            <AlarmClock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-2xl font-bold">{slot.label}</h3>
                            <div className="inline-flex items-center gap-1.5 mt-2 rounded-full bg-green-100 dark:bg-green-900/50 px-3 py-1 text-sm font-semibold text-green-700 dark:text-green-300">
                                <Award className="h-4 w-4"/> +{slot.reward} Credits
                            </div>
                        </button>
                    ))}
                </CardContent>
            </Card>

            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-destructive">Important: The Penalty Rule</h4>
                        <p className="text-sm text-destructive/80">
                            If you start a session and decide to stop it before the timer is complete, or if you navigate to another page or browser tab, you will be penalized <span className="font-bold">{PENALTY} credits.</span> This is to encourage disciplined study habits.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
