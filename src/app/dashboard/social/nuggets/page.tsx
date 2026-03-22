'use client';

import { useMemo } from 'react';
import { useWorldChat, WorldChatMessage, WorldChatProvider } from '@/hooks/use-world-chat';
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

function NuggetJarContent() {
    const { messages, loading: messagesLoading } = useWorldChat();
    const { users, loading: usersLoading } = useAdmin();

    const nuggets = useMemo(() => {
        return messages.filter(m => m.nuggetMarkedBy && m.nuggetMarkedBy.length > 0);
    }, [messages]);

    const usersMap = useMemo(() => new Map(users.map(u => [u.uid, u])), [users]);

    const groupedNuggets = useMemo(() => {
        return nuggets.reduce((acc, nugget) => {
            const dateStr = format(nugget.timestamp, 'yyyy-MM-dd');
            if (!acc[dateStr]) acc[dateStr] = [];
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
        <div className="space-y-8 p-4">
            <div className="flex flex-col gap-4">
                 <Button asChild variant="outline" className="w-fit">
                    <Link href="/dashboard/world"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Global Forum</Link>
                </Button>
                <div className="text-center">
                    <Gem className="h-16 w-16 text-amber-500 mx-auto mb-2 animate-gold-shine" />
                    <h1 className="text-4xl font-black tracking-tight uppercase">The Wisdom Nugget Jar</h1>
                    <p className="text-muted-foreground max-w-md mx-auto">Treasured knowledge shared by our community of legends.</p>
                </div>
            </div>

            {nuggets.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                    <Gem className="h-20 w-20 mx-auto mb-4" />
                    <p className="text-xl font-bold uppercase tracking-widest">The Jar is Empty</p>
                    <p className="text-sm">Mark helpful messages in the Global Forum to see them here.</p>
                </div>
            ) : (
                <div className="space-y-8 max-w-3xl mx-auto">
                    {sortedGroups.map(dateStr => {
                        const nuggetsForDay = groupedNuggets[dateStr];
                        const date = new Date(dateStr);
                        
                        return (
                            <div key={dateStr}>
                                <div className="flex justify-center mb-6">
                                    <span className="px-4 py-1 bg-muted rounded-full text-xs font-bold uppercase text-muted-foreground">{formatDateHeading(date)}</span>
                                </div>
                                <div className="space-y-4">
                                    {nuggetsForDay.map(nugget => {
                                        const sender = usersMap.get(nugget.senderId);
                                        return (
                                            <Card key={nugget.id} className="border-amber-400/30 bg-amber-400/5 shadow-xl shadow-amber-500/5 overflow-hidden">
                                                <CardContent className="p-6">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <Avatar className="h-10 w-10 border-2 border-amber-400/50">
                                                            <AvatarImage src={sender?.photoURL} />
                                                            <AvatarFallback>{sender?.displayName?.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-black uppercase text-sm">{sender?.displayName || 'Unknown User'}</p>
                                                            <p className="text-[10px] opacity-60">{formatDistanceToNow(nugget.timestamp, { addSuffix: true })}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-lg leading-relaxed font-medium italic text-foreground/90 whitespace-pre-wrap">"{nugget.text}"</p>
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

export default function NuggetJarPage() {
    return (
        <WorldChatProvider>
            <NuggetJarContent />
        </WorldChatProvider>
    )
}
