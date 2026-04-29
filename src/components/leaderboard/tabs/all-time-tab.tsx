
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
        const winners = users.slice(0, 3);
        if (winners.length < 3) return winners;
        return [winners[1], winners[0], winners[2]]; // [2nd, 1st, 3rd]
    }, [users]);

    const registry = useMemo(() => users.slice(3, 50), [users]);

    const scrollToMe = useCallback(() => {
        if (currentUserId && itemRefs.current[currentUserId]) {
            itemRefs.current[currentUserId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentUserId]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).scrollToUserRank = scrollToMe;
        }
    }, [scrollToMe]);

    const handleFlip = (uid: string) => {
        setFlippedCards(prev => ({ ...prev, [uid]: !prev[uid] }));
    };

    return (
        <div className="space-y-12 max-w-7xl mx-auto w-full pb-60 px-2 sm:px-4 relative">
            
            {/* THE GLASS PODIUM STAGE */}
            <div className="perspective-1000 w-full h-[350px] sm:h-[480px] relative z-10">
                <motion.div
                    animate={{ rotateY: activePodiumRank ? 180 : 0 }}
                    transition={{ duration: 0.8, type: 'spring', stiffness: 100, damping: 20 }}
                    className="w-full h-full preserve-3d relative"
                >
                    {/* FRONT: THE STAGE */}
                    <div className="absolute inset-0 backface-hidden">
                        <Card className="h-full bg-white/5 backdrop-blur-3xl border-2 border-white/10 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden relative">
                            <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
                            
                            <div className="flex items-end justify-center gap-4 sm:gap-12 w-full max-w-2xl relative z-10">
                                {topThree.map((user) => {
                                    const actualRank = users.findIndex(u => u.uid === user.uid) + 1;
                                    const isFirst = actualRank === 1;
                                    const equippedFrameId = user.equippedFrame || 'default';
                                    
                                    // Legendary Colorful Backgrounds
                                    const podiumStyles = {
                                        1: "bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 border-yellow-300 shadow-yellow-500/40",
                                        2: "bg-gradient-to-br from-slate-300 via-blue-400 to-indigo-600 border-slate-200 shadow-blue-500/30",
                                        3: "bg-gradient-to-br from-orange-800 via-red-700 to-rose-900 border-orange-600 shadow-red-500/30",
                                    }[actualRank as 1|2|3] || "bg-white/5";

                                    return (
                                        <div key={user.uid} className="flex flex-col items-center gap-4">
                                            <div className="relative group">
                                                <Trophy className={cn(
                                                    "h-6 w-6 sm:h-8 sm:w-8 absolute -top-8 left-1/2 -translate-x-1/2 animate-float-trophy",
                                                    actualRank === 1 ? "text-yellow-400" : actualRank === 2 ? "text-slate-200" : "text-orange-500"
                                                )} />
                                                <button 
                                                    onClick={() => setActivePodiumRank(actualRank)}
                                                    className={cn(
                                                        "avatar-frame-base transition-all duration-500 hover:scale-110",
                                                        equippedFrameId === 'premium' ? "avatar-frame-premium" : "border-4 border-white/20 p-1"
                                                    )}
                                                >
                                                    <Avatar className={cn(
                                                        "h-16 w-16 sm:h-24 sm:w-24 border-2 border-background shadow-2xl relative z-10 bg-background",
                                                        isFirst ? "sm:h-32 sm:w-32" : ""
                                                    )}>
                                                        <AvatarImage src={user.photoURL} />
                                                        <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                </button>
                                                <div className={cn(
                                                    "absolute -bottom-4 left-1/2 -translate-x-1/2 h-6 w-6 sm:h-8 sm:w-8 rounded-full border-2 bg-background flex items-center justify-center font-black italic shadow-xl z-20 text-[10px] sm:text-sm",
                                                    actualRank === 1 ? "border-yellow-400" : actualRank === 2 ? "border-slate-300" : "border-amber-700"
                                                )}>
                                                    {actualRank}
                                                </div>
                                            </div>
                                            <div className="text-center mt-4">
                                                <p className="text-[10px] sm:text-base font-black uppercase italic text-white truncate max-w-[80px] sm:max-w-[150px]">
                                                    {user.displayName}
                                                </p>
                                                <div className="mt-1 scale-90">
                                                    <ShowcaseBadge user={user} />
                                                </div>
                                                {/* THE COLOURFUL LEGENDARY PEDESTAL */}
                                                <button 
                                                    onClick={() => setActivePodiumRank(actualRank)}
                                                    className={cn(
                                                        "mt-4 w-24 sm:w-40 rounded-t-3xl border-t-4 border-x-2 transition-all duration-700 hover:brightness-110",
                                                        podiumStyles,
                                                        isFirst ? "h-24 sm:h-40" : actualRank === 2 ? "h-20 sm:h-28" : "h-14 sm:h-20"
                                                    )}
                                                >
                                                     <p className="text-sm sm:text-3xl font-black italic tabular-nums text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
                                                        {user.totalScore.toLocaleString()}
                                                    </p>
                                                    <p className="text-[6px] sm:text-[9px] font-black uppercase tracking-widest text-white/60">Points</p>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    </div>

                    {/* BACK: THE TACTICAL DOSSIER */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180">
                        <Card className="h-full bg-slate-950/95 backdrop-blur-3xl border-2 border-primary/30 rounded-[3rem] shadow-2xl overflow-hidden relative">
                            <div className="absolute inset-0 bg-grid-slate-800/50 opacity-20" />
                            
                            <AnimatePresence mode="wait">
                                {activePodiumRank && (
                                    <motion.div 
                                        key={activePodiumRank}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="h-full p-4 sm:p-10 flex flex-col relative z-10"
                                    >
                                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                                            <Button variant="ghost" onClick={() => setActivePodiumRank(null)} className="h-9 px-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-[10px] uppercase tracking-widest">
                                                <ArrowLeft className="mr-2 h-3.5 w-3.5"/> Back to Stage
                                            </Button>
                                            <div className="h-9 w-9 sm:h-12 sm:w-12 bg-primary/20 rounded-2xl flex items-center justify-center border-2 border-primary/40 font-black italic text-lg sm:text-xl text-primary">
                                                #{activePodiumRank}
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-row gap-4 sm:gap-10 items-stretch">
                                            {/* LEFT PANE: IDENTITY */}
                                            <div className="w-[35%] sm:w-[30%] flex flex-col items-center justify-center gap-4 shrink-0 border-r border-white/5 pr-4 sm:pr-10">
                                                <div className={cn("avatar-frame-base", (users[activePodiumRank - 1]?.equippedFrame || 'default') === 'premium' ? 'avatar-frame-premium' : 'avatar-frame-default')}>
                                                    <Avatar className="h-20 w-20 sm:h-40 sm:w-40 border-4 shadow-2xl relative z-10 bg-background">
                                                        <AvatarImage src={users[activePodiumRank - 1]?.photoURL} />
                                                        <AvatarFallback>U</AvatarFallback>
                                                    </Avatar>
                                                </div>
                                                <div className="text-center space-y-1">
                                                    <h3 className="text-sm sm:text-2xl font-black uppercase italic tracking-tighter text-white truncate max-w-full">
                                                        {users[activePodiumRank - 1]?.displayName}
                                                    </h3>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="scale-75"><ShowcaseBadge user={users[activePodiumRank - 1]} /></div>
                                                        <span className="text-[7px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-widest">{users[activePodiumRank - 1]?.mindMateId || 'LEGEND'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* RIGHT PANE: MISSION DATA TABLE */}
                                            <div className="flex-1 flex flex-col justify-center space-y-4">
                                                <div className="bg-black/40 rounded-[1.5rem] p-4 sm:p-6 border border-white/5 shadow-inner">
                                                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-1">Live Standing</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <p className="text-2xl sm:text-5xl font-black italic tracking-tighter text-white tabular-nums">
                                                            {users[activePodiumRank - 1]?.totalScore.toLocaleString()}
                                                        </p>
                                                        <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-40">Total Points</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <DossierCell icon={Clock} label="Study Time" val={`${formatHours(users[activePodiumRank - 1]?.totalStudyTime || 0)}h`} color="text-sky-400" />
                                                    <DossierCell icon={Flame} label="Active Streak" val={`${users[activePodiumRank - 1]?.streak}d`} color="text-orange-500" />
                                                    <DossierCell icon={Gem} label="Mainframe Credits" val={users[activePodiumRank - 1]?.credits.toLocaleString()} color="text-amber-500" />
                                                    <DossierCell icon={ShieldAlert} label="Exile Phase" val={users[activePodiumRank - 1]?.breakdown.isolationLabel.split(' ')[0]} color="text-red-500" />
                                                    <div className="col-span-2">
                                                        <DossierCell icon={Medal} label="Identity Assets Unlocked" val={`${getOwnedBadges(users[activePodiumRank - 1]).length} Badges`} color="text-fuchsia-400" isWide />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </div>
                </motion.div>
            </div>

            {/* THE KINETIC REGISTRY (RANK 4+) */}
            <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between px-4 mb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Registry Index</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tap Card to Inspect Dossier</p>
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

            <BadgeShowcaseDialog user={showcaseUser} onClose={() => showcaseUser && setShowcaseUser(null)} />
        </div>
    );
}

function DossierCell({ icon: Icon, label, val, color, isWide = false }: any) {
    return (
        <div className={cn(
            "flex items-center gap-3 p-2 sm:p-3 bg-black/20 rounded-xl border border-white/5 shadow-inner",
            isWide && "justify-center"
        )}>
            <div className={cn("p-1.5 rounded-lg bg-black/20 shrink-0", color)}>
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
            <div className="min-w-0">
                <p className="text-[7px] sm:text-[8px] font-black uppercase opacity-40 leading-none truncate mb-0.5">{label}</p>
                <p className="text-[9px] sm:text-xs font-black text-white truncate">{val}</p>
            </div>
        </div>
    );
}

function RegistryFlipCard({ user, rank, isMe, isFlipped, onFlip, onShowcase, itemRef }: any) {
    const equippedFrameId = user.equippedFrame || 'default';
    return (
        <div ref={itemRef} className="perspective-1000 w-full h-[88px] sm:h-24 relative cursor-pointer" onClick={onFlip}>
            <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                className="w-full h-full preserve-3d relative"
            >
                {/* FRONT: THE HUD */}
                <div className="absolute inset-0 backface-hidden">
                    <Card className={cn(
                        "h-full border border-white/5 bg-card/40 rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center px-4 sm:px-8 gap-4 sm:gap-8 transition-colors",
                        isMe && "bg-primary/5 border-primary/20"
                    )}>
                        <div className="w-6 sm:w-10 text-center font-black italic text-lg sm:text-2xl opacity-40">#{rank}</div>
                        
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <button onClick={(e) => { e.stopPropagation(); onShowcase(); }}>
                                <div className={cn("avatar-frame-base", equippedFrameId === 'premium' ? 'avatar-frame-premium' : 'avatar-frame-default')}>
                                    <Avatar className={cn("h-10 w-10 sm:h-14 sm:w-14 border-2 shadow-lg bg-background relative z-10")}>
                                        <AvatarImage src={user.photoURL} />
                                        <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </div>
                            </button>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-black text-sm sm:text-xl uppercase italic tracking-tight truncate">{user.displayName}</p>
                                    <div className="scale-90 origin-left">
                                        <ShowcaseBadge user={user} />
                                    </div>
                                    {user.isLeaderboardPrivate && <EyeOff className="h-3 w-3 opacity-40" />}
                                </div>
                                <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mt-0.5">
                                    {user.mindMateId || 'LEGEND'}
                                </p>
                            </div>
                        </div>

                        <div className="text-right shrink-0">
                            <p className="text-xl sm:text-4xl font-black italic tracking-tighter leading-none tabular-nums text-white">
                                {user.totalScore.toLocaleString()}
                            </p>
                            <p className="text-[8px] font-black uppercase opacity-40 mt-1 tracking-widest">Total Points</p>
                        </div>
                    </Card>
                </div>

                {/* BACK: THE DATA DOSSIER */}
                <div className="absolute inset-0 backface-hidden rotate-y-180">
                    <Card className="h-full border-primary/30 bg-slate-900/95 rounded-[1.5rem] sm:rounded-[2.5rem] flex items-stretch p-2 sm:p-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
                        
                        {/* LEFT PANE: IDENTITY */}
                        <div className="w-[30%] flex flex-col items-center justify-center gap-1 border-r border-white/5 pr-2 sm:pr-4">
                            <div className={cn("avatar-frame-base", equippedFrameId === 'premium' ? 'avatar-frame-premium' : 'avatar-frame-default')}>
                                <Avatar className={cn("h-10 w-10 sm:h-14 sm:w-14 border-2 shrink-0 bg-background relative z-10")}>
                                    <AvatarImage src={user.photoURL} />
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                            </div>
                            <p className="text-[8px] font-black uppercase text-primary truncate w-full text-center">{user.displayName.split(' ')[0]}</p>
                        </div>

                        {/* RIGHT PANE: TABLE DATA */}
                        <div className="flex-1 grid grid-cols-2 gap-1 sm:gap-2 pl-2 sm:pl-4 relative z-10 self-center">
                            <DossierCell icon={Clock} label="Study" val={`${formatHours(user.totalStudyTime || 0)}h`} color="text-sky-400" />
                            <DossierCell icon={Flame} label="Streak" val={`${user.streak}d`} color="text-orange-500" />
                            <DossierCell icon={Gem} label="Credits" val={user.credits.toLocaleString()} color="text-amber-500" />
                            <DossierCell icon={ShieldAlert} label="Exile" val={user.breakdown.isolationLabel.split(' ')[0]} color="text-red-500" />
                        </div>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
}

function BadgeShowcaseDialog({ user, onClose }: { user: UserWithStats | null, onClose: () => void }) {
    if (!user) return null;
    const owned = getOwnedBadges(user);
    const equippedFrameId = user.equippedFrame || 'default';

    return (
        <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-xl bg-background/95 backdrop-blur-3xl border-primary/20 p-0 overflow-hidden rounded-[3rem] shadow-2xl">
                <div className="h-32 bg-gradient-to-br from-primary/20 via-background to-background relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/20 text-white hover:bg-destructive/20 hover:text-destructive z-50" onClick={onClose}><X className="h-6 w-6"/></Button>
                </div>
                
                <div className="px-6 sm:px-10 pb-12 -mt-16 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className={cn("avatar-frame-base h-24 w-24 sm:h-32 sm:w-32", equippedFrameId === 'premium' ? 'avatar-frame-premium' : 'avatar-frame-default')}>
                            <Avatar className={cn("h-full w-full border-4 shadow-2xl bg-background relative z-10")}>
                                <AvatarImage src={user.photoURL} />
                                <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div>
                            {user.isPlusMember && (
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] premium-text-gradient mb-1">MindMate Plus Member</p>
                            )}
                            <h3 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tight leading-none">{user.displayName}</h3>
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
