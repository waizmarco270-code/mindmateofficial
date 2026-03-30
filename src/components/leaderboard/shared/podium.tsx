
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, CreditCard, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShowcaseBadge } from './badge-renderer';
import { UserWithStats } from '@/hooks/use-leaderboard-data';

interface PodiumProps {
    users: UserWithStats[];
    scoreLabel: string;
    scoreKey: 'totalScore' | 'weeklyTime' | 'entertainmentTotalScore';
    onUserClick?: (user: UserWithStats) => void;
}

export function LeaderboardPodium({ users, scoreLabel, scoreKey, onUserClick }: PodiumProps) {
    const formatScore = (user: UserWithStats) => {
        const val = user[scoreKey];
        if (scoreKey === 'weeklyTime') {
            const h = Math.floor(val / 3600);
            const m = Math.floor((val % 3600) / 60);
            return h > 0 ? `${h}h ${m}m` : `${m}m`;
        }
        return val.toLocaleString();
    };

    const renderCard = (user: UserWithStats, rank: number) => {
        if (!user) return null;
        const isGold = rank === 0;
        const placeDetails = {
            0: { title: '1st Place', trophy: 'text-yellow-400', border: 'border-yellow-400', bg: 'bg-yellow-500/5 shadow-yellow-500/20' },
            1: { title: '2nd Place', trophy: 'text-slate-400', border: 'border-slate-400', bg: '' },
            2: { title: '3rd Place', trophy: 'text-amber-700', border: 'border-amber-700', bg: '' }
        }[rank]!;

        const hasMaster = user.masterCardExpires && new Date(user.masterCardExpires) > new Date();

        return (
            <div 
                onClick={() => onUserClick?.(user)}
                className={cn(
                    "w-full text-left rounded-3xl transition-all cursor-pointer hover:scale-[1.02]",
                    isGold ? "lg:col-span-2" : "col-span-1"
                )}
            >
                <Card className={cn("relative overflow-hidden h-full border-2", placeDetails.border, placeDetails.bg)}>
                    {user.isLeaderboardPrivate && (
                        <div className="absolute top-2 right-2 p-1 bg-black/50 rounded-full z-20">
                            <EyeOff className="h-3 w-3 text-white/70" />
                        </div>
                    )}
                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                        <div className="relative">
                            <Trophy className={cn("absolute -top-2 -left-2 h-8 w-8 -rotate-12", placeDetails.trophy)} />
                            <Avatar className={cn("h-20 w-20 border-4", placeDetails.border)}>
                                <AvatarImage src={user.photoURL} />
                                <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div>
                            <div className="flex items-center justify-center gap-2">
                                <p className="font-black text-xl">{user.displayName}</p>
                                <ShowcaseBadge user={user} />
                            </div>
                            <p className={cn("text-xs font-black uppercase tracking-widest", placeDetails.trophy)}>{placeDetails.title}</p>
                        </div>
                        <div className="space-y-1">
                            <p className={cn("text-4xl font-black tracking-tighter", placeDetails.trophy)}>{formatScore(user)}</p>
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{scoreLabel}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 items-stretch">
            {users[0] && renderCard(users[0], 0)}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-1">
                {users[1] && renderCard(users[1], 1)}
                {users[2] && renderCard(users[2], 2)}
            </div>
        </div>
    );
}
