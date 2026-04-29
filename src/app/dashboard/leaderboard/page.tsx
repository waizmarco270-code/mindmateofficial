
'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { useLeaderboardData, UserWithStats } from '@/hooks/use-leaderboard-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { 
    Settings2, Loader2, Trophy, ShieldCheck, Globe, 
    Info, X, Target, Star, Medal, Clock, 
    Flame, ShieldAlert, Award, Gem, LayoutDashboard,
    ChevronRight, ChevronLeft, ArrowLeft, History,
    CheckCircle
} from 'lucide-react';
import { AllTimeTab } from '@/components/leaderboard/tabs/all-time-tab';
import { WeeklyTab } from '@/components/leaderboard/tabs/weekly-tab';
import { PrivacyDialog } from '@/components/leaderboard/shared/privacy-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ShowcaseBadge } from '@/components/leaderboard/shared/badge-renderer';

export default function LeaderboardPage() {
    const { user: currentUser } = useUser();
    const { currentUserData, toggleLeaderboardPrivacy } = useUsers();
    const { processedUsers, loading } = useLeaderboardData();
    
    const [activeTab, setActiveTab] = useState('all-time');
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isMyRankOpen, setIsMyRankOpen] = useState(false);

    const filteredUsers = useMemo(() => {
        return processedUsers.filter(u => !u.isLeaderboardPrivate || u.uid === currentUser?.id);
    }, [processedUsers, currentUser?.id]);

    const sortedByScore = useMemo(() => [...filteredUsers].sort((a, b) => b.totalScore - a.totalScore), [filteredUsers]);
    const sortedByWeekly = useMemo(() => [...filteredUsers].sort((a, b) => b.weeklyTime - a.weeklyTime), [filteredUsers]);

    const lastWeekWeeklyWinner = useMemo(() => [...processedUsers].sort((a, b) => b.prevWeeklyTime - a.prevWeeklyTime)[0], [processedUsers]);

    const myRank = useMemo(() => {
        const pool = activeTab === 'all-time' ? sortedByScore : sortedByWeekly;
        return pool.findIndex(u => u.uid === currentUser?.id) + 1;
    }, [activeTab, sortedByScore, sortedByWeekly, currentUser?.id]);

    const myData = useMemo(() => {
        return sortedByScore.find(u => u.uid === currentUser?.id);
    }, [sortedByScore, currentUser?.id]);

    const scrollToMe = useCallback(() => {
        if (typeof window !== 'undefined' && (window as any).scrollToUserRank) {
            (window as any).scrollToUserRank();
        }
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    <p className="font-black uppercase tracking-[0.4em] text-[10px] text-primary animate-pulse">Synchronizing Global Rankings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full flex flex-col space-y-8 pb-40 max-w-7xl mx-auto px-4 w-full relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 golden-legend-bg opacity-30" />
                <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] opacity-10" />
            </div>

            <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-4">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 sm:gap-6"
                >
                    <div className="p-4 rounded-[2.5rem] bg-amber-500/10 text-amber-500 border-2 border-amber-500/20 shadow-[0_0_50px_rgba(245,158,11,0.2)] backdrop-blur-xl">
                        <Trophy className="h-10 w-10 sm:h-12 sm:w-12 animate-gold-shine" />
                    </div>
                    <div>
                        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-white via-white to-slate-500 bg-clip-text text-transparent leading-none">
                            HALL OF LEGENDS
                        </h1>
                        <p className="text-muted-foreground font-black uppercase text-[10px] sm:text-xs tracking-[0.3em] flex items-center gap-2 mt-2">
                            <Globe className="h-3 w-3 text-primary animate-pulse"/> Sovereign performance registry
                        </p>
                    </div>
                </motion.div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button 
                        variant="outline" 
                        className="flex-1 md:flex-none h-14 rounded-2xl border-primary/20 bg-primary/5 hover:bg-primary/10 font-black uppercase text-[10px] tracking-widest px-8 shadow-xl shadow-primary/10"
                        onClick={() => setIsMyRankOpen(true)}
                    >
                        <Target className="mr-3 h-4 w-4 text-primary"/> Your Rank Info
                    </Button>
                    <Button 
                        variant="outline" 
                        className="flex-1 md:flex-none h-14 rounded-2xl border-white/10 bg-white/5 font-black uppercase text-[10px] tracking-widest px-8 hover:bg-white/10"
                        onClick={scrollToMe}
                    >
                        Find Me
                    </Button>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            size="icon"
                            className="h-14 w-14 rounded-2xl border-white/10 hover:bg-primary/20 transition-all"
                            onClick={() => setIsInfoOpen(true)}
                        >
                            <Info className="h-6 w-6 text-primary" />
                        </Button>
                        <Button 
                            variant="outline" 
                            size="icon"
                            className="h-14 w-14 rounded-2xl border-white/10 bg-white/5 font-black uppercase text-[10px] tracking-widest hover:bg-primary/20"
                            onClick={() => setIsPrivacyOpen(true)}
                        >
                            <Settings2 className="h-6 w-6 text-primary"/>
                        </Button>
                    </div>
                </div>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full relative z-10">
                <div className="flex justify-center mb-16">
                    <TabsList className="grid w-full max-w-md grid-cols-2 h-16 p-1.5 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border-2 border-white/5 shadow-2xl">
                        <TabsTrigger value="all-time" className="rounded-[2rem] font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-white shadow-xl transition-all">All-Time Standing</TabsTrigger>
                        <TabsTrigger value="weekly" className="rounded-[2rem] font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-white shadow-xl transition-all">Weekly Sprint</TabsTrigger>
                    </TabsList>
                </div>

                <div className="animate-in fade-in-50 duration-700 w-full">
                    <TabsContent value="all-time" className="h-full m-0 w-full">
                        <AllTimeTab users={sortedByScore} currentUserId={currentUser?.id} onUserClick={() => {}} />
                    </TabsContent>
                    
                    <TabsContent value="weekly" className="m-0">
                        <WeeklyTab users={sortedByWeekly} currentUserId={currentUser?.id} onUserClick={() => {}} lastWeekWinner={lastWeekWeeklyWinner} />
                    </TabsContent>
                </div>
            </Tabs>

            {/* PERSONAL RANK DIALOG */}
            <Dialog open={isMyRankOpen} onOpenChange={setIsMyRankOpen}>
                <DialogContent className="max-w-lg bg-background/95 backdrop-blur-3xl border-primary/20 rounded-[3rem] p-0 overflow-hidden shadow-2xl">
                    {myData ? (
                        <>
                            <div className="p-8 bg-primary/10 border-b border-primary/20">
                                <DialogHeader>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center border-2 border-primary/40 font-black italic text-2xl text-primary">
                                            #{myRank}
                                        </div>
                                        <div>
                                            <DialogTitle className="text-3xl font-black uppercase italic text-white tracking-tighter">Your Registry Status</DialogTitle>
                                            <DialogDescription className="font-bold text-primary/60 uppercase text-[10px] tracking-widest">Active Mainframe Record</DialogDescription>
                                        </div>
                                    </div>
                                </DialogHeader>
                                <div className="mt-6 flex items-center justify-between">
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
                                        <p className="text-4xl font-black italic tabular-nums text-primary">{myData.totalScore.toLocaleString()}</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Points</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60 flex items-center gap-2"><LayoutDashboard className="h-3 w-3"/> Standing Breakdown</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <DossierSummary icon={Clock} label="Study Effort" val={myData.breakdown.studyPoints.toLocaleString()} color="text-sky-400" />
                                    <DossierSummary icon={Flame} label="Streak Loyalty" val={myData.breakdown.streakPoints.toLocaleString()} color="text-orange-500" />
                                    <DossierSummary icon={Gem} label="Standard Economy" val={myData.breakdown.creditsPoints.toLocaleString()} color="text-amber-500" />
                                    <DossierSummary icon={ShieldAlert} label="Exile Bonus" val={myData.breakdown.isolationPoints.toLocaleString()} color="text-red-500" />
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center italic text-xs text-muted-foreground">
                                    "Continue mission cycles to ascend the Hall of Legends."
                                </div>
                            </div>
                            <DialogFooter className="p-6 bg-muted/20 border-t">
                                <DialogClose asChild><Button className="w-full h-14 rounded-2xl font-black uppercase">Resume Mission</Button></DialogClose>
                            </DialogFooter>
                        </>
                    ) : null}
                </DialogContent>
            </Dialog>

            <PrivacyDialog 
                isOpen={isPrivacyOpen} 
                onOpenChange={setIsPrivacyOpen} 
                isPrivate={currentUserData?.isLeaderboardPrivate ?? false}
                onToggle={(val) => toggleLeaderboardPrivacy(currentUser!.id, val)}
            />

            <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
                <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-primary/20 rounded-[2.5rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase italic flex items-center gap-2">
                            <Info className="text-primary h-6 w-6"/> Scoring Protocol v3.0
                        </DialogTitle>
                        <DialogDescription className="font-bold">The mathematical architecture of academic excellence.</DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InfoBlock label="Study Mastery" desc="1 Point per Minute Logged" color="text-sky-400" icon={Clock} />
                            <InfoBlock label="Streak Loyalty" desc="10 Points per Daily Streak" color="text-orange-500" icon={Flame} />
                            <InfoBlock label="Standard Economy" desc="1/2 Point per Credit Held" color="text-amber-500" icon={Gem} />
                            <InfoBlock label="Identity Assets" desc="100 Points per Unique Badge" color="text-fuchsia-400" icon={Award} />
                        </div>
                        <div className="p-6 rounded-[2rem] bg-red-500/5 border border-red-500/20">
                            <h4 className="text-xs font-black uppercase text-red-500 tracking-widest mb-3 flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4"/> Isolation Bounties
                            </h4>
                            <div className="grid grid-cols-2 gap-y-2 text-[10px] font-bold">
                                <p>7 Days: <span className="text-red-500">5,000 PTS</span></p>
                                <p>14 Days: <span className="text-red-500">15,000 PTS</span></p>
                                <p>21 Days: <span className="text-red-500">25,000 PTS</span></p>
                                <p>30 Days: <span className="text-red-500">30,000 PTS</span></p>
                                <p>3 Months: <span className="text-red-500">100,000 PTS</span></p>
                                <p>6 Months: <span className="text-red-500">300,000 PTS</span></p>
                                <p className="col-span-2 mt-2 pt-2 border-t border-red-500/10 text-center text-sm">
                                    1 Year: <span className="text-red-500 font-black">1,000,000 PTS</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function DossierSummary({ icon: Icon, label, val, color }: any) {
    return (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className={cn("p-2 rounded-xl bg-black/20 shrink-0", color)}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1 truncate">{label}</p>
                <p className="text-lg font-black text-white italic tabular-nums">{val}</p>
            </div>
        </div>
    );
}

function InfoBlock({ label, desc, color, icon: Icon }: any) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-white/5">
            <div className={cn("p-2 rounded-xl bg-black/20", color)}>
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className={cn("text-[10px] font-black uppercase tracking-widest", color)}>{label}</p>
                <p className="text-xs font-bold text-foreground mt-0.5">{desc}</p>
            </div>
        </div>
    );
}
