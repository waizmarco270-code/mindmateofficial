

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Medal, Flame, Zap, ListChecks, Code, ShieldCheck, Crown, Gamepad2, Swords, CreditCard, UserPlus, UserCheck, Trophy, Clock } from 'lucide-react';
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
        user.isCoDev && { type: 'co-dev', name: 'Co-Developer', badge: <span className="co-dev-badge"><Code className="h-3 w-3"/> Co-Dev</span> }
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
                                {hasMasterCard && <span className="master-card-badge"><CreditCard className="h-3 w-3"/> MASTER</span>}
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {hasMasterCard && (
                        <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-yellow-400/10 to-amber-500/10 border border-yellow-500/30 text-center">
                            <p className="font-bold text-sm text-yellow-400">Master Card Active!</p>
                            <p className="text-xs text-yellow-400/80">Expires on {format(new Date(user.masterCardExpires!), 'PPP')}</p>
                        </div>
                    )}
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
