
'use client';

import { UserWithStats } from '@/hooks/use-leaderboard-data';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Trophy, Clock, Gem, Flame } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ShowcaseBadge } from './shared/badge-renderer';

interface PodiumCardProps {
    rank: 1 | 2 | 3;
    user?: UserWithStats;
    onClick: (user: UserWithStats) => void;
    scoreKey?: 'totalScore' | 'weeklyScore' | 'monthlyScore';
}

export function PodiumCard({ rank, user, onClick, scoreKey = 'totalScore' }: PodiumCardProps) {
    if (!user) return null;

    const styles = {
        1: {
            border: 'border-yellow-400/50',
            bg: 'bg-yellow-500/10',
            glow: 'shadow-[0_0_50px_rgba(245,158,11,0.3)]',
            text: 'text-yellow-400',
            aura: 'bg-yellow-400/20'
        },
        2: {
            border: 'border-blue-400/50',
            bg: 'bg-blue-500/10',
            glow: 'shadow-[0_0_40px_rgba(56,189,248,0.2)]',
            text: 'text-blue-400',
            aura: 'bg-blue-400/20'
        },
        3: {
            border: 'border-orange-500/50',
            bg: 'bg-orange-600/10',
            glow: 'shadow-[0_0_40px_rgba(249,115,22,0.2)]',
            text: 'text-orange-500',
            aura: 'bg-orange-500/20'
        }
    }[rank];

    const equippedFrameId = user.equippedFrame || 'default';

    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="relative cursor-pointer group"
            onClick={() => onClick(user)}
        >
            <div className={cn("absolute -inset-4 blur-3xl rounded-full opacity-50 z-0", styles.aura)} />
            
            {rank === 1 && (
                <motion.div 
                    animate={{ y: [0, -10, 0], rotate: [-5, 5, -5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -top-16 left-1/2 -translate-x-1/2 z-20"
                >
                    <Crown className="h-12 w-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(245,158,11,1)]" />
                </motion.div>
            )}

            <div className={cn(
                "relative z-10 p-8 rounded-[3rem] border-2 backdrop-blur-3xl overflow-hidden transition-all duration-500",
                styles.border, styles.bg, styles.glow,
                "group-hover:border-white/40"
            )}>
                <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                <div className="scanning-line" />

                <div className="flex flex-col items-center gap-6 relative z-10 text-center">
                    <div className="relative">
                        <div className={cn("avatar-frame-base", equippedFrameId === 'premium' ? 'avatar-frame-premium' : 'border-4 border-white/20 p-1')}>
                            <Avatar className={cn("h-24 w-24 sm:h-32 sm:w-32 border-2 border-background shadow-2xl bg-background relative z-10")}>
                                <AvatarImage src={user.photoURL} />
                                <AvatarFallback className="text-3xl">{user.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className={cn("absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full border-2 bg-background font-black italic shadow-xl z-20 text-[10px] sm:text-sm", styles.border, styles.text)}>
                            #{rank}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">{user.displayName}</h3>
                        <div className="scale-110"><ShowcaseBadge user={user} /></div>
                    </div>

                    <div className="space-y-1">
                        <p className={cn("text-5xl font-black tracking-tighter", styles.text)}>
                            {Math.round(user[scoreKey] || 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Operational Points</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full pt-6 border-t border-white/10">
                        <MinStat val={Math.round((user.totalStudyTime || 0) / 3600)} label="HRS" icon={Clock} color="text-sky-400" />
                        <MinStat val={user.credits} label="CR" icon={Gem} color="text-amber-500" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function MinStat({ val, label, icon: Icon, color }: any) {
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5">
                <Icon className={cn("h-3 w-3", color)} />
                <span className="text-sm font-black italic text-white">{val.toLocaleString()}</span>
            </div>
            <p className="text-[8px] font-black uppercase tracking-widest opacity-40">{label}</p>
        </div>
    );
}
