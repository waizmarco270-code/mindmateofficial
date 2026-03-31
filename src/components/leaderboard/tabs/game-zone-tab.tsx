
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
    FlaskConical, Smile, EyeOff, ScrollText, Brain, Clock, ShieldCheck
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
    const { gameHistory } = useAdmin();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showcaseUser, setShowcaseUser] = useState<UserWithStats | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<any | null>(null);
    
    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const topTwenty = users.slice(0, 20);
    const myRank = users.findIndex(u => u.uid === currentUserId) + 1;
    const myData = users.find(u => u.uid === currentUserId);
    const isNotInTopTwenty = myRank > 20 || myRank === 0;

    const lastWeekWinner = gameHistory[0]?.topPerformers[0];

    const scrollToMe = useCallback(() => {
        if (currentUserId && itemRefs.current[currentUserId]) {
            itemRefs.current[currentUserId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setExpandedId(currentUserId);
        } else if (isNotInTopTwenty) {
            setExpandedId('my-rank');
            const footer = document.getElementById('personal-skill-footer');
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
        if (isMe) return "border-rose-500/30 bg-rose-500/5";
        return "border-white/5 bg-card/40";
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto w-full pb-40 px-2 sm:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-rose-500/5 border-rose-500/20">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Gamepad2 className="h-8 w-8 text-rose-500 animate-pulse" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Skill Registry</p>
                                <p className="font-bold">Weekly Arcade Cycle</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest border-primary/20" onClick={() => setIsHistoryOpen(true)}>
                            <History className="mr-2 h-3 w-3"/> View History
                        </Button>
                    </CardContent>
                </Card>

                {lastWeekWinner && (
                    <Card className="bg-amber-500/5 border-amber-500/20 cursor-pointer group" onClick={() => setSelectedHistoryEntry({ user: lastWeekWinner, date: gameHistory[0].weekStartDate })}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Trophy className="h-8 w-8 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last Week Champion</p>
                                    <p className="font-bold truncate max-w-[150px]">{lastWeekWinner.displayName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-black text-amber-500">{Math.round(lastWeekWinner.score)}</p>
                                <p className="text-[8px] font-black uppercase opacity-40">Skill Points</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="space-y-4">
                {topTwenty.map((user, index) => {
                    const rank = index + 1;
                    const isExpanded = expandedId === user.uid;
                    const isMe = user.uid === currentUserId;
                    const tierStyles = getTierStyles(rank, isMe);
                    const ownedBadges = getOwnedBadges(user);

                    return (
                        <div key={user.uid} ref={(el) => { if (user.uid) itemRefs.current[user.uid] = el; }}>
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}>
                                <Card 
                                    className={cn(
                                        "relative overflow-hidden border-2 cursor-pointer group transition-all duration-500 rounded-[2.5rem]",
                                        isExpanded ? "ring-4 ring-rose-500/20 scale-[1.01]" : "hover:scale-[1.005]",
                                        tierStyles,
                                        rank <= 3 && "min-h-[100px]"
                                    )}
                                    onClick={() => setExpandedId(isExpanded ? null : user.uid)}
                                >
                                    <div className="p-4 sm:p-6 flex items-center gap-4 sm:gap-8">
                                        <div className="w-8 sm:w-12 text-center font-black italic text-xl sm:text-3xl opacity-40">#{rank}</div>
                                        
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setShowcaseUser(user); }} 
                                            className="relative group/avatar shrink-0"
                                        >
                                            <div className="absolute -inset-1 bg-rose-500/20 rounded-full blur opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                                            <Avatar className={cn("h-12 w-12 sm:h-16 sm:w-16 border-2 border-white/10 relative z-10", rank === 1 && "h-16 w-16 sm:h-20 sm:w-20")}>
                                                <AvatarImage src={user.photoURL} />
                                                <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <p className={cn("font-black text-sm sm:text-xl uppercase tracking-tight truncate italic", rank === 1 && "text-lg sm:text-2xl")}>{user.displayName}</p>
                                                <ShowcaseBadge user={user} />
                                                {user.isLeaderboardPrivate && (
                                                    <div className="flex items-center gap-1 text-white/40">
                                                        <EyeOff className="h-3 w-3" />
                                                        <span className="text-[8px] font-black uppercase">Stealth</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 mt-1">
                                                {user.mindMateId || 'ELITE ARCADE GAMER'}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className={cn("text-2xl sm:text-4xl font-black italic tracking-tighter text-white leading-none", rank === 1 && "text-3xl sm:text-5xl")}>{Math.round(user.entertainmentTotalScore).toLocaleString()}</p>
                                            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Skill Points</p>
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
                                                    <SkillBlock icon={Orbit} label="Astro Ascent" score={user.gameHighScores?.astroAscent} color="text-purple-400" />
                                                    <SkillBlock icon={Bird} label="Flappy Mind" score={user.gameHighScores?.flappyMind} color="text-sky-400" />
                                                    <SkillBlock icon={Swords} label="Dim. Shift" score={user.gameHighScores?.dimensionShift} color="text-rose-400" />
                                                    <SkillBlock icon={BrainCircuit} label="Sub. Sprint" score={user.gameHighScores?.subjectSprint} color="text-emerald-400" />
                                                    <SkillBlock icon={Smile} label="Emoji Quiz" score={user.gameHighScores?.emojiQuiz} color="text-yellow-400" />
                                                    <SkillBlock icon={Sigma} label="Math Legend" score={user.gameHighScores?.mathematicsLegend} color="text-blue-400" />
                                                    <SkillBlock icon={Atom} label="Element Quest" score={(user.elementQuestScores?.s || 0) + (user.elementQuestScores?.p || 0) + (user.elementQuestScores?.d || 0) + (user.elementQuestScores?.f || 0)} color="text-cyan-400" />
                                                    <SkillBlock icon={Brain} label="Memory Pattern" score={user.gameHighScores?.memoryGame} color="text-green-400" />
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            </motion.div>
                        </div>
                    );
                })}
            </div>

            <AnimatePresence>
                {isNotInTopTwenty && myData && (
                    <motion.div 
                        id="personal-skill-footer"
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        className="fixed bottom-[88px] left-0 right-0 z-[100] px-4 md:px-8 pointer-events-none"
                    >
                        <div className="max-w-7xl mx-auto pointer-events-auto">
                            <Card 
                                className="bg-[#0a0a0a]/95 backdrop-blur-2xl border-t-2 border-rose-500 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] rounded-t-[2.5rem] overflow-hidden relative cursor-pointer group"
                                onClick={() => setExpandedId(expandedId === 'my-rank' ? null : 'my-rank')}
                            >
                                <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
                                <div className="p-4 sm:p-6 flex items-center justify-between text-white relative z-10">
                                    <div className="flex items-center gap-4 sm:gap-8">
                                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-rose-500/20 border-2 border-rose-500/40 flex flex-col items-center justify-center font-black text-xl sm:text-2xl italic leading-none">
                                            <span className="text-[8px] uppercase tracking-widest not-italic opacity-60 mb-1">Rank</span>
                                            #{myRank}
                                        </div>
                                        <div>
                                            <p className="font-black text-xs sm:text-lg uppercase tracking-widest leading-none">Your Skill Standing</p>
                                            <p className="text-[8px] font-bold uppercase text-rose-500 tracking-[0.2em] mt-1.5 flex items-center gap-2">
                                                <CheckCircle className="h-3 w-3"/> Arcade Uplink Active
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-4">
                                        <div className="flex flex-col items-end">
                                            <p className="text-2xl sm:text-5xl font-black italic tracking-tighter leading-none text-rose-500">{Math.round(myData.entertainmentTotalScore).toLocaleString()}</p>
                                            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mt-1">Skill Points</p>
                                        </div>
                                        <div className="opacity-30 group-hover:opacity-100 transition-opacity">
                                            {expandedId === 'my-rank' ? <ChevronUp /> : <ChevronDown />}
                                        </div>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedId === 'my-rank' && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/10 bg-black/60 p-6">
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                <SkillBlock icon={Orbit} label="Astro Ascent" score={myData.gameHighScores?.astroAscent} color="text-purple-400" />
                                                <SkillBlock icon={Bird} label="Flappy Mind" score={myData.gameHighScores?.flappyMind} color="text-sky-400" />
                                                <SkillBlock icon={Swords} label="Dim. Shift" score={myData.gameHighScores?.dimensionShift} color="text-rose-400" />
                                                <SkillBlock icon={BrainCircuit} label="Sub. Sprint" score={myData.gameHighScores?.subjectSprint} color="text-emerald-400" />
                                                <SkillBlock icon={Smile} label="Emoji Quiz" score={myData.gameHighScores?.emojiQuiz} color="text-yellow-400" />
                                                <SkillBlock icon={Sigma} label="Math Legend" score={myData.gameHighScores?.mathematicsLegend} color="text-blue-400" />
                                                <SkillBlock icon={Atom} label="Element Quest" score={(myData.elementQuestScores?.s || 0) + (myData.elementQuestScores?.p || 0) + (myData.elementQuestScores?.d || 0) + (myData.elementQuestScores?.f || 0)} color="text-cyan-400" />
                                                <SkillBlock icon={Brain} label="Memory Pattern" score={myData.gameHighScores?.memoryGame} color="text-green-400" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* History Dialog */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="max-w-3xl bg-background/95 backdrop-blur-xl border-primary/20 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
                    <div className="p-8 border-b bg-muted/20">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black uppercase italic flex items-center gap-3">
                                <History className="h-8 w-8 text-primary"/> Skill Registry Archive
                            </DialogTitle>
                            <DialogDescription className="text-base font-medium">Historical Top 5 Game Masters from previous operational cycles.</DialogDescription>
                        </DialogHeader>
                    </div>
                    <ScrollArea className="h-[500px]">
                        <div className="p-8 space-y-8">
                            {gameHistory.map((entry, i) => (
                                <div key={entry.id} className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h4 className="text-sm font-black uppercase tracking-[0.3em] text-primary">Cycle: {format(parseISO(entry.weekStartDate), 'MMM d')}</h4>
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
                                                    <span className="font-bold text-sm truncate max-w-[150px]">{p.displayName}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-primary">{p.score}</p>
                                                    <p className="text-[8px] font-black uppercase opacity-40">Points</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {gameHistory.length === 0 && (
                                <div className="py-20 text-center opacity-30 italic">No historical archives found in the mainframe.</div>
                            )}
                        </div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* Individual History Detail Dialog */}
            <Dialog open={!!selectedHistoryEntry} onOpenChange={(o) => !o && setSelectedHistoryEntry(null)}>
                <DialogContent className="max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none">
                    {selectedHistoryEntry && (
                        <Card className="border-amber-500/30 bg-background/95 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="text-center bg-amber-500/10 p-8">
                                <div className="mx-auto w-20 h-20 rounded-full bg-amber-500/20 border-4 border-amber-500/40 flex items-center justify-center mb-4">
                                    <Trophy className="h-10 w-10 text-amber-500 animate-gold-shine" />
                                </div>
                                <CardTitle className="text-2xl font-black uppercase italic tracking-tight">{selectedHistoryEntry.user.displayName}</CardTitle>
                                <CardDescription className="font-bold text-amber-600 dark:text-amber-400 uppercase text-[10px] tracking-widest">
                                    Week of {format(parseISO(selectedHistoryEntry.date), 'MMMM do')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <SkillBlock icon={Orbit} label="Astro Ascent" score={selectedHistoryEntry.user.scores.astroAscent} color="text-purple-400" isMini />
                                    <SkillBlock icon={Bird} label="Flappy Mind" score={selectedHistoryEntry.user.scores.flappyMind} color="text-sky-400" isMini />
                                    <SkillBlock icon={Swords} label="Dim. Shift" score={selectedHistoryEntry.user.scores.dimensionShift} color="text-rose-400" isMini />
                                    <SkillBlock icon={BrainCircuit} label="Sub. Sprint" score={selectedHistoryEntry.user.scores.subjectSprint} color="text-emerald-400" isMini />
                                    <SkillBlock icon={Smile} label="Emoji Quiz" score={selectedHistoryEntry.user.scores.emojiQuiz} color="text-yellow-400" isMini />
                                    <SkillBlock icon={Sigma} label="Math Legend" score={selectedHistoryEntry.user.scores.mathematicsLegend} color="text-blue-400" isMini />
                                    <SkillBlock icon={Atom} label="Element Quest" score={selectedHistoryEntry.user.scores.elementQuestTotal} color="text-cyan-400" isMini />
                                    <SkillBlock icon={Brain} label="Memory Pattern" score={selectedHistoryEntry.user.scores.memoryGame} color="text-green-400" isMini />
                                </div>
                                <div className="pt-4 border-t border-white/5 text-center">
                                    <p className="text-3xl font-black text-amber-500 italic tabular-nums">{selectedHistoryEntry.user.score}</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Operational Skill Points</p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full h-12 rounded-xl font-bold" onClick={() => setSelectedHistoryEntry(null)}>UPLINK CLOSED</Button>
                            </CardFooter>
                        </Card>
                    )}
                </DialogContent>
            </Dialog>

            <BadgeShowcaseDialog user={showcaseUser} onClose={() => setShowcaseUser(null)} />
        </div>
    );
}

function SkillBlock({ icon: Icon, label, score, color, isMini = false }: any) {
    return (
        <div className={cn("flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 transition-colors", isMini ? "p-2 rounded-xl" : "p-3 rounded-2xl")}>
            <div className={cn("p-1.5 rounded-lg bg-black/20", color)}>
                <Icon className={cn(isMini ? "h-3.5 w-3.5" : "h-5 w-5")} />
            </div>
            <div className="min-w-0 text-left">
                <p className={cn("text-[8px] font-black uppercase opacity-40 leading-none mb-1", isMini && "text-[7px]")}>{label}</p>
                <p className={cn("font-bold truncate leading-none", isMini ? "text-[10px]" : "text-xs")}>{score || 0}</p>
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
                <div className="h-32 bg-gradient-to-br from-rose-500/20 via-background to-background relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/5" />
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/20 text-white hover:bg-destructive/20 hover:text-destructive" onClick={onClose}><X className="h-4 w-4"/></Button>
                </div>
                
                <div className="px-8 pb-10 -mt-12 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <Avatar className="h-24 w-24 border-4 border-rose-500 shadow-2xl bg-background">
                            <AvatarImage src={user.photoURL} />
                            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tight">{user.displayName}</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Arcade Identity Dossier • {user.mindMateId || 'LEGEND'}</p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-6">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-rose-500 flex items-center gap-2">
                                <Medal className="h-4 w-4"/> Verified Arcade Assets
                            </h4>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{owned.length} Badges Unlocked</span>
                        </div>

                        <ScrollArea className="h-64 pr-4">
                            <div className="space-y-3">
                                {owned.map(key => (
                                    <div key={key} className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-white/5 group hover:border-rose-500/20 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-background shadow-inner">
                                                <ScrollText className="h-4 w-4 text-rose-500 opacity-40"/>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{badgeMeta[key].name}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium">Unlocked through arcade dominance.</p>
                                            </div>
                                        </div>
                                        <div className="scale-90">{badgeMeta[key].badge}</div>
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
                        <p className="text-[9px] text-center text-muted-foreground font-bold uppercase tracking-widest italic opacity-60 pt-4">"Viewing all badges this user's Identity record holds"</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function Badge({ children, variant, className }: any) {
    return <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", className)}>{children}</span>;
}
