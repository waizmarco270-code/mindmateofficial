
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Loader2, Plus, Users, Crown, Star, Medal } from 'lucide-react';
import { CreateGroupModal } from '@/components/groups/create-group-modal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { useUser, SignedOut } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';
import { useGroups, type Group } from '@/hooks/use-groups.tsx';
import type { User } from '@/hooks/use-admin';
import { FriendsProvider } from '@/hooks/use-friends';
import { GroupsProvider } from '@/hooks/use-groups.tsx';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { groupBanners } from '@/lib/group-assets';

function GroupCard({ group, index }: { group: Group, index: number }) {
    const banner = groupBanners.find(b => b.id === group.banner) || groupBanners[0];
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Link href={`/dashboard/groups/${group.id}`} className="group block">
                <Card className="h-full flex flex-col hover:border-primary transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
                    {/* Banner Background */}
                    <div className={cn("absolute inset-0 z-0 opacity-30 group-hover:opacity-50 transition-opacity", banner.class)}></div>
                    <div className="absolute inset-0 z-0 bg-gradient-to-t from-card via-card/80 to-transparent"></div>

                    <CardHeader className="relative z-10 flex-row items-start gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/50 shrink-0">
                            <AvatarImage src={group.logoUrl || undefined} />
                            <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                             <CardTitle>{group.name}</CardTitle>
                            {group.motto && <CardDescription className="italic">"{group.motto}"</CardDescription>}
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10 flex-1 flex flex-col justify-end">
                        <div className="flex items-center -space-x-3">
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
                        <p className="text-sm font-semibold text-muted-foreground mt-2">{group.members.length} member(s)</p>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
}

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
                    Study Clans
                    </h1>
                    <p className="text-muted-foreground">Collaborate, compete, and conquer your goals together.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} disabled={!user}>
                    <Plus className="mr-2 h-4 w-4" /> Create Clan
                </Button>
            </div>

            <div className="relative">
                 <SignedOut>
                    <LoginWall 
                        title="Join or Create a Clan"
                        description="Sign up to team up with your friends, create study clans, and compete on private leaderboards."
                    />
                </SignedOut>

                {groups.length === 0 ? (
                     <Card className="text-center py-16 border-dashed">
                        <CardHeader>
                            <CardTitle>No Clans Yet</CardTitle>
                            <CardDescription>You haven't joined or created any clans. Forge one to get started!</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button onClick={() => setIsCreateOpen(true)} disabled={!user}>
                                <Plus className="mr-2 h-4 w-4" /> Create Your First Clan
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map((group, index) => (
                           <GroupCard key={group.id} group={group} index={index} />
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
