

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wrench } from 'lucide-react';
import { AppSettings, MaintenanceTheme } from '@/hooks/use-admin';
import { differenceInSeconds } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface MaintenancePageProps {
    settings: AppSettings | null;
}

function Countdown({ targetDate }: { targetDate: Date }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const interval = setInterval(() => {
            const totalSeconds = differenceInSeconds(targetDate, new Date());

            if (totalSeconds <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(interval);
                 // Auto-refresh after countdown finishes to check if site is live
                setTimeout(() => window.location.reload(), 2000);
                return;
            }

            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            
            setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className="grid grid-cols-4 gap-2 text-center font-mono">
            <div><p className="text-3xl font-bold">{String(timeLeft.days).padStart(2, '0')}</p><p className="text-xs text-white/70">Days</p></div>
            <div><p className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</p><p className="text-xs text-white/70">Hours</p></div>
            <div><p className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</p><p className="text-xs text-white/70">Mins</p></div>
            <div><p className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</p><p className="text-xs text-white/70">Secs</p></div>
        </div>
    );
}

export function MaintenancePage({ settings }: MaintenancePageProps) {
    const targetDate = settings?.maintenanceEndTime ? new Date(settings.maintenanceEndTime) : null;
    const theme = settings?.maintenanceTheme || 'shiny';

    return (
        <div className={cn("flex h-screen w-screen items-center justify-center p-4",
            theme === 'sunflower' && 'banner-sunflower-bg',
            theme === 'forest' && 'banner-forest-bg',
            theme === 'shiny' && 'banner-shiny-bg'
        )}>
             <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <Card className="w-full max-w-lg text-center bg-background/80 backdrop-blur-lg border-white/20 text-white">
                    <CardHeader>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                            <Wrench className="h-10 w-10 text-white animate-pulse" />
                        </div>
                        <CardTitle className="text-2xl">Under Maintenance</CardTitle>
                        <CardDescription className="text-white/80">
                           {settings?.maintenanceMessage || "MindMate is currently undergoing some upgrades to make it even better. We'll be back shortly!"}
                        </CardDescription>
                    </CardHeader>
                    {targetDate && (
                        <CardContent>
                            <div className="p-4 rounded-lg bg-black/20 border border-white/10">
                                <p className="text-sm font-semibold text-white/80 mb-2">We'll be back in:</p>
                                <Countdown targetDate={targetDate} />
                            </div>
                        </CardContent>
                    )}
                </Card>
            </motion.div>
        </div>
    );
}
