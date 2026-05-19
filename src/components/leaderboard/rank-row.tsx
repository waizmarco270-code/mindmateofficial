'use client';

import { UserWithStats } from '@/hooks/use-leaderboard-data';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Gem, Flame, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShowcaseBadge } from './shared/badge-renderer';

interface RankRowProps {
    user: UserWithStats;
    rank: number;
    isMe: boolean;
    onClick: (user: UserWithStats) => void;
}

export function RankRow({ user, rank, isMe, onClick }: RankRowProps) {
    const equippedFrameId = user.equippedFrame || 'default';

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            whileHover={{ x: 10, scale: 1.02 }}
            className="w-full cursor-pointer group"
            onClick={() => onClick(user)}
        >
            <div className={cn(
                "relative overflow-hidden border border-white/5 bg-card/40 backdrop-blur-xl rounded-2xl sm:rounded-[2.5rem] flex items-center px-4 sm:px-10 h-20 sm:h-24 gap-4 sm:gap-10 transition-all",
                isMe && "bg-primary/5 border-primary/20 ring-1 ring-primary/10 shadow-[0_0_30px_rgba(139,92,246,0.1)]",
                "hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5"
            )}>
                <div className="absolute inset-0 bg-grid-white/5 opacity-5 group-hover:opacity-10 transition-opacity" />
                
                <div className="w-6 sm:w-10 text-center font-black italic text-xl sm:text-3xl opacity-20 group-hover:opacity-60 transition-opacity">#{rank}</div>
                
                <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0 relative z-10">
                    <div className={cn("avatar-frame-base", equippedFrameId === 'premium' ? 'avatar-frame-premium' : 'avatar-frame-default')}>
                        <Avatar className="h-10 w-10 sm:h-14 sm:w-14 border-2 shadow-lg bg-background relative z-10">
                            <AvatarImage src={user.photoURL} />
                            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-black text-sm sm:text-2xl uppercase italic tracking-tight truncate">{user.displayName}</p>
                            <div className="scale-75 origin-left"><ShowcaseBadge user={user} /></div>
                        </div>
                        <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">REGISTRY RECORD • {user.mindMateId || 'LEGEND'}</p>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-8 px-8 border-x border-white/5">
                    <MinStat icon={Clock} val={`${Math.round((user.totalStudyTime || 0) / 3600)}h`} color="text-sky-400" />
                    <MinStat icon={Gem} val={user.credits} color="text-amber-500" />
                    <MinStat icon={Flame} val={user.streak} color="text-orange-500" />
                </div>

                <div className="text-right shrink-0 relative z-10 flex items-center gap-4 sm:gap-10">
                    <div>
                        <p className="text-xl sm:text-4xl font-black italic tracking-tighter leading-none tabular-nums text-white">
                            {user.totalScore.toLocaleString()}
                        </p>
                        <p className="text-[8px] font-black uppercase opacity-40 mt-1 tracking-widest">Points</p>
                    </div>
                    <ChevronRight className="h-6 w-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-primary" />
                </div>
            </div>
        </motion.div>
    );
}

function MinStat({ icon: Icon, val, color }: any) {
    return (
        <div className="flex flex-col items-center gap-1">
            <Icon className={cn("h-4 w-4", color)} />
            <span className="text-[10px] font-black italic text-white">{val}</span>
        </div>
    );
}
