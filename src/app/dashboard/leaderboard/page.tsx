'use client';

import { useState, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { useLeaderboardData, UserWithStats } from '@/hooks/use-leaderboard-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Globe, Target, Star, ShieldCheck, Info, Search, Loader2 } from 'lucide-react';
import { PodiumCard } from '@/components/leaderboard/podium-card';
import { RankRow } from '@/components/leaderboard/rank-row';
import { UserRankHUD } from '@/components/leaderboard/user-rank-hud';
import { ProfileModal } from '@/components/leaderboard/profile-modal';
import { Input } from '@/components/ui/input';

export default function LeaderboardPage() {
    const { user: authUser } = useUser();
    const { processedUsers, loading } = useLeaderboardData();
    const [activeTab, setActiveTab] = useState('weekly');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);

    const sortedUsers = useMemo(() => {
        let pool = [...processedUsers].filter(u => !u.isLeaderboardPrivate || u.uid === authUser?.id);
        
        if (activeTab === 'weekly') pool.sort((a, b) => b.weeklyTime - a.weeklyTime);
        else if (activeTab === 'monthly') pool.sort((a, b) => b.monthlyTime - a.monthlyTime);
        else pool.sort((a, b) => b.totalScore - a.totalScore);

        if (searchTerm) {
            pool = pool.filter(u => u.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        return pool;
    }, [processedUsers, activeTab, searchTerm, authUser?.id]);

    const topThree = sortedUsers.slice(0, 3);
    const remaining = sortedUsers.slice(3, 100);
    const myRank = sortedUsers.findIndex(u => u.uid === authUser?.id) + 1;
    const myData = sortedUsers.find(u => u.uid === authUser?.id);

    if (loading) {
        return (
            <div className="flex h-[80vh] w-full flex-col items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
                <p className="font-black uppercase tracking-[0.4em] text-[10px] text-primary animate-pulse">Syncing Global Registry...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden pb-40">
            {/* Background Atmosphere */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[#050505]" />
                <div className="absolute inset-0 bg-grid-white/5 opacity-10" />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full"
                />
                <motion.div 
                    animate={{ 
                        scale: [1.2, 1, 1.2],
                        opacity: [0.1, 0.15, 0.1]
                    }}
                    transition={{ duration: 12, repeat: Infinity }}
                    className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-600/20 blur-[150px] rounded-full"
                />
            </div>

            <div className="relative z-10 space-y-12">
                {/* Hero Header */}
                <header className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-center md:text-left space-y-2"
                    >
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                            <div className="p-4 rounded-3xl bg-primary/10 border-2 border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.3)] backdrop-blur-xl">
                                <Trophy className="h-10 w-10 text-primary animate-gold-shine" />
                            </div>
                            <div>
                                <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-white via-white to-slate-500 bg-clip-text text-transparent leading-none">
                                    HALL OF LEGENDS
                                </h1>
                                <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-primary/60 flex items-center gap-2 mt-2 justify-center md:justify-start">
                                    <Globe className="h-3 w-3" /> Sovereign Performance Registry
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <UserRankHUD rank={myRank} user={myData} />
                </header>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-16">
                        <TabsList className="h-16 p-1.5 bg-black/40 backdrop-blur-2xl border-2 border-white/5 rounded-[2.5rem] shadow-2xl w-full max-w-xl">
                            <TabsTrigger value="weekly" className="rounded-[2rem] font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-full">Weekly Sprint</TabsTrigger>
                            <TabsTrigger value="monthly" className="rounded-[2rem] font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-full">Monthly Dominion</TabsTrigger>
                            <TabsTrigger value="all-time" className="rounded-[2rem] font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white transition-all h-full">All-Time Legends</TabsTrigger>
                        </TabsList>

                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                            <Input 
                                placeholder="Locate Citizen..." 
                                className="h-16 pl-12 rounded-[2rem] bg-black/40 border-2 border-white/5 focus:border-primary/30 transition-all text-lg font-bold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <TabsContent value={activeTab} className="m-0 space-y-20">
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-20"
                            >
                                {/* Top 3 Podium */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-6xl mx-auto px-4">
                                    <div className="order-2 md:order-1"><PodiumCard rank={2} user={topThree[1]} onClick={setSelectedUser} /></div>
                                    <div className="order-1 md:order-2 scale-110 z-10"><PodiumCard rank={1} user={topThree[0]} onClick={setSelectedUser} /></div>
                                    <div className="order-3 md:order-3"><PodiumCard rank={3} user={topThree[2]} onClick={setSelectedUser} /></div>
                                </div>

                                {/* Registry List */}
                                <div className="space-y-4 max-w-5xl mx-auto px-4">
                                    <div className="flex items-center justify-between px-6 mb-8">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Elite Index</h4>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1 w-8 bg-primary rounded-full animate-pulse" />
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Registry Live</p>
                                        </div>
                                    </div>
                                    {remaining.map((user, idx) => (
                                        <RankRow 
                                            key={user.uid} 
                                            user={user} 
                                            rank={idx + 4} 
                                            isMe={user.uid === authUser?.id}
                                            onClick={setSelectedUser}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </TabsContent>
                </Tabs>
            </div>

            <ProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
    );
}
