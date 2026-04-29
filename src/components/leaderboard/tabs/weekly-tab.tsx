
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { UserWithStats } from '@/hooks/use-leaderboard-data';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, History, ChevronDown, ChevronUp, CheckCircle, Gem, Medal, EyeOff, X, ScrollText, Flame, ArrowLeft, Trophy } from 'lucide-react';
import { endOfWeek, format as formatDate, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { ShowcaseBadge, getOwnedBadges, badgeMeta } from '../shared/badge-renderer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface WeeklyTabProps {
    users: UserWithStats[];
    currentUserId?: string;
    onUserClick: (user: UserWithStats) => void;
    lastWeekWinner?: UserWithStats;
}

const formatHours = (seconds: number) => {
    return (seconds / 3600).toFixed(1);
};

export function WeeklyTab({ users, currentUserId, onUserClick, lastWeekWinner }: WeeklyTabProps) {
    const [timeLeft, setTimeLeft] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [showcaseUser, setShowcaseUser] = useState<UserWithStats | null>(null);
    const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const topFifty = users.slice(0, 50);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
            const diff = weekEnd.getTime() - now.getTime();
            if (diff <= 0) { setTimeLeft("Resetting..."); return; }
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / 1000 / 60) % 60);
            const s = Math.floor((diff / 1000) % 60);
            setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const scrollToMe = useCallback(() => {
        if (currentUserId && itemRefs.current[currentUserId]) {
            itemRefs.current[currentUserId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setExpandedId(currentUserId);
        }
    }, [currentUserId]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).scrollToUserRank = scrollToMe;
        }
    }, [scrollToMe]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-7xl mx-auto w-full pb-40 px-2 sm:px-4 relative z-10"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-primary/5 border-primary/20 rounded-3xl overflow-hidden backdrop-blur-md">
                    <CardContent className="p-4 sm:p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Clock className="h-6 w-6 animate-pulse" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cycle Reset</p>
                                <p className="font-bold text-sm sm:text-base text-foreground">Next Monday</p>
                            </div>
                        </div>
                        <div className="font-mono font-black text-sm sm:text-lg bg-black/20 px-3 py-1.5 rounded-xl border border-white/5">
                            {timeLeft}
                        </div>
                    </CardContent>
                </Card>

                {lastWeekWinner && lastWeekWinner.prevWeeklyTime > 0 && (
                    <Card className="bg-amber-500/5 border-amber-500/20 rounded-3xl overflow-hidden backdrop-blur-md">
                        <CardContent className="p-4 sm:p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                                    <History className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last Champion</p>
                                    <p className="font-bold truncate max-w-[120px] text-sm sm:text-base text-foreground">{lastWeekWinner.displayName}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm sm:text-xl font-black text-amber-500">{formatTime(lastWeekWinner.prevWeeklyTime)}</p>
                                <p className="text-[8px] font-black uppercase opacity-40">Weekly Focus</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="space-y-4">
                {topFifty.map((user, index) => {
                    const rank = index + 1;
                    const isExpanded = expandedId === user.uid;
                    const isMe = user.uid === currentUserId;
                    const isTopThree = rank <= 3;
                    const equippedFrameId = user.equippedFrame || 'default';

                    return (
                        <div key={user.uid} ref={(el) => { if (user.uid) itemRefs.current[user.uid] = el; }}>
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}>
                                <Card 
                                    className={cn(
                                        "relative overflow-hidden border-2 cursor-pointer transition-all duration-500 rounded-[2rem] sm:rounded-[2.5rem]",
                                        isMe ? "bg-primary/5 border-primary/20" : "bg-card/40 border-white/5",
                                        isTopThree && "border-amber-500/30 shadow-lg shadow-amber-500/5",
                                        isExpanded && "scale-[1.01] ring-4 ring-primary/10"
                                    )}
                                    onClick={() => setExpandedId(isExpanded ? null : user.uid)}
                                >
                                    <div className="p-4 sm:p-6 flex items-center gap-3 sm:gap-8">
                                        <div className="w-8 sm:w-12 text-center font-black italic text-xl sm:text-3xl opacity-40 shrink-0">#{rank}</div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setShowcaseUser(user); }} 
                                            className="relative shrink-0"
                                        >
                                            <div className={cn("avatar-frame-base", equippedFrameId === 'premium' ? 'avatar-frame-premium' : 'avatar-frame-default')}>
                                                <Avatar className="h-10 w-10 sm:h-16 sm:w-16 border-2 border-background relative z-10 bg-background">
                                                    <AvatarImage src={user.photoURL} />
                                                    <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            </div>
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-black text-sm sm:text-xl uppercase tracking-tight truncate italic">{user.displayName}</p>
                                                {user.isLeaderboardPrivate && <EyeOff className="h-3 w-3 opacity-40" />}
                                            </div>
                                            <div className="mt-1 scale-75 origin-left">
                                                <ShowcaseBadge user={user} />
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-lg sm:text-4xl font-black italic tracking-tighter text-primary leading-none tabular-nums">
                                                {formatTime(user.weeklyTime)}
                                            </p>
                                            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Study Hours</p>
                                        </div>
                                        <div className="ml-1 sm:ml-2 opacity-30 group-hover:opacity-100 transition-opacity hidden sm:block">
                                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        </div>
                                    </div>
                                    
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/5 bg-black/40 p-4 sm:p-6">
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                                    <DossierCell icon={Clock} label="Total Study" val={`${formatHours(user.totalStudyTime || 0)}h`} color="text-sky-400" />
                                                    <DossierCell icon={Flame} label="Daily Streak" val={`${user.streak}d`} color="text-orange-500" />
                                                    <DossierCell icon={Gem} label="Registry Credits" val={user.credits.toLocaleString()} color="text-amber-400" />
                                                    <DossierCell icon={Medal} label="Assets" val={`${getOwnedBadges(user).length} Badges`} color="text-fuchsia-400" />
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

            <BadgeShowcaseDialog 
                user={showcaseUser} 
                onClose={() => setShowcaseUser(null)} 
            />
        </motion.div>
    );
}

function DossierCell({ icon: Icon, label, val, color }: any) {
    return (
        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-2xl border border-white/5 shadow-inner">
            <div className={cn("p-1.5 rounded-lg bg-black/20 shrink-0", color)}>
                <Icon className="h-4 w-4"/>
            </div>
            <div className="min-w-0">
                <p className="text-[7px] uppercase font-black opacity-40 leading-none mb-0.5 truncate">{label}</p>
                <p className="text-[10px] font-bold text-white truncate">{val}</p>
            </div>
        </div>
    );
}

function BadgeShowcaseDialog({ user, onClose }: { user: UserWithStats | null, onClose: () => void }) {
    if (!user) return null;
    const owned = getOwnedBadges(user);
    const equippedFrameId = user.equippedFrame || 'default';

    return (
        <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-xl bg-background/95 backdrop-blur-3xl border-primary/20 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl">
                <div className="h-32 bg-gradient-to-br from-primary/20 via-background to-background relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/5" />
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/20 text-white hover:bg-destructive/20 hover:text-destructive" onClick={onClose}><X className="h-6 w-6"/></Button>
                </div>
                
                <div className="px-6 sm:px-8 pb-10 -mt-12 relative z-10">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className={cn("avatar-frame-base h-24 w-24 sm:h-32 sm:w-32", equippedFrameId === 'premium' ? 'avatar-frame-premium' : 'avatar-frame-default')}>
                            <Avatar className="h-full w-full border-4 shadow-2xl bg-background relative z-10">
                                <AvatarImage src={user.photoURL} />
                                <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div>
                            <h3 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight">{user.displayName}</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Identity Dossier • {user.mindMateId || 'LEGEND'}</p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-6">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
                                <Medal className="h-5 w-5"/> Verified Assets
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
