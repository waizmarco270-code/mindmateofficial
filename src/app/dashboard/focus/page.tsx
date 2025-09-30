
'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Timer, Zap, Clock, Swords } from 'lucide-react';

const focusTools = [
    {
        title: 'Pomodoro',
        description: 'Classic timer for focused sprints.',
        icon: Timer,
        href: '/dashboard/pomodoro',
        color: 'from-green-800 via-slate-900 to-slate-900',
        shadow: 'shadow-green-500/20',
        iconColor: 'text-green-400',
    },
    {
        title: 'Focus Mode',
        description: 'Lock in for long, rewarded sessions.',
        icon: Zap,
        href: '/dashboard/tracker',
        color: 'from-yellow-800 via-slate-900 to-slate-900',
        shadow: 'shadow-yellow-500/20',
        iconColor: 'text-yellow-400',
    },
    {
        title: 'Tracker & Insights',
        description: 'Log time and see your progress.',
        icon: Clock,
        href: '/dashboard/tracker-insights',
        color: 'from-blue-800 via-slate-900 to-slate-900',
        shadow: 'shadow-blue-500/20',
        iconColor: 'text-blue-400',
    },
    {
        title: 'Challenger',
        description: 'Forge discipline, win big.',
        icon: Swords,
        href: '/dashboard/challenger',
        color: 'from-red-800 via-slate-900 to-slate-900',
        shadow: 'shadow-red-500/20',
        iconColor: 'text-red-400',
    }
];

export default function FocusHubPage() {
    return (
        <div className="space-y-8">
             <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <Zap className="h-8 w-8 text-primary" />
                  MindMate Focus
                </h1>
                <p className="text-muted-foreground">Your dedicated toolkit for deep work and productivity.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
                {focusTools.map((tool) => (
                    <Link href={tool.href} className="group block" key={tool.title}>
                       <Card className={cn("group relative text-white overflow-hidden rounded-xl p-px hover:shadow-lg transition-all duration-300 flex flex-col justify-center h-full", tool.shadow)}>
                            <div className={cn("absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 z-0 opacity-80", tool.color)}></div>
                            <div className="absolute inset-0 bg-grid-slate-800/50 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <CardContent className="p-4 sm:p-6 text-center relative z-10 space-y-3">
                                <tool.icon className={cn("h-10 w-10 mx-auto", tool.iconColor)} />
                                <h3 className="text-lg font-semibold">{tool.title}</h3>
                                <p className="text-xs text-slate-400 hidden sm:block">{tool.description}</p>
                            </CardContent>
                        </Card>
                     </Link>
                ))}
            </div>
        </div>
    );
}

