
'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, Check, User as UserIcon, Medal, Flame, Zap, ListChecks, Code, ShieldCheck, Crown, Gamepad2 } from 'lucide-react';
import { SUPER_ADMIN_UID } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
    const { user, isLoaded } = useUser();
    const { currentUserData, loading: usersLoading } = useUsers();
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);

    const loading = !isLoaded || usersLoading;

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }
    
    if (!user || !currentUserData) {
        return <p>User not found.</p>
    }

    const handleCopyId = () => {
        navigator.clipboard.writeText(user.id);
        setIsCopied(true);
        toast({ title: 'User ID Copied!' });
        setTimeout(() => setIsCopied(false), 2000);
    };
    
    const isSuperAdmin = currentUserData.uid === SUPER_ADMIN_UID;
    const isAdmin = currentUserData.isAdmin;
    const isVip = currentUserData.isVip;
    const isGM = currentUserData.isGM;

    const stats = [
        { label: 'Current Credits', value: currentUserData.credits || 0, icon: Medal, color: 'text-amber-500' },
        { label: 'Current Streak', value: currentUserData.streak || 0, icon: Flame, color: 'text-orange-500' },
        { label: 'Longest Streak', value: currentUserData.longestStreak || 0, icon: Flame, color: 'text-red-500' },
        { label: 'Focus Sessions', value: currentUserData.focusSessionsCompleted || 0, icon: Zap, color: 'text-green-500' },
        { label: 'Tasks Completed', value: currentUserData.dailyTasksCompleted || 0, icon: ListChecks, color: 'text-blue-500' },
    ];


    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-primary shadow-lg">
                    <AvatarImage src={currentUserData.photoURL} alt={currentUserData.displayName} />
                    <AvatarFallback className="text-3xl">{currentUserData.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">{currentUserData.displayName}</h1>
                    <p className="text-muted-foreground">{currentUserData.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                        {isSuperAdmin ? (
                            <span className="dev-badge"><Code className="h-3 w-3" /> DEV</span>
                        ) : isAdmin ? (
                            <span className="admin-badge"><ShieldCheck className="h-3 w-3"/> ADMIN</span>
                        ) : isVip ? (
                            <span className="elite-badge"><Crown className="h-3 w-3"/> ELITE</span>
                        ) : isGM ? (
                            <span className="gm-badge">GM</span>
                        ) : (
                             <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border"><UserIcon className="h-3 w-3" /> Member</span>
                        )}
                    </div>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <div>
                            <p className="text-sm text-muted-foreground">Clerk User ID</p>
                            <p className="font-mono text-xs">{user.id}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={handleCopyId}>
                            {isCopied ? <Check className="h-4 w-4 text-green-500"/> : <Copy className="h-4 w-4"/>}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map(stat => (
                    <Card key={stat.label}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                            <stat.icon className={cn("h-5 w-5 text-muted-foreground", stat.color)} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold">{stat.value.toLocaleString()}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

        </div>
    );
}
