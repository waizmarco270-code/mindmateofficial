'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MoreVertical, ImagePlus, X, Paperclip, Users, Trash2, LogOut, Settings, MessageSquare, Pin, PinOff, Globe, Info } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, Timestamp, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Group, GroupMessage, GroupRole } from '@/context/groups-context';
import { Loader2 } from 'lucide-react';
import { useGroups } from '@/hooks/use-groups';
import { usePresence } from '@/hooks/use-presence';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

const userColors = [
    'border-red-500/50', 'border-orange-500/50', 'border-amber-500/50',
    'border-yellow-500/50', 'border-lime-500/50', 'border-green-500/50',
    'border-emerald-500/50', 'border-teal-500/50', 'border-cyan-500/50',
    'border-sky-500/50', 'border-blue-500/50', 'border-indigo-500/50',
    'border-violet-500/50', 'border-purple-500/50', 'border-fuchsia-500/50',
    'border-pink-500/50', 'border-rose-500/50',
];

const getUserColor = (userId: string) => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return userColors[Math.abs(hash) % userColors.length];
};

export function GroupChat({ group }: { group: Group }) {
    const { user: currentUser } = useUser();
    const { pinMessage } = useGroups();
    const { onlineUsers } = usePresence();
    const [messages, setMessages] = useState<GroupMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'chat' | 'pinned'>('chat');
    
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const currentUserRole = useMemo(() => {
        return group.members.find(m => m.uid === currentUser?.id)?.role || 'member';
    }, [group.members, currentUser?.id]);

    const canPin = currentUserRole === 'leader' || currentUserRole === 'co-leader';

    useEffect(() => {
        if (!group.id) {
            setLoading(false);
            return;
        };

        setLoading(true);
        const messagesRef = collection(db, 'groups', group.id, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: (data.timestamp as Timestamp)?.toDate() || new Date()
                } as GroupMessage;
            });
            setMessages(fetchedMessages);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching group messages:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [group.id]);

    useEffect(() => {
        if (scrollAreaRef.current && activeTab === 'chat') {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages, activeTab]);
    
     useEffect(() => {
        if (imageFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(imageFile);
        } else {
            setImagePreview(null);
        }
    }, [imageFile]);

    const sendMessage = useCallback(async (text?: string, imageUrl?: string | null) => {
        if (!group.id || !currentUser || (!text?.trim() && !imageUrl)) return;

        const messagesRef = collection(db, 'groups', group.id, 'messages');
        await addDoc(messagesRef, {
            senderId: currentUser.id,
            text: text || '',
            imageUrl: imageUrl || null,
            timestamp: serverTimestamp(),
            isPinned: false
        });
        
        const groupRef = doc(db, 'groups', group.id);
        await updateDoc(groupRef, {
            lastMessage: {
                text: text ? (text.length > 30 ? text.substring(0, 30) + '...' : text) : 'Sent an image',
                senderId: currentUser.id,
                timestamp: serverTimestamp()
            }
        });

    }, [group.id, currentUser]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !imageFile) || !currentUser) return;
        
        let imageAsBase64: string | null = null;
        if (imageFile) {
             if (imageFile.size > 1024 * 1024 * 2) { // 2MB limit
                toast({ variant: "destructive", title: "Image too large", description: "Please select an image smaller than 2MB." });
                return;
            }
            imageAsBase64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(imageFile);
            });
        }

        await sendMessage(newMessage, imageAsBase64);
        setNewMessage('');
        setImageFile(null);
    };
    
    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const pinnedMessages = useMemo(() => messages.filter(m => m.isPinned), [messages]);
    const onlineCount = useMemo(() => {
        const memberIds = group.members.map(m => m.uid);
        return onlineUsers.filter(u => u.isOnline && memberIds.includes(u.uid)).length;
    }, [onlineUsers, group.members]);

    return (
        <div className="h-full flex flex-col bg-card">
            <header className="flex items-center justify-between p-4 border-b bg-muted/20">
                <div className="flex items-center gap-3">
                     <Avatar className="h-10 w-10 border-2 border-primary/30">
                        <AvatarImage src={group.logoUrl || undefined} />
                        <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-black text-sm uppercase tracking-tight truncate max-w-[120px]">{group.name}</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">{onlineCount} Warriors Active</p>
                        </div>
                    </div>
                </div>
                <div className="p-1 bg-background rounded-lg border flex gap-1">
                    <Button variant={activeTab === 'chat' ? 'secondary' : 'ghost'} size="sm" className="h-8 text-[10px] font-black uppercase px-4" onClick={() => setActiveTab('chat')}>CHAT</Button>
                    <Button variant={activeTab === 'pinned' ? 'secondary' : 'ghost'} size="sm" className="h-8 text-[10px] font-black uppercase px-4 relative" onClick={() => setActiveTab('pinned')}>
                        PINNED
                        {pinnedMessages.length > 0 && (
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-white rounded-full flex items-center justify-center text-[8px] border border-background">
                                {pinnedMessages.length}
                            </span>
                        )}
                    </Button>
                </div>
            </header>

            <ScrollArea className="flex-1" viewportRef={scrollAreaRef}>
                <div className="p-4 space-y-6">
                    {loading ? (
                        <div className="flex justify-center items-center h-full py-20"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-50"/></div>
                    ) : (activeTab === 'chat' ? messages : pinnedMessages).map((msg, index) => {
                        const sender = group.memberDetails?.find(m => m.uid === msg.senderId);
                        const prevMessage = messages[index - 1];
                        
                        const showHeader = !prevMessage || prevMessage.senderId !== msg.senderId || !isSameDay(new Date(msg.timestamp), new Date(prevMessage.timestamp));
                        const showDateSeparator = index === 0 || !isSameDay(new Date(msg.timestamp), new Date(prevMessage.timestamp));

                        return (
                           <div key={msg.id} className="group/msg">
                                {activeTab === 'chat' && showDateSeparator && (
                                    <div className="text-center my-4">
                                        <span className="px-3 py-1 bg-muted rounded-full text-[10px] font-black uppercase text-muted-foreground">{format(new Date(msg.timestamp), 'MMMM d')}</span>
                                    </div>
                                )}
                                <div className={cn("flex items-start gap-2", msg.senderId === currentUser?.id ? "flex-row-reverse" : "")}>
                                    {! (msg.senderId === currentUser?.id) && (
                                        <Avatar className={cn("h-8 w-8 shrink-0 mt-1", showHeader ? 'opacity-100' : 'opacity-0')}>
                                            <AvatarImage src={sender?.photoURL} />
                                            <AvatarFallback>{sender?.displayName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    
                                    <div className={cn("max-w-[85%] relative", msg.senderId === currentUser?.id ? "items-end" : "items-start")}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <div className={cn(
                                                    "p-3 rounded-2xl shadow-sm transition-all border-2",
                                                    msg.senderId === currentUser?.id ? "bg-primary/10 border-primary/20 rounded-tr-none" : "bg-muted border-transparent rounded-tl-none",
                                                    msg.isPinned && "border-yellow-500/50 shadow-yellow-500/20"
                                                )}>
                                                    {showHeader && !(msg.senderId === currentUser?.id) && (
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className={cn("text-[10px] font-black uppercase", getUserColor(sender?.uid || ''))}>
                                                                {sender?.displayName}
                                                            </p>
                                                            <Badge variant="outline" className="text-[8px] h-3 px-1 py-0 uppercase opacity-40">{sender?.role}</Badge>
                                                        </div>
                                                    )}
                                                    {msg.isPinned && (
                                                        <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-yellow-500/20 text-yellow-500">
                                                            <Pin className="h-3 w-3 fill-current" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest">Sovereign Directive</span>
                                                        </div>
                                                    )}
                                                    {msg.text && <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>}
                                                    {msg.imageUrl && (
                                                        <div className="mt-2 rounded-xl overflow-hidden border border-white/5">
                                                            <Image src={msg.imageUrl} alt="Uplink data" width={300} height={200} className="w-full h-auto object-cover" />
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-end gap-1 mt-1 opacity-40 text-[9px] font-bold">
                                                        {format(new Date(msg.timestamp), 'h:mm a')}
                                                    </div>
                                                </div>
                                            </DropdownMenuTrigger>
                                            {canPin && (
                                                <DropdownMenuContent align={msg.senderId === currentUser?.id ? 'end' : 'start'}>
                                                    <DropdownMenuItem onClick={() => pinMessage(group.id, msg.id, !msg.isPinned)}>
                                                        {msg.isPinned ? <><PinOff className="mr-2 h-4 w-4"/> Unpin Directive</> : <><Pin className="mr-2 h-4 w-4"/> Pin to War Room</>}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            )}
                                        </DropdownMenu>
                                    </div>
                                </div>
                           </div>
                        );
                    })}
                    {!loading && (activeTab === 'chat' ? messages : pinnedMessages).length === 0 && (
                        <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                            {activeTab === 'chat' ? <MessageSquare className="h-12 w-12" /> : <Pin className="h-12 w-12" />}
                            <p className="text-sm font-black uppercase tracking-widest">{activeTab === 'chat' ? "War room silent" : "No active directives"}</p>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {activeTab === 'chat' && (
                <footer className="p-4 border-t bg-muted/5">
                    {imagePreview && (
                        <div className="relative w-24 h-24 mb-3 p-1 bg-black/40 border-2 border-primary/30 rounded-xl group">
                            <Image src={imagePreview} alt="Target file" layout="fill" objectFit="cover" className="rounded-lg"/>
                             <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg" onClick={() => setImageFile(null)}>
                                <X className="h-3 w-3"/>
                            </Button>
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                         <Button type="button" variant="ghost" size="icon" className="rounded-xl h-11 w-11 bg-muted/50 hover:bg-primary/20 text-primary" onClick={handleFileSelect}>
                            <ImagePlus className="h-5 w-5" />
                        </Button>
                         <input type="file" ref={fileInputRef} onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} accept="image/*" className="hidden" />
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Dispatch briefing..."
                            className="flex-1 h-11 bg-muted/50 border-none rounded-2xl px-5 text-sm"
                            autoComplete="off"
                        />
                        <Button type="submit" size="icon" className="rounded-2xl h-11 w-11 bg-primary text-white shadow-lg shadow-primary/20" disabled={!newMessage.trim() && !imageFile}>
                            <Send className="h-5 w-5" />
                        </Button>
                    </form>
                </footer>
            )}
        </div>
    );
}
