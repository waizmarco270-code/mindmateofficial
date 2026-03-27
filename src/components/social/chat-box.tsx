
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MoreVertical, X, Trash2, UserX, Code, Crown, ArrowLeft, ShieldCheck, Gamepad2, Swords, Gem, Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { User, SUPER_ADMIN_UID, useUsers } from '@/hooks/use-admin';
import { useChat } from '@/hooks/use-chat';
import { useFriends } from '@/hooks/use-friends';
import { useUser } from '@clerk/nextjs';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { usePresence } from '@/hooks/use-presence';
import { useVoiceCall } from '@/hooks/use-voice-call';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatBoxProps {
    friend: User;
    onClose?: () => void;
}

export function ChatBox({ friend, onClose }: ChatBoxProps) {
    const { user: currentUser } = useUser();
    const { messages, sendMessage, loading } = useChat(friend.uid);
    const { removeFriend } = useFriends();
    const { onlineUsers } = usePresence();
    const { startCall, activeCall, acceptCall, rejectCall, endCall, localStream, remoteStream } = useVoiceCall();
    
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
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
        <Card className="h-full flex flex-col relative overflow-hidden">
            {/* Call Overlay */}
            <AnimatePresence>
                {activeCall && (
                    <motion.div 
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        className="absolute inset-0 z-50 bg-[#075e54] dark:bg-[#1f2c34] flex flex-col items-center justify-center p-8 text-white"
                    >
                        <div className="flex-1 flex flex-col items-center justify-center gap-6">
                            <motion.div 
                                animate={activeCall.status === 'ringing' ? { scale: [1, 1.1, 1] } : {}}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="relative"
                            >
                                <Avatar className="h-32 w-32 border-4 border-white/20 shadow-2xl">
                                    <AvatarImage src={activeCall.callerId === currentUser?.id ? activeCall.receiverPhoto : activeCall.callerPhoto} />
                                    <AvatarFallback className="text-4xl text-black">{(activeCall.callerId === currentUser?.id ? activeCall.receiverName : activeCall.callerName).charAt(0)}</AvatarFallback>
                                </Avatar>
                                {activeCall.status === 'active' && (
                                    <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full border-2 border-[#1f2c34]">
                                        <Volume2 className="h-4 w-4" />
                                    </div>
                                )}
                            </motion.div>
                            <div className="text-center">
                                <h2 className="text-3xl font-black">{activeCall.callerId === currentUser?.id ? activeCall.receiverName : activeCall.callerName}</h2>
                                <p className="text-sm font-bold uppercase tracking-widest opacity-70 mt-2">
                                    {activeCall.status === 'ringing' ? (activeCall.callerId === currentUser?.id ? 'Ringing...' : 'Incoming Call...') : 'Active Call'}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-12 mb-12">
                            {activeCall.status === 'ringing' && activeCall.receiverId === currentUser?.id ? (
                                <>
                                    <Button size="icon" className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 shadow-xl" onClick={rejectCall}>
                                        <PhoneOff className="h-8 w-8" />
                                    </Button>
                                    <Button size="icon" className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 shadow-xl animate-bounce" onClick={acceptCall}>
                                        <Phone className="h-8 w-8" />
                                    </Button>
                                </>
                            ) : (
                                <Button size="icon" className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 shadow-xl" onClick={endCall}>
                                    <PhoneOff className="h-8 w-8" />
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

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

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10" onClick={() => startCall(friend)} disabled={!isFriendOnline}>
                        <Phone className="h-5 w-5" />
                    </Button>
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
                </div>
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
                        className="flex-1 rounded-full"
                    />
                    <Button type="submit" size="icon" className="rounded-full" disabled={!newMessage.trim()}>
                        <Send />
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}

function ChatMessage({ message, isOwn, friend }: { message: any; isOwn: boolean; friend: User }) {
    const { user: clerkUser } = useUser();
    const { users } = useUsers();
    const userToShow = isOwn ? users.find(u => u.uid === clerkUser?.id) : friend;

    if (!userToShow) return null;

    const isSuperAdmin = userToShow.uid === SUPER_ADMIN_UID;
    const ownedBadges = [
        (isSuperAdmin || userToShow.isAdmin) && { type: 'admin', badge: <span className="admin-badge"><ShieldCheck className="h-3 w-3" /> ADMIN</span> },
        userToShow.isVip && { type: 'vip', badge: <span className="elite-badge"><Crown className="h-3 w-3" /> ELITE</span> },
        userToShow.isGM && { type: 'gm', badge: <span className="gm-badge">GM</span> },
        userToShow.isChallenger && { type: 'challenger', badge: <span className="challenger-badge"><Swords className="h-3 w-3"/> Challenger</span> },
        userToShow.isCoDev && { type: 'co-dev', badge: <span className="co-dev-badge"><Code className="h-3 w-3"/> Co-Dev</span> }
    ].filter(Boolean) as any[];

    if(isSuperAdmin) ownedBadges.unshift({ type: 'dev', badge: <span className="dev-badge"><Code className="h-3 w-3" /> DEV</span> });
    const badgeToShow = ownedBadges.find(b => b.type === userToShow.showcasedBadge) || ownedBadges[0] || null;

    return (
        <div className={cn("flex items-end gap-2", isOwn && "justify-end")}>
            {!isOwn && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={friend.photoURL} />
                    <AvatarFallback>{friend.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
            )}
            <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-3 py-2", isOwn ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none shadow-sm")}>
                {!isOwn && (
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-[10px] font-black uppercase text-muted-foreground">{friend.displayName}</p>
                         {badgeToShow && badgeToShow.badge}
                    </div>
                )}
                <TooltipProvider delayDuration={100}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <p className="whitespace-pre-wrap text-sm">{message.text}</p>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="text-[10px]">{format(message.timestamp, "MMM d, h:mm a")}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}
