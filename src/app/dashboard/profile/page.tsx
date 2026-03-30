
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User as UserIcon, Star, Search, Trophy, Brain, Compass } from 'lucide-react';
import { useAdmin, useUsers, SUPER_ADMIN_UID, User, BadgeType } from '@/hooks/use-admin';
import { useUser, useClerk } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { useQuizzes } from '@/hooks/use-quizzes';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFriends, FriendsProvider } from '@/hooks/use-friends';
import { UserProfileCard } from '@/components/profile/user-profile-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

            <Dialog open={!!selectedUser} onOpenChange={(isOpen) => !isOpen && setSelectedUser(null)}>
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
                <h1 className="text-3xl font-bold tracking-tight">Profile Hub</h1>

                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="profile"><UserIcon className="mr-2 h-4 w-4"/> Your Profile</TabsTrigger>
                        <TabsTrigger value="search"><Search className="mr-2 h-4 w-4"/> Search Users</TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile" className="mt-6">
                        <UserProfileCard user={currentUserData} isOwnProfile={true} />
                    </TabsContent>
                    <TabsContent value="search" className="mt-6">
                        <SearchUsersTab />
                    </TabsContent>
                </Tabs>
            </div>
        </FriendsProvider>
    )
}
