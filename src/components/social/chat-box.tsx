
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MoreVertical, X, Trash2, UserX, Code, Crown, ArrowLeft, ShieldCheck, Gamepad2, Swords, Gem, Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Check, CheckCheck, UserPlus, Clock } from 'lucide-react';
import { User, SUPER_ADMIN_UID, useUsers } from '@/hooks/use-admin';
import { useChat } from '@/hooks/use-chat';
import { useFriends } from '@/hooks/use-friends';
import { useUser } from '@clerk/nextjs';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isToday, isSameDay } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
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
    const { removeFriend, friends } = useFriends();
    const { onlineUsers } = usePresence();
    const { startCall, activeCall, acceptCall, rejectCall, endCall, callDuration } = useVoiceCall();
    
    const [newMessage, setNewMessage] = useState('');
    const [isFriendTyping, setIsFriendTyping] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const isFriendOnline = onlineUsers.find(u => u.uid === friend.uid)?.isOnline || false;
    const lastSeen = onlineUsers.find(u => u.uid === friend.uid)?.lastSeen;

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

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

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages.length]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        if (target.scrollTop < 50 && hasMore && !loading) {
            loadMore();
        }
    };

    return (
        <Card className="h-full flex flex-col relative overflow-hidden bg-whatsapp-style-bg border-none rounded-none md:rounded-3xl">
            {/* Call Overlay */}
            <AnimatePresence>
                {activeCall && (
                    <motion.div 
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute inset-0 z-50 bg-[#075e54] dark:bg-[#1f2c34] flex flex-col items-center justify-between p-8 text-white"
                    >
                        <header className="w-full flex justify-between items-center text-white/80">
                            <ShieldCheck className="h-6 w-6" />
                            <p className="text-xs font-black uppercase tracking-[0.2em]">End-to-End Encrypted</p>
                            <UserPlus className="h-6 w-6 cursor-pointer hover:text-white" />
                        </header>

                        <div className="flex flex-col items-center gap-6">
                            <motion.div 
                                animate={activeCall.status === 'ringing' ? { scale: [1, 1.05, 1] } : {}}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                                <Avatar className="h-40 w-40 border-4 border-white/20 shadow-2xl relative z-10">
                                    <AvatarImage src={activeCall.callerId === currentUser?.id ? activeCall.receiverPhoto : activeCall.callerPhoto} />
                                    <AvatarFallback className="text-4xl text-black">{(activeCall.callerId === currentUser?.id ? activeCall.receiverName : activeCall.callerName).charAt(0)}</AvatarFallback>
                                </Avatar>
                            </motion.div>
                            <div className="text-center z-10">
                                <h2 className="text-4xl font-black">{activeCall.callerId === currentUser?.id ? activeCall.receiverName : activeCall.callerName}</h2>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <Clock className="h-4 w-4 opacity-70" />
                                    <p className="text-xl font-mono tracking-widest">
                                        {activeCall.status === 'active' ? formatDuration(callDuration) : (activeCall.callerId === currentUser?.id ? 'Ringing...' : 'Incoming Call...')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <footer className="w-full max-w-sm flex justify-around items-center gap-4 bg-black/20 backdrop-blur-md p-6 rounded-3xl border border-white/10">
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
                                <>
                                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full bg-white/10 hover:bg-white/20" onClick={() => setIsMuted(!isMuted)}>
                                        {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                                    </Button>
                                    <Button size="icon" className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 shadow-xl" onClick={endCall}>
                                        <PhoneOff className="h-8 w-8" />
                                    </Button>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full bg-white/10 hover:bg-white/20">
                                                <UserPlus className="h-6 w-6" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-64 bg-background text-foreground border-primary/20 rounded-2xl p-2">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground p-2 mb-1 border-b">Invite Ally to Call</p>
                                            <ScrollArea className="h-48">
                                                <div className="space-y-1">
                                                    {friends.filter(f => onlineUsers.find(u => u.uid === f.uid)?.isOnline).map(f => (
                                                        <Button key={f.uid} variant="ghost" className="w-full justify-start text-xs font-bold" onClick={() => { startCall(f); toast({ title: "Invite Sent!" }); }}>
                                                            <Avatar className="h-6 w-6 mr-2"><AvatarImage src={f.photoURL}/></Avatar>
                                                            {f.displayName}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        </PopoverContent>
                                    </Popover>
                                </>
                            )}
                        </footer>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="flex-shrink-0 flex flex-row items-center justify-between border-b p-3 bg-white/95 dark:bg-[#202c33]/95 backdrop-blur-md z-10 shadow-sm">
                 <div className="flex items-center gap-3">
                    {onClose && <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}><ArrowLeft/></Button>}
                    <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-primary/10">
                            <AvatarImage src={friend.photoURL} alt={friend.displayName} />
                            <AvatarFallback>{friend.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {isFriendOnline && (
                             <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background animate-pulse" />
                        )}
                    </div>
                    <div className="grid gap-0">
                        <p className="font-black text-sm tracking-tight">{friend.displayName}</p>
                        {isFriendTyping ? (
                            <p className="text-[10px] text-primary font-black animate-pulse uppercase tracking-wider">typing...</p>
                        ) : isFriendOnline ? (
                            <p className="text-[10px] text-green-500 font-bold uppercase">Online Now</p>
                        ) : (
                            <p className="text-[10px] text-muted-foreground font-medium">
                                last seen {lastSeen ? formatDistanceToNow(lastSeen, { addSuffix: true }) : 'long ago'}
                            </p>
                        )}
                    </div>
                 </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10 rounded-full h-10 w-10" onClick={() => startCall(friend)} disabled={!isFriendOnline}>
                        <Phone className="h-5 w-5" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-primary/10 w-48 p-1">
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive font-bold p-3 rounded-lg">
                                        <UserX className="mr-2 h-4 w-4" /> Remove Friend
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="rounded-2xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Break Alliance?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will remove <b>{friend.displayName}</b> from your trusted allies.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => removeFriend(friend.uid)} className="rounded-xl bg-destructive hover:bg-destructive/90">Break Alliance</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <ScrollArea className="flex-1 flex flex-col" viewportRef={scrollAreaRef} onScroll={handleScroll}>
                 <div className="p-4 sm:p-6 space-y-4 flex flex-col min-h-full">
                    {loading && hasMore && (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary opacity-50" />
                        </div>
                    )}
                    {messages.map((msg, index) => {
                        const prevMsg = messages[index - 1];
                        const showDate = !prevMsg || !isSameDay(msg.timestamp, prevMsg.timestamp);
                        return (
                            <div key={msg.id} className="flex flex-col gap-2">
                                {showDate && (
                                    <div className="flex justify-center my-6">
                                        <span className="px-4 py-1 bg-black/10 dark:bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black text-muted-foreground uppercase tracking-widest">
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

            <footer className="flex-shrink-0 p-3 bg-[#ededed] dark:bg-[#1f2c34] border-t dark:border-white/5 sticky bottom-0 z-10">
                <form onSubmit={handleSendMessage} className="flex items-center w-full gap-2 max-w-4xl mx-auto">
                    <Input
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            updateTypingStatus(e.target.value.length > 0);
                        }}
                        onBlur={() => updateTypingStatus(false)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-full bg-white dark:bg-[#2a3942] border-none shadow-sm h-12 px-6 focus-visible:ring-primary/20"
                    />
                    <Button type="submit" size="icon" className="rounded-full h-12 w-12 bg-[#00a884] hover:bg-[#008f6a] text-white shadow-lg transition-transform active:scale-95 flex-shrink-0" disabled={!newMessage.trim()}>
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </footer>
        </Card>
    );
}

function ChatMessage({ message, isOwn, friend }: { message: any; isOwn: boolean; friend: User }) {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: isOwn ? 20 : -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            className={cn("flex w-full", isOwn ? "justify-end" : "justify-start")}
        >
            <div className={cn(
                "relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 py-2 shadow-sm text-sm transition-all",
                isOwn 
                    ? "bg-[#d9fdd3] dark:bg-[#005c4b] rounded-tr-none border-r-4 border-emerald-500/20" 
                    : "bg-white dark:bg-[#202c33] rounded-tl-none border-l-4 border-primary/20"
            )}>
                <div className="flex flex-col">
                    <p className="whitespace-pre-wrap leading-relaxed select-text font-medium">{message.text}</p>
                    <div className="flex items-center justify-end gap-1 mt-1.5 opacity-60 text-[10px] font-black self-end">
                        <span>{format(message.timestamp, "h:mm a")}</span>
                        {isOwn && (
                            <span className="text-sky-500">
                                <CheckCheck className="h-3.5 w-3.5" />
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
