'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { UserWithStats } from '@/hooks/use-leaderboard-data';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ShowcaseBadge, getOwnedBadges, badgeMeta } from '../shared/badge-renderer';
import { 
    Clock, Flame, Gem, ShieldAlert, 
    ChevronDown, ChevronUp, Target, 
    Zap, Info, Star, Trophy, EyeOff, CheckCircle,
    Medal, X, ScrollText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { SUPER_ADMIN_UID } from '@/hooks/use-admin';

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
    const [showcaseUser, setShowcaseUser] = useState<UserWithStats | null>(null);
    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const topTwenty = users.slice(0, 20);
    const myRank = users.findIndex(u => u.uid === currentUserId) + 1;
    const myData = users.find(u => u.uid === currentUserId);
    const isNotInTopTwenty = myRank > 20 || myRank === 0;

    const scrollToMe = useCallback(() => {
        if (currentUserId && itemRefs.current[currentUserId]) {
            itemRefs.current[currentUserId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setExpandedId(currentUserId);
        } else if (isNotInTopTwenty) {
            setExpandedId('my-rank');
            const footer = document.getElementById('personal-rank-footer');
            footer?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentUserId, isNotInTopTwenty]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).scrollToUserRank = scrollToMe;
        }
    }, [scrollToMe]);

    const getTierStyles = (rank: number, isMe: boolean) => {
        if (rank === 1) return "border-[#f59e0b] shadow-[0_0_30px_rgba(245,158,11,0.2)] animate-[alpha-rainbow-gold_4s_linear_infinite] bg-gradient-to-br from-yellow-500/10 to-amber-900/20";
        if (rank === 2) return "border-slate-300 shadow-[0_0_20px_rgba(203,213,225,0.2)] animate-[silver-glow_3s_ease-in-out_infinite] bg-gradient-to-br from-slate-400/10 to-slate-800/20";
        if (rank === 3) return "border-[#b45309] shadow-[0_0_15px_rgba(180,83,9,0.2)] animate-[bronze-glow_3s_ease-in-out_infinite] bg-gradient-to-br from-amber-700/10 to-orange-900/20";
        if (isMe) return "border-primary/30 bg-primary/5";
        return "border-white/5 bg-card/40";
    };

    return (
        <div className="space-y-4 max-w-7xl mx-auto w-full pb-40 px-2 sm:px-4">
            {topTwenty.map((user, index) => {
                const rank = index + 1;
                const isExpanded = expandedId === user.uid;
                const isMe = user.uid === currentUserId;
                const tierStyles = getTierStyles(rank, isMe);
                const ownedBadges = getOwnedBadges(user);

                return (
                    <div key={user.uid} ref={(el) => { if (user.uid) itemRefs.current[user.uid] = el; }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <Card 
                                className={cn(
                                    "relative overflow-hidden border-2 cursor-pointer group transition-all duration-500 rounded-[2rem] sm:rounded-[2.5rem]",
                                    isExpanded ? "ring-4 ring-primary/20 scale-[1.01]" : "hover:scale-[1.005]",
                                    tierStyles
                                )}
                                onClick={() => setExpandedId(isExpanded ? null : user.uid)}
                            >
                                <div className="p-4 sm:p-6 flex items-center gap-3 sm:gap-8">
                                    {/* Rank Indicator */}
                                    <div className="w-8 sm:w-12 text-center font-black italic text-xl sm:text-3xl opacity-40 shrink-0">#{rank}</div>
                                    
                                    {/* Avatar Zone */}
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            setShowcaseUser(user); 
                                        }} 
                                        className="relative group/avatar shrink-0"
                                    >
                                        <div className="absolute -inset-1 bg-primary/20 rounded-full blur opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                                        <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-white/10 relative z-10">
                                            <AvatarImage src={user.photoURL} />
                                            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </button>

                                    {/* User Identity Zone */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-black text-sm sm:text-xl uppercase tracking-tight truncate italic">{user.displayName}</p>
                                            <ShowcaseBadge user={user} />
                                            {user.isLeaderboardPrivate && (
                                                <div className="flex items-center gap-1 text-white/40">
                                                    <EyeOff className="h-3 w-3" />
                                                    <span className="text-[8px] font-black uppercase hidden sm:inline">Phantom</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-1.5 flex-wrap">
                                            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                                {user.mindMateId || 'LEGEND'}
                                            </p>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setShowcaseUser(user); }}
                                                className="flex items-center gap-1 sm:gap-1.5 bg-primary/10 hover:bg-primary/20 px-2 py-0.5 rounded-full border border-primary/20 transition-all"
                                            >
                                                <Medal className="h-2.5 w-2.5 text-primary" />
                                                <span className="text-[8px] sm:text-[9px] font-black text-primary uppercase">{ownedBadges.length} Assets</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Score Zone - Fluid Typography */}
                                    <div className="text-right shrink-0">
                                        <p className={cn(
                                            "font-black italic tracking-tighter text-white leading-none tabular-nums",
                                            user.totalScore >= 1000000 ? "text-xl sm:text-4xl" : "text-2xl sm:text-5xl"
                                        )}>
                                            {user.totalScore.toLocaleString()}
                                        </p>
                                        <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Tactical Points</p>
                                    </div>
                                    
                                    <div className="ml-1 sm:ml-2 opacity-30 group-hover:opacity-100 transition-opacity hidden sm:block">
                                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
                                            <div className="p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
                                                <BreakdownBlock icon={Clock} label="Study" val={`${formatHours(user.totalStudyTime || 0)}h`} points={user.breakdown.studyPoints} color="text-sky-400" />
                                                <BreakdownBlock icon={Flame} label="Streak" val={`${user.streak}d`} points={user.breakdown.streakPoints} color="text-orange-500" />
                                                <BreakdownBlock icon={Gem} label="Credits" val={user.credits.toLocaleString()} points={user.breakdown.creditsPoints} color="text-amber-500" />
                                                <BreakdownBlock icon={ShieldAlert} label="Isolation" val={user.breakdown.isolationLabel} points={user.breakdown.isolationPoints} color="text-red-500" />
                                                <BreakdownBlock icon={Medal} label="Badges" val={`${ownedBadges.length}`} points={user.breakdown.badgePoints} color="text-fuchsia-400" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    </div>
                );
            })}

            <AnimatePresence>
                {isNotInTopTwenty && myData && (
                    <motion.div 
                        id="personal-rank-footer"
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className="fixed bottom-[80px] sm:bottom-[88px] left-0 right-0 z-[100] px-2 sm:px-4 pointer-events-none"
                    >
                        <div className="max-w-7xl mx-auto pointer-events-auto">
                            <Card 
                                className="bg-[#0a0a0a]/95 backdrop-blur-2xl border-t-2 border-primary shadow-[0_-20px_50px_rgba(0,0,0,0.5)] rounded-t-[2rem] overflow-hidden relative cursor-pointer group"
                                onClick={() => setExpandedId(expandedId === 'my-rank' ? null : 'my-rank')}
                            >
                                <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
                                <div className="p-4 sm:p-6 flex items-center justify-between text-white relative z-10">
                                    <div className="flex items-center gap-3 sm:gap-8">
                                        <div className="h-10 w-10 sm:h-16 sm:w-16 rounded-full bg-primary/20 border-2 border-primary/40 flex flex-col items-center justify-center font-black text-sm sm:text-2xl italic leading-none shrink-0">
                                            <span className="text-[6px] sm:text-[8px] uppercase tracking-widest not-italic opacity-60 mb-0.5 sm:mb-1">Rank</span>
                                            #{myRank}
                                        </div>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="h-8 w-8 sm:h-14 sm:w-14 border-2 border-white/10 shrink-0">
                                                <AvatarImage src={myData.photoURL} />
                                                <AvatarFallback>ME</AvatarFallback>
                                            </Avatar>
                                            <div className="truncate">
                                                <p className="font-black text-[10px] sm:text-lg uppercase tracking-widest leading-none truncate">Personal Standing</p>
                                                <p className="text-[7px] sm:text-[8px] font-bold uppercase text-primary tracking-[0.2em] mt-1 sm:mt-1.5 flex items-center gap-1.5">
                                                    <CheckCircle className="h-2 w-2 sm:h-3 sm:w-3"/> System Sync Active
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <div className="flex flex-col items-end">
                                            <p className={cn(
                                                "font-black italic tracking-tighter leading-none text-primary tabular-nums",
                                                myData.totalScore >= 1000000 ? "text-xl sm:text-5xl" : "text-2xl sm:text-6xl"
                                            )}>{myData.totalScore.toLocaleString()}</p>
                                            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Sovereign Points</p>
                                        </div>
                                        <div className="opacity-30 group-hover:opacity-100 transition-opacity">
                                            {expandedId === 'my-rank' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedId === 'my-rank' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-white/10 bg-black/60 p-4 sm:p-6"
                                        >
                                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
                                                <BreakdownBlock icon={Clock} label="Study" val={`${formatHours(myData.totalStudyTime || 0)}h`} points={myData.breakdown.studyPoints} color="text-sky-400" />
                                                <BreakdownBlock icon={Flame} label="Streak" val={`${myData.streak}d`} points={myData.breakdown.streakPoints} color="text-orange-500" />
                                                <BreakdownBlock icon={Gem} label="Credits" val={myData.credits.toLocaleString()} points={myData.breakdown.creditsPoints} color="text-amber-500" />
                                                <BreakdownBlock icon={ShieldAlert} label="Isolation" val={myData.breakdown.isolationLabel} points={myData.breakdown.isolationPoints} color="text-red-500" />
                                                <BreakdownBlock icon={Medal} label="Badges" val={`${getOwnedBadges(myData).length}`} points={myData.breakdown.badgePoints} color="text-fuchsia-400" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BadgeShowcaseDialog 
                user={showcaseUser} 
                onClose={() => setShowcaseUser(null)} 
            />
        </div>
    );
}

function BreakdownBlock({ icon: Icon, label, val, points, color }: any) {
    return (
        <div className="flex items-center gap-3 sm:gap-4 bg-white/5 p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-white/5 group hover:border-white/10 transition-colors">
            <div className={cn("p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-black/20 shrink-0", color)}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 text-left">
                <p className="text-[7px] sm:text-[8px] font-black uppercase opacity-40 leading-none mb-0.5 sm:mb-1">{label}</p>
                <p className="text-[10px] sm:text-xs font-bold truncate leading-none">{val}</p>
                <p className={cn("text-[8px] sm:text-[10px] font-black mt-0.5 sm:mt-1", color)}>+{points.toLocaleString()}</p>
            </div>
        </div>
    );
}

function BadgeShowcaseDialog({ user, onClose }: { user: UserWithStats | null, onClose: () => void }) {
    if (!user) return null;
    const owned = getOwnedBadges(user);

    return (
        <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-xl bg-background/95 backdrop-blur-xl border-primary/20 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
                <div className="h-32 bg-gradient-to-br from-primary/20 via-background to-background relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/5" />
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/20 text-white hover:bg-destructive/20 hover:text-destructive" onClick={onClose}><X className="h-4 w-4"/></Button>
                </div>
                
                <div className="px-6 sm:px-8 pb-10 -mt-12 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-primary shadow-2xl bg-background">
                            <AvatarImage src={user.photoURL} />
                            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight">{user.displayName}</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Identity Dossier • {user.mindMateId || 'LEGEND'}</p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-6">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
                                <Medal className="h-4 w-4"/> Verified Assets
                            </h4>
                            <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase">{owned.length} Badges Unlocked</span>
                        </div>

                        <ScrollArea className="h-64 pr-2 sm:pr-4">
                            <div className="space-y-3">
                                {owned.map(key => (
                                    <div key={key} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-white/5 group hover:border-primary/20 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-background shadow-inner">
                                                <ScrollText className="h-4 w-4 text-primary opacity-40"/>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{badgeMeta[key].name}</p>
                                                <p className="text-[9px] text-muted-foreground font-medium">Unlocked through merit.</p>
                                            </div>
                                        </div>
                                        <div className="scale-75 sm:scale-90 origin-right">{badgeMeta[key].badge}</div>
                                    </div>
                                ))}
                                {owned.length === 0 && (
                                    <div className="py-12 text-center opacity-30 flex flex-col items-center">
                                        <Trophy className="h-12 w-12 mb-2" />
                                        <p className="text-xs font-black uppercase tracking-widest">No assets found</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        <p className="text-[8px] sm:text-[9px] text-center text-muted-foreground font-bold uppercase tracking-widest italic opacity-60 pt-4">"Viewing all badges this user's Identity record holds"</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
