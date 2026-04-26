'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useLeaderboardData, UserWithStats } from '@/hooks/use-leaderboard-data';
import { useAdmin, SUPER_ADMIN_UID } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Trophy, Gamepad2, Star, Gem, Crown, 
    Zap, Rocket, Bird, Swords, BrainCircuit, 
    Sigma, Atom, Smile, Clock, ShieldAlert,
    History, ChevronDown, ChevronUp, CheckCircle,
    ArrowRight, Info, EyeOff, Loader2, Maximize2,
    Settings, Globe, Medal, Sparkles, X, LayoutDashboard,
    ScrollText, Orbit, Flame, Brain, ShieldX, Beaker,
    Target, GripVertical, Ruler
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { ShowcaseBadge, getOwnedBadges, badgeMeta } from '../leaderboard/shared/badge-renderer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function ArenaLeaderboard() {
    const { user: currentUser } = useUser();
    const { processedUsers, loading } = useLeaderboardData();
    const { gameHistory, claimGMBounty } = useAdmin();
    
    const [activeTab, setActiveTab] = useState('all-time');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showcaseUser, setShowcaseUser] = useState<UserWithStats | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isMyRankOpen, setIsMyRankOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Sorting Logic
    const sortedUsers = useMemo(() => {
        let pool = [...processedUsers].filter(u => !u.isLeaderboardPrivate || u.uid === currentUser?.id);
        if (activeTab === 'all-time') return pool.sort((a, b) => b.entertainmentTotalScore - a.entertainmentTotalScore);
        // Defaulting to score for now
        return pool.sort((a, b) => b.entertainmentTotalScore - a.entertainmentTotalScore);
    }, [processedUsers, activeTab, currentUser?.id]);

    const topThree = useMemo(() => {
        const top = sortedUsers.slice(0, 3);
        if (top.length < 3) return top;
        return [top[1], top[0], top[2]]; // [2nd, 1st, 3rd]
    }, [sortedUsers]);

    const registry = useMemo(() => sortedUsers.slice(3, 50), [sortedUsers]);
    const myRank = sortedUsers.findIndex(u => u.uid === currentUser?.id) + 1;
    const myData = sortedUsers.find(u => u.uid === currentUser?.id);
    const canClaimGM = myData && myData.entertainmentTotalScore >= 1000 && !myData.isGM;

    const handleClaimGM = async () => {
        if (!currentUser?.id || isProcessing) return;
        setIsProcessing(true);
        try {
            await claimGMBounty(currentUser.id);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-rose-500 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500/60 animate-pulse">Syncing Arena Registry...</p>
        </div>
    );

    return (
        <div className="space-y-12">
            {/* GRANDMASTER ASCENSION BAR */}
            <AnimatePresence>
                {canClaimGM && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="relative p-1 rounded-[2.5rem] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.3)]"
                    >
                        <div className="bg-black/90 backdrop-blur-3xl p-6 rounded-[2.4rem] flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
                            <div className="absolute inset-0 golden-legend-bg opacity-10 animate-pulse" />
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="p-4 rounded-3xl bg-yellow-400/20 border-2 border-yellow-400/40 text-yellow-400 animate-gold-shine">
                                    <Crown className="h-10 w-10" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white">THRESHOLD BREACHED</h3>
                                    <p className="text-xs font-bold text-slate-400 tracking-[0.2em] mt-1 uppercase">Sovereign Authority Activation Requested</p>
                                </div>
                            </div>
                            <Button 
                                onClick={handleClaimGM}
                                disabled={isProcessing}
                                className="h-16 px-12 rounded-2xl font-black text-lg bg-yellow-400 hover:bg-yellow-500 text-black shadow-2xl relative z-10"
                            >
                                {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <Zap className="mr-2 h-5 w-5 fill-current"/>}
                                CLAIM 500 CR + GM BADGE
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12">
                    <TabsList className="h-14 p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl w-full sm:w-auto">
                        <TabsTrigger value="all-time" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-rose-600 data-[state=active]:text-white">All-Time</TabsTrigger>
                        <TabsTrigger value="weekly" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-rose-600 data-[state=active]:text-white">Weekly</TabsTrigger>
                        <TabsTrigger value="monthly" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-rose-600 data-[state=active]:text-white">Monthly</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsMyRankOpen(true)} 
                            className="h-14 rounded-2xl border-rose-500/30 bg-rose-500/5 text-rose-500 font-black uppercase text-[10px] tracking-[0.2em] px-8 flex-1 sm:flex-initial hover:bg-rose-600/10 shadow-lg shadow-rose-900/10"
                        >
                            <Target className="mr-3 h-4 w-4" /> Your Rank Info
                        </Button>
                        <Button variant="outline" onClick={() => setIsHistoryOpen(true)} className="h-14 rounded-2xl border-white/10 bg-white/5 font-black uppercase text-[10px] tracking-[0.2em] px-8 flex-1 sm:flex-initial hover:bg-rose-600/10">
                            <History className="mr-3 h-4 w-4 text-rose-500" /> Archives
                        </Button>
                    </div>
                </div>

                <TabsContent value={activeTab} className="m-0 space-y-12">
                    {/* ARENA PODIUM */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end relative">
                        <div className="lg:col-span-2 grid grid-cols-3 gap-2 sm:gap-8 items-end h-[350px] sm:h-[500px]">
                            {topThree.map((user, idx) => {
                                const originalRank = sortedUsers.findIndex(u => u.uid === user.uid) + 1;
                                const isFirst = originalRank === 1;
                                const stageColor = isFirst ? 'border-yellow-400' : originalRank === 2 ? 'border-slate-300' : 'border-amber-700';
                                
                                return (
                                    <div key={user.uid} className="flex flex-col items-center gap-6 group">
                                        <div className="relative">
                                            <motion.div 
                                                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                                                transition={{ duration: 4, repeat: Infinity }}
                                                className={cn("absolute -inset-4 rounded-full blur-2xl", isFirst ? "bg-yellow-400/20" : "bg-primary/10")}
                                            />
                                            <button 
                                                onClick={() => setShowcaseUser(user)}
                                                className={cn(
                                                    "avatar-frame-base transition-all duration-500 hover:scale-110",
                                                    (user.equippedFrame || 'default') === 'premium' ? 'avatar-frame-premium' : 'avatar-frame-default'
                                                )}
                                            >
                                                <Avatar className={cn(
                                                    "h-12 w-12 sm:h-24 sm:w-24 border-2 shadow-2xl relative z-10 bg-background",
                                                    isFirst && "sm:h-40 sm:w-40 h-24 w-24"
                                                )}>
                                                    <AvatarImage src={user.photoURL} />
                                                    <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            </button>
                                            <div className={cn(
                                                "absolute -bottom-4 left-1/2 -translate-x-1/2 h-6 w-6 sm:h-8 sm:w-8 rounded-full border-2 bg-background flex items-center justify-center font-black italic shadow-xl z-20 text-[10px] sm:text-sm",
                                                stageColor
                                            )}>
                                                {originalRank}
                                            </div>
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-[10px] sm:text-xl font-black uppercase italic tracking-tighter truncate max-w-[70px] sm:max-w-none">{user.displayName}</p>
                                            <div className="scale-75"><ShowcaseBadge user={user} /></div>
                                        </div>
                                        {/* The Arena Pedestal */}
                                        <button 
                                            onClick={() => setShowcaseUser(user)}
                                            className={cn(
                                                "w-full rounded-t-[2rem] border-t-4 bg-gradient-to-b from-white/10 to-transparent transition-all duration-700 hover:brightness-125",
                                                stageColor,
                                                isFirst ? "h-32 sm:h-48" : originalRank === 2 ? "h-24 sm:h-32" : "h-16 sm:h-24"
                                            )}
                                        >
                                            <div className="p-2 sm:p-4 text-center">
                                                <p className="text-sm sm:text-3xl font-black italic tabular-nums text-white">
                                                    {Math.round(user.entertainmentTotalScore).toLocaleString()}
                                                </p>
                                                <p className="text-[6px] sm:text-[9px] font-black uppercase tracking-widest opacity-40">Points</p>
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ARENA INTEL PANEL */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="bg-rose-500/5 border-rose-500/20 rounded-[2.5rem] p-8 relative overflow-hidden">
                                <div className="absolute inset-0 bg-grid-white/5 opacity-20" />
                                <CardHeader className="p-0 mb-6">
                                    <CardTitle className="text-xs font-black uppercase tracking-[0.4em] text-rose-500">Arena Protocols</CardTitle>
                                </CardHeader>
                                <div className="space-y-6 text-xs font-medium leading-relaxed italic text-slate-400">
                                    <p>"The Skill Arena is a merit-based ecosystem. Points are weighted by difficulty: Forge and Chronos carry maximum weight."</p>
                                    <Separator className="bg-white/5" />
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20"><Star className="h-5 w-5 text-rose-500"/></div>
                                        <p>Reach 1000 Skill Points to claim the legendary Grandmaster status.</p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* REGISTRY LIST */}
                    <div className="space-y-4 max-w-5xl mx-auto">
                        <div className="flex items-center justify-between px-6 mb-8">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Arena Registry Index</h4>
                            <div className="flex items-center gap-2">
                                <div className="h-1 w-8 bg-primary rounded-full animate-pulse" />
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Phase v2.5 Stable</p>
                            </div>
                        </div>

                        {registry.map((user, index) => (
                            <ArenaRankCard 
                                key={user.uid}
                                user={user}
                                rank={index + 4}
                                isMe={user.uid === currentUser?.id}
                                isExpanded={expandedId === user.uid}
                                onToggle={() => setExpandedId(expandedId === user.uid ? null : user.uid)}
                                onInspect={() => setShowcaseUser(user)}
                            />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* MY RANK DIALOG */}
            <Dialog open={isMyRankOpen} onOpenChange={setIsMyRankOpen}>
                <DialogContent className="max-w-lg bg-background/95 backdrop-blur-3xl border-rose-500/20 rounded-[3rem] p-0 overflow-hidden shadow-2xl">
                    {myData ? (
                        <>
                            <div className="p-8 bg-rose-500/10 border-b border-rose-500/20">
                                <DialogHeader>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-14 w-14 rounded-2xl bg-rose-500/20 flex items-center justify-center border-2 border-rose-500/40 font-black italic text-2xl text-rose-500">
                                            #{myRank}
                                        </div>
                                        <div>
                                            <DialogTitle className="text-3xl font-black uppercase italic text-white tracking-tighter">Your Skill Status</DialogTitle>
                                            <DialogDescription className="font-bold text-rose-500/60 uppercase text-[10px] tracking-widest">Active Registry Record</DialogDescription>
                                        </div>
                                    </div>
                                </DialogHeader>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("avatar-frame-base", (myData.equippedFrame || 'default') === 'premium' ? 'avatar-frame-premium' : 'avatar-frame-default')}>
                                            <Avatar className="h-16 w-16 border-2 shadow-lg bg-background relative z-10">
                                                <AvatarImage src={myData.photoURL} />
                                                <AvatarFallback>U</AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div>
                                            <p className="font-black text-xl text-white uppercase italic">{myData.displayName}</p>
                                            <div className="scale-90 origin-left"><ShowcaseBadge user={myData} /></div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-black italic tabular-nums text-rose-500">{Math.round(myData.entertainmentTotalScore).toLocaleString()}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Points</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500/60 mb-6 flex items-center gap-2"><LayoutDashboard className="h-3 w-3"/> Detailed Module Dossier</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <DossierItem icon={Ruler} label="Units (Easy)" val={myData.gameHighScores?.unitDimensionsEasy} color="text-sky-400" />
                                    <DossierItem icon={ShieldAlert} label="Units (Hard)" val={myData.gameHighScores?.unitDimensionsHard} color="text-rose-500" />
                                    <DossierItem icon={Orbit} label="Astro Ascent" val={myData.gameHighScores?.astroAscent} color="text-purple-400" />
                                    <DossierItem icon={Beaker} label="Formula Forge" val={myData.gameHighScores?.formulaForge} color="text-rose-600" />
                                    <DossierItem icon={Sigma} label="Math Legend" val={myData.gameHighScores?.mathematicsLegend} color="text-blue-400" />
                                    <DossierItem icon={Atom} label="Element Quest" val={myData.elementQuestTotalScore} color="text-cyan-400" />
                                    <DossierItem icon={Clock} label="Chronos" val={myData.gameHighScores?.chronos} color="text-amber-400" />
                                    <DossierItem icon={Smile} label="Emoji Quiz" val={myData.gameHighScores?.emojiQuiz} color="text-yellow-400" />
                                </div>
                            </div>
                            <DialogFooter className="p-6 bg-muted/20 border-t">
                                <DialogClose asChild><Button className="w-full h-14 rounded-2xl font-black uppercase">Dismiss Briefing</Button></DialogClose>
                            </DialogFooter>
                        </>
                    ) : (
                        <div className="p-12 text-center opacity-40">
                            <ShieldX className="h-16 w-16 mx-auto mb-4" />
                            <p className="font-black uppercase tracking-widest">No registry data manifest.</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* CYCLE ARCHIVES DIALOG */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="max-w-3xl bg-background/95 backdrop-blur-xl border-rose-500/20 rounded-[3rem] p-0 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b bg-rose-500/5">
                        <DialogHeader>
                            <DialogTitle className="text-4xl font-black uppercase italic text-white flex items-center gap-4">
                                <History className="h-10 w-10 text-rose-500"/> Skill Archives
                            </DialogTitle>
                            <DialogDescription className="font-bold text-slate-400">Registry records from previous operational cycles.</DialogDescription>
                        </DialogHeader>
                    </div>
                    <ScrollArea className="h-[500px]">
                        <div className="p-8 space-y-12">
                            {gameHistory.length === 0 ? (
                                <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                                    <ShieldAlert className="h-16 w-16" />
                                    <p className="text-xs font-black uppercase tracking-widest">No historical logs manifest</p>
                                </div>
                            ) : gameHistory.map(entry => (
                                <div key={entry.id} className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                        <h4 className="text-sm font-black uppercase tracking-[0.3em] text-rose-400">Cycle: {format(parseISO(entry.weekStartDate), 'MMMM do')}</h4>
                                        <Badge variant="outline" className="text-[8px] font-black uppercase">Record Sealed</Badge>
                                    </div>
                                    <div className="grid gap-3">
                                        {entry.topPerformers.map((p, i) => (
                                            <div key={p.uid} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-rose-500/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-lg font-black italic opacity-20 w-6">#{i+1}</span>
                                                    <Avatar className="h-10 w-10 border-2 border-white/10"><AvatarImage src={p.photoURL}/><AvatarFallback>U</AvatarFallback></Avatar>
                                                    <span className="font-bold text-sm uppercase truncate max-w-[150px]">{p.displayName}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black italic text-rose-500 tabular-nums">{p.score}</p>
                                                    <p className="text-[8px] font-black uppercase opacity-40">Points</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <DialogFooter className="p-6 bg-muted/20 border-t">
                        <DialogClose asChild><Button className="w-full h-14 rounded-2xl font-black uppercase">Close Archive</Button></DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <BadgeShowcaseDialog user={showcaseUser} onClose={() => setShowcaseUser(null)} />
        </div>
    );
}

function ArenaRankCard({ user, rank, isMe, isExpanded, onToggle, onInspect }: any) {
    const frameId = user.equippedFrame || 'default';
    return (
        <div className="w-full flex flex-col gap-0">
            <Card 
                className={cn(
                    "relative overflow-hidden border-2 border-white/5 bg-card/40 rounded-[1.5rem] sm:rounded-[2.5rem] flex items-center px-4 sm:px-8 h-20 sm:h-24 gap-4 sm:gap-8 transition-all cursor-pointer group",
                    isMe && "bg-rose-500/5 border-rose-500/20",
                    isExpanded && "rounded-b-none border-b-0 ring-1 ring-rose-500/30",
                    "hover:border-rose-500/30"
                )}
                onClick={onToggle}
            >
                <div className="absolute inset-0 bg-grid-white/5 opacity-5 group-hover:opacity-10 transition-opacity" />
                <div className="w-6 sm:w-12 text-center font-black italic text-xl sm:text-4xl opacity-30 group-hover:opacity-60 transition-opacity">#{rank}</div>
                
                <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0 relative z-10">
                    <button onClick={(e) => { e.stopPropagation(); onInspect(); }}>
                        <div className={cn("avatar-frame-base", frameId === 'premium' ? 'avatar-frame-premium' : 'avatar-frame-default')}>
                            <Avatar className="h-10 w-10 sm:h-14 sm:w-14 border-2 shadow-lg bg-background relative z-10">
                                <AvatarImage src={user.photoURL} />
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                        </div>
                    </button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-black text-sm sm:text-2xl uppercase italic tracking-tighter truncate leading-none">{user.displayName}</p>
                            <ShowcaseBadge user={user} />
                        </div>
                        <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-rose-500/60 mt-1">ARCADE OPERATIVE</p>
                    </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-4 sm:gap-8 relative z-10">
                    <div>
                        <p className="text-xl sm:text-4xl font-black italic tracking-tighter leading-none tabular-nums text-white">
                            {Math.round(user.entertainmentTotalScore).toLocaleString()}
                        </p>
                        <p className="text-[8px] font-black uppercase opacity-40 mt-1 tracking-widest text-right">Points</p>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 opacity-40"/> : <ChevronDown className="h-4 w-4 opacity-40"/>}
                </div>
            </Card>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-2 border-white/5 border-t-0 bg-black/60 rounded-b-[2rem] p-4 sm:p-8 overflow-hidden">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
                            <DossierItem icon={Ruler} label="Units (Easy)" val={user.gameHighScores?.unitDimensionsEasy} color="text-sky-400" />
                            <DossierItem icon={ShieldAlert} label="Units (Hard)" val={user.gameHighScores?.unitDimensionsHard} color="text-rose-500" />
                            <DossierItem icon={Orbit} label="Astro Ascent" val={user.gameHighScores?.astroAscent} color="text-purple-400" />
                            <DossierItem icon={Bird} label="Flappy Mind" val={user.gameHighScores?.flappyMind} color="text-sky-400" />
                            <DossierItem icon={Swords} label="Dimension Shift" val={user.gameHighScores?.dimensionShift} color="text-rose-400" />
                            <DossierItem icon={BrainCircuit} label="Subject Sprint" val={user.gameHighScores?.subjectSprint} color="text-emerald-400" />
                            <DossierItem icon={Smile} label="Emoji Quiz" val={user.gameHighScores?.emojiQuiz} color="text-yellow-400" />
                            <DossierItem icon={Sigma} label="Math Legend" val={user.gameHighScores?.mathematicsLegend} color="text-blue-400" />
                            <DossierItem icon={Atom} label="Element Quest" val={user.elementQuestTotalScore} color="text-cyan-400" />
                            <DossierItem icon={Clock} label="Chronos" val={user.gameHighScores?.chronos} color="text-amber-400" />
                            <DossierItem icon={Beaker} label="Formula Forge" val={user.gameHighScores?.formulaForge} color="text-rose-600" />
                            <DossierItem icon={Brain} label="Memory Pattern" val={user.gameHighScores?.memoryGame} color="text-green-500" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function DossierItem({ icon: Icon, label, val, color }: any) {
    return (
        <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-2xl border border-white/5 shadow-inner group/cell hover:border-white/10 transition-all">
            <div className={cn("p-2 rounded-lg bg-black/20 shrink-0 group-hover/cell:scale-110 transition-transform", color)}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
                <p className="text-[7px] sm:text-[8px] font-black uppercase opacity-40 leading-none truncate mb-1">{label}</p>
                <p className="text-[9px] sm:text-sm font-black text-white truncate tabular-nums">{val || 0}</p>
            </div>
        </div>
    );
}

function BadgeShowcaseDialog({ user, onClose }: { user: UserWithStats | null, onClose: () => void }) {
    if (!user) return null;
    const owned = getOwnedBadges(user);
    const frameId = user.equippedFrame || 'default';

    return (
        <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-xl bg-background/95 backdrop-blur-3xl border-rose-500/20 p-0 overflow-hidden rounded-[3rem] shadow-2xl">
                <div className="h-32 bg-gradient-to-br from-rose-500/20 via-background to-background relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/5" />
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/20 text-white hover:bg-destructive/20 hover:text-destructive z-50" onClick={onClose}><X className="h-6 w-6"/></Button>
                </div>
                
                <div className="px-6 sm:px-10 pb-12 -mt-16 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className={cn("avatar-frame-base h-24 w-24 sm:h-32 sm:w-32", frameId === 'premium' ? 'avatar-frame-premium' : 'avatar-frame-default')}>
                            <Avatar className="h-full w-full border-4 shadow-2xl bg-background relative z-10">
                                <AvatarImage src={user.photoURL} />
                                <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div>
                            <h3 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tight leading-none">{user.displayName}</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 mt-2">Arena Identity • {user.mindMateId || 'UNREGISTERED'}</p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-6">
                        <div className="p-6 rounded-[2rem] bg-rose-500/5 border border-rose-500/20">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500/60 mb-6 flex items-center gap-2"><LayoutDashboard className="h-3 w-3"/> Registry Record</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <DossierItem icon={Ruler} label="Units (Easy)" val={user.gameHighScores?.unitDimensionsEasy} color="text-sky-400" />
                                <DossierItem icon={ShieldAlert} label="Units (Hard)" val={user.gameHighScores?.unitDimensionsHard} color="text-rose-500" />
                                <DossierItem icon={Orbit} label="Astro Ascent" val={user.gameHighScores?.astroAscent} color="text-purple-400" />
                                <DossierItem icon={Bird} label="Flappy Mind" val={user.gameHighScores?.flappyMind} color="text-sky-400" />
                                <DossierItem icon={Swords} label="Dimension Shift" val={user.gameHighScores?.dimensionShift} color="text-rose-400" />
                                <DossierItem icon={BrainCircuit} label="Subject Sprint" val={user.gameHighScores?.subjectSprint} color="text-emerald-400" />
                                <DossierItem icon={Smile} label="Emoji Quiz" val={user.gameHighScores?.emojiQuiz} color="text-yellow-400" />
                                <DossierItem icon={Sigma} label="Math Legend" val={user.gameHighScores?.mathematicsLegend} color="text-blue-400" />
                                <DossierItem icon={Atom} label="Element Quest" val={user.elementQuestTotalScore} color="text-cyan-400" />
                                <DossierItem icon={Clock} label="Chronos" val={user.gameHighScores?.chronos} color="text-amber-400" />
                                <DossierItem icon={Beaker} label="Formula Forge" val={user.gameHighScores?.formulaForge} color="text-rose-600" />
                                <DossierItem icon={Brain} label="Memory Pattern" val={user.gameHighScores?.memoryGame} color="text-green-500" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-rose-500 flex items-center gap-3">
                                <Medal className="h-5 w-5"/> Identity Portfolio
                            </h4>
                            <span className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-full">{owned.length} Assets Unlocked</span>
                        </div>

                        <ScrollArea className="h-48 pr-4 sm:pr-6">
                            <div className="space-y-3">
                                {owned.map(key => (
                                    <div key={key} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-white/[0.03] border border-white/5 group hover:border-rose-500/30 transition-all shadow-inner">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 rounded-2xl bg-background shadow-lg">
                                                <ScrollText className="h-5 w-5 text-rose-500 opacity-40"/>
                                            </div>
                                            <div>
                                                <p className="text-base font-black uppercase italic text-foreground/90">{badgeMeta[key].name}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Arena Certified</p>
                                            </div>
                                        </div>
                                        <div className="scale-90 sm:scale-110 origin-right">{badgeMeta[key].badge}</div>
                                    </div>
                                ))}
                                {owned.length === 0 && (
                                    <div className="py-12 text-center opacity-30 flex flex-col items-center">
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

