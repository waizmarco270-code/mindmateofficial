
'use client';

import { useState, useRef, useCallback } from 'react';
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
    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const topTwenty = users.slice(0, 20);
    const myRank = users.findIndex(u => u.uid === currentUserId) + 1;
    const myData = users.find(u => u.uid === currentUserId);
    const isNotInTopTwenty = myRank > 20;

    const scrollToMe = useCallback(() => {
        if (currentUserId && itemRefs.current[currentUserId]) {
            itemRefs.current[currentUserId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setExpandedId(currentUserId);
        }
    }, [currentUserId]);

    // Expose scroll function via window for the parent to call
    if (typeof window !== 'undefined') {
        (window as any).scrollToUserRank = scrollToMe;
    }

    return (
        <div className="space-y-4 max-w-7xl mx-auto w-full pb-40">
            {topTwenty.map((user, index) => {
                const rank = index + 1;
                const isExpanded = expandedId === user.uid;
                const isMe = user.uid === currentUserId;
                
                const tierStyles = {
                    1: "border-[#f59e0b] shadow-[0_0_30px_rgba(245,158,11,0.2)] animate-[alpha-rainbow-gold_4s_linear_infinite] bg-gradient-to-br from-yellow-500/10 to-amber-900/20",
                    2: "border-slate-300 shadow-[0_0_20px_rgba(203,213,225,0.2)] animate-[silver-glow_3s_ease-in-out_infinite] bg-gradient-to-br from-slate-400/10 to-slate-800/20",
                    3: "border-[#b45309] shadow-[0_0_15px_rgba(180,83,9,0.2)] animate-[bronze-glow_3s_ease-in-out_infinite] bg-gradient-to-br from-amber-700/10 to-orange-900/20"
                }[rank as 1|2|3] || (isMe ? "border-primary/30 bg-primary/5" : "border-white/5 bg-card/40");

                return (
                    <div key={user.uid} ref={el => itemRefs.current[user.uid] = el}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <Card 
                                className={cn(
                                    "relative overflow-hidden border-2 cursor-pointer group transition-all duration-500 rounded-[2rem]",
                                    isExpanded ? "ring-4 ring-primary/20 scale-[1.01]" : "hover:scale-[1.005]",
                                    tierStyles
                                )}
                                onClick={() => setExpandedId(isExpanded ? null : user.uid)}
                            >
                                <div className="p-4 sm:p-6 flex items-center gap-4 sm:gap-8">
                                    <div className="w-8 sm:w-12 text-center font-black italic text-xl sm:text-3xl opacity-40">#{rank}</div>
                                    
                                    <button onClick={(e) => { e.stopPropagation(); onUserClick(user); }} className="relative group/avatar">
                                        <div className="absolute -inset-1 bg-primary/20 rounded-full blur opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                                        <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-white/10 relative z-10">
                                            <AvatarImage src={user.photoURL} />
                                            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <p className="font-black text-sm sm:text-xl uppercase tracking-tight truncate italic">{user.displayName}</p>
                                            <ShowcaseBadge user={user} />
                                            {user.isLeaderboardPrivate && <EyeOff className="h-3 w-3 text-white/30" />}
                                        </div>
                                        <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1 opacity-60">
                                            {user.mindMateId || 'GENESIS LEGEND'}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-2xl sm:text-4xl font-black italic tracking-tighter text-white leading-none">{user.totalScore.toLocaleString()}</p>
                                        <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Tactical Points</p>
                                    </div>
                                    
                                    <div className="ml-2 opacity-30 group-hover:opacity-100 transition-opacity">
                                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
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
                                            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                <BreakdownBlock icon={Clock} label="Study" val={`${formatHours(user.totalStudyTime || 0)}h`} points={user.breakdown.studyPoints} color="text-sky-400" />
                                                <BreakdownBlock icon={Flame} label="Streak" val={`${user.streak}d`} points={user.breakdown.streakPoints} color="text-orange-500" />
                                                <BreakdownBlock icon={Gem} label="Credits" val={user.credits.toLocaleString()} points={user.breakdown.creditsPoints} color="text-amber-500" />
                                                <BreakdownBlock icon={ShieldAlert} label="Isolation" val={user.breakdown.isolationLabel} points={user.breakdown.isolationPoints} color="text-red-500" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    </div>
                ))}

                {/* STICKY BOTTOM PERSONAL MONITOR (Only for Rank > 20) */}
                <AnimatePresence>
                    {isNotInTopTwenty && myData && (
                        <motion.div 
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            className="fixed bottom-[88px] left-0 right-0 z-[100] px-4 md:px-8 pointer-events-none"
                        >
                            <div className="max-w-7xl mx-auto pointer-events-auto">
                                <Card 
                                    className="bg-[#0a0a0a]/95 backdrop-blur-2xl border-t-2 border-primary shadow-[0_-20px_50px_rgba(0,0,0,0.5)] rounded-t-[2.5rem] overflow-hidden relative cursor-pointer group"
                                    onClick={() => setExpandedId(expandedId === 'my-rank' ? null : 'my-rank')}
                                >
                                    <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
                                    <div className="p-4 sm:p-6 flex items-center justify-between text-white relative z-10">
                                        <div className="flex items-center gap-4 sm:gap-8">
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
                                        <div className="text-right flex items-center gap-4">
                                            <div className="flex flex-col items-end">
                                                <p className="text-2xl sm:text-5xl font-black italic tracking-tighter leading-none text-primary">{myData.totalScore.toLocaleString()}</p>
                                                <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Sovereign Points</p>
                                            </div>
                                            <div className="opacity-30 group-hover:opacity-100 transition-opacity">
                                                {expandedId === 'my-rank' ? <ChevronUp /> : <ChevronDown />}
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expandedId === 'my-rank' && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-white/10 bg-black/60 p-6"
                                            >
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                    <BreakdownBlock icon={Clock} label="Study" val={`${formatHours(myData.totalStudyTime || 0)}h`} points={myData.breakdown.studyPoints} color="text-sky-400" />
                                                    <BreakdownBlock icon={Flame} label="Streak" val={`${myData.streak}d`} points={myData.breakdown.streakPoints} color="text-orange-500" />
                                                    <BreakdownBlock icon={Gem} label="Credits" val={myData.credits.toLocaleString()} points={myData.breakdown.creditsPoints} color="text-amber-500" />
                                                    <BreakdownBlock icon={ShieldAlert} label="Isolation" val={myData.breakdown.isolationLabel} points={myData.breakdown.isolationPoints} color="text-red-500" />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
        </div>
    );
}

function BreakdownBlock({ icon: Icon, label, val, points, color }: any) {
    return (
        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-2xl border border-white/5 group hover:border-white/10 transition-colors">
            <div className={cn("p-2 rounded-xl bg-black/20", color)}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">{label}</p>
                <p className="text-xs font-bold truncate leading-none">{val}</p>
                <p className={cn("text-[10px] font-black mt-1", color)}>+{points.toLocaleString()} PTS</p>
            </div>
        </div>
    );
}
