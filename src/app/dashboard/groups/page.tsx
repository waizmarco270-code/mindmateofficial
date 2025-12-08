
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Loader2, Plus, Users } from 'lucide-react';
import { CreateGroupModal } from '@/components/groups/create-group-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useUser, SignedOut } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';
import { useGroups, type Group } from '@/hooks/use-groups.tsx';
import type { User } from '@/hooks/use-admin';
import { FriendsProvider } from '@/hooks/use-friends';
import { GroupsProvider } from '@/hooks/use-groups.tsx';

function GroupsPageContent() {
    const { user } = useUser();
    const { groups, loading } = useGroups();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Users className="h-8 w-8 text-primary" />
                    Study Groups
                    </h1>
                    <p className="text-muted-foreground">Collaborate, compete, and conquer your goals together.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} disabled={!user}>
                    <Plus className="mr-2 h-4 w-4" /> Create Group
                </Button>
            </div>

            <div className="relative">
                 <SignedOut>
                    <LoginWall 
                        title="Join or Create a Group"
                        description="Sign up to team up with your friends, create study groups, and compete on private leaderboards."
                    />
                </SignedOut>

                {groups.length === 0 ? (
                     <Card className="text-center py-16 border-dashed">
                        <CardHeader>
                            <CardTitle>No Groups Yet</CardTitle>
                            <CardDescription>You haven't joined or created any groups. Create one to get started!</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button onClick={() => setIsCreateOpen(true)} disabled={!user}>
                                <Plus className="mr-2 h-4 w-4" /> Create Your First Group
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map(group => (
                            <Link key={group.id} href={`/dashboard/groups/${group.id}`} className="group block">
                                <Card className="h-full flex flex-col hover:border-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                    <CardHeader>
                                        <CardTitle>{group.name}</CardTitle>
                                        <CardDescription>{group.members.length} member(s)</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col justify-end">
                                        <div className="flex items-center -space-x-2">
                                            {group.memberDetails?.slice(0, 5).map(member => (
                                                <Avatar key={member.uid} className="border-2 border-background">
                                                    <AvatarImage src={member.photoURL} />
                                                    <AvatarFallback>{member.displayName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                            {group.members.length > 5 && (
                                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs font-bold border-2 border-background">
                                                    +{group.members.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <CreateGroupModal isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />
        </div>
    );
}

export default function GroupsPage() {
    return (
        <FriendsProvider>
            <GroupsProvider>
                <GroupsPageContent />
            </GroupsProvider>
        </FriendsProvider>
    );
}
