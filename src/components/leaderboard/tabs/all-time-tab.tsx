
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { UserWithStats } from '@/hooks/use-leaderboard-data';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ShowcaseBadge, getOwnedBadges, badgeMeta } from '../shared/badge-renderer';
import { 
    Clock, Flame, Gem, ShieldAlert, 
    Target, Zap, Info, Star, Trophy, 
    EyeOff, CheckCircle, Medal, X, ScrollText 
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
    const [showcaseUser, setShowcaseUser] = useState<UserWithStats | null>(null);
    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const topTwenty = users.slice(0, 20);
    const myRank = users.findIndex(u => u.uid === currentUserId) + 1;
    const myData = users.find(u => u.uid === currentUserId);
    const isNotInTopTwenty = myRank > 20 || myRank === 0;

    const scrollToMe = useCallback(() => {
        if (currentUserId && itemRefs.current[currentUserId]) {
            itemRefs.current[currentUserId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (isNotInTopTwenty) {
            const footer = document.getElementById('personal-rank-footer');
            footer?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentUserId, isNotInTopTwenty]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).scrollToUserRank = scrollToMe;
        }
    }, [scrollToMe]);

    const getTierClasses = (rank: number) => {
        if (rank === 1) return "tier-gold-sober border-yellow-500/50";
        if (rank === 2) return "tier-silver-sober border-slate-300/50";
        if (rank === 3) return "tier-bronze-sober border-amber-700/50";
        return "border-white/5 bg-card/40";
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto w-full pb-60 px-2 sm:px-4">
            {topTwenty.map((user, index) => {
                const rank = index + 1;
                const isMe = user.uid === currentUserId;
                const tierClasses = getTierClasses(rank);
                const ownedBadges = getOwnedBadges(user);

                return (
                    <div key={user.uid} ref={(el) => { if (user.uid) itemRefs.current[user.uid] = el; }}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card 
                                className={cn(
                                    "relative overflow-hidden border-2 transition-all duration-500 rounded-[2rem] sm:rounded-[3rem] shadow-2xl",
                                    isMe ? "ring-2 ring-primary/40 bg-primary/5" : "",
                                    tierClasses
                                )}
                            >
                                <div className="p-4 sm:p-8 flex flex-col gap-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 sm:gap-6">
                                            <div className="flex flex-col items-center justify-center bg-black/20 rounded-2xl h-12 w-12 sm:h-16 sm:w-16 border border-white/5 shrink-0">
                                                <span className="text-[10px] font-black uppercase opacity-40 leading-none mb-1">Rank</span>
                                                <span className="text-xl sm:text-2xl font-black italic">#{rank}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-4">
                                                <button onClick={() => setShowcaseUser(user)} className="relative shrink-0">
                                                    <Avatar className="h-14 w-14 sm:h-20 sm:w-20 border-2 border-white/10 shadow-xl">
                                                        <AvatarImage src={user.photoURL} />
                                                        <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                </button>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="font-black text-lg sm:text-3xl uppercase tracking-tight italic truncate text-white">{user.displayName}</h3>
                                                        <ShowcaseBadge user={user} />
                                                        {user.isLeaderboardPrivate && <EyeOff className="h-4 w-4 opacity-40" />}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                                            {user.mindMateId || 'LEGENDARY CITIZEN'}
                                                        </p>
                                                        <button 
                                                            onClick={() => setShowcaseUser(user)}
                                                            className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 px-2.5 py-1 rounded-full border border-primary/20 transition-all"
                                                        >
                                                            <Medal className="h-3 w-3 text-primary" />
                                                            <span className="text-[9px] font-black text-primary uppercase">{ownedBadges.length} Assets</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-left sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-white/5">
                                            <p className={cn(
                                                "font-black italic tracking-tighter leading-none text-white tabular-nums",
                                                user.totalScore >= 1000000 ? "text-2xl sm:text-6xl" : "text-3xl sm:text-7xl"
                                            )}>
                                                {user.totalScore.toLocaleString()}
                                            </p>
                                            <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-primary mt-2">Sovereign Points</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 border-t border-white/5 pt-6">
                                        <MatrixBlock icon={Clock} label="Study" val={`${formatHours(user.totalStudyTime || 0)}h`} points={user.breakdown.studyPoints} color="text-sky-400" />
                                        <MatrixBlock icon={Flame} label="Streak" val={`${user.streak}d`} points={user.breakdown.streakPoints} color="text-orange-500" />
                                        <MatrixBlock icon={Gem} label="Credits" val={user.credits.toLocaleString()} points={user.breakdown.creditsPoints} color="text-amber-500" />
                                        <MatrixBlock icon={ShieldAlert} label="Exile" val={user.breakdown.isolationLabel.split(' ')[0]} points={user.breakdown.isolationPoints} color="text-red-500" />
                                        <MatrixBlock icon={Medal} label="Assets" val={`${ownedBadges.length}`} points={user.breakdown.badgePoints} color="text-fuchsia-400" className="col-span-2 sm:col-span-1" />
                                    </div>
                                </div>
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
                            <Card className="bg-[#050505]/95 backdrop-blur-3xl border-t-2 border-primary shadow-[0_-20px_60px_rgba(0,0,0,0.8)] rounded-t-[3rem] overflow-hidden">
                                <div className="p-4 sm:p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/20 border-2 border-primary/40 flex flex-col items-center justify-center shrink-0">
                                                <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Rank</span>
                                                <span className="text-xl sm:text-2xl font-black italic">#{myRank}</span>
                                            </div>
                                            <div>
                                                <p className="font-black text-sm sm:text-xl uppercase italic tracking-tighter">Your Standing</p>
                                                <p className="text-[8px] sm:text-[10px] font-bold uppercase text-primary tracking-[0.2em] flex items-center gap-1.5 mt-1">
                                                    <CheckCircle className="h-3 w-3"/> Mainframe Link Active
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl sm:text-5xl font-black italic tracking-tighter text-white tabular-nums">{myData.totalScore.toLocaleString()}</p>
                                            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-40">Points</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-5 gap-2 sm:gap-4 pt-4 border-t border-white/5">
                                        <MatrixBlock icon={Clock} label="Study" val={`${formatHours(myData.totalStudyTime || 0)}h`} points={myData.breakdown.studyPoints} color="text-sky-400" isMini />
                                        <MatrixBlock icon={Flame} label="Streak" val={`${myData.streak}d`} points={myData.breakdown.streakPoints} color="text-orange-500" isMini />
                                        <MatrixBlock icon={Gem} label="Credits" val={myData.credits.toLocaleString()} points={myData.breakdown.creditsPoints} color="text-amber-500" isMini />
                                        <MatrixBlock icon={ShieldAlert} label="Exile" val={myData.breakdown.isolationLabel.split(' ')[0]} points={myData.breakdown.isolationPoints} color="text-red-500" isMini />
                                        <MatrixBlock icon={Medal} label="Assets" val={`${getOwnedBadges(myData).length}`} points={myData.breakdown.badgePoints} color="text-fuchsia-400" isMini />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <BadgeShowcaseDialog user={showcaseUser} onClose={() => setShowcaseUser(null)} />
        </div>
    );
}

function MatrixBlock({ icon: Icon, label, val, points, color, className, isMini = false }: any) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-2 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/[0.03] border border-white/5 transition-all hover:bg-white/[0.06] text-center",
            className
        )}>
            <div className={cn("p-1.5 sm:p-2.5 rounded-xl bg-black/40 mb-2 sm:mb-3 shadow-inner", color)}>
                <Icon className={cn(isMini ? "h-3.5 w-3.5" : "h-5 w-5 sm:h-6 sm:w-6")} />
            </div>
            <p className="text-[7px] sm:text-[9px] font-black uppercase opacity-40 tracking-widest mb-0.5">{label}</p>
            <p className="text-[9px] sm:text-sm font-black truncate max-w-full text-foreground">{val}</p>
            <p className={cn("text-[8px] sm:text-[10px] font-black mt-1", color)}>+{points.toLocaleString()}</p>
        </div>
    );
}

function BadgeShowcaseDialog({ user, onClose }: { user: UserWithStats | null, onClose: () => void }) {
    if (!user) return null;
    const owned = getOwnedBadges(user);

    return (
        <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-xl bg-background/95 backdrop-blur-3xl border-primary/20 p-0 overflow-hidden rounded-[3rem] shadow-2xl">
                <div className="h-32 bg-gradient-to-br from-primary/20 via-background to-background relative">
                    <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/20 text-white hover:bg-destructive/20 hover:text-destructive z-50" onClick={onClose}><X className="h-6 w-6"/></Button>
                </div>
                
                <div className="px-6 sm:px-10 pb-12 -mt-16 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-primary shadow-2xl bg-background">
                            <AvatarImage src={user.photoURL} />
                            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tight">{user.displayName}</h3>
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground mt-2">Identity Registry • {user.mindMateId || 'LEGEND'}</p>
                        </div>
                    </div>

                    <div className="mt-10 space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-primary flex items-center gap-3">
                                <Medal className="h-5 w-5"/> Active Identity Assets
                            </h4>
                            <span className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-full">{owned.length} UNLOCKED</span>
                        </div>

                        <ScrollArea className="h-72 pr-4 sm:pr-6">
                            <div className="space-y-3">
                                {owned.map(key => (
                                    <div key={key} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-white/[0.03] border border-white/5 group hover:border-primary/30 transition-all shadow-inner">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 rounded-2xl bg-background shadow-lg">
                                                <ScrollText className="h-5 w-5 text-primary opacity-40"/>
                                            </div>
                                            <div>
                                                <p className="text-base font-black uppercase italic text-foreground/90">{badgeMeta[key].name}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Mission Validated</p>
                                            </div>
                                        </div>
                                        <div className="scale-90 sm:scale-110 origin-right">{badgeMeta[key].badge}</div>
                                    </div>
                                ))}
                                {owned.length === 0 && (
                                    <div className="py-20 text-center opacity-30 flex flex-col items-center">
                                        <Trophy className="h-16 w-16 mb-4" />
                                        <p className="text-sm font-black uppercase tracking-[0.3em]">No valid signatures found</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        <p className="text-[9px] text-center text-muted-foreground font-black uppercase tracking-[0.3em] italic opacity-40 pt-6">"End of Dossier Record"</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
