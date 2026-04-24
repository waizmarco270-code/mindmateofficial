
'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { UserWithStats } from '@/hooks/use-leaderboard-data';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ShowcaseBadge, getOwnedBadges, badgeMeta } from '../shared/badge-renderer';
import { 
    Gamepad2, History, Trophy, Star, 
    ChevronDown, ChevronUp, CheckCircle, 
    X, Medal, Gem, Orbit, Bird, 
    Swords, BrainCircuit, Sigma, Atom, 
    FlaskConical, Smile, EyeOff, ScrollText, Brain, Clock, ShieldCheck,
    ChevronRight, ArrowLeft, Loader2, Zap, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/hooks/use-admin';
import { format, parseISO } from 'date-fns';

interface GameZoneTabProps {
    users: UserWithStats[];
    currentUserId?: string;
    onUserClick: (user: UserWithStats) => void;
}

export function GameZoneTab({ users, currentUserId, onUserClick }: GameZoneTabProps) {
    const { gameHistory, claimGMBounty } = useAdmin();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showcaseUser, setShowcaseUser] = useState<UserWithStats | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<any | null>(null);
    const [isClaiming, setIsProcessingClaim] = useState(false);
    
    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const topThree = useMemo(() => {
        const winners = users.slice(0, 3);
        if (winners.length < 3) return winners;
        return [winners[1], winners[0], winners[2]]; // [2nd, 1st, 3rd]
    }, [users]);

    const registry = useMemo(() => users.slice(3, 30), [users]);
    const myRank = users.findIndex(u => u.uid === currentUserId) + 1;
    const myData = users.find(u => u.uid === currentUserId);
    const isNotInTopThirty = myRank > 30 || myRank === 0;

    const canClaimGM = myData && myData.entertainmentTotalScore >= 1000 && !myData.isGM;

    const scrollToMe = useCallback(() => {
        if (currentUserId && itemRefs.current[currentUserId]) {
            itemRefs.current[currentUserId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setExpandedId(currentUserId);
        } else if (isNotInTopThirty) {
            setExpandedId('my-rank');
            const footer = document.getElementById('personal-skill-footer');
            footer?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [currentUserId, isNotInTopThirty]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).scrollToUserRank = scrollToMe;
        }
    }, [scrollToMe]);

    const handleClaimBounty = async () => {
        if (!currentUserId || isClaiming) return;
        setIsProcessingClaim(true);
        try {
            await claimGMBounty(currentUserId);
        } finally {
            setIsProcessingClaim(false);
        }
    };

    return (
        <div className="space-y-12 max-w-7xl mx-auto w-full pb-60 px-2 sm:px-4">
            
            {/* BOUNTY CLAIM BAR */}
            <AnimatePresence>
                {canClaimGM && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-1 rounded-[2rem] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 shadow-2xl shadow-yellow-500/30"
                    >
                        <div className="bg-black/90 backdrop-blur-xl p-4 sm:p-6 rounded-[1.9rem] flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-yellow-400/20 text-yellow-400 border border-yellow-400/30">
                                    <Crown className="h-8 w-8 animate-bounce" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h4 className="text-xl font-black uppercase italic text-yellow-400 tracking-tighter">THRESHOLD BREACHED</h4>
                                    <p className="text-xs font-medium text-slate-300">You have crossed 1000 Skill Points. Claim your Grandmaster status.</p>
                                </div>
                            </div>
                            <Button 
                                onClick={handleClaimBounty} 
                                disabled={isClaiming}
                                className="h-14 px-10 rounded-2xl font-black uppercase text-sm bg-yellow-400 hover:bg-yellow-500 text-black shadow-xl"
                            >
                                {isClaiming ? <Loader2 className="animate-spin" /> : "CLAIM 500 CR + GM BADGE"}
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PODIUM STAGE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
                <div className="lg:col-span-8 h-[350px] sm:h-[480px]">
                    <Card className="h-full bg-slate-950/40 backdrop-blur-3xl border-2 border-white/5 rounded-[3rem] shadow-2xl flex flex-col items-center justify-center p-4 sm:p-8 overflow-hidden relative">
                        <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
                        <div className="flex items-end justify-center gap-4 sm:gap-12 w-full max-w-2xl relative z-10">
                            {topThree.map((user) => {
                                const actualRank = users.findIndex(u => u.uid === user.uid) + 1;
                                const isFirst = actualRank === 1;
                                const equippedFrameId = user.equippedFrame || 'default';
                                
                                return (
                                    <div key={user.uid} className="flex flex-col items-center gap-4">
                                        <div className="relative group">
                                            <Gamepad2 className={cn(
                                                "h-6 w-6 sm:h-8 sm:w-8 absolute -top-8 left-1/2 -translate-x-1/2 animate-float-trophy",
                                                actualRank === 1 ? "text-yellow-400" : actualRank === 2 ? "text-slate-300" : "text-amber-700"
                                            )} />
                                            <button 
                                                onClick={() => setExpandedId(user.uid)}
                                                className={cn(
                                                    "avatar-frame-base transition-all duration-500 hover:scale-110",
                                                    equippedFrameId === 'premium' ? "avatar-frame-premium" : (actualRank === 1 ? "gold-glow" : actualRank === 2 ? "silver-glow" : "bronze-glow")
                                                )}
                                            >
                                                <Avatar className={cn(
                                                    "h-16 w-16 sm:h-24 sm:w-24 border-2 border-background shadow-2xl",
                                                    isFirst ? "sm:h-32 sm:w-32" : ""
                                                )}>
                                                    <AvatarImage src={user.photoURL} />
                                                    <AvatarFallback>U</AvatarFallback>
                                                </Avatar>
                                            </button>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] sm:text-xs font-black uppercase text-white truncate max-w-[80px] sm:max-w-[120px] italic">
                                                {user.displayName.split(' ')[0]}
                                            </p>
                                            <div className="mt-1 scale-90">
                                                <ShowcaseBadge user={user} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-4">
                    <Card className="bg-muted/20 border-white/5 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Historical Archives</h5>
                            <Button variant="ghost" size="sm" onClick={() => setIsHistoryOpen(true)} className="h-6 text-[8px] font-black uppercase tracking-widest bg-white/5 border border-white/10">Access Logs</Button>
                        </div>
                        <div className="space-y-3">
                            {gameHistory.slice(0, 3).map(h => (
                                <div key={h.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-black/20 border border-white/5 group hover:border-primary/20 transition-all cursor-pointer" onClick={() => { setSelectedHistoryEntry({ user: h.topPerformers[0], date: h.weekStartDate }); }}>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-6 w-6 border border-white/10"><AvatarImage src={h.topPerformers[0]?.photoURL}/></Avatar>
                                        <span className="font-bold opacity-60">{format(parseISO(h.weekStartDate), 'MMM d')}</span>
                                    </div>
                                    <Trophy className="h-3 w-3 text-amber-500 opacity-20 group-hover:opacity-100 transition-opacity"/>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* THE SKILL REGISTRY */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-4 mb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500/60">Registry Phase Index</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tap Card for Tactical Dossier</p>
                </div>
                {registry.map((user, index) => (
                    <RegistryFlipCard 
                        key={user.uid}
                        user={user}
                        rank={index + 4}
                        isMe={user.uid === currentUserId}
                        isExpanded={expandedId === user.uid}
                        onClick={() => setExpandedId(expandedId === user.uid ? null : user.uid)}
                        onShowcase={() => setShowcaseUser(user)}
                        itemRef={(el) => { if (user.uid) itemRefs.current[user.uid] = el; }}
                    />
                ))}
            </div>

            <AnimatePresence>
                {isNotInTopThirty && myData && (
                    <motion.div 
                        id="personal-skill-footer"
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className="fixed bottom-[80px] sm:bottom-[88px] left-0 right-0 z-[100] px-2 sm:px-4 pointer-events-none"
                    >
                        <div className="max-w-7xl mx-auto pointer-events-auto">
                            <Card 
                                className="bg-[#050505]/95 backdrop-blur-3xl border-t-2 border-rose-600 shadow-[0_-20px_60px_rgba(0,0,0,0.8)] rounded-t-[2.5rem] overflow-hidden cursor-pointer"
                                onClick={() => setExpandedId(expandedId === 'my-rank' ? null : 'my-rank')}
                            >
                                <div className="p-4 sm:p-8 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-rose-500/20 border-2 border-rose-500/40 flex flex-col items-center justify-center shrink-0">
                                            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">Skill</span>
                                            <span className="text-xl sm:text-2xl font-black italic">#{myRank}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black text-xs sm:text-xl uppercase italic tracking-tighter truncate">Personal Standing</p>
                                            <p className="text-[8px] sm:text-[10px] font-bold uppercase text-rose-500 tracking-[0.2em] flex items-center gap-1.5 mt-1">
                                                <CheckCircle className="h-3 w-3"/> Arcade Uplink Active
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl sm:text-5xl font-black italic tracking-tighter text-white tabular-nums">{Math.round(myData.entertainmentTotalScore).toLocaleString()}</p>
                                        <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-40">Skill Points</p>
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {expandedId === 'my-rank' && <DossierExpansion user={myData} />}
                                </AnimatePresence>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="max-w-3xl bg-background/95 backdrop-blur-xl border-primary/20 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
                    <div className="p-6 sm:p-8 border-b bg-muted/20">
                        <DialogHeader>
                            <DialogTitle className="text-2xl sm:text-3xl font-black uppercase italic flex items-center gap-3">
                                <History className="h-8 w-8 text-primary"/> Skill Registry Archive
                            </DialogTitle>
                            <DialogDescription className="text-xs sm:text-base font-medium">Historical Top 5 Game Masters from previous operational cycles.</DialogDescription>
                        </DialogHeader>
                    </div>
                    <ScrollArea className="h-[500px]">
                        <div className="p-4 sm:p-8 space-y-8">
                            {gameHistory.map((entry, i) => (
                                <div key={entry.id} className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-primary">Cycle: {format(parseISO(entry.weekStartDate), 'MMM d')}</h4>
                                        <Badge variant="outline" className="text-[8px] font-black uppercase">Operational Record</Badge>
                                    </div>
                                    <div className="grid gap-2">
                                        {entry.topPerformers.map((p, idx) => (
                                            <button 
                                                key={p.uid} 
                                                onClick={() => setSelectedHistoryEntry({ user: p, date: entry.weekStartDate })}
                                                className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-white/5 hover:border-primary/30 transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black w-4 text-muted-foreground">#{idx + 1}</span>
                                                    <Avatar className="h-8 w-8 border">
                                                        <AvatarImage src={p.photoURL}/>
                                                        <AvatarFallback>U</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-bold text-xs sm:text-sm truncate max-w-[150px] text-foreground">{p.displayName}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs sm:text-sm font-black text-primary tabular-nums">{p.score}</p>
                                                    <p className="text-[8px] font-black uppercase opacity-40">Points</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            <Dialog open={!!selectedHistoryEntry} onOpenChange={(o) => !o && setSelectedHistoryEntry(null)}>
                <DialogContent className="max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none">
                    {selectedHistoryEntry && (
                        <Card className="border-amber-500/30 bg-background/95 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="text-center bg-amber-500/10 p-8">
                                <div className="mx-auto w-20 h-20 rounded-full bg-amber-500/20 border-4 border-amber-500/40 flex items-center justify-center mb-4">
                                    <Trophy className="h-10 w-10 text-amber-500 animate-gold-shine" />
                                </div>
                                <CardTitle className="text-2xl font-black uppercase italic tracking-tight text-foreground">{selectedHistoryEntry.user.displayName}</CardTitle>
                                <CardDescription className="font-bold text-amber-600 dark:text-amber-400 uppercase text-[10px] tracking-widest">
                                    Week of {format(parseISO(selectedHistoryEntry.date), 'MMMM do')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <DossierItem icon={Orbit} label="Astro" val={selectedHistoryEntry.user.scores.astroAscent} color="text-purple-400" />
                                    <DossierItem icon={Bird} label="Flappy" val={selectedHistoryEntry.user.scores.flappyMind} color="text-sky-400" />
                                    <DossierItem icon={Swords} label="Shift" val={selectedHistoryEntry.user.scores.dimensionShift} color="text-rose-400" />
                                    <DossierItem icon={BrainCircuit} label="Sprint" val={selectedHistoryEntry.user.scores.subjectSprint} color="text-emerald-400" />
                                    <DossierItem icon={Smile} label="Emoji" val={selectedHistoryEntry.user.scores.emojiQuiz} color="text-yellow-400" />
                                    <DossierItem icon={Sigma} label="Math" val={selectedHistoryEntry.user.scores.mathematicsLegend} color="text-blue-400" />
                                </div>
                                <div className="pt-4 border-t border-white/5 text-center">
                                    <p className="text-3xl font-black text-amber-500 italic tabular-nums">{selectedHistoryEntry.user.score}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Operational Skill Points</p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <DialogClose asChild>
                                    <Button className="w-full h-12 rounded-xl font-bold">UPLINK CLOSED</Button>
                                </DialogClose>
                            </CardFooter>
                        </Card>
                    )}
                </DialogContent>
            </Dialog>

            <BadgeShowcaseDialog user={showcaseUser} onClose={() => showcaseUser && setShowcaseUser(null)} />
        </div>
    );
}

function DossierExpansion({ user }: { user: UserWithStats }) {
    return (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/10 bg-black/60 p-4 sm:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                <DossierItem icon={Orbit} label="Astro Ascent" val={user.gameHighScores?.astroAscent} color="text-purple-400" />
                <DossierItem icon={Bird} label="Flappy Mind" val={user.gameHighScores?.flappyMind} color="text-sky-400" />
                <DossierItem icon={Swords} label="Dimension Shift" val={user.gameHighScores?.dimensionShift} color="text-rose-400" />
                <DossierItem icon={BrainCircuit} label="Subject Sprint" val={user.gameHighScores?.subjectSprint} color="text-emerald-400" />
                <DossierItem icon={Smile} label="Emoji Quiz" val={user.gameHighScores?.emojiQuiz} color="text-yellow-400" />
                <DossierItem icon={Sigma} label="Mathematics Legend" val={user.gameHighScores?.mathematicsLegend} color="text-blue-400" />
                <DossierItem icon={Atom} label="Element Quest" val={user.elementQuestTotalScore} color="text-cyan-400" />
                <DossierItem icon={Brain} label="Memory Pattern" val={user.gameHighScores?.memoryGame} color="text-green-400" />
            </div>
        </motion.div>
    );
}

function DossierItem({ icon: Icon, label, val, color }: any) {
    return (
        <div className="flex items-center gap-3 p-2 sm:p-3 bg-white/5 rounded-xl sm:rounded-2xl border border-white/5">
            <div className={cn("p-1.5 sm:p-2 rounded-lg bg-black/20 shrink-0", color)}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
                <p className="text-[7px] sm:text-[8px] font-black uppercase opacity-40 leading-none truncate mb-1">{label}</p>
                <p className="text-[9px] sm:text-xs font-black text-white truncate tabular-nums">{val || 0}</p>
            </div>
        </div>
    );
}

function RegistryFlipCard({ user, rank, isMe, isExpanded, onClick, onShowcase, itemRef }: any) {
    const equippedFrameId = user.equippedFrame || 'default';
    return (
        <div ref={itemRef} className="w-full flex flex-col gap-0">
            <Card 
                className={cn(
                    "relative overflow-hidden border border-white/5 bg-card/40 rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center px-4 sm:px-8 h-20 sm:h-24 gap-4 sm:gap-8 transition-all cursor-pointer",
                    isMe && "bg-rose-500/5 border-rose-500/20",
                    isExpanded && "rounded-b-none border-b-0 ring-1 ring-rose-500/20"
                )}
                onClick={onClick}
            >
                <div className="w-6 sm:w-10 text-center font-black italic text-xl sm:text-3xl opacity-40">#{rank}</div>
                
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <button onClick={(e) => { e.stopPropagation(); onShowcase(); }}>
                        <div className={cn("avatar-frame-base", equippedFrameId === 'premium' ? 'avatar-frame-premium' : 'avatar-frame-default')}>
                            <Avatar className="h-10 w-10 sm:h-14 sm:w-14 border-2 shadow-lg bg-background relative z-10">
                                <AvatarImage src={user.photoURL} />
                                <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                    </button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-black text-sm sm:text-xl uppercase italic tracking-tight truncate">{user.displayName}</p>
                            <ShowcaseBadge user={user} />
                            {user.isLeaderboardPrivate && <EyeOff className="h-3 w-3 opacity-40" />}
                        </div>
                        <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mt-0.5">
                            {user.mindMateId || 'ARCADE ELITE'}
                        </p>
                    </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-4">
                    <div>
                        <p className="text-xl sm:text-4xl font-black italic tracking-tighter leading-none tabular-nums text-white">
                            {Math.round(user.entertainmentTotalScore).toLocaleString()}
                        </p>
                        <p className="text-[8px] font-black uppercase opacity-40 mt-1 tracking-widest">Skill Points</p>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 opacity-40"/> : <ChevronDown className="h-4 w-4 opacity-40"/>}
                </div>
            </Card>

            <AnimatePresence>
                {isExpanded && <DossierExpansion user={user} />}
            </AnimatePresence>
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
                <div className="h-32 bg-gradient-to-br from-rose-500/20 via-background to-background relative">
                    <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/20 text-white hover:bg-destructive/20 hover:text-destructive z-50" onClick={onClose}><X className="h-6 w-6"/></Button>
                </div>
                
                <div className="px-6 sm:px-10 pb-12 -mt-16 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className={cn("avatar-frame-base h-24 w-24 sm:h-32 sm:w-32", equippedFrameId === 'premium' ? 'avatar-frame-premium' : 'avatar-frame-default')}>
                            <Avatar className={cn("h-full w-full border-4 shadow-2xl bg-background")}>
                                <AvatarImage src={user.photoURL} />
                                <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div>
                            <h3 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tight">{user.displayName}</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Arcade Registry • {user.mindMateId || 'LEGEND'}</p>
                        </div>
                    </div>

                    <div className="mt-10 space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-rose-500 flex items-center gap-3">
                                <Award className="h-5 w-5"/> Verified Assets
                            </h4>
                            <span className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-full">{owned.length} UNLOCKED</span>
                        </div>

                        <ScrollArea className="h-64 pr-4 sm:pr-6">
                            <div className="space-y-3">
                                {owned.map(key => (
                                    <div key={key} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-white/[0.03] border border-white/5 group hover:border-rose-500/30 transition-all shadow-inner">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 rounded-2xl bg-background shadow-lg">
                                                <ScrollText className="h-5 w-5 text-rose-500 opacity-40"/>
                                            </div>
                                            <div>
                                                <p className="text-base font-black uppercase italic text-foreground/90">{badgeMeta[key].name}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Asset Log Secured</p>
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

function Badge({ children, variant, className }: any) {
    return <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", className)}>{children}</span>;
}
