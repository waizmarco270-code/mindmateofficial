
'use client';

import { useState, useEffect } from 'react';
import { User } from '@/hooks/use-admin';
import { ShieldAlert, Clock, LogOut, Gavel, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClerk } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, parseISO, isPast } from 'date-fns';
import { cn } from '@/lib/utils';

export function BannedOverlay({ user }: { user: User }) {
    const { signOut } = useClerk();
    const [timeLeft, setTimeLeft] = useState<string>('');

    const isPermanent = user.banType === 'permanent' || !user.banExpires;
    const expiryDate = user.banExpires ? parseISO(user.banExpires) : null;

    useEffect(() => {
        if (isPermanent || !expiryDate) return;

        const updateTimer = () => {
            if (isPast(expiryDate)) {
                setTimeLeft('Ban Expired. Refresh to resume.');
                return;
            }
            setTimeLeft(formatDistanceToNow(expiryDate, { addSuffix: true }));
        };

        updateTimer();
        const interval = setInterval(updateTimer, 10000);
        return () => clearInterval(interval);
    }, [isPermanent, expiryDate]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden select-none">
            {/* Red Pulsing Background */}
            <div className="absolute inset-0 bg-red-950/20 animate-pulse" />
            <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]" />
            
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-10 w-full max-w-2xl mx-auto p-8"
            >
                <div className="bg-slate-900/80 backdrop-blur-2xl border-4 border-red-600/50 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_100px_rgba(220,38,38,0.3)] text-center space-y-8">
                    <div className="flex justify-center">
                        <div className="relative">
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute -inset-4 bg-red-600/20 rounded-full blur-2xl"
                            />
                            <div className="relative p-6 rounded-full bg-red-600/10 border-4 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)]">
                                <Gavel className="h-16 w-16 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-red-600 uppercase italic">
                            ACCESS DENIED
                        </h1>
                        <p className="text-xl font-bold text-white uppercase tracking-[0.2em]">Sovereign Ban Protocol Active</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-4 text-left">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Reason for Exclusion</p>
                                <p className="text-lg font-medium text-slate-200 mt-1">{user.banReason || 'Major violation of MindMate security protocols.'}</p>
                            </div>
                        </div>

                        <Separator className="bg-white/5" />

                        <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">Temporal Status</p>
                                <p className={cn(
                                    "text-lg font-bold mt-1",
                                    isPermanent ? "text-red-500" : "text-amber-500"
                                )}>
                                    {isPermanent ? 'PERMANENT UID TERMINATION' : `EXPIRES ${timeLeft.toUpperCase()}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground max-w-md mx-auto italic">
                        "The path to legend is built on discipline. You have failed to uphold the integrity of this network."
                    </p>

                    <Button 
                        size="lg" 
                        variant="ghost" 
                        className="w-full h-14 text-lg font-black rounded-2xl text-slate-400 hover:text-white hover:bg-white/5"
                        onClick={() => signOut()}
                    >
                        <LogOut className="mr-2 h-5 w-5"/> TERMINATE SESSION
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

function Separator({ className }: { className?: string }) {
    return <div className={cn("h-px w-full", className)} />;
}
