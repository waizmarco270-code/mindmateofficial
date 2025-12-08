
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Group } from '@/context/groups-context';
import { Loader2, Play, Users, Zap, CheckCircle, Plus, Trash2, Clock, Check, X, Pause } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { TimeTracker } from '../tracker/time-tracker';

interface GroupFocusProps {
    group: Group;
}

export function GroupFocus({ group }: GroupFocusProps) {
    const [view, setView] = useState<'idle' | 'session'>('idle');

    if (view === 'session') {
        return (
            <Card className="bg-gradient-to-br from-green-900/50 to-slate-900 border-green-700/50 shadow-lg shadow-green-500/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-400">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                            <Zap />
                        </motion.div>
                        Group Study Session
                    </CardTitle>
                    <CardDescription>Track your study time here to contribute to the clan's XP.</CardDescription>
                </CardHeader>
                <CardContent>
                    <TimeTracker />
                </CardContent>
                <CardFooter>
                    <Button variant="destructive" onClick={() => setView('idle')}>
                        <X className="mr-2 h-4 w-4" />
                        Close Study Hub
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="relative group overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950">
             <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(to_bottom,white_10%,transparent_70%)] group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3">
                    <Zap className="h-6 w-6 text-yellow-400"/>
                    Clan Study Hub
                </CardTitle>
                <CardDescription>Start a group focus session to study with your clan and earn massive XP.</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4 text-center">
                 <Button size="lg" className="w-full sm:w-auto" onClick={() => setView('session')}>
                     <Play className="mr-2"/> Start Group Focus
                </Button>
            </CardContent>
        </Card>
    );
}

    