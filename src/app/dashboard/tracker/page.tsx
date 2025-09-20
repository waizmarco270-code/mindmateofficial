
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlarmClock, AlertTriangle, Award, Zap, X, Pause, Play, Music, Volume2, VolumeX, Shield, Swords, BrainCircuit, Star } from 'lucide-react';
import { useUser, SignedIn, SignedOut } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useBeforeunload } from 'react-beforeunload';
import { LoginWall } from '@/components/ui/login-wall';
import { AnimatePresence, motion } from 'framer-motion';
import { useVisibilityChange } from '@/hooks/use-visibility-change';
import { usePathname } from 'next/navigation';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay";


interface FocusSlot {
    duration: number; // in seconds
    label: string;
    reward: number;
    icon: React.ElementType;
    color: string;
    shadow: string;
    shortLabel: string;
}

const focusSlots: FocusSlot[] = [
    { duration: 3600, label: '1 Hour', reward: 5, icon: BrainCircuit, color: 'from-blue-500 to-sky-500', shadow: 'shadow-blue-500/30', shortLabel: '1 HR' },
    { duration: 7200, label: '2 Hours', reward: 20, icon: Swords, color: 'from-green-500 to-emerald-500', shadow: 'shadow-green-500/30', shortLabel: '2 HR' },
    { duration: 10800, label: '3 Hours', reward: 30, icon: Shield, color: 'from-purple-500 to-indigo-500', shadow: 'shadow-purple-500/30', shortLabel: '3 HR' },
    { duration: 18000, label: '5 Hours', reward: 40, icon: Star, color: 'from-yellow-500 to-amber-500', shadow: 'shadow-yellow-500/30', shortLabel: '5 HR' },
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

const musicTracks = [
    { id: 'none', name: 'No Music', src: '' },
    { id: 'irreplaceable', name: 'The Irreplaceable', src: '/audio/irreplaceable.mp3' },
    { id: 'hans-zimmer', name: 'Hans Zimmer Mix', src: '/audio/hans-zimmer.mp3' },
    { id: 'interstellar', name: 'Interstellar', src: '/audio/interstellar.mp3' },
    { id: 'max-focus', name: 'Max Focus', src: '/audio/max-focus.mp3' },
    { id: 'soothing', name: 'Soothing Piano', src: '/audio/soothing.mp3' },
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
    const [selectedMusic, setSelectedMusic] = useState(musicTracks[0]);

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
            // This is a synchronous action, we can't prevent default but can apply penalty before unload.
        }
    });

    // More reliable penalty system for tab switching or backgrounding
    useVisibilityChange(() => {
        if (isSessionActive && !isPaused && document.visibilityState === 'hidden') {
            applyPenalty();
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
    
    useEffect(() => {
        const audioEl = audioRef.current;
        if (!audioEl) return;

        if (isSessionActive && selectedMusic?.src) {
            audioEl.play().catch(e => console.error("Audio play failed:", e));
        } else {
            audioEl.pause();
        }
    }, [isSessionActive, selectedMusic]);

    useEffect(() => {
        const audioEl = audioRef.current;
        if(audioEl) audioEl.muted = isMuted;
    }, [isMuted]);

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
    
    const CIRCLE_RADIUS = 130;
    const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;


    if (activeSlot) {
        const progress = (timeLeft / activeSlot.duration) * 100;
        return (
             <div className="flex justify-center items-center h-full">
                 <audio ref={audioRef} src={selectedMusic.src} loop muted={isMuted} />
                 <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="w-full max-w-lg text-center bg-background/50 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/10"
                >
                    <CardHeader className="p-0">
                        <CardTitle className="text-3xl">Focusing: {activeSlot.label}</CardTitle>
                        <CardDescription>Keep this page open. Closing it or navigating away will result in a penalty.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-8 py-8 px-0">
                        <div className="relative h-72 w-72">
                             <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 300">
                                <defs>
                                    <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#8B5CF6" />
                                        <stop offset="100%" stopColor="#22C55E" />
                                    </linearGradient>
                                </defs>
                                <circle cx="150" cy="150" r={CIRCLE_RADIUS} fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                                <motion.circle
                                    cx="150" cy="150" r={CIRCLE_RADIUS}
                                    fill="transparent"
                                    stroke="url(#rainbow)"
                                    strokeWidth="12"
                                    strokeLinecap="round"
                                    strokeDasharray={CIRCLE_CIRCUMFERENCE}
                                    initial={{ strokeDashoffset: 0 }}
                                    animate={{ strokeDashoffset: CIRCLE_CIRCUMFERENCE * (1 - progress / 100) }}
                                    transition={{ duration: 1, ease: 'linear' }}
                                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="font-mono text-6xl font-bold tabular-nums tracking-tighter [text-shadow:0_2px_8px_rgba(0,0,0,0.7)]">
                                    {formatTime(timeLeft)}
                                </span>
                                 <motion.button onClick={togglePause} className="text-sm font-semibold text-white/80 mt-1 px-4 py-2 rounded-full hover:bg-white/10">
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
                                    className="text-lg italic text-white/80 text-center"
                                >
                                    "{quotes[currentQuoteIndex]}"
                                </motion.p>
                            </AnimatePresence>
                        </div>
                        
                        <div className="w-full flex justify-between items-center">
                             <Button variant="destructive" onClick={handleStopSession}>
                                <X className="mr-2 h-4 w-4"/> Stop
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
                </motion.div>
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

            <Card className="bg-transparent border-0 shadow-none overflow-hidden">
                <CardHeader>
                    <CardTitle>Select a Focus Slot</CardTitle>
                    <CardDescription>Complete a session to earn credits. Leaving early will result in a penalty.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Carousel
                        opts={{
                            align: "start",
                            loop: true,
                        }}
                         plugins={[
                            Autoplay({
                              delay: 4000,
                              stopOnInteraction: true,
                              stopOnMouseEnter: true,
                            }),
                        ]}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4 py-4">
                           {focusSlots.map((slot, index) => (
                            <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                <div className="p-1">
                                <button
                                    className={cn(
                                        "group relative w-full h-full p-6 border-2 rounded-2xl text-left overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed",
                                        "bg-gradient-to-br",
                                        slot.color,
                                        "text-primary-foreground border-transparent"
                                    )}
                                    onClick={() => handleSelectSlot(slot)}
                                    disabled={!isSignedIn}
                                >
                                <div className="relative z-10 flex flex-col justify-between h-56">
                                     <div className="flex justify-between items-start">
                                        <div className="p-3 mb-4 rounded-lg bg-white/10 w-fit">
                                            <slot.icon className="h-8 w-8 text-white animate-pulse" style={{animationDuration: `${2 + index}s`}}/>
                                        </div>
                                        {/* 3D Clock */}
                                        <div className="relative w-24 h-24">
                                            <div className="absolute inset-0 rounded-full bg-black/10 shadow-inner"></div>
                                            <div className="absolute inset-2 rounded-full bg-black/20 shadow-md flex items-center justify-center">
                                                <span className="text-white font-bold text-3xl [text-shadow:0_0_8px_currentColor]">{slot.shortLabel}</span>
                                            </div>
                                             <div className="absolute top-1 left-1/2 -translate-x-1/2 h-2 w-1 bg-white/30 rounded-full"></div>
                                             <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-2 w-1 bg-white/30 rounded-full"></div>
                                             <div className="absolute left-1 top-1/2 -translate-y-1/2 h-1 w-2 bg-white/30 rounded-full"></div>
                                             <div className="absolute right-1 top-1/2 -translate-y-1/2 h-1 w-2 bg-white/30 rounded-full"></div>
                                        </div>
                                     </div>
                                     <div>
                                        <h3 className="text-4xl font-bold">{slot.label}</h3>
                                        <div className="inline-flex items-center gap-1.5 mt-2 rounded-full px-3 py-1 text-sm font-semibold bg-green-400/80 text-green-900 [text-shadow:0_0_8px_currentColor] shadow-md">
                                            <Award className="h-4 w-4"/> +{slot.reward} Credits
                                        </div>
                                     </div>
                                </div>
                                </button>
                                </div>
                            </CarouselItem>
                        ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                    </Carousel>
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
