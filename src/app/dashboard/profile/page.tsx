

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User as UserIcon, Copy, Check, Medal, Flame, Zap, ListChecks, Code, ShieldCheck, Crown, Gamepad2, Swords, Brain, BarChart3, Trophy, Compass, Star } from 'lucide-react';
import { useAdmin, useUsers, SUPER_ADMIN_UID } from '@/hooks/use-admin';
import { useUser, useClerk } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useQuizzes } from '@/hooks/use-quizzes';
import { useChallenges } from '@/hooks/use-challenges';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProgressConstellation } from '@/components/analytics/progress-constellation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

function ProfileTab() {
    const { user } = useUser();
    const { currentUserData, users } = useUsers();
    const [isCopied, setIsCopied] = useState(false);
    const { toast } = useToast();

    if (!currentUserData) return <Loader2 className="mx-auto my-10 animate-spin"/>;
    
    const handleCopyId = () => {
        navigator.clipboard.writeText(user?.id || '');
        setIsCopied(true);
        toast({ title: "User ID copied!" });
        setTimeout(() => setIsCopied(false), 2000);
    }
    
    const isSuperAdmin = currentUserData.uid === SUPER_ADMIN_UID;
    const isAdmin = currentUserData.isAdmin;
    const isVip = currentUserData.isVip;
    const isGM = currentUserData.isGM;
    const isChallenger = currentUserData.isChallenger;
    
    const badges = [
        isSuperAdmin && { name: 'Developer', badge: <span className="dev-badge"><Code className="h-3 w-3" /> DEV</span> },
        isAdmin && !isSuperAdmin && { name: 'Admin', badge: <span className="admin-badge"><ShieldCheck className="h-3 w-3" /> ADMIN</span> },
        isVip && { name: 'Elite Member', badge: <span className="elite-badge"><Crown className="h-3 w-3" /> ELITE</span> },
        isGM && { name: 'Game Master', badge: <span className="gm-badge">GM</span> },
        isChallenger && { name: 'Challenger', badge: <span className="challenger-badge"><Swords className="h-3 w-3"/> Challenger</span> }
    ].filter(Boolean);

    const stats = [
        { label: 'Total Credits', value: currentUserData.credits, icon: Medal, color: 'text-amber-500' },
        { label: 'Current Streak', value: currentUserData.streak || 0, icon: Flame, color: 'text-orange-500' },
        { label: 'Longest Streak', value: currentUserData.longestStreak || 0, icon: Trophy, color: 'text-yellow-400' },
        { label: 'Focus Sessions', value: currentUserData.focusSessionsCompleted || 0, icon: Zap, color: 'text-green-500' },
        { label: 'Tasks Completed', value: currentUserData.dailyTasksCompleted || 0, icon: ListChecks, color: 'text-blue-500' },
    ];
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-2 border-primary">
                            <AvatarImage src={currentUserData.photoURL} />
                            <AvatarFallback>{currentUserData.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-3xl">{currentUserData.displayName}</CardTitle>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {badges.map((b) => b && <div key={b.name}>{b.badge}</div>)}
                                {!badges.length && <Badge variant="outline">Member</Badge>}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="user-id">Your User ID</Label>
                        <div className="flex items-center gap-2">
                           <Input id="user-id" readOnly value={user?.id || ''} className="font-mono bg-muted"/>
                           <Button size="icon" variant="outline" onClick={handleCopyId}>
                                {isCopied ? <Check className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}
                           </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {stats.map(stat => (
                    <Card key={stat.label}>
                        <CardHeader className="p-4 flex-row items-center justify-between">
                            <CardTitle className={cn("text-sm font-medium", stat.color)}>{stat.label}</CardTitle>
                            <stat.icon className={cn("h-4 w-4 text-muted-foreground", stat.color)} />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function AnalyticsTab() {
    const { users } = useUsers();
    const { user } = useUser();
    const { quizzes } = useQuizzes();
    const { activeChallenge } = useChallenges();
    const [detailModalContent, setDetailModalContent] = useState<{ title: string; data: any[] } | null>(null);

    const { currentUserData } = useUsers();

    const sortedAllTime = [...users].sort((a,b) => b.totalScore - a.totalScore);
    const sortedWeekly = [...users].sort((a,b) => b.weeklyTime - a.weeklyTime);
    
    const rankAllTime = sortedAllTime.findIndex(u => u.uid === user?.id) + 1;
    const rankWeekly = sortedWeekly.findIndex(u => u.uid === user?.id) + 1;
    
    const perfectedQuizzes = quizzes.filter(q => user?.id && currentUserData?.perfectedQuizzes?.includes(q.id));

    if (!currentUserData) {
        return <div className="text-center text-muted-foreground py-10">No analytics data available yet.</div>
    }

    return (
        <>
            <div className="space-y-8 p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950/80 blue-nebula-bg">
                <div id="particle-container" className="[mask-image:linear-gradient(to_bottom,white_20%,transparent_75%)]">
                    {[...Array(12)].map((_, i) => <div key={i} className="particle"></div>)}
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-white">
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="text-lg text-sky-300">Leaderboard Ranking</CardTitle>
                            <Trophy className="text-sky-300"/>
                        </CardHeader>
                        <CardContent className="flex justify-around text-center">
                            <div>
                                <p className="text-4xl font-bold">{rankAllTime > 0 ? rankAllTime : 'N/A'}</p>
                                <p className="text-sm text-muted-foreground">All-Time</p>
                            </div>
                            <div>
                                <p className="text-4xl font-bold">{rankWeekly > 0 ? rankWeekly : 'N/A'}</p>
                                <p className="text-sm text-muted-foreground">Weekly</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="text-lg text-purple-300">Quiz Mastery</CardTitle>
                            <Brain className="text-purple-300"/>
                        </CardHeader>
                        <CardContent className="text-center">
                            <div>
                                <p className="text-4xl font-bold">{perfectedQuizzes.length}</p>
                                <p className="text-sm text-muted-foreground">Quizzes Perfected</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-1 lg:col-span-1 bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="text-lg text-red-300">Active Challenge</CardTitle>
                            <Compass className="text-red-300"/>
                        </CardHeader>
                        <CardContent className="text-center">
                            {activeChallenge ? (
                                <div>
                                    <p className="text-xl font-bold truncate">{activeChallenge.title}</p>
                                    <p className="text-sm text-muted-foreground">Day {activeChallenge.currentDay} of {activeChallenge.duration}</p>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">No active challenge</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2 lg:col-span-3 bg-white/5 border-white/10 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg text-fuchsia-300">Your Progress Constellation</CardTitle>
                        </CardHeader>
                        <CardContent className="min-h-[300px] flex items-center justify-center">
                        <ProgressConstellation user={currentUserData} quizzes={perfectedQuizzes} onStarClick={setDetailModalContent}/>
                        </CardContent>
                    </Card>
                </div>
            </div>
             <Dialog open={!!detailModalContent} onOpenChange={(isOpen) => !isOpen && setDetailModalContent(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{detailModalContent?.title}</DialogTitle>
                        <DialogDescription>A detailed breakdown of this achievement.</DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto p-1">
                        {detailModalContent?.data.length === 0 ? (
                            <p className="text-muted-foreground text-center py-10">No data to display yet.</p>
                        ) : (
                            <ul className="space-y-2">
                                {detailModalContent?.data.map((item, index) => (
                                    <li key={index} className="p-3 rounded-md border bg-muted">{item.title}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default function ProfilePage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Profile & Analytics</h1>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile"><UserIcon className="mr-2"/> Profile</TabsTrigger>
                    <TabsTrigger value="analytics"><Star className="mr-2"/> Constellation Analytics</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="mt-6">
                    <ProfileTab />
                </TabsContent>
                <TabsContent value="analytics" className="mt-6">
                    <AnalyticsTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}
