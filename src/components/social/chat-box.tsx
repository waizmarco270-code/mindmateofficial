
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Send, MoreVertical, X, Trash2, UserX, ArrowLeft, 
    ShieldCheck, Phone, PhoneOff, Mic, MicOff, 
    Check, CheckCheck, UserPlus, Clock, Paperclip, 
    Edit, Copy, Reply, Loader2, Play, Pause
} from 'lucide-react';
import { User, useUsers } from '@/hooks/use-admin';
import { useChat, Message } from '@/hooks/use-chat';
import { useFriends } from '@/hooks/use-friends';
import { useUser } from '@clerk/nextjs';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isToday, isSameDay } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { usePresence } from '@/hooks/use-presence';
import { useVoiceCall } from '@/hooks/use-voice-call';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

interface ChatBoxProps {
    friend: User;
    onClose?: () => void;
}

export function ChatBox({ friend, onClose }: ChatBoxProps) {
    const { user: currentUser } = useUser();
    const { messages, sendMessage, editMessage, deleteMessage, loading, hasMore, loadMore } = useChat(friend.uid);
    const { removeFriend } = useFriends();
    const { onlineUsers } = usePresence();
    const { startCall, activeCall, acceptCall, rejectCall, endCall, callDuration } = useVoiceCall();
    const { toast } = useToast();
    
    const [newMessage, setNewMessage] = useState('');
    const [isFriendTyping, setIsFriendTyping] = useState(false);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);
    
    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isFriendOnline = onlineUsers.find(u => u.uid === friend.uid)?.isOnline || false;
    const lastSeen = onlineUsers.find(u => u.uid === friend.uid)?.lastSeen;

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Typing Status Listener
    useEffect(() => {
        if (!currentUser || !friend.uid) return;
        const chatId = [currentUser.id, friend.uid].sort().join('_');
        const typingRef = doc(db, 'typing_status', chatId);
        const unsubscribe = onSnapshot(typingRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                const isTyping = data[friend.uid]?.isTyping && (Date.now() - data[friend.uid]?.timestamp < 3000);
                setIsFriendTyping(!!isTyping);
            }
        });
        return () => unsubscribe();
    }, [currentUser, friend.uid]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() && !editingMessage) return;

        if (editingMessage) {
            await editMessage(editingMessage.id, newMessage);
            setEditingMessage(null);
        } else {
            const replyContext = replyingTo ? {
                text: replyingTo.text,
                senderId: replyingTo.senderId,
                id: replyingTo.id
            } : undefined;
            await sendMessage(newMessage, undefined, undefined, replyContext);
            setReplyingTo(null);
        }
        setNewMessage('');
        updateTypingStatus(false);
    };

    const updateTypingStatus = async (isTyping: boolean) => {
        if (!currentUser || !friend.uid) return;
        const chatId = [currentUser.id, friend.uid].sort().join('_');
        const typingRef = doc(db, 'typing_status', chatId);
        await setDoc(typingRef, {
            [currentUser.id]: { isTyping, timestamp: Date.now() }
        }, { merge: true });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUser) return;

        if (file.size > 200 * 1024) {
            toast({ variant: 'destructive', title: "Limit Exceeded", description: "Images must be under 200KB for the free plan." });
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target?.result as string;
            await sendMessage('', base64);
        };
        reader.readAsDataURL(file);
    };

    // Voice Note Recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const base64 = e.target?.result as string;
                    if (base64.length > 300 * 1024) {
                        toast({ variant: 'destructive', title: "Too long!", description: "Keep voice notes under 15 seconds." });
                    } else {
                        await sendMessage('', undefined, base64);
                    }
                };
                reader.readAsDataURL(audioBlob);
                stream.getTracks().forEach(t => t.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= 15) stopRecording();
                    return prev + 1;
                });
            }, 1000);
        } catch (err) {
            toast({ variant: 'destructive', title: "Mic Error", description: "Enable microphone to send voice notes." });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        }
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
            {/* Call Overlay Integrated from previous logic */}
            <AnimatePresence>
                {activeCall && (
                    <motion.div 
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        className="absolute inset-0 z-50 bg-[#075e54] dark:bg-[#1f2c34] flex flex-col items-center justify-between p-8 text-white"
                    >
                        <Avatar className="h-40 w-40 border-4 border-white/20 shadow-2xl">
                            <AvatarImage src={activeCall.callerId === currentUser?.id ? activeCall.receiverPhoto : activeCall.callerPhoto} />
                            <AvatarFallback className="text-4xl text-black">C</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            <h2 className="text-4xl font-black">{activeCall.callerId === currentUser?.id ? activeCall.receiverName : activeCall.callerName}</h2>
                            <p className="text-xl font-mono mt-2">{activeCall.status === 'active' ? formatDuration(callDuration) : 'Calling...'}</p>
                        </div>
                        <div className="flex gap-4">
                            {activeCall.status === 'ringing' && activeCall.receiverId === currentUser?.id ? (
                                <>
                                    <Button size="icon" className="h-16 w-16 rounded-full bg-red-500" onClick={rejectCall}><PhoneOff/></Button>
                                    <Button size="icon" className="h-16 w-16 rounded-full bg-green-500 animate-bounce" onClick={acceptCall}><Phone/></Button>
                                </>
                            ) : (
                                <Button size="icon" className="h-16 w-16 rounded-full bg-red-500" onClick={endCall}><PhoneOff/></Button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="flex-shrink-0 flex items-center justify-between border-b p-3 bg-white/95 dark:bg-[#202c33]/95 backdrop-blur-md z-10">
                 <div className="flex items-center gap-3">
                    {onClose && <Button variant="ghost" size="icon" className="md:hidden" onClick={onClose}><ArrowLeft/></Button>}
                    <Avatar className="h-10 w-10 border-2 border-primary/10">
                        <AvatarImage src={friend.photoURL} />
                        <AvatarFallback>{friend.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-0">
                        <p className="font-black text-sm">{friend.displayName}</p>
                        {isFriendTyping ? (
                            <p className="text-[10px] text-primary font-black animate-pulse">typing...</p>
                        ) : isFriendOnline ? (
                            <p className="text-[10px] text-green-500 font-bold">Online Now</p>
                        ) : (
                            <p className="text-[10px] text-muted-foreground">
                                {lastSeen ? `last seen ${formatDistanceToNow(lastSeen, { addSuffix: true })}` : 'offline'}
                            </p>
                        )}
                    </div>
                 </div>
                 <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-primary rounded-full" onClick={() => startCall(friend)} disabled={!isFriendOnline}><Phone className="h-5 w-5" /></Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="h-5 w-5"/></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="text-destructive font-bold" onClick={() => removeFriend(friend.uid)}><UserX className="mr-2 h-4 w-4"/> Remove Friend</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
            </header>

            <ScrollArea className="flex-1" viewportRef={scrollAreaRef} onScroll={handleScroll}>
                 <div className="p-4 space-y-4 flex flex-col min-h-full">
                    {loading && hasMore && <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary opacity-50" /></div>}
                    {messages.map((msg, index) => {
                        const prevMsg = messages[index - 1];
                        const showDate = !prevMsg || !isSameDay(msg.timestamp, prevMsg.timestamp);
                        return (
                            <div key={msg.id} className="flex flex-col gap-2">
                                {showDate && (
                                    <div className="flex justify-center my-4">
                                        <span className="px-3 py-1 bg-black/10 dark:bg-white/10 rounded-full text-[10px] font-bold text-muted-foreground uppercase">
                                            {format(msg.timestamp, 'MMMM d')}
                                        </span>
                                    </div>
                                )}
                                <MessageBubble 
                                    message={msg} 
                                    isOwn={msg.senderId === currentUser?.id} 
                                    onReply={() => setReplyingTo(msg)}
                                    onEdit={() => { setEditingMessage(msg); setNewMessage(msg.text); }}
                                    onDelete={() => deleteMessage(msg.id)}
                                />
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>

            <footer className="flex-shrink-0 p-3 bg-[#ededed] dark:bg-[#1f2c34] border-t dark:border-white/5 relative">
                {/* Reply/Edit Preview */}
                <AnimatePresence>
                    {(replyingTo || editingMessage) && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-black/5 dark:bg-black/20 rounded-t-xl p-3 border-b flex items-center justify-between mb-2"
                        >
                            <div className="text-xs border-l-4 border-primary pl-2 truncate">
                                <p className="font-bold text-primary">{editingMessage ? 'Editing Message' : `Replying to ${replyingTo?.senderId === currentUser?.id ? 'Me' : friend.displayName}`}</p>
                                <p className="truncate opacity-70 italic">{(editingMessage || replyingTo)?.text || 'Media'}</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setReplyingTo(null); setEditingMessage(null); if(editingMessage) setNewMessage(''); }}><X className="h-3 w-3" /></Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center gap-2 max-w-4xl mx-auto">
                    {!isRecording ? (
                        <>
                            <Button size="icon" variant="ghost" className="rounded-full flex-shrink-0" onClick={() => fileInputRef.current?.click()}>
                                <Paperclip className="h-5 w-5"/>
                            </Button>
                            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                            <Input
                                value={newMessage}
                                onChange={(e) => { setNewMessage(e.target.value); updateTypingStatus(e.target.value.length > 0); }}
                                onBlur={() => updateTypingStatus(false)}
                                placeholder="Type a message..."
                                className="flex-1 rounded-full bg-white dark:bg-[#2a3942] border-none shadow-sm h-11 px-6"
                            />
                            {newMessage.trim() ? (
                                <Button size="icon" className="rounded-full h-11 w-11 bg-[#00a884] hover:bg-[#008f6a]" onClick={() => handleSendMessage()}>
                                    <Send className="h-5 w-5" />
                                </Button>
                            ) : (
                                <Button size="icon" variant="ghost" className="rounded-full flex-shrink-0 text-[#00a884]" onClick={startRecording}>
                                    <Mic className="h-5 w-5" />
                                </Button>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex items-center gap-4 bg-white dark:bg-[#2a3942] rounded-full h-11 px-4 animate-in slide-in-from-right-4">
                            <Mic className="h-5 w-5 text-red-500 animate-pulse" />
                            <span className="flex-1 font-mono font-bold text-red-500">{formatDuration(recordingTime)} / 00:15</span>
                            <Button variant="ghost" size="sm" className="text-red-500 font-bold" onClick={() => { stopRecording(); setIsRecording(false); }}>Cancel</Button>
                            <Button size="sm" className="bg-[#00a884] rounded-full px-4 font-bold" onClick={stopRecording}>Done</Button>
                        </div>
                    )}
                </div>
            </footer>
        </Card>
    );
}

function MessageBubble({ message, isOwn, onReply, onEdit, onDelete }: { message: Message; isOwn: boolean; onReply: () => void; onEdit: () => void; onDelete: () => void }) {
    const [isPlayingVoice, setIsPlayingVoice] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const toggleVoice = () => {
        if (!audioRef.current) return;
        if (isPlayingVoice) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlayingVoice(!isPlayingVoice);
    };

    return (
        <div className={cn("flex w-full group", isOwn ? "justify-end" : "justify-start")}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className={cn(
                        "relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 py-2 shadow-sm text-sm cursor-pointer hover:brightness-95 transition-all",
                        isOwn ? "bg-[#d9fdd3] dark:bg-[#005c4b] rounded-tr-none" : "bg-white dark:bg-[#202c33] rounded-tl-none"
                    )}>
                        {message.replyTo && (
                            <div className="mb-2 p-2 rounded-lg bg-black/5 dark:bg-black/20 border-l-4 border-primary text-[11px] opacity-80 italic">
                                <p className="truncate">"{message.replyTo.text || 'Media'}"</p>
                            </div>
                        )}

                        {message.imageUrl && (
                            <div className="relative rounded-lg overflow-hidden mb-1 border">
                                <Image src={message.imageUrl} alt="Mission file" width={300} height={200} className="w-full h-auto" unoptimized />
                            </div>
                        )}

                        {message.voiceUrl && (
                            <div className="flex items-center gap-3 py-1 pr-2 min-w-[180px]">
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-primary/10" onClick={toggleVoice}>
                                    {isPlayingVoice ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </Button>
                                <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full relative overflow-hidden">
                                    {isPlayingVoice && <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="absolute inset-0 bg-primary/30" />}
                                </div>
                                <audio ref={audioRef} src={message.voiceUrl} onEnded={() => setIsPlayingVoice(false)} className="hidden" />
                            </div>
                        )}

                        {message.text && <p className="whitespace-pre-wrap leading-relaxed break-words font-medium">{message.text}</p>}

                        <div className="flex items-center justify-end gap-1 mt-1 opacity-60 text-[10px] font-black">
                            {message.edited && <span>edited</span>}
                            <span>{format(message.timestamp, "h:mm a")}</span>
                            {isOwn && (
                                <span className={cn(message.seen ? "text-sky-500" : "text-muted-foreground")}>
                                    <CheckCheck className="h-3.5 w-3.5" />
                                </span>
                            )}
                        </div>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isOwn ? 'end' : 'start'} className="w-40 rounded-xl">
                    <DropdownMenuItem onClick={onReply}><Reply className="mr-2 h-4 w-4"/> Reply</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.text)}><Copy className="mr-2 h-4 w-4"/> Copy Text</DropdownMenuItem>
                    {isOwn && (
                        <>
                            {message.text && <DropdownMenuItem onClick={onEdit}><Edit className="mr-2 h-4 w-4"/> Edit</DropdownMenuItem>}
                            <DropdownMenuItem onClick={onDelete} className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/> Unsend</DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
