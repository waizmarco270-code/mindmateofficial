
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Medal, Flame, Zap, ListChecks, Code, ShieldCheck, Crown, Gamepad2, Swords, CreditCard, UserPlus, UserCheck, Trophy, Clock, ShieldAlert, Snowflake, Sparkles, Bird, Moon, TrendingUp } from 'lucide-react';
import { useAdmin, useUsers, SUPER_ADMIN_UID, User, BadgeType } from '@/hooks/use-admin';
import { useUser, useClerk } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFriends } from '@/hooks/use-friends';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Link from 'next/link';

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

export function UserProfileCard({ user, isOwnProfile = false }: { user: User, isOwnProfile?: boolean }) {
    const { user: authUser } = useUser();
    const { friends, sendFriendRequest, sentRequests } = useFriends();
    const { setShowcaseBadge } = useAdmin();
    const [isCopied, setIsCopied] = useState(false);
    const { toast } = useToast();

    if (!user) return null;
    
    const handleCopyId = () => {
        if (!user) return;
        navigator.clipboard.writeText(user.uid || '');
        setIsCopied(true);
        toast({ title: "User ID copied!" });
        setTimeout(() => setIsCopied(false), 2000);
    }
    
    const isSuperAdmin = user.uid === SUPER_ADMIN_UID;
    const hasMasterCard = user.masterCardExpires && new Date(user.masterCardExpires) > new Date();

    const ownedBadges = [
        (isSuperAdmin || user.isAdmin) && { type: 'admin', name: 'Admin', badge: <span className="admin-badge"><ShieldCheck className="h-3 w-3" /> ADMIN</span> },
        user.isVip && { type: 'vip', name: 'Elite Member', badge: <span className="elite-badge"><Crown className="h-3 w-3" /> ELITE</span> },
        user.isGM && { type: 'gm', name: 'Game Master', badge: <span className="gm-badge">GM</span> },
        user.isChallenger && { type: 'challenger', name: 'Challenger', badge: <span className="challenger-badge"><Swords className="h-3 w-3"/> Challenger</span> },
        user.isCoDev && { type: 'co-dev', name: 'Co-Developer', badge: <span className="co-dev-badge"><Code className="h-3 w-3"/> Co-Dev</span> },
        user.isEarlyBird && { type: 'early-bird', name: 'Early Bird', badge: <span className="early-bird-badge"><Bird className="h-3 w-3"/> EARLY BIRD</span> },
        user.isNightOwl && { type: 'night-owl', name: 'Night Owl', badge: <span className="night-owl-badge"><Moon className="h-3 w-3"/> NIGHT OWL</span> },
        user.isKnowledgeKnight && { type: 'knowledge-knight', name: 'Knowledge Knight', badge: <span className="knowledge-knight-badge"><ShieldCheck className="h-3 w-3"/> KNIGHT</span> }
    ].filter(Boolean) as { type: BadgeType, name: string, badge: JSX.Element }[];
    
    if(isSuperAdmin) ownedBadges.unshift({ type: 'dev', name: 'Developer', badge: <span className="dev-badge"><Code className="h-3 w-3" /> DEV</span> });

    const showcasedBadge = ownedBadges.find(b => b.type === user.showcasedBadge) || ownedBadges[0] || null;

    const stats = [
        { label: 'Total Credits', value: hasMasterCard ? '∞' : user.credits.toLocaleString(), icon: Medal, color: 'text-amber-500' },
        { label: 'Current Streak', value: user.streak || 0, icon: Flame, color: 'text-orange-500' },
        { label: 'Longest Streak', value: user.longestStreak || 0, icon: Trophy, color: 'text-yellow-400' },
        { label: 'Focus Sessions', value: user.focusSessionsCompleted || 0, icon: Zap, color: 'text-green-500' },
        { label: 'Tasks Completed', value: user.dailyTasksCompleted || 0, icon: ListChecks, color: 'text-blue-500' },
    ];

    const artifacts = [
        { name: 'Penalty Aegis', count: user.inventory?.penaltyShields || 0, icon: ShieldAlert, color: 'text-blue-400', desc: 'Protects from Focus penalties.' },
        { name: 'Chronos Freeze', count: user.inventory?.streakFreezes || 0, icon: Snowflake, color: 'text-cyan-400', desc: 'Saves your daily streak.' },
        { name: 'Alpha Radiance', active: user.inventory?.alphaGlowExpires && new Date(user.inventory.alphaGlowExpires) > new Date(), icon: Sparkles, color: 'text-fuchsia-400', desc: 'Glow in World Chat.', expiry: user.inventory?.alphaGlowExpires },
        { name: 'XP Booster', count: user.inventory?.clanXpBoosters || 0, icon: TrendingUp, color: 'text-emerald-400', desc: '+500 Clan XP.' },
        { name: 'Clan Ascender', count: user.inventory?.clanLevelMaxers || 0, icon: Crown, color: 'text-yellow-400', desc: 'Instant Max Level.' },
    ];
    
    return (
        <div className="space-y-6">
            <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(to_bottom,white:10%,transparent:90%)]" />
                <CardHeader className="relative z-10">
                    <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-1000" />
                            <Avatar className="h-24 w-24 border-2 border-primary relative bg-background">
                                <AvatarImage src={user.photoURL} />
                                <AvatarFallback className="text-3xl">{user.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-4xl font-black tracking-tight">{user.displayName}</CardTitle>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                                {showcasedBadge ? showcasedBadge.badge : <Badge variant="outline" className="font-bold">STUDENT</Badge>}
                                {hasMasterCard && <span className="master-card-badge"><CreditCard className="h-3 w-3"/> MASTER</span>}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="space-y-2">
                        <Label htmlFor="user-id" className="font-bold text-xs uppercase tracking-widest text-muted-foreground">MindMate ID</Label>
                        <div className="flex items-center gap-2">
                           <Input id="user-id" readOnly value={user.uid || ''} className="font-mono bg-muted/50 border-primary/10 h-12"/>
                           <Button size="icon" variant="outline" className="h-12 w-12" onClick={handleCopyId}>
                                {isCopied ? <Check className="h-4 w-4 text-green-500"/> : <Copy className="h-4 w-4"/>}
                           </Button>
                        </div>
                    </div>
                    {!isOwnProfile && authUser && (
                         <div className="mt-4">
                            {friends.some(f => f.uid === user.uid) ? (
                                <Button className="w-full h-12 font-bold" disabled variant="secondary"> <UserCheck className="mr-2"/> Friends Forever</Button>
                            ) : sentRequests.some(r => r.receiverId === user.uid) ? (
                                 <Button className="w-full h-12 font-bold" disabled> <UserCheck className="mr-2"/> Ally Request Sent</Button>
                            ) : (
                                <Button className="w-full h-12 font-bold" onClick={() => sendFriendRequest(user.uid)}>
                                    <UserPlus className="mr-2"/> Form Alliance
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Tabs defaultValue="stats" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50 p-1 rounded-xl border">
                    <TabsTrigger value="stats" className="rounded-lg font-bold">Statistics</TabsTrigger>
                    <TabsTrigger value="inventory" className="rounded-lg font-bold">Nexus Artifacts</TabsTrigger>
                </TabsList>

                <TabsContent value="stats" className="space-y-6">
                    {isOwnProfile && ownedBadges.length > 1 && (
                        <Card className="border-primary/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-bold">Showcase Badge</CardTitle>
                                <CardDescription>Display your rank to the world.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-wrap gap-3">
                                {ownedBadges.map(b => (
                                    <button key={b.type} onClick={() => setShowcaseBadge(user.uid, b.type)} className={cn("p-2 rounded-xl border-2 transition-all", user.showcasedBadge === b.type || (!user.showcasedBadge && b.type === (isSuperAdmin ? 'dev' : 'admin')) ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-muted')}>
                                        {b.badge}
                                    </button>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {stats.map(stat => (
                            <Card key={stat.label} className="bg-gradient-to-br from-card to-muted/30">
                                <CardHeader className="p-4 flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
                                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <div className="text-3xl font-black tracking-tighter">{stat.value}</div>
                                </CardContent>
                            </Card>
                        ))}
                        <Card className="col-span-2 md:col-span-1 bg-primary/5 border-primary/20">
                            <CardHeader className="p-4 flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary">Focused Time</CardTitle>
                                <Clock className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-3xl font-black tracking-tighter text-primary">{formatTotalStudyTime(user.totalStudyTime || 0)}</div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="inventory">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {artifacts.map((art, i) => (
                            <Card key={i} className="bg-muted/30 border-dashed border-2">
                                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                                    <div className={cn("p-3 rounded-2xl bg-background shadow-inner", art.color)}>
                                        <art.icon className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="font-black text-lg">{art.name}</p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{art.desc}</p>
                                    </div>
                                    <div className="mt-2">
                                        {art.expiry ? (
                                            <Badge variant={art.active ? "default" : "secondary"}>
                                                {art.active ? `Expires: ${format(new Date(art.expiry), 'MMM d')}` : "Expired"}
                                            </Badge>
                                        ) : (
                                            <p className="text-2xl font-black text-primary">x{art.count}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {isOwnProfile && (
                        <Button asChild variant="outline" className="w-full mt-6 h-12 rounded-xl font-bold">
                            <Link href="/dashboard/store">Visit Nexus Emporium</Link>
                        </Button>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
