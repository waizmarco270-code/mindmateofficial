
'use client';

import { UserWithStats } from '@/hooks/use-leaderboard-data';
import { LeaderboardPodium } from '../shared/podium';
import { LeaderboardRankList } from '../shared/rank-list';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Gamepad2, History } from 'lucide-react';

interface GameZoneTabProps {
    users: UserWithStats[];
    currentUserId?: string;
    onUserClick: (user: UserWithStats) => void;
    lastWeekWinner?: UserWithStats;
}

export function GameZoneTab({ users, currentUserId, onUserClick, lastWeekWinner }: GameZoneTabProps) {
    const topThree = users.slice(0, 3);
    const rest = users.slice(3, 50);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-rose-500/5 border-rose-500/20">
                    <CardContent className="p-4 flex items-center gap-3">
                        <Gamepad2 className="h-8 w-8 text-rose-500" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">GM Title Race</p>
                            <p className="font-bold">Weekly Performance Rank</p>
                        </div>
                    </CardContent>
                </Card>

                {lastWeekWinner && lastWeekWinner.prevWeekEntertainmentTotalScore > 0 && (
                    <Card className="bg-amber-500/5 border-amber-500/20">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <History className="h-8 w-8 text-amber-500" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Previous GM</p>
                                    <p className="font-bold truncate max-w-[120px]">{lastWeekWinner.displayName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-black text-amber-500">{lastWeekWinner.prevWeekEntertainmentTotalScore}</p>
                                <p className="text-[8px] font-black uppercase opacity-40">Skill Points</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <LeaderboardPodium 
                users={topThree} 
                scoreLabel="Skill Points" 
                scoreKey="entertainmentTotalScore" 
                onUserClick={onUserClick}
            />
            
            <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground px-1">Game Masters</h3>
                <LeaderboardRankList 
                    users={rest} 
                    currentUserId={currentUserId}
                    scoreLabel="Skill Points"
                    scoreKey="entertainmentTotalScore"
                    onUserClick={onUserClick}
                />
            </div>
        </motion.div>
    );
}
