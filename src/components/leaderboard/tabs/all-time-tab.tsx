
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
    
    // Directive: Registry separated into frames
    const topThree = users.slice(0, 3);
    const theVanguard = users.slice(3, 20);
    
    // Directive: Find personal rank from the full list
    const myRank = users.findIndex(u => u.uid === currentUserId) + 1;
    const myData = users.find(u => u.uid === currentUserId);

    return (
        <div className="space-y-12 max-w-7xl mx-auto w-full px-0">
            {/* FRAME ALPHA: THE PODIUM */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500/60 flex items-center gap-2">
                        <Star className="h-4 w-4 animate-pulse"/> Frame Alpha: The Podium
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {topThree.map((user, index) => {
                        const rank = index + 1;
                        const isExpanded = expandedId === user.uid;
                        
                        const tierStyles = {
                            1: "border-[#f59e0b] shadow-[0_0_30px_rgba(245,158,11,0.2)] animate-[alpha-rainbow-gold_4s_linear_infinite] bg-gradient-to-br from-yellow-500/10 to-amber-900/20",
                            2: "border-slate-300 shadow-[0_0_20px_rgba(203,213,225,0.2)] animate-[silver-glow_3s_ease-in-out_infinite] bg-gradient-to-br from-slate-400/10 to-slate-800/20",
                            3: "border-[#b45309] shadow-[0_0_15px_rgba(180,83,9,0.2)] animate-[bronze-glow_3s_ease-in-out_infinite] bg-gradient-to-br from-amber-700/10 to-orange-900/20"
                        }[rank as 1|2|3]!;

                        return (
                            <motion.div
                                key={user.uid}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card 
                                    className={cn(
                                        "relative overflow-hidden border-2 cursor-pointer group rounded-[2.5rem] transition-all duration-500",
                                        isExpanded ? "ring-4 ring-primary/20 scale-[1.02]" : "hover:scale-[1.01]",
                                        tierStyles
                                    )}
                                    onClick={() => setExpandedId(isExpanded ? null : user.uid)}
                                >
                                    {user.isLeaderboardPrivate && (
                                        <div className="absolute top-4 right-4 z-20">
                                            <EyeOff className="h-4 w-4 text-white/50" />
                                        </div>
                                    )}
                                    
                                    <div className="p-6 flex flex-col items-center text-center gap-4">
                                        <div className="relative">
                                            <div className="absolute -top-2 -left-2 bg-black/40 px-2 py-0.5 rounded-full font-black text-xs text-white z-10">#{rank}</div>
                                            <button onClick={(e) => { e.stopPropagation(); onUserClick(user); }}>
                                                <Avatar className="h-20 w-20 border-4 border-white/20">
                                                    <AvatarImage src={user.photoURL} />
                                                    <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            </button>
                                        </div>
                                        
                                        <div className="min-w-0 w-full">
                                            <p className="font-black text-lg uppercase tracking-tight truncate italic">{user.displayName}</p>
                                            <div className="flex justify-center mt-1 scale-90"><ShowcaseBadge user={user} /></div>
                                        </div>

                                        <div className="w-full pt-4 border-t border-white/5">
                                            <p className="text-3xl font-black italic tracking-tighter text-white">{user.totalScore.toLocaleString()}</p>
                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Tactical Points</p>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-white/5 bg-black/40 p-4"
                                            >
                                                <div className="grid grid-cols-2 gap-2">
                                                    <MiniBreakdown label="Study" val={`${formatHours(user.totalStudyTime || 0)}h`} color="text-sky-400" />
                                                    <MiniBreakdown label="Isolation" val={user.breakdown.isolationLabel} color="text-red-500" />
                                                    <MiniBreakdown label="Streak" val={`${user.streak}d`} color="text-orange-500" />
                                                    <MiniBreakdown label="Credits" val={user.credits.toLocaleString()} color="text-amber-500" />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* FRAME BETA: THE VANGUARD */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary/60 flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4"/> Frame Beta: The Vanguard
                    </h3>
                </div>
                <div className="space-y-3">
                    {theVanguard.map((user, index) => {
                        const rank = index + 4;
                        const isExpanded = expandedId === user.uid;
                        const isMe = user.uid === currentUserId;

                        return (
                            <motion.div
                                key={user.uid}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                            >
                                <Card 
                                    className={cn(
                                        "relative overflow-hidden transition-all duration-300 border bg-card/40 backdrop-blur-md cursor-pointer rounded-2xl",
                                        isExpanded ? "border-primary ring-1 ring-primary/20" : "hover:border-primary/20",
                                        isMe ? "border-amber-500/30 bg-amber-500/5" : "border-white/5"
                                    )}
                                    onClick={() => setExpandedId(isExpanded ? null : user.uid)}
                                >
                                    <div className="p-4 flex items-center gap-4 sm:gap-6">
                                        <div className="w-8 text-center font-black text-muted-foreground opacity-40 text-lg italic">#{rank}</div>
                                        
                                        <button onClick={(e) => { e.stopPropagation(); onUserClick(user); }}>
                                            <Avatar className="h-12 w-12 border border-white/10">
                                                <AvatarImage src={user.photoURL} />
                                                <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-bold text-base uppercase truncate leading-none">{user.displayName}</p>
                                                <div className="scale-75 origin-left"><ShowcaseBadge user={user} /></div>
                                                {user.isLeaderboardPrivate && <EyeOff className="h-3 w-3 text-white/30" />}
                                            </div>
                                            <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mt-1 opacity-60">
                                                {user.mindMateId || 'GENESIS LEGEND'}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-xl font-black italic text-primary leading-none">{user.totalScore.toLocaleString()}</p>
                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mt-1">Points</p>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-white/5 bg-black/40"
                                            >
                                                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    <BreakdownRow icon={Clock} label="Study" val={`${formatHours(user.totalStudyTime || 0)}h`} color="text-sky-400" />
                                                    <BreakdownRow icon={Flame} label="Streak" val={`${user.streak}d`} color="text-orange-500" />
                                                    <BreakdownRow icon={Gem} label="Credits" val={user.credits.toLocaleString()} color="text-amber-500" />
                                                    <BreakdownRow icon={ShieldAlert} label="Isolation" val={user.breakdown.isolationLabel} color="text-red-500" />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* STICKY BOTTOM PERSONAL MONITOR */}
            <AnimatePresence>
                {myData && (
                    <motion.div 
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className="fixed bottom-[88px] left-0 right-0 z-[100] px-4 md:px-8 pointer-events-none"
                    >
                        <div className="max-w-7xl mx-auto pointer-events-auto">
                            <Card className="bg-[#0a0a0a]/95 backdrop-blur-2xl border-t-2 border-primary shadow-[0_-20px_50px_rgba(0,0,0,0.5)] rounded-t-[2.5rem] p-4 sm:p-6 flex items-center justify-between text-white overflow-hidden relative">
                                <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
                                <div className="flex items-center gap-4 sm:gap-8 relative z-10">
                                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/20 border-2 border-primary/40 flex flex-col items-center justify-center font-black text-xl sm:text-2xl italic leading-none">
                                        <span className="text-[8px] uppercase tracking-widest not-italic opacity-60 mb-1">Rank</span>
                                        #{myRank}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10 sm:h-14 sm:w-14 border-2 border-white/10">
                                            <AvatarImage src={myData.photoURL} />
                                            <AvatarFallback>ME</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-black text-xs sm:text-lg uppercase tracking-widest leading-none">Your Tactical Standing</p>
                                            <p className="text-[8px] font-bold uppercase text-primary tracking-[0.2em] mt-1.5 flex items-center gap-2">
                                                <CheckCircle className="h-3 w-3"/> System Sync Active
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right relative z-10 flex flex-col items-end">
                                    <p className="text-2xl sm:text-5xl font-black italic tracking-tighter leading-none text-primary">{myData.totalScore.toLocaleString()}</p>
                                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Sovereign Points</p>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function MiniBreakdown({ label, val, color }: any) {
    return (
        <div className="bg-black/20 p-2 rounded-xl flex flex-col items-center text-center">
            <p className="text-[7px] font-black uppercase tracking-widest opacity-40">{label}</p>
            <p className={cn("text-[10px] font-black truncate w-full", color)}>{val}</p>
        </div>
    );
}

function BreakdownRow({ icon: Icon, label, val, color }: any) {
    return (
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
            <Icon className={cn("h-3 w-3 shrink-0", color)} />
            <div className="min-w-0">
                <p className="text-[7px] font-black uppercase opacity-40 leading-none">{label}</p>
                <p className="text-[10px] font-bold truncate">{val}</p>
            </div>
        </div>
    );
}
