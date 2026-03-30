
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
    Zap, Info, Star, Trophy, EyeOff, CheckCircle
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
    
    // Directive: Registry limited to Top 20 Elite
    const topTwenty = users.slice(0, 20);
    
    // Directive: Find personal rank from the full list
    const myRank = users.findIndex(u => u.uid === currentUserId) + 1;
    const myData = users.find(u => u.uid === currentUserId);

    return (
        <div className="space-y-6 pb-32 max-w-7xl mx-auto w-full px-0">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary/60 flex items-center gap-2">
                    <Trophy className="h-4 w-4"/> Elite Registry: Top 20
                </h3>
            </div>
            
            <div className="space-y-4">
                {topTwenty.map((user, index) => {
                    const isExpanded = expandedId === user.uid;
                    const isMe = user.uid === currentUserId;
                    const rank = index + 1;

                    // Legendary Tier Styling
                    const isTopThree = rank <= 3;
                    const tierStyles = {
                        1: "border-[#f59e0b] shadow-[0_0_30px_rgba(245,158,11,0.2)] animate-[alpha-rainbow-gold_4s_linear_infinite] bg-gradient-to-br from-yellow-500/10 to-amber-900/20",
                        2: "border-slate-300 shadow-[0_0_20px_rgba(203,213,225,0.2)] animate-[silver-glow_3s_ease-in-out_infinite] bg-gradient-to-br from-slate-400/10 to-slate-800/20",
                        3: "border-[#b45309] shadow-[0_0_15px_rgba(180,83,9,0.2)] animate-[bronze-glow_3s_ease-in-out_infinite] bg-gradient-to-br from-amber-700/10 to-orange-900/20"
                    }[rank as 1|2|3] || "border-white/5 bg-card/40 backdrop-blur-xl";

                    return (
                        <motion.div
                            key={user.uid}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card 
                                className={cn(
                                    "relative overflow-hidden transition-all duration-500 border-2 cursor-pointer group rounded-[2rem]",
                                    isExpanded ? "border-primary ring-2 ring-primary/20 scale-[1.01]" : "hover:border-primary/30",
                                    tierStyles,
                                    isMe && !isTopThree && "border-amber-500/30 bg-amber-500/5"
                                )}
                                onClick={() => setExpandedId(isExpanded ? null : user.uid)}
                            >
                                {/* Privacy Indicator */}
                                {user.isLeaderboardPrivate && (
                                    <div className="absolute top-4 right-12 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 border border-white/10">
                                        <EyeOff className="h-3 w-3 text-white/70" />
                                        <span className="text-[8px] font-black uppercase text-white/50 tracking-widest">Phantom</span>
                                    </div>
                                )}

                                <div className="p-4 sm:p-8 flex items-center gap-4 sm:gap-8">
                                    {/* Rank Sector */}
                                    <div className="w-10 sm:w-16 text-center shrink-0">
                                        <span className={cn(
                                            "text-3xl sm:text-5xl font-black italic tracking-tighter",
                                            rank === 1 ? "text-yellow-400 drop-shadow-[0_0_15px_#facc15]" :
                                            rank === 2 ? "text-slate-300 drop-shadow-[0_0_15px_#cbd5e1]" :
                                            rank === 3 ? "text-amber-600 drop-shadow-[0_0_15px_#b45309]" :
                                            "text-muted-foreground opacity-20"
                                        )}>
                                            #{rank}
                                        </span>
                                    </div>

                                    {/* Avatar Sector - Profile Ingress */}
                                    <button 
                                        className="relative shrink-0 transition-transform active:scale-90"
                                        onClick={(e) => { e.stopPropagation(); onUserClick(user); }}
                                    >
                                        <div className={cn(
                                            "absolute -inset-2 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity",
                                            isTopThree ? "bg-white/20" : "bg-primary/20"
                                        )} />
                                        <Avatar className={cn(
                                            "h-16 w-16 sm:h-24 sm:w-24 border-4 relative",
                                            rank === 1 ? "border-yellow-400" : 
                                            rank === 2 ? "border-slate-300" :
                                            rank === 3 ? "border-amber-700" :
                                            "border-white/10"
                                        )}>
                                            <AvatarImage src={user.photoURL} />
                                            <AvatarFallback className="text-2xl">{user.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </button>

                                    {/* Name & Badge Sector */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <p className={cn(
                                                "font-black text-xl sm:text-4xl uppercase tracking-tighter truncate leading-none italic",
                                                rank === 1 && "text-yellow-400"
                                            )}>
                                                {user.displayName}
                                            </p>
                                            <div className="scale-110 sm:scale-125 origin-left">
                                                <ShowcaseBadge user={user} />
                                            </div>
                                        </div>
                                        <p className="text-[10px] sm:text-xs font-black uppercase text-muted-foreground tracking-[0.3em] mt-3 opacity-60">
                                            {user.mindMateId || 'GENESIS LEGEND'}
                                        </p>
                                    </div>

                                    {/* Primary Score Sector */}
                                    <div className="text-right shrink-0">
                                        <p className={cn(
                                            "text-4xl sm:text-7xl font-black tracking-tighter italic leading-none",
                                            rank === 1 ? "text-yellow-400" : "text-primary"
                                        )}>
                                            {user.totalScore.toLocaleString()}
                                        </p>
                                        <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground mt-1">Tactical Points</p>
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
                                            className="border-t border-white/5 bg-black/40"
                                        >
                                            <div className="p-6 sm:p-10 grid grid-cols-2 md:grid-cols-5 gap-4">
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
                                                    label="Streak (x10)" 
                                                    value={`${user.streak}d`} 
                                                    points={user.breakdown.streakPoints}
                                                    color="text-orange-500"
                                                />
                                                <BreakdownItem 
                                                    icon={Gem} 
                                                    label="Credits (1/2)" 
                                                    value={user.credits.toLocaleString()} 
                                                    points={user.breakdown.creditsPoints}
                                                    color="text-amber-500"
                                                />
                                                <BreakdownItem 
                                                    icon={Target} 
                                                    label="D-Index" 
                                                    value="SOON" 
                                                    points={0}
                                                    color="text-emerald-500"
                                                    isInactive
                                                />
                                            </div>
                                            <div className="px-10 pb-8 text-[10px] font-black uppercase text-center tracking-[0.4em] text-muted-foreground/30 italic">
                                                Authorized by Sovereign Intelligence Mainframe v2.5
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* FIXED PERSONAL RANK CARD */}
            <AnimatePresence>
                {myData && (
                    <motion.div 
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className="fixed bottom-24 left-0 right-0 z-40 px-4 md:px-8 pointer-events-none"
                    >
                        <div className="max-w-7xl mx-auto pointer-events-auto">
                            <Card className="bg-primary border-primary-foreground/20 shadow-[0_-10px_40px_rgba(139,92,246,0.4)] rounded-[2.5rem] p-4 sm:p-6 flex items-center justify-between text-white overflow-hidden relative">
                                <div className="absolute inset-0 bg-grid-white/10 opacity-20" />
                                <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center font-black text-xl sm:text-3xl italic">
                                        #{myRank}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10 sm:h-14 sm:w-14 border-2 border-white/20">
                                            <AvatarImage src={myData.photoURL} />
                                            <AvatarFallback>ME</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-black text-sm sm:text-xl uppercase tracking-widest leading-none">Your Tactical Standing</p>
                                            <p className="text-[10px] font-bold uppercase opacity-70 mt-1">Status: Active Service</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right relative z-10">
                                    <p className="text-2xl sm:text-5xl font-black italic tracking-tighter leading-none">{myData.totalScore.toLocaleString()}</p>
                                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-70">Sovereign Points</p>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function BreakdownItem({ icon: Icon, label, value, points, color, isInactive }: any) {
    return (
        <div className={cn("p-4 rounded-3xl border border-white/5 bg-background/40 flex flex-col items-center text-center gap-1", isInactive && "opacity-40 grayscale")}>
            <div className={cn("p-3 rounded-2xl bg-white/5 mb-2", color)}>
                <Icon className="h-5 w-5" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="text-sm font-bold truncate w-full">{value}</p>
            <div className="h-px w-8 bg-white/10 my-2" />
            <p className={cn("text-sm font-black", color)}>+{points.toLocaleString()} PTS</p>
        </div>
    );
}
