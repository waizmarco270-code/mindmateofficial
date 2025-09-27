

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User as UserIcon, Copy, Check, Medal, Flame, Zap, ListChecks, Code, ShieldCheck, Crown, Gamepad2, Swords, Brain, BarChart3, Trophy, Compass, Star, Clock, UserPlus, Search, UserCheck } from 'lucide-react';
import { useAdmin, useUsers, SUPER_ADMIN_UID, User, BadgeType } from '@/hooks/use-admin';
import { useUser, useClerk } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useQuizzes } from '@/hooks/use-quizzes';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProgressConstellation } from '@/components/analytics/progress-constellation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFriends, FriendsProvider } from '@/hooks/use-friends';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const formatTotalStudyTime = (totalSeconds: number) => {
    if (totalSeconds < 60) return "0m";

    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || (days === 0 && hours === 0)) parts.push(`${minutes}m`);

    return parts.join(' ');
}

function UserProfileCard({ user, isOwnProfile = false }: { user: User, isOwnProfile?: boolean }) {
    const { user: authUser } = useUser();
    const { friends, sendFriendRequest, sentRequests } = useFriends();
    const { setShowcaseBadge } = useAdmin();
    const [isCopied, setIsCopied] = useState(false);
    const { toast } = useToast();

    if (!user) return <Loader2 className="mx-auto my-10 animate-spin"/>;
    
    const handleCopyId = () => {
        if (!user) return;
        navigator.clipboard.writeText(user.uid || '');
        setIsCopied(true);
        toast({ title: "User ID copied!" });
        setTimeout(() => setIsCopied(false), 2000);
    }
    
    const isSuperAdmin = user.uid === SUPER_ADMIN_UID;

    const ownedBadges = [
        (isSuperAdmin || user.isAdmin) && { type: 'admin', name: 'Admin', badge: <span className="admin-badge"><ShieldCheck className="h-3 w-3" /> ADMIN</span> },
        user.isVip && { type: 'vip', name: 'Elite Member', badge: <span className="elite-badge"><Crown className="h-3 w-3" /> ELITE</span> },
        user.isGM && { type: 'gm', name: 'Game Master', badge: <span className="gm-badge">GM</span> },
        user.isChallenger && { type: 'challenger', name: 'Challenger', badge: <span className="challenger-badge"><Swords className="h-3 w-3"/> Challenger</span> },
        user.isCoDev && { type: 'co-dev', name: 'Co-Developer', badge: <span className="co-dev-badge"><Code className="h-3 w-3"/> Co-Dev</span> }
    ].filter(Boolean) as { type: BadgeType, name: string, badge: JSX.Element }[];
    
    if(isSuperAdmin) ownedBadges.unshift({ type: 'dev', name: 'Developer', badge: <span className="dev-badge"><Code className="h-3 w-3" /> DEV</span> });

    const showcasedBadge = ownedBadges.find(b => b.type === user.showcasedBadge) || ownedBadges[0] || null;

    const stats = [
        { label: 'Total Credits', value: user.credits.toLocaleString(), icon: Medal, color: 'text-amber-500' },
        { label: 'Current Streak', value: user.streak || 0, icon: Flame, color: 'text-orange-500' },
        { label: 'Longest Streak', value: user.longestStreak || 0, icon: Trophy, color: 'text-yellow-400' },
        { label: 'Focus Sessions', value: user.focusSessionsCompleted || 0, icon: Zap, color: 'text-green-500' },
        { label: 'Tasks Completed', value: user.dailyTasksCompleted || 0, icon: ListChecks, color: 'text-blue-500' },
    ];
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-2 border-primary">
                            <AvatarImage src={user.photoURL} />
                            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-3xl">{user.displayName}</CardTitle>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                {showcasedBadge ? showcasedBadge.badge : <Badge variant="outline">Member</Badge>}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="user-id">User ID</Label>
                        <div className="flex items-center gap-2">
                           <Input id="user-id" readOnly value={user.uid || ''} className="font-mono bg-muted"/>
                           <Button size="icon" variant="outline" onClick={handleCopyId}>
                                {isCopied ? <Check className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}
                           </Button>
                        </div>
                    </div>
                    {!isOwnProfile && authUser && (
                         <div className="mt-4">
                            {friends.some(f => f.uid === user.uid) ? (
                                <Button className="w-full" disabled> <UserCheck className="mr-2"/> Already Friends</Button>
                            ) : sentRequests.some(r => r.receiverId === user.uid) ? (
                                 <Button className="w-full" disabled> <UserCheck className="mr-2"/> Request Sent</Button>
                            ) : (
                                <Button className="w-full" onClick={() => sendFriendRequest(user.uid)}>
                                    <UserPlus className="mr-2"/> Add Friend
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {isOwnProfile && ownedBadges.length > 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Showcase Your Badges</CardTitle>
                        <CardDescription>Choose a badge to display next to your name across the app.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-4">
                        {ownedBadges.map(b => (
                            <button key={b.type} onClick={() => setShowcaseBadge(user.uid, b.type)} className={cn("p-2 rounded-lg border-2 transition-all", user.showcasedBadge === b.type || (!user.showcasedBadge && b.type === (isSuperAdmin ? 'dev' : 'admin')) ? 'border-primary ring-2 ring-primary/50' : 'border-transparent hover:border-primary/50')}>
                                {b.badge}
                            </button>
                        ))}
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {stats.map(stat => (
                    <Card key={stat.label}>
                        <CardHeader className="p-4 flex-row items-center justify-between">
                            <CardTitle className={cn("text-sm font-medium", stat.color)}>{stat.label}</CardTitle>
                            <stat.icon className={cn("h-4 w-4 text-muted-foreground", stat.color)} />
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
                 <Card className="col-span-2 lg:col-span-3">
                    <CardHeader className="p-4 flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-cyan-500">Total Study Time</CardTitle>
                        <Clock className="h-4 w-4 text-cyan-500" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-center">
                        <div className="text-4xl font-bold">{formatTotalStudyTime(user.totalStudyTime || 0)}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}


function AnalyticsTab() {
    const { users } = useUsers();
    const { user } = useUser();
    const { quizzes } = useQuizzes();

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
                        <p className="text-muted-foreground">Coming Soon</p>
                    </CardContent>
                </Card>
                <Card className="md:col-span-2 lg:col-span-3 bg-white/5 border-white/10 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg text-fuchsia-300">Your Progress Constellation</CardTitle>
                    </CardHeader>
                    <CardContent className="min-h-[300px] flex items-center justify-center">
                    <ProgressConstellation user={currentUserData} quizzes={perfectedQuizzes} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function SearchUsersTab() {
    const { user: authUser } = useUser();
    const { users } = useUsers();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return [];
        return users.filter(user => 
            user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            user.uid !== authUser?.id
        );
    }, [searchTerm, users, authUser]);

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search for other students..." 
                    className="pl-10 h-12 text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <Dialog open={!!selectedUser} onOpenChange={(isOpen) => !isOpen && setSelectedUser(null)}>
                <div className="space-y-4">
                    {filteredUsers.map(user => (
                        <Card key={user.uid} className="hover:bg-muted cursor-pointer" onClick={() => setSelectedUser(user)}>
                            <CardContent className="p-4 flex items-center gap-4">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={user.photoURL} />
                                    <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold">{user.displayName}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {searchTerm && filteredUsers.length === 0 && (
                        <p className="text-center text-muted-foreground py-10">No users found.</p>
                    )}
                </div>
                 <DialogContent className="max-w-md">
                    {selectedUser && (
                        <>
                         <DialogHeader>
                            <DialogTitle>User Profile</DialogTitle>
                         </DialogHeader>
                         <div className="max-h-[70vh] overflow-y-auto p-1">
                            <UserProfileCard user={selectedUser} />
                         </div>
                        </>
                    )}
                 </DialogContent>
            </Dialog>
        </div>
    );
}

export default function ProfilePage() {
    const { currentUserData } = useUsers();
    if (!currentUserData) return <div className="flex justify-center items-center h-full"><Loader2 className="h-10 w-10 animate-spin"/></div>

    return (
        <FriendsProvider>
            <div className="space-y-8">
                <h1 className="text-3xl font-bold tracking-tight">Profile & Analytics</h1>

                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="profile"><UserIcon className="mr-2"/> Your Profile</TabsTrigger>
                        <TabsTrigger value="search"><Search className="mr-2"/> Search Users</TabsTrigger>
                        <TabsTrigger value="analytics"><Star className="mr-2"/> Constellation</TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile" className="mt-6">
                        <UserProfileCard user={currentUserData} isOwnProfile={true} />
                    </TabsContent>
                    <TabsContent value="search" className="mt-6">
                        <SearchUsersTab />
                    </TabsContent>
                    <TabsContent value="analytics" className="mt-6">
                        <AnalyticsTab />
                    </TabsContent>
                </Tabs>
            </div>
        </FriendsProvider>
    )
}
