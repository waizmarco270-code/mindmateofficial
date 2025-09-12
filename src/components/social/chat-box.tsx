
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MoreVertical, X, Trash2, UserX, Code, Crown, ArrowLeft } from 'lucide-react';
import { User, SUPER_ADMIN_UID } from '@/hooks/use-admin';
import { useChat, Message } from '@/hooks/use-chat';
import { useFriends } from '@/hooks/use-friends';
import { useUser } from '@clerk/nextjs';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
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

    const isOnline = onlineUsers.some(u => u.uid === friend.uid);

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
                        {isOnline && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />}
                    </div>
                    <div className="grid gap-0.5">
                        <p className="font-semibold">{friend.displayName}</p>
                        <p className="text-xs text-muted-foreground">{isOnline ? 'Online' : 'Offline'}</p>
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
    const { user: currentUser } = useUser();
    const userToShow = isOwn ? currentUser : friend;

    const isSuperAdmin = userToShow?.id === SUPER_ADMIN_UID;
    const isAdmin = (userToShow as any)?.isAdmin;

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
                        {isSuperAdmin ? (
                            <span className="dev-badge flex-shrink-0"><Code className="h-3 w-3" /> DEV</span>
                        ) : isAdmin && (
                            <span className="vip-badge flex-shrink-0"><Crown className="h-3 w-3" /> VIP</span>
                        )}
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
                    <AvatarImage src={currentUser?.imageUrl} />
                    <AvatarFallback>{currentUser?.firstName?.charAt(0)}</AvatarFallback>
                </Avatar>
            )}
        </div>
    );
}
