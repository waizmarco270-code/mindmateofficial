
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MoreVertical, X, Trash2, UserX, Code, Crown, ArrowLeft, ShieldCheck, Gamepad2, Swords, Gem, Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Check, CheckCheck } from 'lucide-react';
import { User, SUPER_ADMIN_UID, useUsers } from '@/hooks/use-admin';
import { useChat } from '@/hooks/use-chat';
import { useFriends } from '@/hooks/use-friends';
import { useUser } from '@clerk/nextjs';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isToday, isSameDay } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { usePresence } from '@/hooks/use-presence';
import { useVoiceCall } from '@/hooks/use-voice-call';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ChatBoxProps {
    friend: User;
    onClose?: () => void;
}

export function ChatBox({ friend, onClose }: ChatBoxProps) {
    const { user: currentUser } = useUser();
    const { messages, sendMessage, loading, hasMore, loadMore } = useChat(friend.uid);
    const { removeFriend } = useFriends();
    const { onlineUsers } = usePresence();
    const { startCall, activeCall, acceptCall, rejectCall, endCall } = useVoiceCall();
    
    const [newMessage, setNewMessage] = useState('');
    const [isFriendTyping, setIsFriendTyping] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const isFriendOnline = onlineUsers.find(u => u.uid === friend.uid)?.isOnline || false;
    const lastSeen = onlineUsers.find(u => u.uid === friend.uid)?.lastSeen;

    // Typing Indicator Logic
    useEffect(() => {
        if (!currentUser || !friend.uid) return;
        const chatId = [currentUser.id, friend.uid].sort().join('_');
        const typingRef = doc(db, 'typing_status', chatId);

        const unsubscribe = onSnapshot(typingRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const isTyping = data[friend.uid]?.isTyping && (Date.now() - data[friend.uid]?.timestamp < 3000);
                setIsFriendTyping(!!isTyping);
            }
        });

        return () => unsubscribe();
    }, [currentUser, friend.uid]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && currentUser) {
            sendMessage(newMessage);
            setNewMessage('');
            updateTypingStatus(false);
        }
    };

    const updateTypingStatus = async (isTyping: boolean) => {
        if (!currentUser || !friend.uid) return;
        const chatId = [currentUser.id, friend.uid].sort().join('_');
        const typingRef = doc(db, 'typing_status', chatId);
        await setDoc(typingRef, {
            [currentUser.id]: { isTyping, timestamp: Date.now() }
        }, { merge: true });
    };

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages.length]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        if (target.scrollTop === 0 && hasMore && !loading) {
            loadMore();
        }
    };

    return (
        <Card className="h-full flex flex-col relative overflow-hidden bg-whatsapp-style-bg">
            {/* Call Overlay */}
            <AnimatePresence>
                {activeCall && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
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

            <header className="flex flex-row items-center justify-between border-b p-3 bg-white/80 dark:bg-[#202c33]/80 backdrop-blur-md sticky top-0 z-10">
                 <div className="flex items-center gap-3">
                    {onClose && <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}><ArrowLeft/></Button>}
                    <div className="relative">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={friend.photoURL} alt={friend.displayName} />
                            <AvatarFallback>{friend.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {isFriendOnline && (
                             <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background animate-pulse" />
                        )}
                    </div>
                    <div className="grid gap-0">
                        <p className="font-bold text-sm">{friend.displayName}</p>
                        {isFriendTyping ? (
                            <p className="text-[10px] text-primary font-bold animate-pulse">typing...</p>
                        ) : isFriendOnline ? (
                            <p className="text-[10px] text-green-500 font-bold uppercase">Online</p>
                        ) : (
                            <p className="text-[10px] text-muted-foreground">
                                last seen {lastSeen ? formatDistanceToNow(lastSeen, { addSuffix: true }) : 'long ago'}
                            </p>
                        )}
                    </div>
                 </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full" onClick={() => startCall(friend)} disabled={!isFriendOnline}>
                        <Phone className="h-5 w-5" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-primary/10">
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive font-bold">
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
            </header>

            <ScrollArea className="flex-1" viewportRef={scrollAreaRef} onScroll={handleScroll}>
                 <div className="p-4 space-y-4 flex flex-col">
                    {messages.map((msg, index) => {
                        const prevMsg = messages[index - 1];
                        const showDate = !prevMsg || !isSameDay(msg.timestamp, prevMsg.timestamp);
                        return (
                            <div key={msg.id} className="flex flex-col gap-2">
                                {showDate && (
                                    <div className="flex justify-center my-4">
                                        <span className="px-3 py-1 bg-black/10 dark:bg-white/10 rounded-full text-[10px] font-bold text-muted-foreground uppercase">
                                            {isToday(msg.timestamp) ? 'Today' : format(msg.timestamp, 'MMMM d, yyyy')}
                                        </span>
                                    </div>
                                )}
                                <ChatMessage message={msg} isOwn={msg.senderId === currentUser?.id} friend={friend} />
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>

            <footer className="p-3 border-t bg-[#ededed] dark:bg-[#1f2c34] sticky bottom-0 z-10">
                <form onSubmit={handleSendMessage} className="flex items-center w-full gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            updateTypingStatus(e.target.value.length > 0);
                        }}
                        onBlur={() => updateTypingStatus(false)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-full bg-white dark:bg-[#2a3942] border-none shadow-sm h-11"
                    />
                    <Button type="submit" size="icon" className="rounded-full h-11 w-11 bg-[#00a884] hover:bg-[#008f6a] text-white shadow-md flex-shrink-0" disabled={!newMessage.trim()}>
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </footer>
        </Card>
    );
}

function ChatMessage({ message, isOwn, friend }: { message: any; isOwn: boolean; friend: User }) {
    return (
        <div className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}>
            <div className={cn(
                "relative max-w-[80%] rounded-xl px-3 py-2 shadow-sm text-sm",
                isOwn 
                    ? "bg-[#d9fdd3] dark:bg-[#005c4b] rounded-tr-none text-foreground" 
                    : "bg-white dark:bg-[#202c33] rounded-tl-none text-foreground"
            )}>
                <div className="flex flex-col">
                    <p className="whitespace-pre-wrap leading-relaxed select-text">{message.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1 opacity-60 text-[9px] font-bold self-end">
                        <span>{format(message.timestamp, "h:mm a")}</span>
                        {isOwn && (
                            <span className="text-blue-500">
                                <CheckCheck className="h-3 w-3" />
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
