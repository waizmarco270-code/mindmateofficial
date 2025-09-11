
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlarmClock, AlertTriangle, Award, Zap, X, Play, Pause, RotateCcw } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useBeforeunload } from 'react-beforeunload';

interface FocusSlot {
    duration: number; // in seconds
    label: string;
    reward: number;
}

const focusSlots: FocusSlot[] = [
    { duration: 3600, label: '1 Hour', reward: 2 },
    { duration: 7200, label: '2 Hours', reward: 5 },
    { duration: 10800, label: '3 Hours', reward: 10 },
];

const PENALTY = 10;
export const FOCUS_PENALTY_SESSION_KEY = 'focusPenaltyApplied';

export default function FocusModePage() {
    const { user } = useUser();
    const { currentUserData, addCreditsToUser, incrementFocusSessions } = useUsers();
    const { toast } = useToast();

    const [activeSlot, setActiveSlot] = useState<FocusSlot | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isActive, setIsActive] = useState(false);
    
    const penaltyApplicator = useRef<() => void>();

    useBeforeunload(event => {
        if (isActive && activeSlot) {
            event.preventDefault();
        }
    });

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (isActive && timeLeft === 0) {
            if (user && activeSlot) {
                addCreditsToUser(user.id, activeSlot.reward);
                incrementFocusSessions(user.id);
                toast({
                    title: `Session Complete! +${activeSlot.reward} Credits!`,
                    description: 'Great job on your focused study session!',
                    className: "bg-green-500/10 text-green-700 border-green-500/50 dark:text-green-300"
                });
            }
            setIsActive(false);
            setActiveSlot(null);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeLeft, user, activeSlot, addCreditsToUser, incrementFocusSessions, toast]);
    
    useEffect(() => {
        penaltyApplicator.current = () => {
            if (user && isActive && activeSlot) {
                addCreditsToUser(user.id, -PENALTY);
                 if (typeof window !== 'undefined') {
                    sessionStorage.setItem(FOCUS_PENALTY_SESSION_KEY, `You have been penalized ${PENALTY} credits for leaving an active focus session.`);
                 }
            }
        };
    });

    useEffect(() => {
        return () => {
            penaltyApplicator.current?.();
        };
    }, []);

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
        setIsActive(true);
    };

    const handleStopSession = () => {
        if (user) {
            addCreditsToUser(user.id, -PENALTY);
            toast({
                variant: 'destructive',
                title: 'Session Stopped Early',
                description: `You have been penalized ${PENALTY} credits.`,
            });
        }
        setIsActive(false);
        setActiveSlot(null);
        setTimeLeft(0);
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (activeSlot) {
        const progress = ((activeSlot.duration - timeLeft) / activeSlot.duration) * 100;
        return (
            <div className="flex justify-center items-center h-full">
                <Card className="w-full max-w-md text-center animate-in fade-in-50">
                    <CardHeader>
                        <CardTitle className="text-3xl">Focusing: {activeSlot.label}</CardTitle>
                        <CardDescription>Keep this page open. Closing it or navigating away will result in a penalty.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-6">
                         <div className="relative h-64 w-64">
                            <svg className="h-full w-full" viewBox="0 0 100 100">
                              <circle className="text-muted" strokeWidth="7" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50"/>
                              <circle
                                className="text-primary transition-all duration-1000 ease-linear"
                                strokeWidth="7"
                                strokeDasharray="283"
                                strokeDashoffset={283 * (1 - progress / 100)}
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="45"
                                cx="50"
                                cy="50"
                                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-bold font-mono tabular-nums tracking-tighter">
                                    {formatTime(timeLeft)}
                                </span>
                                <p className="text-sm text-muted-foreground mt-1">Time Remaining</p>
                            </div>
                        </div>
                        <Button variant="destructive" size="lg" onClick={handleStopSession}>
                           <X className="mr-2 h-4 w-4"/> Stop Session & Accept Penalty
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }


    return (
        <div className="space-y-8">
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
                            className="p-6 border rounded-lg text-center hover:shadow-lg hover:-translate-y-1 transition-transform"
                            onClick={() => handleSelectSlot(slot)}
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
                            If you start a session and decide to stop it before the timer is complete, or if you leave this page, you will be penalized <span className="font-bold">{PENALTY} credits.</span> This is to encourage disciplined study habits.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
