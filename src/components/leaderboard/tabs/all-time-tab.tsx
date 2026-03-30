
'use client';

import { useState } from 'react';
import { UserWithStats } from '@/hooks/use-leaderboard-data';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { ShowcaseBadge } from '../shared/badge-renderer';
import { 
    Clock, Flame, Gem, ShieldAlert, 
    ChevronDown, ChevronUp, Target, 
    Zap, Info, Star, Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AllTimeTabProps {
    users: UserWithStats[];
    currentUserId?: string;
    onUserClick: (user: UserWithStats) => void;
}

const formatHours = (seconds: number) => {
    return (seconds / 3600).toFixed(1);
};

export function AllTimeTab({ users, currentUserId, onUserClick }: AllTimeTabProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const topTwenty = users.slice(0, 20);

    return (
        <div className="space-y-4 pb-20">
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary/60 px-2 flex items-center gap-2">
                <Trophy className="h-4 w-4"/> Elite Top 20 Legends
            </h3>
            
            <div className="space-y-3">
                {topTwenty.map((user, index) => {
                    const isExpanded = expandedId === user.uid;
                    const isMe = user.uid === currentUserId;
                    const rank = index + 1;

                    return (
                        <motion.div
                            key={user.uid}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card 
                                className={cn(
                                    "relative overflow-hidden transition-all duration-500 border-2 cursor-pointer group",
                                    isExpanded ? "border-primary ring-2 ring-primary/20" : "border-white/5 hover:border-primary/30 bg-card/40 backdrop-blur-xl",
                                    isMe && !isExpanded && "border-amber-500/30 bg-amber-500/5"
                                )}
                                onClick={() => setExpandedId(isExpanded ? null : user.uid)}
                            >
                                <div className="p-4 sm:p-6 flex items-center gap-4">
                                    {/* Rank Sector */}
                                    <div className="w-8 sm:w-12 text-center shrink-0">
                                        <span className={cn(
                                            "text-2xl font-black italic",
                                            rank === 1 ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" :
                                            rank === 2 ? "text-slate-300" :
                                            rank === 3 ? "text-amber-600" : "text-muted-foreground opacity-40"
                                        )}>
                                            #{rank}
                                        </span>
                                    </div>

                                    {/* Avatar Sector */}
                                    <button 
                                        className="relative shrink-0 transition-transform active:scale-90"
                                        onClick={(e) => { e.stopPropagation(); onUserClick(user); }}
                                    >
                                        <div className="absolute -inset-1 bg-primary/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Avatar className={cn(
                                            "h-12 w-12 sm:h-16 sm:w-16 border-2 relative",
                                            rank === 1 ? "border-yellow-400" : "border-white/10"
                                        )}>
                                            <AvatarImage src={user.photoURL} />
                                            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </button>

                                    {/* Name & Badge Sector */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-black text-lg sm:text-2xl uppercase tracking-tight truncate leading-tight">
                                                {user.displayName}
                                            </p>
                                            <ShowcaseBadge user={user} />
                                        </div>
                                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1 opacity-60">
                                            {user.mindMateId || 'GENESIS LEGEND'}
                                        </p>
                                    </div>

                                    {/* Primary Score Sector */}
                                    <div className="text-right shrink-0">
                                        <p className="text-3xl sm:text-5xl font-black tracking-tighter text-primary italic">
                                            {user.totalScore.toLocaleString()}
                                        </p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tactical Points</p>
                                    </div>

                                    {/* Expansion Toggle */}
                                    <div className="hidden sm:block pl-2">
                                        {isExpanded ? <ChevronUp className="opacity-40" /> : <ChevronDown className="opacity-40" />}
                                    </div>
                                </div>

                                {/* Tactical Breakdown Sector */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-white/5 bg-black/20"
                                        >
                                            <div className="p-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                                                <BreakdownItem 
                                                    icon={Clock} 
                                                    label="Study Time" 
                                                    value={`${formatHours(user.totalStudyTime || 0)}h`} 
                                                    points={user.breakdown.studyPoints}
                                                    color="text-sky-400"
                                                />
                                                <BreakdownItem 
                                                    icon={ShieldAlert} 
                                                    label="Isolation" 
                                                    value={user.breakdown.isolationLabel} 
                                                    points={user.breakdown.isolationPoints}
                                                    color="text-red-500"
                                                />
                                                <BreakdownItem 
                                                    icon={Flame} 
                                                    label="Active Streak" 
                                                    value={`${user.streak}d`} 
                                                    points={user.breakdown.streakPoints}
                                                    color="text-orange-500"
                                                />
                                                <BreakdownItem 
                                                    icon={Gem} 
                                                    label="Credits" 
                                                    value={user.credits.toLocaleString()} 
                                                    points={user.breakdown.creditsPoints}
                                                    color="text-amber-500"
                                                />
                                                <BreakdownItem 
                                                    icon={Target} 
                                                    label="Discipline" 
                                                    value="SOON" 
                                                    points={0}
                                                    color="text-emerald-500"
                                                    isInactive
                                                />
                                            </div>
                                            <div className="px-6 pb-6 text-[10px] font-black uppercase text-center tracking-[0.2em] text-muted-foreground/40 italic">
                                                Verified by Sovereign Intelligence Mainframe v2.5
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

function BreakdownItem({ icon: Icon, label, value, points, color, isInactive }: any) {
    return (
        <div className={cn("p-4 rounded-2xl border border-white/5 bg-background/40 flex flex-col items-center text-center gap-1", isInactive && "opacity-40 grayscale")}>
            <div className={cn("p-2 rounded-xl bg-white/5 mb-1", color)}>
                <Icon className="h-4 w-4" />
            </div>
            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="text-sm font-bold truncate w-full">{value}</p>
            <div className="h-px w-8 bg-white/10 my-1" />
            <p className={cn("text-xs font-black", color)}>+{points} PTS</p>
        </div>
    );
}
