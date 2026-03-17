'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Globe, Loader2, Code, Crown, ShieldCheck, Gamepad2, Swords, Trash2, Smile, Pin, X, PinOff, ArrowLeft, Reply, Edit, Copy, Palette, Gem, CloudRain, Zap } from 'lucide-react';
import { useWorldChat, WorldChatMessage, ReplyContext } from '@/hooks/use-world-chat';
import { useAdmin, User, SUPER_ADMIN_UID } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isSameDay } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserProfileCard } from '@/components/profile/user-profile-card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useLocalStorage } from '@/hooks/use-local-storage';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const userColors = [
    'text-red-400', 'text-orange-400', 'text-amber-400', 'text-yellow-400', 'text-lime-400', 
    'text-green-400', 'text-emerald-400', 'text-teal-400', 'text-cyan-400', 'text-sky-400', 
    'text-blue-400', 'text-indigo-400', 'text-violet-400', 'text-purple-400', 'text-fuchsia-400', 
    'text-pink-400', 'text-rose-400',
];

const getUserColor = (userId: string) => {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return userColors[Math.abs(hash) % userColors.length];
};

export function WorldChatView() {
    const { messages, sendMessage, sendRain, claimRain, loading, pinnedMessage, unpinMessage, typingUsers, updateTypingStatus } = useWorldChat();
    const { users: allUsers, loading: usersLoading, isAdmin } = useAdmin();
    const { user: currentUser } = useUser();
    const { toast } = useToast();
    const [newMessage, setNewMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [replyingTo, setReplyingTo] = useState<WorldChatMessage | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior });
        }
    }, []);

    useEffect(() => {
        scrollToBottom('auto');
    }, [loading]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
            if (scrollHeight - scrollTop - clientHeight < 300) {
                 scrollToBottom();
            }
        }
    }, [messages, scrollToBottom]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        if (isAdmin && newMessage.startsWith('/rain ')) {
            const parts = newMessage.split(' ');
            const amount = parseInt(parts[1]);
            const limit = parseInt(parts[2]);
            if (!isNaN(amount) && !isNaN(limit)) {
                await sendRain(amount, limit);
                setNewMessage('');
                return;
            }
        }

        const replyContext: ReplyContext | null = replyingTo ? {
            messageId: replyingTo.id,
            senderId: replyingTo.senderId,
            senderName: allUsers.find(u => u.uid === replyingTo.senderId)?.displayName || 'Unknown',
            textSnippet: replyingTo.text?.substring(0, 50) || 'Action Message',
        } : null;

        await sendMessage(newMessage, replyContext);
        setNewMessage('');
        setReplyingTo(null);
    };

    const handleTyping = (text: string) => {
        setNewMessage(text);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        else updateTypingStatus(true);
        typingTimeoutRef.current = setTimeout(() => {
            updateTypingStatus(false);
            typingTimeoutRef.current = null;
        }, 2000); 
    };
    
    const usersMap = new Map(allUsers.map(u => [u.uid, u]));
    const getTypingText = () => {
        if (typingUsers.length === 0) return null;
        if (typingUsers.length === 1) return `${typingUsers[0].displayName} is typing...`;
        return `${typingUsers.length} users are typing...`;
    };

    return (
        <div className="h-screen flex flex-col bg-whatsapp-style-bg relative overflow-hidden">
            {/* Fixed Header */}
            <header className="flex-shrink-0 z-20 flex items-center justify-between p-4 bg-[#075e54] dark:bg-[#1f2c34] text-white shadow-md">
                <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8">
                        <Link href="/dashboard"><ArrowLeft /></Link>
                    </Button>
                    <Globe className="h-6 w-6 text-emerald-400" />
                    <div>
                        <h2 className="font-bold text-lg leading-tight">World Hub</h2>
                        <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Public Community</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/10">
                        <Link href="/dashboard/social/nuggets"><Gem className="h-5 w-5 text-amber-400"/></Link>
                    </Button>
                </div>
            </header>

            {/* Pinned Announcement */}
            {pinnedMessage && (
                <div className="flex-shrink-0 z-10 p-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800/30 flex items-center gap-3 text-xs">
                    <Pin className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <p className="flex-1 truncate italic">"{pinnedMessage.text}"</p>
                    {isAdmin && <Button variant="ghost" size="icon" className="h-6 w-6 text-yellow-600" onClick={unpinMessage}><PinOff className="h-3 w-3"/></Button>}
                </div>
            )}

            {/* Scrollable Chat Area */}
            <ScrollArea className="flex-1 relative" viewportRef={scrollAreaRef}>
                <div className="p-4 space-y-2 min-h-full flex flex-col justify-end">
                    {(loading || usersLoading) && (
                        <div className="absolute inset-0 flex justify-center items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                    {messages.map((msg, index) => {
                        const sender = usersMap.get(msg.senderId);
                        if (!sender) return null;
                        const isOwn = msg.senderId === currentUser?.id;
                        const prevMessage = messages[index - 1];
                        const showHeader = !prevMessage || prevMessage.senderId !== msg.senderId || !isSameDay(msg.timestamp, prevMessage.timestamp);
                        const showDate = !prevMessage || !isSameDay(msg.timestamp, prevMessage.timestamp);

                        return (
                            <div key={msg.id}>
                                {showDate && (
                                    <div className="flex justify-center my-4">
                                        <span className="px-3 py-1 bg-black/10 dark:bg-white/10 rounded-full text-[10px] font-bold text-muted-foreground uppercase">
                                            {format(msg.timestamp, 'MMMM d, yyyy')}
                                        </span>
                                    </div>
                                )}
                                <ChatMessage 
                                    message={msg} 
                                    sender={sender} 
                                    isOwn={isOwn} 
                                    showHeader={showHeader} 
                                    onUserSelect={setSelectedUser} 
                                    onReply={setReplyingTo}
                                    onClaimRain={() => claimRain(msg.id)}
                                />
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>

            {/* Fixed Footer */}
            <footer className="flex-shrink-0 z-20 p-3 bg-[#ededed] dark:bg-[#1f2c34] border-t dark:border-white/5">
                <AnimatePresence>
                    {replyingTo && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="bg-black/5 dark:bg-white/5 rounded-t-xl p-2 border-b border-black/10 dark:border-white/10 mb-2 flex items-center justify-between"
                        >
                            <div className="text-xs border-l-4 border-emerald-500 pl-2">
                                <p className="font-bold text-emerald-600 dark:text-emerald-400">Replying to {usersMap.get(replyingTo.senderId)?.displayName}</p>
                                <p className="truncate opacity-70 italic">"{replyingTo.text || 'Action Message'}"</p>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setReplyingTo(null)}><X className="h-3 w-3" /></Button>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Input
                            value={newMessage}
                            onChange={(e) => handleTyping(e.target.value)}
                            placeholder="Type a message..."
                            className="h-11 rounded-full pl-4 bg-white dark:bg-[#2a3942] border-none shadow-sm text-sm"
                        />
                        <div className="absolute -top-5 left-4 text-[10px] text-muted-foreground font-medium italic animate-pulse">
                            {getTypingText()}
                        </div>
                    </div>
                    <Button 
                        type="submit" 
                        onClick={handleSendMessage}
                        size="icon" 
                        className="h-11 w-11 rounded-full bg-[#00a884] hover:bg-[#008f6a] text-white shadow-md" 
                        disabled={!newMessage.trim()}
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </footer>

            {/* Profile Dialog */}
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="max-w-md p-0 overflow-hidden border-0">
                    {selectedUser && <UserProfileCard user={selectedUser} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ChatMessage({ message, sender, isOwn, showHeader, onUserSelect, onReply, onClaimRain }: { message: WorldChatMessage, sender: User, isOwn: boolean, showHeader: boolean, onUserSelect: (user: User) => void, onReply: (message: WorldChatMessage) => void, onClaimRain: () => void }) {
    const { isAdmin, editMessage, deleteMessage, toggleReaction, pinMessage, toggleNugget } = useWorldChat();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(message.text || '');

    const handleEditSave = () => {
        if(editText.trim() !== message.text) editMessage(message.id, editText);
        setIsEditing(false);
    };

    const hasGlow = sender.inventory?.alphaGlowExpires && new Date(sender.inventory.alphaGlowExpires) > new Date();
    const isNugget = (message.nuggetMarkedBy?.length || 0) > 0;

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cn("flex flex-col group", isOwn ? "items-end" : "items-start")}>
            <div className={cn("flex gap-2 max-w-[85%]", isOwn ? "flex-row-reverse" : "flex-row")}>
                {!isOwn && (
                    <button onClick={() => onUserSelect(sender)} className="mt-1 flex-shrink-0">
                        <Avatar className="h-8 w-8 border border-white/10"><AvatarImage src={sender.photoURL}/><AvatarFallback>{sender.displayName?.charAt(0)}</AvatarFallback></Avatar>
                    </button>
                )}
                
                <Popover>
                    <PopoverTrigger asChild>
                        <div className={cn(
                            "relative px-3 py-2 rounded-2xl shadow-sm text-sm cursor-pointer transition-all",
                            isOwn ? "bg-[#d9fdd3] dark:bg-[#005c4b] rounded-tr-none" : "bg-white dark:bg-[#202c33] rounded-tl-none",
                            hasGlow && "ring-2 ring-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]",
                            isNugget && "border-amber-400 border-2"
                        )}>
                            {showHeader && !isOwn && (
                                <p className={cn("text-[11px] font-black mb-1", getUserColor(sender.uid))}>
                                    {sender.displayName}
                                </p>
                            )}
                            
                            {message.replyingTo && (
                                <div className="mb-2 p-2 rounded-lg bg-black/5 dark:bg-black/20 border-l-4 border-emerald-500 text-[11px] opacity-80 italic">
                                    <p className="font-bold not-italic">{message.replyingTo.senderName}</p>
                                    <p className="truncate">"{message.replyingTo.textSnippet}"</p>
                                </div>
                            )}

                            {message.type === 'rain' ? (
                                <div className="p-4 text-center space-y-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-400/30">
                                    <div className="relative">
                                        <CloudRain className="h-10 w-10 text-cyan-400 mx-auto animate-bounce" />
                                        <Zap className="h-4 w-4 text-yellow-400 absolute top-0 right-1/3 animate-pulse"/>
                                    </div>
                                    <p className="font-black text-blue-600 dark:text-blue-300 italic tracking-tighter text-xl">CREDIT RAIN!</p>
                                    <p className="text-xs opacity-80">Grab {message.rainData?.amount} credits before they're gone!</p>
                                    <Button size="sm" onClick={(e) => { e.stopPropagation(); onClaimRain(); }} className="w-full bg-cyan-500 hover:bg-cyan-600 font-bold">
                                        CLAIM RAIN
                                    </Button>
                                    <p className="text-[10px] opacity-60 uppercase font-black">{message.rainData?.claimedBy.length} / {message.rainData?.maxClaims} TAKEN</p>
                                </div>
                            ) : isEditing ? (
                                <div className="space-y-2">
                                    <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full bg-transparent border-0 focus:ring-0 resize-none p-0 outline-none" rows={2}/>
                                    <div className="flex justify-end gap-2 text-[10px] font-bold"><button onClick={() => setIsEditing(false)}>CANCEL</button><button onClick={handleEditSave} className="text-emerald-500">SAVE</button></div>
                                </div>
                            ) : (
                                <p className="leading-relaxed select-text whitespace-pre-wrap">{message.text}</p>
                            )}

                            <div className="flex items-center justify-end gap-1 mt-1 opacity-60 text-[9px] font-bold">
                                {message.editedAt && <span>edited</span>}
                                <span>{format(message.timestamp, 'h:mm a')}</span>
                            </div>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-1 bg-slate-800 border-white/10 rounded-full flex gap-1 shadow-2xl">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={() => onReply(message)}><Reply className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={() => toggleNugget(message.id)}><Gem className={cn("h-4 w-4", isNugget && "text-amber-400")}/></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={() => setIsEditing(true)}><Edit className="h-4 w-4"/></Button>
                        {isAdmin && <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={() => pinMessage(message.id)}><Pin className="h-4 w-4"/></Button>}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMessage(message.id)}><Trash2 className="h-4 w-4"/></Button>
                    </PopoverContent>
                </Popover>
            </div>
        </motion.div>
    );
}