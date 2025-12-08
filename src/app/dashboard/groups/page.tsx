

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Loader2, Plus, Users, Search, Filter } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

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

function ExploreClans() {
    const { allPublicGroups, loading, sendJoinRequest, addMemberToAutoJoinClan, sentJoinRequests } = useGroups();
    const { user } = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState('');

    const filteredGroups = allPublicGroups.filter(g => 
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !g.members.includes(user?.id || '')
    );

    const handleJoin = async (group: Group) => {
        setIsSubmitting(group.id);
        if (group.joinMode === 'auto') {
            await addMemberToAutoJoinClan(group);
        } else {
            await sendJoinRequest(group);
        }
        setIsSubmitting('');
    }

    if (loading) return <div className="flex items-center justify-center p-10"><Loader2 className="h-8 w-8 animate-spin"/></div>

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search for public clans..." className="pl-10 h-12" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            {filteredGroups.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">No clans found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredGroups.map(group => {
                        const hasRequested = sentJoinRequests.some(r => r.groupId === group.id);
                        return (
                             <Card key={group.id} className="flex flex-col">
                                <CardHeader className="flex-row items-start gap-4">
                                     <Avatar className="h-12 w-12 border-2 border-primary/50 shrink-0">
                                        <AvatarImage src={group.logoUrl || undefined} />
                                        <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                     <div className="flex-1">
                                        <CardTitle>{group.name}</CardTitle>
                                        <CardDescription>{group.members.length} members</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-sm text-muted-foreground italic line-clamp-2">{group.motto || 'No motto set.'}</p>
                                </CardContent>
                                <CardFooter>
                                    <Button className="w-full" onClick={() => handleJoin(group)} disabled={hasRequested || isSubmitting === group.id}>
                                        {isSubmitting === group.id ? <Loader2 className="h-4 w-4 animate-spin"/> :
                                         hasRequested ? "Request Sent" :
                                         group.joinMode === 'auto' ? "Join Now" : "Send Join Request"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
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

                <Tabs defaultValue="my-clans">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="my-clans">My Clans</TabsTrigger>
                        <TabsTrigger value="explore">Explore Clans</TabsTrigger>
                    </TabsList>
                    <TabsContent value="my-clans" className="mt-6">
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
                    </TabsContent>
                    <TabsContent value="explore" className="mt-6">
                        <ExploreClans />
                    </TabsContent>
                </Tabs>
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
