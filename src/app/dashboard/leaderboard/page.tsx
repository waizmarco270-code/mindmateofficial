
'use client';

import { useState, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { useLeaderboardData, UserWithStats } from '@/hooks/use-leaderboard-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Settings2, Loader2, Trophy } from 'lucide-react';
import { UserProfileCard } from '@/components/profile/user-profile-card';
import { AllTimeTab } from '@/components/leaderboard/tabs/all-time-tab';
import { WeeklyTab } from '@/components/leaderboard/tabs/weekly-tab';
import { GameZoneTab } from '@/components/leaderboard/tabs/game-zone-tab';
import { PrivacyDialog } from '@/components/leaderboard/shared/privacy-dialog';

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
            <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="font-black uppercase tracking-[0.3em] text-[10px]">Syncing Rankings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-20 max-w-6xl mx-auto">
            <header className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-xl shadow-amber-500/5">
                        <Trophy className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight uppercase italic">Hall of Legends</h1>
                        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.2em] ml-1">Sovereign Performance Registry</p>
                    </div>
                </div>
                <Button variant="outline" className="rounded-full border-primary/20 hover:bg-primary/5 font-bold" onClick={() => setIsPrivacyOpen(true)}>
                    <Settings2 className="mr-2 h-4 w-4"/> Phantom Mode
                </Button>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex justify-center mb-8">
                    <TabsList className="grid w-full max-w-md grid-cols-3 h-14 p-1 bg-muted/50 rounded-2xl border">
                        <TabsTrigger value="all-time" className="rounded-xl font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">All-Time</TabsTrigger>
                        <TabsTrigger value="weekly" className="rounded-xl font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Weekly</TabsTrigger>
                        <TabsTrigger value="game-zone" className="rounded-xl font-bold uppercase text-[10px] tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">Games</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="all-time">
                    <AllTimeTab users={sortedByScore} currentUserId={currentUser?.id} onUserClick={setSelectedUser} />
                </TabsContent>
                
                <TabsContent value="weekly">
                    <WeeklyTab users={sortedByWeekly} currentUserId={currentUser?.id} onUserClick={setSelectedUser} lastWeekWinner={lastWeekWeeklyWinner} />
                </TabsContent>
                
                <TabsContent value="game-zone">
                    <GameZoneTab users={sortedByGames} currentUserId={currentUser?.id} onUserClick={setSelectedUser} lastWeekWinner={lastWeekGameWinner} />
                </TabsContent>
            </Tabs>

            <PrivacyDialog 
                isOpen={isPrivacyOpen} 
                onOpenChange={setIsPrivacyOpen} 
                isPrivate={currentUserData?.isLeaderboardPrivate ?? false}
                onToggle={(val) => toggleLeaderboardPrivacy(currentUser!.id, val)}
            />

            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="max-w-md p-0 overflow-hidden border-0 bg-transparent shadow-none">
                    {selectedUser && <UserProfileCard user={selectedUser} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}
