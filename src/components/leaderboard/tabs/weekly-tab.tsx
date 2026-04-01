
'use client';

import { useState, useEffect } from 'react';
import { UserWithStats } from '@/hooks/use-leaderboard-data';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, History, ChevronDown, ChevronUp, CheckCircle, Gem, Medal, EyeOff } from 'lucide-react';
import { endOfWeek, format as formatDate, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { ShowcaseBadge, getOwnedBadges } from '../shared/badge-renderer';

interface WeeklyTabProps {
    users: UserWithStats[];
    currentUserId?: string;
    onUserClick: (user: UserWithStats) => void;
    lastWeekWinner?: UserWithStats;
}

const formatHours = (seconds: number) => {
    return (seconds / 3600).toFixed(1);
};

export function WeeklyTab({ users, currentUserId, onUserClick, lastWeekWinner }: WeeklyTabProps) {
    const [timeLeft, setTimeLeft] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const topFifty = users.slice(0, 50);
    const myRank = users.findIndex(u => u.uid === currentUserId) + 1;
    const myData = users.find(u => u.uid === currentUserId);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
            const diff = weekEnd.getTime() - now.getTime();
            if (diff <= 0) { setTimeLeft("Resetting..."); return; }
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / 1000 / 60) % 60);
            const s = Math.floor((diff / 1000) % 60);
            setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-7xl mx-auto w-full pb-40 px-2"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-primary/5 border-primary/20 rounded-3xl overflow-hidden">
                    <CardContent className="p-4 sm:p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Clock className="h-6 w-6 animate-pulse" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cycle Reset</p>
                                <p className="font-bold text-sm sm:text-base">Next Monday</p>
                            </div>
                        </div>
                        <div className="font-mono font-black text-sm sm:text-lg bg-black/20 px-3 py-1.5 rounded-xl border border-white/5">
                            {timeLeft}
                        </div>
                    </CardContent>
                </Card>

                {lastWeekWinner && lastWeekWinner.prevWeeklyTime > 0 && (
                    <Card className="bg-amber-500/5 border-amber-500/20 rounded-3xl overflow-hidden">
                        <CardContent className="p-4 sm:p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                                    <History className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last Champion</p>
                                    <p className="font-bold truncate max-w-[120px] text-sm sm:text-base">{lastWeekWinner.displayName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm sm:text-xl font-black text-amber-500">{formatTime(lastWeekWinner.prevWeeklyTime)}</p>
                                <p className="text-[8px] font-black uppercase opacity-40">Weekly Focus</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="space-y-4">
                {topFifty.map((user, index) => {
                    const rank = index + 1;
                    const isExpanded = expandedId === user.uid;
                    const isMe = user.uid === currentUserId;
                    const isTopThree = rank <= 3;

                    return (
                        <div key={user.uid}>
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}>
                                <Card 
                                    className={cn(
                                        "relative overflow-hidden border-2 cursor-pointer transition-all duration-500 rounded-[2rem] sm:rounded-[2.5rem]",
                                        isMe ? "bg-primary/5 border-primary/20" : "bg-card/40 border-white/5",
                                        isTopThree && "border-amber-500/30 shadow-lg shadow-amber-500/5",
                                        isExpanded && "scale-[1.01] ring-4 ring-primary/10"
                                    )}
                                    onClick={() => setExpandedId(isExpanded ? null : user.uid)}
                                >
                                    <div className="p-4 sm:p-6 flex items-center gap-3 sm:gap-8">
                                        <div className="w-8 sm:w-12 text-center font-black italic text-xl sm:text-3xl opacity-40">#{rank}</div>
                                        <Avatar className="h-10 w-10 sm:h-16 sm:w-16 border-2 border-white/10 shrink-0">
                                            <AvatarImage src={user.photoURL} />
                                            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-black text-sm sm:text-xl uppercase tracking-tight truncate italic">{user.displayName}</p>
                                                {user.isLeaderboardPrivate && <EyeOff className="h-3 w-3 opacity-40" />}
                                            </div>
                                            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                                {user.mindMateId || 'LEGEND'}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-xl sm:text-4xl font-black italic tracking-tighter text-primary leading-none tabular-nums">
                                                {formatTime(user.weeklyTime)}
                                            </p>
                                            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Study Hours</p>
                                        </div>
                                        <div className="ml-1 sm:ml-2 opacity-30">
                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </div>
                                    </div>
                                    
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/5 bg-black/40">
                                                <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl">
                                                        <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400"><Clock className="h-4 w-4"/></div>
                                                        <div className="min-w-0"><p className="text-[7px] uppercase font-black opacity-40">Total</p><p className="text-[10px] font-bold">{formatHours(user.totalStudyTime || 0)}h</p></div>
                                                    </div>
                                                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl">
                                                        <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400"><Flame className="h-4 w-4"/></div>
                                                        <div className="min-w-0"><p className="text-[7px] uppercase font-black opacity-40">Streak</p><p className="text-[10px] font-bold">{user.streak}d</p></div>
                                                    </div>
                                                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl">
                                                        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400"><Gem className="h-4 w-4"/></div>
                                                        <div className="min-w-0"><p className="text-[7px] uppercase font-black opacity-40">Credits</p><p className="text-[10px] font-bold">{user.credits}</p></div>
                                                    </div>
                                                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl">
                                                        <div className="p-1.5 rounded-lg bg-fuchsia-500/20 text-fuchsia-400"><Medal className="h-4 w-4"/></div>
                                                        <div className="min-w-0"><p className="text-[7px] uppercase font-black opacity-40">Assets</p><p className="text-[10px] font-bold">{getOwnedBadges(user).length}</p></div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
