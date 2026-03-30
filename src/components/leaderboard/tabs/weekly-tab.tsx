
'use client';

import { useState, useEffect } from 'react';
import { UserWithStats } from '@/hooks/use-leaderboard-data';
import { LeaderboardPodium } from '../shared/podium';
import { LeaderboardRankList } from '../shared/rank-list';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, History } from 'lucide-react';
import { endOfWeek, format as formatDate } from 'date-fns';

interface WeeklyTabProps {
    users: UserWithStats[];
    currentUserId?: string;
    onUserClick: (user: UserWithStats) => void;
    lastWeekWinner?: UserWithStats;
}

export function WeeklyTab({ users, currentUserId, onUserClick, lastWeekWinner }: WeeklyTabProps) {
    const [timeLeft, setTimeLeft] = useState('');
    const topThree = users.slice(0, 3);
    const rest = users.slice(3, 50);

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
            className="space-y-8"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Clock className="h-8 w-8 text-primary animate-pulse" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cycle Reset</p>
                                <p className="font-bold">Next Monday</p>
                            </div>
                        </div>
                        <div className="font-mono font-black text-lg bg-black/20 px-3 py-1.5 rounded-xl border border-white/5">
                            {timeLeft}
                        </div>
                    </CardContent>
                </Card>

                {lastWeekWinner && lastWeekWinner.prevWeeklyTime > 0 && (
                    <Card className="bg-amber-500/5 border-amber-500/20">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <History className="h-8 w-8 text-amber-500" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last Champion</p>
                                    <p className="font-bold truncate max-w-[120px]">{lastWeekWinner.displayName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-black text-amber-500">{formatTime(lastWeekWinner.prevWeeklyTime)}</p>
                                <p className="text-[8px] font-black uppercase opacity-40">Weekly Focus</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <LeaderboardPodium 
                users={topThree} 
                scoreLabel="Weekly Focus" 
                scoreKey="weeklyTime" 
                onUserClick={onUserClick}
            />
            
            <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground px-1">Weekly Combatants</h3>
                <LeaderboardRankList 
                    users={rest} 
                    currentUserId={currentUserId}
                    scoreLabel="Weekly Time"
                    scoreKey="weeklyTime"
                    onUserClick={onUserClick}
                />
            </div>
        </motion.div>
    );
}
