

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User as UserIcon, Star, Search } from 'lucide-react';
import { useAdmin, useUsers, SUPER_ADMIN_UID, User, BadgeType } from '@/hooks/use-admin';
import { useUser, useClerk } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { useQuizzes } from '@/hooks/use-quizzes';
import { Input } from '@/components/ui/input';
import { ProgressConstellation } from '@/components/analytics/progress-constellation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFriends, FriendsProvider } from '@/hooks/use-friends';
import { UserProfileCard } from '@/components/profile/user-profile-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


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
