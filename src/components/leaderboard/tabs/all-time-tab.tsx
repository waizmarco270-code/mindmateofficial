
'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { UserWithStats } from '@/hooks/use-leaderboard-data';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ShowcaseBadge, getOwnedBadges, badgeMeta } from '../shared/badge-renderer';
import { 
    Clock, Flame, Gem, ShieldAlert, 
    Target, Zap, Info, Star, Trophy, 
    EyeOff, CheckCircle, Medal, X, ScrollText, ArrowLeft, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

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
    const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
    const [activePodiumRank, setActivePodiumRank] = useState<number | null>(null);
    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const topThree = useMemo(() => {
        // Special ordering for 2-1-3 layout
        const winners = users.slice(0, 3);
        if (winners.length < 3) return winners;
        return [winners[1], winners[0], winners[2]]; // [2nd, 1st, 3rd]
    }, [users]);

    const registry = useMemo(() => users.slice(3, 20), [users]);
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

    const handleFlip = (uid: string) => {
        setFlippedCards(prev => ({ ...prev, [uid]: !prev[uid] }));
    };

    return (
        <div className="space-y-12 max-w-7xl mx-auto w-full pb-60 px-2 sm:px-4">
            
            {/* THE GLASS PODIUM STAGE */}
            <div className="perspective-1000 w-full h-[320px] sm:h-[400px] relative">
                <motion.div
                    animate={{ rotateY: activePodiumRank ? 180 : 0 }}
                    transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 20 }}
                    className="w-full h-full preserve-3d relative"
                >
                    {/* FRONT: THE STAGE */}
                    <div className="absolute inset-0 backface-hidden">
                        <Card className="h-full bg-white/5 backdrop-blur-3xl border-2 border-white/10 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden relative">
                            <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                            
                            <div className="flex items-end justify-center gap-4 sm:gap-12 w-full max-w-2xl relative z-10">
                                {topThree.map((user, index) => {
                                    // Identify actual rank from users array
                                    const actualRank = users.findIndex(u => u.uid === user.uid) + 1;
                                    const isFirst = actualRank === 1;
                                    
                                    return (
                                        <div key={user.uid} className="flex flex-col items-center gap-4">
                                            <div className="relative group">
                                                <Trophy className={cn(
                                                    "h-6 w-6 sm:h-8 sm:w-8 absolute -top-8 left-1/2 -translate-x-1/2 animate-float-trophy",
                                                    actualRank === 1 ? "text-yellow-400" : actualRank === 2 ? "text-slate-300" : "text-amber-700"
                                                )} />
                                                <button 
                                                    onClick={() => setActivePodiumRank(actualRank)}
                                                    className={cn(
                                                        "relative p-1 rounded-full transition-all duration-500 hover:scale-110",
                                                        actualRank === 1 ? "gold-glow" : actualRank === 2 ? "silver-glow" : "bronze-glow"
                                                    )}
                                                >
                                                    <Avatar className={cn(
                                                        "h-16 w-16 sm:h-24 sm:w-24 border-2 border-background shadow-2xl",
                                                        isFirst ? "sm:h-32 sm:w-32" : ""
                                                    )}>
                                                        <AvatarImage src={user.photoURL} />
                                                        <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                </button>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[10px] sm:text-xs font-black uppercase tracking-tighter text-white/80 truncate max-w-[80px] sm:max-w-[120px]">
                                                    {user.displayName.split(' ')[0]}
                                                </p>
                                                <div className="mt-1 opacity-60 scale-75">
                                                    <ShowcaseBadge user={user} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            <div className="mt-8 text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 animate-pulse">Tap Avatar to Inspect</p>
                            </div>
                        </Card>
                    </div>

                    {/* BACK: THE DATA REVEAL */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180">
                        <Card className="h-full bg-slate-900/90 backdrop-blur-3xl border-2 border-primary/30 rounded-[3rem] shadow-2xl overflow-hidden relative">
                            <div className="absolute inset-0 bg-grid-slate-800/50" />
                            
                            <AnimatePresence mode="wait">
                                {activePodiumRank && (
                                    <motion.div 
                                        key={activePodiumRank}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="h-full p-6 sm:p-10 flex flex-col relative z-10"
                                    >
                                        <div className="flex items-center justify-between">
                                            <Button variant="ghost" onClick={() => setActivePodiumRank(null)} className="h-10 px-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10">
                                                <ArrowLeft className="mr-2 h-4 w-4"/> Back to Stage
                                            </Button>
                                            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/40 font-black italic text-xl">
                                                #{activePodiumRank}
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col items-center justify-center gap-6">
                                            <div className="text-center space-y-2">
                                                <h3 className="text-3xl sm:text-5xl font-black uppercase italic tracking-tighter text-white">
                                                    {users[activePodiumRank - 1]?.displayName}
                                                </h3>
                                                <div className="flex items-center justify-center gap-3">
                                                    <ShowcaseBadge user={users[activePodiumRank - 1]} />
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                                                        {users[activePodiumRank - 1]?.mindMateId || 'LEGEND'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="w-full max-w-md p-6 sm:p-8 bg-black/40 rounded-[2.5rem] border border-white/5 shadow-inner text-center">
                                                <p className="text-5xl sm:text-7xl font-black italic tracking-tighter text-primary tabular-nums drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                                                    {users[activePodiumRank - 1]?.totalScore.toLocaleString()}
                                                </p>
                                                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-2">Sovereign Points</p>
                                            </div>

                                            <div className="grid grid-cols-4 gap-2 w-full max-w-lg">
                                                <QuickStat icon={Clock} val={`${formatHours(users[activePodiumRank - 1]?.totalStudyTime || 0)}h`} color="text-sky-400" />
                                                <QuickStat icon={Flame} val={`${users[activePodiumRank - 1]?.streak}d`} color="text-orange-500" />
                                                <QuickStat icon={Gem} val={users[activePodiumRank - 1]?.credits.toLocaleString()} color="text-amber-500" />
                                                <QuickStat icon={Medal} val={`${getOwnedBadges(users[activePodiumRank - 1]).length}`} color="text-fuchsia-400" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </div>
                </motion.div>
            </div>

            {/* THE KINETIC REGISTRY (RANK 4-20) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-4 mb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Registry Index</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Tap Card to Inspect Stats</p>
                </div>
                {registry.map((user, index) => (
                    <RegistryFlipCard 
                        key={user.uid}
                        user={user}
                        rank={index + 4}
                        isMe={user.uid === currentUserId}
                        isFlipped={!!flippedCards[user.uid]}
                        onFlip={() => handleFlip(user.uid)}
                        onShowcase={() => setShowcaseUser(user)}
                        itemRef={(el) => { if (user.uid) itemRefs.current[user.uid] = el; }}
                    />
                ))}
            </div>

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

function QuickStat({ icon: Icon, val, color }: any) {
    return (
        <div className="bg-white/5 rounded-2xl p-2 flex flex-col items-center border border-white/5 shadow-inner">
            <Icon className={cn("h-4 w-4 mb-1", color)} />
            <span className="text-[10px] font-black text-white truncate w-full text-center">{val}</span>
        </div>
    );
}

function RegistryFlipCard({ user, rank, isMe, isFlipped, onFlip, onShowcase, itemRef }: any) {
    const ownedBadges = getOwnedBadges(user);

    return (
        <div ref={itemRef} className="perspective-1000 w-full h-[88px] sm:h-20 relative cursor-pointer" onClick={onFlip}>
            <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                className="w-full h-full preserve-3d relative"
            >
                {/* FRONT: THE HUD */}
                <div className="absolute inset-0 backface-hidden">
                    <Card className={cn(
                        "h-full border border-white/5 bg-card/40 rounded-2xl sm:rounded-3xl flex items-center px-4 sm:px-8 gap-4 sm:gap-8 transition-colors",
                        isMe && "bg-primary/5 border-primary/20"
                    )}>
                        <div className="w-6 sm:w-10 text-center font-black italic text-lg sm:text-2xl opacity-30">#{rank}</div>
                        
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <button onClick={(e) => { e.stopPropagation(); onShowcase(); }}>
                                <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-white/10 shadow-lg bg-background">
                                    <AvatarImage src={user.photoURL} />
                                    <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </button>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="font-black text-sm sm:text-lg uppercase italic truncate">{user.displayName}</p>
                                    <div className="scale-75 origin-left hidden sm:block">
                                        <ShowcaseBadge user={user} />
                                    </div>
                                    {user.isLeaderboardPrivate && <EyeOff className="h-3 w-3 opacity-40" />}
                                </div>
                                <div className="flex items-center gap-2 sm:hidden">
                                    <div className="scale-75 origin-left">
                                        <ShowcaseBadge user={user} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-xl sm:text-3xl font-black italic tracking-tighter leading-none tabular-nums">
                                {user.totalScore.toLocaleString()}
                            </p>
                            <p className="text-[8px] font-black uppercase opacity-40 mt-1">Points</p>
                        </div>
                    </Card>
                </div>

                {/* BACK: THE DATA MATRIX */}
                <div className="absolute inset-0 backface-hidden rotate-y-180">
                    <Card className="h-full border-primary/30 bg-primary/10 rounded-2xl sm:rounded-3xl flex items-center px-2 sm:px-6">
                        <div className="grid grid-cols-5 gap-1 sm:gap-4 w-full">
                            <MatrixBlock icon={Clock} label="Study" val={`${formatHours(user.totalStudyTime || 0)}h`} points={user.breakdown.studyPoints} color="text-sky-400" isMini />
                            <MatrixBlock icon={Flame} label="Streak" val={`${user.streak}d`} points={user.breakdown.streakPoints} color="text-orange-500" isMini />
                            <MatrixBlock icon={Gem} label="Credits" val={user.credits.toLocaleString()} points={user.breakdown.creditsPoints} color="text-amber-500" isMini />
                            <MatrixBlock icon={ShieldAlert} label="Exile" val={user.breakdown.isolationLabel.split(' ')[0]} points={user.breakdown.isolationPoints} color="text-red-500" isMini />
                            <MatrixBlock icon={Medal} label="Assets" val={`${getOwnedBadges(user).length}`} points={user.breakdown.badgePoints} color="text-fuchsia-400" isMini />
                        </div>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
}

function MatrixBlock({ icon: Icon, label, val, points, color, className, isMini = false }: any) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-1 sm:p-2 rounded-xl sm:rounded-2xl bg-black/20 border border-white/5 text-center",
            className
        )}>
            <div className={cn("p-1 rounded-lg bg-black/40 mb-1 shadow-inner", color)}>
                <Icon className={cn(isMini ? "h-3 w-3" : "h-5 w-5")} />
            </div>
            <p className="text-[6px] sm:text-[8px] font-black uppercase opacity-40 leading-none truncate w-full px-1">{label}</p>
            <p className="text-[8px] sm:text-xs font-black truncate max-w-full text-foreground">{val}</p>
            <p className={cn("text-[6px] sm:text-[9px] font-black mt-0.5", color)}>+{points.toLocaleString()}</p>
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
