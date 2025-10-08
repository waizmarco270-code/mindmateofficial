
'use client';

import { useMemo } from 'react';
import { useWorldChat, WorldChatMessage } from '@/hooks/use-world-chat';
import { useAdmin, User } from '@/hooks/use-admin';
import { ArrowLeft, Gem, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const formatDateHeading = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
}

export default function NuggetJarPage() {
    const { messages, loading: messagesLoading } = useWorldChat();
    const { users, loading: usersLoading } = useAdmin();

    const nuggets = useMemo(() => {
        return messages.filter(m => m.nuggetMarkedBy && m.nuggetMarkedBy.length > 0);
    }, [messages]);

    const usersMap = useMemo(() => new Map(users.map(u => [u.uid, u])), [users]);

    const groupedNuggets = useMemo(() => {
        return nuggets.reduce((acc, nugget) => {
            const dateStr = format(nugget.timestamp, 'yyyy-MM-dd');
            if (!acc[dateStr]) {
                acc[dateStr] = [];
            }
            acc[dateStr].push(nugget);
            return acc;
        }, {} as Record<string, WorldChatMessage[]>);
    }, [nuggets]);

    const sortedGroups = Object.keys(groupedNuggets).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    if (messagesLoading || usersLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                 <Button asChild variant="outline" className="mb-4">
                    <Link href="/dashboard/social"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Social Hub</Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <Gem className="h-8 w-8 text-amber-500" />
                  Wisdom Nugget Jar
                </h1>
                <p className="text-muted-foreground">A collection of the most helpful messages from the community.</p>
            </div>

            {nuggets.length === 0 ? (
                <Card className="text-center py-16 border-dashed">
                    <CardContent>
                        <p className="text-lg text-muted-foreground">The Nugget Jar is empty.</p>
                        <p className="text-sm text-muted-foreground">Mark helpful messages in the World Chat to save them here!</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-8">
                    {sortedGroups.map(dateStr => {
                        const nuggetsForDay = groupedNuggets[dateStr];
                        const date = new Date(dateStr);
                        
                        return (
                            <div key={dateStr}>
                                <h2 className="font-bold text-xl mb-4 pb-2 border-b">{formatDateHeading(date)}</h2>
                                <div className="space-y-4">
                                    {nuggetsForDay.map(nugget => {
                                        const sender = usersMap.get(nugget.senderId);
                                        return (
                                            <Card key={nugget.id} className="bg-card/80">
                                                <CardContent className="p-4 flex items-start gap-4">
                                                     <Avatar className="h-10 w-10 border">
                                                        <AvatarImage src={sender?.photoURL} />
                                                        <AvatarFallback>{sender?.displayName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                         <div className="flex items-center justify-between text-sm">
                                                            <p className="font-semibold">{sender?.displayName || 'Unknown User'}</p>
                                                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(nugget.timestamp, { addSuffix: true })}</p>
                                                        </div>
                                                         <p className="text-base text-foreground mt-1 whitespace-pre-wrap">{nugget.text}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}

