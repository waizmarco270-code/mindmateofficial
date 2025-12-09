
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wrench } from 'lucide-react';
import { AppSettings } from '@/hooks/use-admin';
import { differenceInSeconds, formatDistanceToNowStrict } from 'date-fns';

interface MaintenancePageProps {
    settings: AppSettings | null;
}

export function MaintenancePage({ settings }: MaintenancePageProps) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!settings?.maintenanceEndTime) {
            return;
        }

        const interval = setInterval(() => {
            const targetDate = new Date(settings.maintenanceEndTime!);
            const now = new Date();
            const diff = differenceInSeconds(targetDate, now);

            if (diff <= 0) {
                setTimeLeft('We should be back any moment now!');
                clearInterval(interval);
                // Optionally trigger a page refresh
                setTimeout(() => window.location.reload(), 30000);
            } else {
                setTimeLeft(formatDistanceToNowStrict(targetDate, { addSuffix: true }));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [settings?.maintenanceEndTime]);


    return (
        <div className="flex h-screen w-screen items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-lg text-center border-primary/20 shadow-lg shadow-primary/10">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <Wrench className="h-10 w-10 text-primary animate-pulse" />
                    </div>
                    <CardTitle className="text-2xl">Under Maintenance</CardTitle>
                    <CardDescription>
                       {settings?.maintenanceMessage || "MindMate is currently undergoing some upgrades to make it even better. We'll be back shortly!"}
                    </CardDescription>
                </CardHeader>
                {settings?.maintenanceEndTime && (
                    <CardContent>
                        <div className="p-4 rounded-lg bg-muted border">
                            <p className="text-sm font-semibold text-muted-foreground">Estimated time remaining:</p>
                            <p className="text-xl font-bold text-primary mt-1">{timeLeft}</p>
                        </div>
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
