
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EyeOff, CreditCard, Medal, Gem } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShowcaseBadge } from './badge-renderer';
import { UserWithStats } from '@/hooks/use-leaderboard-data';

interface RankListProps {
    users: UserWithStats[];
    currentUserId?: string;
    scoreLabel: string;
    scoreKey: 'totalScore' | 'weeklyTime' | 'entertainmentTotalScore';
    onUserClick?: (user: UserWithStats) => void;
}

export function LeaderboardRankList({ users, currentUserId, scoreLabel, scoreKey, onUserClick }: RankListProps) {
    const formatScore = (user: UserWithStats) => {
        const val = user[scoreKey];
        if (scoreKey === 'weeklyTime') {
            const h = Math.floor(val / 3600);
            const m = Math.floor((val % 3600) / 60);
            return h > 0 ? `${h}h ${m}m` : `${m}m`;
        }
        return val.toLocaleString();
    };

    return (
        <Card className="border-primary/10">
            <CardContent className="p-2 space-y-2">
                {users.map((user, index) => {
                    const rank = index + 4;
                    const isMe = user.uid === currentUserId;
                    const hasMaster = user.masterCardExpires && new Date(user.masterCardExpires) > new Date();

                    return (
                        <div
                            key={user.uid}
                            onClick={() => onUserClick?.(user)}
                            className={cn(
                                "group relative overflow-hidden rounded-2xl p-3 flex items-center gap-4 transition-all cursor-pointer",
                                isMe ? "bg-primary/10 border-primary/20 border" : "hover:bg-muted/50 border border-transparent"
                            )}
                        >
                            {user.isLeaderboardPrivate && (
                                <div className="absolute top-2 right-2 p-1 bg-black/50 rounded-full z-10">
                                    <EyeOff className="h-3 w-3 text-white/70" />
                                </div>
                            )}
                            
                            <div className="w-8 text-center font-black text-muted-foreground">{rank}</div>
                            
                            <Avatar className="h-10 w-10 border shadow-sm">
                                <AvatarImage src={user.photoURL} />
                                <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-bold text-sm truncate">{user.displayName}</p>
                                    <ShowcaseBadge user={user} />
                                    {hasMaster && <CreditCard className="h-3 w-3 text-green-500" />}
                                </div>
                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{user.mindMateId || 'LEGEND'}</p>
                            </div>

                            <div className="text-right">
                                <p className="text-lg font-black tracking-tight text-primary">{formatScore(user)}</p>
                                <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">{scoreLabel}</p>
                            </div>
                        </div>
                    );
                })}
                {users.length === 0 && (
                    <div className="py-20 text-center opacity-30 italic">No further rankings recorded.</div>
                )}
            </CardContent>
        </Card>
    );
}
