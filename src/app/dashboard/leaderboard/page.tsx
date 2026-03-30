
'use client';

import { useState, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { useLeaderboardData, UserWithStats } from '@/hooks/use-leaderboard-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Settings2, Loader2, Trophy, ShieldCheck, Globe } from 'lucide-react';
import { UserProfileCard } from '@/components/profile/user-profile-card';
import { AllTimeTab } from '@/components/leaderboard/tabs/all-time-tab';
import { WeeklyTab } from '@/components/leaderboard/tabs/weekly-tab';
import { GameZoneTab } from '@/components/leaderboard/tabs/game-zone-tab';
import { PrivacyDialog } from '@/components/leaderboard/shared/privacy-dialog';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
    const { user: currentUser } = useUser();
    const { currentUserData, toggleLeaderboardPrivacy } = useUsers();
    const { processedUsers, loading } = useLeaderboardData();
    
    const [activeTab, setActiveTab] = useState('all-time');
    const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
    const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

    const filteredUsers = useMemo(() => {
        return processedUsers.filter(u => !u.isLeaderboardPrivate || u.uid === currentUser?.id);
    }, [processedUsers, currentUser?.id]);

    const sortedByScore = useMemo(() => [...filteredUsers].sort((a, b) => b.totalScore - a.totalScore), [filteredUsers]);
    const sortedByWeekly = useMemo(() => [...filteredUsers].sort((a, b) => b.weeklyTime - a.weeklyTime), [filteredUsers]);
    const sortedByGames = useMemo(() => [...filteredUsers].sort((a, b) => b.entertainmentTotalScore - a.entertainmentTotalScore), [filteredUsers]);

    const lastWeekWeeklyWinner = useMemo(() => [...processedUsers].sort((a, b) => b.prevWeeklyTime - a.prevWeeklyTime)[0], [processedUsers]);
    const lastWeekGameWinner = useMemo(() => [...processedUsers].sort((a, b) => b.prevWeekEntertainmentTotalScore - a.prevWeekEntertainmentTotalScore)[0], [processedUsers]);

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
        <div className="min-h-full flex flex-col space-y-8 pb-20 max-w-7xl mx-auto px-4 md:px-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-4">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 sm:gap-6"
                >
                    <div className="p-4 rounded-[2rem] bg-amber-500/10 text-amber-500 border-2 border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                        <Trophy className="h-10 w-10 sm:h-12 sm:w-12 animate-gold-shine" />
                    </div>
                    <div>
                        <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase italic bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
                            HALL OF LEGENDS
                        </h1>
                        <p className="text-muted-foreground font-black uppercase text-[10px] sm:text-xs tracking-[0.3em] flex items-center gap-2 mt-1">
                            <Globe className="h-3 w-3 text-primary"/> Sovereign Performance Registry
                        </p>
                    </div>
                </motion.div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button 
                        variant="outline" 
                        className="flex-1 md:flex-none h-12 rounded-2xl border-primary/20 hover:bg-primary/5 font-black uppercase text-[10px] tracking-widest"
                        onClick={() => setIsPrivacyOpen(true)}
                    >
                        <Settings2 className="mr-2 h-4 w-4"/> Phantom Mode
                    </Button>
                </div>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-center mb-12">
                    <TabsList className="grid w-full max-w-2xl grid-cols-3 h-16 p-1.5 bg-muted/30 backdrop-blur-xl rounded-[2rem] border-2 border-white/5">
                        <TabsTrigger value="all-time" className="rounded-3xl font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-white shadow-xl transition-all">All-Time</TabsTrigger>
                        <TabsTrigger value="weekly" className="rounded-3xl font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-white shadow-xl transition-all">Weekly</TabsTrigger>
                        <TabsTrigger value="game-zone" className="rounded-3xl font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] data-[state=active]:bg-primary data-[state=active]:text-white shadow-xl transition-all">Arcade</TabsTrigger>
                    </TabsList>
                </div>

                <div className="animate-in fade-in-50 duration-700">
                    <TabsContent value="all-time" className="m-0">
                        <AllTimeTab users={sortedByScore} currentUserId={currentUser?.id} onUserClick={setSelectedUser} />
                    </TabsContent>
                    
                    <TabsContent value="weekly" className="m-0">
                        <WeeklyTab users={sortedByWeekly} currentUserId={currentUser?.id} onUserClick={setSelectedUser} lastWeekWinner={lastWeekWeeklyWinner} />
                    </TabsContent>
                    
                    <TabsContent value="game-zone" className="m-0">
                        <GameZoneTab users={sortedByGames} currentUserId={currentUser?.id} onUserClick={setSelectedUser} lastWeekWinner={lastWeekGameWinner} />
                    </TabsContent>
                </div>
            </Tabs>

            <PrivacyDialog 
                isOpen={isPrivacyOpen} 
                onOpenChange={setIsPrivacyOpen} 
                isPrivate={currentUserData?.isLeaderboardPrivate ?? false}
                onToggle={(val) => toggleLeaderboardPrivacy(currentUser!.id, val)}
            />

            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-transparent shadow-none">
                    {selectedUser && (
                        <div className="animate-in zoom-in-95 duration-300">
                            <UserProfileCard user={selectedUser} />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
