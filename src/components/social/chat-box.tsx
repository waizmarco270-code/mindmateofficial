

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MoreVertical, X, Trash2, UserX, Code, Crown, ArrowLeft, ShieldCheck, Gamepad2, Swords } from 'lucide-react';
import { User, SUPER_ADMIN_UID, useUsers } from '@/hooks/use-admin';
import { useChat, Message } from '@/hooks/use-chat';
import { useFriends } from '@/hooks/use-friends';
import { useUser } from '@clerk/nextjs';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Badge } from '../ui/badge';
import { usePresence } from '@/hooks/use-presence';

interface ChatBoxProps {
    friend: User;
    onClose?: () => void;
}

export function ChatBox({ friend, onClose }: ChatBoxProps) {
    const { user: currentUser } = useUser();
    const { messages, sendMessage, loading } = useChat(friend.uid);
    const { removeFriend } = useFriends();
    const { onlineUsers } = usePresence();
    const [newMessage, setNewMessage] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const isFriendOnline = onlineUsers.some(u => u.uid === friend.uid);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && currentUser) {
            sendMessage(newMessage);
            setNewMessage('');
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b p-4">
                 <div className="flex items-center gap-3">
                    {onClose && <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}><ArrowLeft/></Button>}
                    <div className="relative">
                        <Avatar>
                            <AvatarImage src={friend.photoURL} alt={friend.displayName} />
                            <AvatarFallback>{friend.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {isFriendOnline && (
                             <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background animate-pulse" />
                        )}
                    </div>
                    <div className="grid gap-0.5">
                        <p className="font-semibold">{friend.displayName}</p>
                        {isFriendOnline && (
                            <p className="text-xs text-green-500 font-medium">Online</p>
                        )}
                    </div>
                 </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                    <UserX className="mr-2 h-4 w-4" /> Remove Friend
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will remove {friend.displayName} from your friends list. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => removeFriend(friend.uid)}>Remove</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-y-auto">
                 <div className="p-4 space-y-4">
                    {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} isOwn={msg.senderId === currentUser?.id} friend={friend} />
                    ))}
                </div>
            </CardContent>

            <CardFooter className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center w-full gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}

function ChatMessage({ message, isOwn, friend }: { message: Message; isOwn: boolean; friend: User }) {
    const { user: clerkUser } = useUser();
    const { users } = useUsers();
    
    // Determine which user's data to display
    const userToShow = isOwn ? users.find(u => u.uid === clerkUser?.id) : friend;

    if (!userToShow) return null; // Or a loading/error state

    const isSuperAdmin = userToShow.uid === SUPER_ADMIN_UID;
    const ownedBadges = [
        (isSuperAdmin || userToShow.isAdmin) && { type: 'admin', name: 'Admin', badge: <span className="admin-badge"><ShieldCheck className="h-3 w-3" /> ADMIN</span> },
        userToShow.isVip && { type: 'vip', name: 'Elite Member', badge: <span className="elite-badge"><Crown className="h-3 w-3" /> ELITE</span> },
        userToShow.isGM && { type: 'gm', name: 'Game Master', badge: <span className="gm-badge">GM</span> },
        userToShow.isChallenger && { type: 'challenger', name: 'Challenger', badge: <span className="challenger-badge"><Swords className="h-3 w-3"/> Challenger</span> },
        userToShow.isCoDev && { type: 'co-dev', name: 'Co-Developer', badge: <span className="co-dev-badge"><Code className="h-3 w-3"/> Co-Dev</span> }
    ].filter(Boolean);

    if(isSuperAdmin) ownedBadges.unshift({ type: 'dev', name: 'Developer', badge: <span className="dev-badge"><Code className="h-3 w-3" /> DEV</span> });

    const badgeToShow = ownedBadges.find(b => b.type === userToShow.showcasedBadge) || ownedBadges[0] || null;

    return (
        <div className={cn("flex items-end gap-2", isOwn && "justify-end")}>
            {!isOwn && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={friend.photoURL} />
                    <AvatarFallback>{friend.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
            )}
            <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-3 py-2", isOwn ? "bg-primary text-primary-foreground" : "bg-muted")}>
                {!isOwn && (
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-semibold">{friend.displayName}</p>
                         {badgeToShow && badgeToShow.badge}
                    </div>
                )}
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <p className="whitespace-pre-wrap">{message.text}</p>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{format(message.timestamp, "MMM d, yyyy 'at' h:mm a")}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
             {isOwn && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={clerkUser?.imageUrl} />
                    <AvatarFallback>{clerkUser?.firstName?.charAt(0)}</AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}
