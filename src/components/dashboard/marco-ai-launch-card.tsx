
'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export function MarcoAiLaunchCard() {
    const { isSignedIn } = useUser();
    const [timeLeft, setTimeLeft] = useState<{
        days: string; hours: string; minutes: string; seconds: string;
    } | null>(null);

    useEffect(() => {
        // This function will only run on the client
        const launchDate = new Date('2024-10-02T00:00:00').getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = launchDate - now;

            if (distance < 0) {
                setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
                return false; // Stop the timer
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft({
                days: days.toString().padStart(2, '0'),
                hours: hours.toString().padStart(2, '0'),
                minutes: minutes.toString().padStart(2, '0'),
                seconds: seconds.toString().padStart(2, '0'),
            });
            return true; // Continue the timer
        };
        
        // Initial call to set the time immediately
        if(updateTimer()) {
            const timer = setInterval(() => {
                if (!updateTimer()) {
                    clearInterval(timer);
                }
            }, 1000);
    
            // Cleanup on component unmount
            return () => clearInterval(timer);
        }

    }, []); // Empty dependency array ensures this runs only once on mount (client-side)

    return (
        <Card className="relative group overflow-hidden border-0 bg-transparent mb-8">
            <div className="absolute inset-0 blue-nebula-bg z-0"></div>
            <div id="particle-container" className="[mask-image:linear-gradient(to_bottom,white_20%,transparent_75%)]">
                {[...Array(12)].map((_, i) => <div key={i} className="particle"></div>)}
            </div>
            <CardContent className="relative z-10 p-6 flex flex-col md:flex-row items-center text-center md:text-left gap-6">
                <div className="p-4 bg-primary/20 border-2 border-primary/50 rounded-full animate-pulse">
                    <Bot className="h-12 w-12 text-primary" />
                </div>
                <div className="flex-1">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Coming Soon</h2>
                    <CardTitle className="text-3xl font-bold mt-1">Marco AI 👑🔥</CardTitle>
                    <CardDescription className="text-slate-400 mt-1 max-w-lg mx-auto md:mx-0">
                        The revolutionary AI study partner is launching on 2nd October. Get ready!
                    </CardDescription>
                </div>
                <div className="flex flex-col items-center">
                    <div className="flex gap-2 sm:gap-4">
                        <div className="text-center"><p className="text-4xl font-bold font-code">{timeLeft?.days ?? '00'}</p><p className="text-xs">Days</p></div>
                        <div className="text-center"><p className="text-4xl font-bold font-code">{timeLeft?.hours ?? '00'}</p><p className="text-xs">Hours</p></div>
                        <div className="text-center"><p className="text-4xl font-bold font-code">{timeLeft?.minutes ?? '00'}</p><p className="text-xs">Mins</p></div>
                        <div className="text-center"><p className="text-4xl font-bold font-code text-primary animate-pulse">{timeLeft?.seconds ?? '00'}</p><p className="text-xs">Secs</p></div>
                    </div>
                </div>
            </CardContent>
            {isSignedIn && (
                <div className="relative z-10 p-4 bg-amber-500/10 border-t border-amber-500/20 text-center text-amber-300 text-sm font-semibold flex items-center justify-center gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    Save up 1000 credits to unlock this legendary feature on day one, or you'll miss out!
                </div>
            )}
        </Card>
    );
}
