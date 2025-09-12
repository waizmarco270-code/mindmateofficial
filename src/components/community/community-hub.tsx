'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Globe, MessageSquare, Crown, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelative } from 'date-fns';
import { useGlobalChat, type GlobalMessage } from '@/hooks/use-global-chat';
import { useUsers, User, SUPER_ADMIN_UID } from '@/hooks/use-admin';
import { Skeleton } from '@/components/ui/skeleton';
import { useUnreadMessages } from '@/hooks/use-unread';

export default function CommunityHub() {
    const { messages, sendMessage, loading: chatLoading } = useGlobalChat();
    const [newMessage, setNewMessage] = useState('');
    const { user: currentUser } = useUser();
    const { users: allUsers } = useUsers();
    const { markGlobalAsRead } = useUnreadMessages();
    const scrollAreaRef = useRef<HTMLDivElement>(null);
   
    useEffect(() => {
      markGlobalAsRead();
       if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }, [markGlobalAsRead]);

    // This effect will run ONLY when the number of messages changes.
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({
                top: scrollAreaRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages.length]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && currentUser) {
            sendMessage(newMessage);
            setNewMessage('');
        }
    };
    
    if (!currentUser) {
        return <div className="flex h-full items-center justify-center">Loading...</div>
    }

    return (
        <div className="h-full">
            <Card className="h-full flex flex-col">
                <CardHeader className="border-b">
                    <CardTitle className="flex items-center gap-2"><Globe/> Global Chat</CardTitle>
                    <CardDescription>Talk with the entire MindMate community.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                    <ScrollArea className="h-full" viewportRef={scrollAreaRef}>
                        <div className="p-4 space-y-6">
                            {chatLoading && Array.from({length: 5}).map((_, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-8 w-48" />
                                    </div>
                                </div>
                            ))}
                            {!chatLoading && messages.map((msg) => {
                                const sender = allUsers.find(u => u.uid === msg.senderId);
                                const isCurrentUser = msg.senderId === currentUser?.id;
                                return (
                                    <ChatMessage
                                        key={msg.id}
                                        message={msg}
                                        sender={sender}
                                        isCurrentUser={isCurrentUser}
                                    />
                                );
                            })}
                            {!chatLoading && messages.length === 0 && (
                                <div className="text-center text-muted-foreground pt-16 flex flex-col items-center">
                                    <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4"/>
                                    <h3 className="font-semibold">Welcome to the Global Chat!</h3>
                                    <p>Be the first to say something.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="p-2 border-t bg-background">
                    <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={currentUser.imageUrl ?? undefined} />
                            <AvatarFallback>{currentUser.fullName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            autoComplete="off"
                            className="h-12 text-base"
                        />
                        <Button type="submit" size="icon" className="h-12 w-12" disabled={!newMessage.trim()}>
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}

interface ChatMessageProps {
    message: GlobalMessage;
    sender: User | undefined;
    isCurrentUser: boolean;
}

function ChatMessage({ message, sender, isCurrentUser }: ChatMessageProps) {
    const { user } = useUser();
    const displayTime = message.timestamp ? formatRelative(message.timestamp, new Date()) : "sending...";
    const isVip = sender?.isAdmin ?? false;
    const isSuperAdmin = sender?.uid === SUPER_ADMIN_UID;

    return (
        <div className={cn("flex items-start gap-3", isCurrentUser && "justify-end")}>
             {!isCurrentUser && (
                <Avatar className="h-10 w-10">
                    <AvatarImage src={sender?.photoURL ?? undefined} alt={sender?.displayName} />
                    <AvatarFallback>{sender?.displayName.charAt(0) ?? '?'}</AvatarFallback>
                </Avatar>
            )}
            <div className="flex flex-col gap-1 max-w-md group">
                 {!isCurrentUser && (
                    <p className="text-xs text-muted-foreground font-semibold px-1 flex items-center gap-1.5">
                        {sender?.displayName ?? 'Unknown User'}
                        {isSuperAdmin ? (
                            <span className="dev-badge">
                                <Code className="h-3 w-3" /> DEV
                            </span>
                        ) : isVip ? (
                            <span className="vip-badge">
                                <Crown className="h-3 w-3" /> VIP
                            </span>
                        ) : null}
                    </p>
                 )}
                <div className={cn(
                    'relative rounded-2xl px-4 py-2 shadow-sm',
                    isCurrentUser 
                        ? 'bg-primary text-primary-foreground rounded-br-none' 
                        : 'bg-muted rounded-bl-none'
                )}>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
                 <p className={cn(
                    "text-xs px-1 opacity-0 group-hover:opacity-100 transition-opacity", 
                    isCurrentUser ? "text-right text-muted-foreground" : "text-left text-muted-foreground/80"
                )}>
                    {displayTime}
                </p>
            </div>
             {isCurrentUser && (
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.imageUrl ?? undefined} alt={user?.fullName ?? ''} />
                    <AvatarFallback>{user?.fullName?.charAt(0) ?? '?'}</AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}
