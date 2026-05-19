'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useLeaderboardData, UserWithStats } from '@/hooks/use-leaderboard-data';
import { useAdmin } from '@/hooks/use-admin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Globe, Target, Star, ShieldCheck, Info, Search, Loader2, History, ChevronDown, ChevronUp } from 'lucide-react';
import { PodiumCard } from '@/components/leaderboard/podium-card';
import { RankRow } from '@/components/leaderboard/rank-row';
import { UserRankHUD } from '@/components/leaderboard/user-rank-hud';
import { ProfileModal } from '@/components/leaderboard/profile-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { endOfWeek, endOfMonth, format, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function LeaderboardPage() {
    const { user: authUser } = useUser();
    const { processedUsers, loading } = useLeaderboardData();
    const { gameHistory } = useAdmin();
    const [activeTab, setActiveTab] = useState('all-time');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');

    // Timer Logic for Temporal Resets
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            let target;
            if (activeTab === 'weekly') target = endOfWeek(now, { weekStartsOn: 1 });
            else if (activeTab === 'monthly') target = endOfMonth(now);
            else return setTimeLeft('');

            const diff = target.getTime() - now.getTime();
            if (diff <= 0) return setTimeLeft('00:00:00');

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / 1000 / 60) % 60);
            const s = Math.floor((diff / 1000) % 60);

            if (d > 0) setTimeLeft(`${d}d ${h}h ${m}m`);
            else setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [activeTab]);

    const sortedUsers = useMemo(() => {
        let pool = [...processedUsers].filter(u => !u.isLeaderboardPrivate || u.uid === authUser?.id);
        
        if (activeTab === 'weekly') pool.sort((a, b) => b.weeklyScore - a.weeklyScore);
        else if (activeTab === 'monthly') pool.sort((a, b) => b.monthlyScore - a.monthlyScore);
        else pool.sort((a, b) => b.totalScore - a.totalScore);

        if (searchTerm) {
            pool = pool.filter(u => u.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        return pool.slice(0, 20); // STRICT TOP 20 LIMIT
    }, [processedUsers, activeTab, searchTerm, authUser?.id]);

    const topThree = sortedUsers.slice(0, 3);
    const remaining = sortedUsers.slice(3);
    
    // Find my rank in full pool for the personal card
    const myFullRank = useMemo(() => {
        let pool = [...processedUsers];
        if (activeTab === 'weekly') pool.sort((a, b) => b.weeklyScore - a.weeklyScore);
        else if (activeTab === 'monthly') pool.sort((a, b) => b.monthlyScore - a.monthlyScore);
        else pool.sort((a, b) => b.totalScore - a.totalScore);
        return pool.findIndex(u => u.uid === authUser?.id) + 1;
    }, [processedUsers, activeTab, authUser?.id]);

    const myData = processedUsers.find(u => u.uid === authUser?.id);

    if (loading) {
        return (
            <div className="flex h-[80vh] w-full flex-col items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                <p className="font-black uppercase tracking-[0.4em] text-[10px] text-primary animate-pulse">Syncing Global Registry...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden pb-40 px-4">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[#050505]" />
                <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full"
                />
            </div>

            <div className="relative z-10 space-y-12 max-w-7xl mx-auto">
                {/* Hero Header */}
                <header className="flex flex-col lg:flex-row justify-between items-center gap-8 pt-8">
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="text-center lg:text-left space-y-2">
                        <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                            <div className="p-4 rounded-3xl bg-primary/10 border-2 border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.3)] backdrop-blur-xl">
                                <Trophy className="h-10 w-10 text-primary animate-gold-shine" />
                            </div>
                            <div>
                                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-white via-white to-slate-500 bg-clip-text text-transparent leading-none">
                                    HALL OF LEGENDS
                                </h1>
                                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-primary/60 flex items-center gap-2 mt-2 justify-center lg:justify-start">
                                    <Globe className="h-3 w-3" /> Sovereign Performance Registry
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <UserRankHUD rank={myFullRank} user={myData} />
                </header>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-16">
                        <TabsList className="h-16 p-1.5 bg-black/40 backdrop-blur-2xl border-2 border-white/5 rounded-[2.5rem] shadow-2xl w-full max-w-2xl">
                            <TabsTrigger value="all-time" className="rounded-[2rem] font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-full">All-Time Legends</TabsTrigger>
                            <TabsTrigger value="weekly" className="rounded-[2rem] font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-full">Weekly Sprint</TabsTrigger>
                            <TabsTrigger value="monthly" className="rounded-[2rem] font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-full">Monthly Dominion</TabsTrigger>
                        </TabsList>

                        <div className="flex gap-4 w-full max-w-md">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                                <Input 
                                    placeholder="Locate Citizen..." 
                                    className="h-16 pl-12 rounded-[2rem] bg-black/40 border-2 border-white/5 focus:border-primary/30 transition-all text-lg font-bold"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button onClick={() => setIsHistoryOpen(true)} variant="outline" className="h-16 w-16 rounded-[2rem] border-2 bg-white/5 flex flex-col gap-1 items-center justify-center">
                                <History className="h-6 w-6 text-primary" />
                            </Button>
                        </div>
                    </div>

                    <TabsContent value={activeTab} className="m-0 space-y-12">
                        {timeLeft && (
                            <div className="text-center animate-in fade-in zoom-in">
                                <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary py-2 px-6 rounded-full font-black uppercase tracking-widest text-xs">
                                    Cycle Reset In: {timeLeft}
                                </Badge>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-20"
                            >
                                {/* Top 3 Podium */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-6xl mx-auto">
                                    <div className="order-2 md:order-1"><PodiumCard rank={2} user={topThree[1]} onClick={setSelectedUser} scoreKey={activeTab === 'weekly' ? 'weeklyScore' : activeTab === 'monthly' ? 'monthlyScore' : 'totalScore'} /></div>
                                    <div className="order-1 md:order-2 scale-110 z-10"><PodiumCard rank={1} user={topThree[0]} onClick={setSelectedUser} scoreKey={activeTab === 'weekly' ? 'weeklyScore' : activeTab === 'monthly' ? 'monthlyScore' : 'totalScore'} /></div>
                                    <div className="order-3 md:order-3"><PodiumCard rank={3} user={topThree[2]} onClick={setSelectedUser} scoreKey={activeTab === 'weekly' ? 'weeklyScore' : activeTab === 'monthly' ? 'monthlyScore' : 'totalScore'} /></div>
                                </div>

                                {/* Registry List */}
                                <div className="space-y-4 max-w-5xl mx-auto">
                                    <div className="flex items-center justify-between px-6 mb-8">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Elite Index (Top 20)</h4>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Registry Live</p>
                                    </div>
                                    {remaining.map((u, idx) => (
                                        <RankRow 
                                            key={u.uid} 
                                            user={u} 
                                            rank={idx + 4} 
                                            isMe={u.uid === authUser?.id}
                                            onClick={setSelectedUser}
                                            scoreKey={activeTab === 'weekly' ? 'weeklyScore' : activeTab === 'monthly' ? 'monthlyScore' : 'totalScore'}
                                        />
                                    ))}
                                    {remaining.length === 0 && <p className="text-center py-10 opacity-20 italic">The registry has reached its limit.</p>}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </TabsContent>
                </Tabs>
            </div>

            {/* HISTORY DIALOG */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-2xl border-primary/20 rounded-[3rem] p-0 overflow-hidden shadow-2xl">
                    <div className="p-8 border-b bg-primary/5">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black uppercase italic text-white flex items-center gap-3">
                                <History className="h-8 w-8 text-primary"/> Temporal Archives
                            </DialogTitle>
                            <DialogDescription className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Historical Champion Records</DialogDescription>
                        </DialogHeader>
                    </div>
                    <ScrollArea className="h-[500px]">
                        <div className="p-8 space-y-10">
                            {gameHistory.length === 0 ? (
                                <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                                    <ShieldCheck className="h-16 w-16" />
                                    <p className="text-xs font-black uppercase tracking-widest">No historical logs manifest</p>
                                </div>
                            ) : gameHistory.map(entry => (
                                <div key={entry.id} className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                        <h4 className="text-sm font-black uppercase tracking-[0.3em] text-primary">Cycle: {format(parseISO(entry.weekStartDate), 'MMMM do')}</h4>
                                        <Badge variant="outline" className="text-[8px] font-black uppercase">Record Sealed</Badge>
                                    </div>
                                    <div className="grid gap-3">
                                        {entry.topPerformers.map((p, i) => (
                                            <div key={p.uid} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/30 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-lg font-black italic opacity-20 w-6">#{i+1}</span>
                                                    <Avatar className="h-10 w-10 border-2 border-white/10"><AvatarImage src={p.photoURL}/><AvatarFallback>U</AvatarFallback></Avatar>
                                                    <span className="font-bold text-sm uppercase truncate max-w-[150px]">{p.displayName}</span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black italic text-primary tabular-nums">{p.score}</p>
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

            <ProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
    );
}
