
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Loader2, Plus, Users, Search, Filter, Lock, ShieldAlert, Trophy, Star, Crown } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { clanLevelConfig } from '@/app/lib/clan-levels';


function GroupCard({ group, index }: { group: Group, index: number }) {
    const banner = groupBanners.find(b => b.id === group.banner) || groupBanners[0];
    const isMaxLevel = (group.level >= 5) || (group.tempMaxLevelExpires && new Date(group.tempMaxLevelExpires) > new Date());
    const levelInfo = clanLevelConfig.find(l => l.level === (isMaxLevel ? 5 : group.level)) || clanLevelConfig[0];
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Link href={`/dashboard/groups/${group.id}`} className="group block h-full">
                <Card className={cn(
                    "h-full flex flex-col hover:border-primary transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden",
                    isMaxLevel ? "border-yellow-500/50 shadow-yellow-500/20" : levelInfo.borderColorClass
                )}>
                    {/* Banner Background */}
                    <div className={cn("absolute inset-0 z-0 opacity-30 group-hover:opacity-50 transition-opacity", banner.class)}></div>
                    <div className="absolute inset-0 z-0 bg-gradient-to-t from-card via-card/80 to-transparent"></div>

                    {/* Level Badge Overlay */}
                    <div className="absolute top-2 right-2 z-20">
                        {isMaxLevel ? (
                            <Badge className="bg-yellow-400 text-black font-black animate-gold-shine border-2 border-yellow-200">MAX ASCENDED</Badge>
                        ) : (
                            <Badge variant="outline" className={cn("bg-background/80 backdrop-blur-sm font-bold", levelInfo.avatarBorderClass.replace('border-', 'text-'))}>
                                LVL {group.level}
                            </Badge>
                        )}
                    </div>

                    <CardHeader className="relative z-10 flex-row items-start gap-4">
                        <Avatar className={cn("h-16 w-16 border-4 shrink-0 transition-transform group-hover:scale-110", isMaxLevel ? "border-yellow-400 animate-gold-shine" : levelInfo.avatarBorderClass)}>
                            <AvatarImage src={group.logoUrl || undefined} />
                            <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                             <CardTitle className={cn("line-clamp-1", isMaxLevel && "text-yellow-500")}>{group.name}</CardTitle>
                            {group.motto && <CardDescription className="italic line-clamp-1">"{group.motto}"</CardDescription>}
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10 flex-1 flex flex-col justify-end">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center -space-x-3">
                                {group.memberDetails?.slice(0, 5).map(member => (
                                    <Avatar key={member.uid} className="border-2 border-background h-8 w-8">
                                        <AvatarImage src={member.photoURL} />
                                        <AvatarFallback>{member.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                ))}
                                {group.members.length > 5 && (
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold border-2 border-background">
                                        +{group.members.length - 5}
                                    </div>
                                )}
                            </div>
                            {levelInfo.badge && (
                                <span className={cn("text-[10px] uppercase font-black", levelInfo.badge.class)}>{levelInfo.badge.name}</span>
                            )}
                        </div>
                        <p className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-widest">{group.members.length} WARRIORS</p>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
}

function ExploreClans() {
    const { allPublicGroups, loading, sendJoinRequest, addMemberToAutoJoinClan, sentJoinRequests, groups } = useGroups();
    const { user } = useUser();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState('');

    const alreadyInClan = groups.length > 0;

    const filteredGroups = allPublicGroups.filter(g => 
        g.isPublic &&
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !g.memberUids?.includes(user?.id || '')
    );
    
    const topClans = [...allPublicGroups].sort((a,b) => b.members.length - a.members.length).slice(0, 10);

    const handleJoin = async (group: Group) => {
        if (!user) return;
        if (alreadyInClan) {
            router.push(`/dashboard/groups/${groups[0].id}`);
            return;
        }
        setIsSubmitting(group.id);
        try {
            if (group.joinMode === 'auto') {
                await addMemberToAutoJoinClan(group);
                router.push(`/dashboard/groups/${group.id}`);
            } else {
                await sendJoinRequest(group);
            }
        } finally {
            setIsSubmitting('');
        }
    }
    
    const handleInspect = (group: Group) => {
        router.push(`/dashboard/groups/inspect/${group.id}`);
    }

    if (loading) return <div className="flex items-center justify-center p-10"><Loader2 className="h-8 w-8 animate-spin"/></div>

    return (
        <div className="space-y-8">
            {alreadyInClan && (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
                    <ShieldAlert className="text-primary h-5 w-5 shrink-0" />
                    <p className="text-sm">You are already a member of <strong>{groups[0].name}</strong>. You must leave your current clan to join another.</p>
                </div>
            )}

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search for public clans..." className="pl-10 h-12" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(searchTerm ? filteredGroups : topClans).map((group, index) => {
                    const hasRequested = sentJoinRequests.some(r => r.groupId === group.id);
                    const isMaxLevel = (group.level >= 5) || (group.tempMaxLevelExpires && new Date(group.tempMaxLevelExpires) > new Date());
                    const levelInfo = clanLevelConfig.find(l => l.level === (isMaxLevel ? 5 : group.level)) || clanLevelConfig[0];

                    return (
                        <motion.div
                            key={group.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className={cn(
                                "flex flex-col relative overflow-hidden group border-2 transition-all duration-300",
                                isMaxLevel ? "border-yellow-500 shadow-xl shadow-yellow-500/10" : levelInfo.borderColorClass
                            )}>
                                {/* Level Ribbon */}
                                <div className={cn(
                                    "absolute top-0 right-0 px-3 py-1 rounded-bl-lg text-[10px] font-black uppercase z-20",
                                    isMaxLevel ? "bg-yellow-400 text-black animate-pulse" : "bg-muted text-muted-foreground"
                                )}>
                                    Level {group.level}
                                </div>

                                <CardHeader className="flex-row items-center gap-4 relative z-10">
                                    <Avatar className={cn("h-14 w-14 border-2 shrink-0", isMaxLevel ? "border-yellow-400" : levelInfo.avatarBorderClass)}>
                                        <AvatarImage src={group.logoUrl || undefined} />
                                        <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 truncate">
                                        <CardTitle className={cn("text-lg line-clamp-1", isMaxLevel && "text-yellow-500")}>{group.name}</CardTitle>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-[10px] px-1.5">{group.members.length} members</Badge>
                                            {group.joinMode === 'auto' ? (
                                                <Badge variant="secondary" className="bg-green-500/10 text-green-700 text-[10px]">Open</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 text-[10px]">Request</Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 pt-0">
                                    <p className="text-sm text-muted-foreground italic line-clamp-2 min-h-[40px]">"{group.motto || 'No motto set.'}"</p>
                                </CardContent>
                                <CardFooter className="grid grid-cols-2 gap-2 border-t pt-4 bg-muted/30">
                                    <Button variant="outline" size="sm" onClick={() => handleInspect(group)}>Inspect</Button>
                                    <Button size="sm" onClick={() => handleJoin(group)} disabled={hasRequested || isSubmitting === group.id || alreadyInClan}>
                                        {isSubmitting === group.id ? <Loader2 className="h-4 w-4 animate-spin"/> :
                                         alreadyInClan ? "Active" :
                                         hasRequested ? "Pending" : "Join"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )
                })}
            </div>
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

    const alreadyInClan = groups.length > 0;

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
                {!alreadyInClan && (
                    <Button onClick={() => setIsCreateOpen(true)} disabled={!user}>
                        <Plus className="mr-2 h-4 w-4" /> Create Clan
                    </Button>
                )}
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
                        <TabsTrigger value="my-clans">My Clan</TabsTrigger>
                        <TabsTrigger value="explore">Explore Clans</TabsTrigger>
                    </TabsList>
                    <TabsContent value="my-clans" className="mt-6">
                        {groups.length === 0 ? (
                             <Card className="text-center py-16 border-dashed">
                                <CardHeader>
                                    <CardTitle>No Clan Membership</CardTitle>
                                    <CardDescription>You are a lone wolf. Join an existing clan or forge your own to unlock team features!</CardDescription>
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
