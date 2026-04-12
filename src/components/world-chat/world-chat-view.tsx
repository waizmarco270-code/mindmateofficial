'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Send, Globe, Loader2, Code, Crown, ShieldCheck, Gamepad2, 
    Swords, Trash2, Smile, Pin, X, PinOff, ArrowLeft, Reply, 
    Edit, Copy, Palette, Gem, CloudRain, Zap, Plus, AtSign, 
    Vote, Megaphone, BellRing, Lock, Unlock, Trash, Clock, 
    ShieldAlert, ExternalLink, CheckCircle, Bird, Moon, Anchor, Skull,
    Flame
} from 'lucide-react';
import { useWorldChat, WorldChatMessage, ReplyContext } from '@/hooks/use-world-chat';
import { useAdmin, User, SUPER_ADMIN_UID, BadgeType } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isToday, isSameDay } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { UserProfileCard } from '@/components/profile/user-profile-card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useLocalStorage } from '@/hooks/use-local-storage';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { usePresence } from '@/hooks/use-presence';

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

const badgeDetails: Record<string, { name: string, badge: JSX.Element }> = {
    dev: { name: 'Developer', badge: <span className="dev-badge"><Code className="h-3 w-3" /> DEV</span> },
    admin: { name: 'Admin', badge: <span className="admin-badge"><ShieldCheck className="h-3 w-3" /> ADMIN</span> },
    vip: { name: 'Elite Member', badge: <span className="elite-badge"><Crown className="h-3 w-3" /> ELITE</span> },
    gm: { name: 'Game Master', badge: <span className="gm-badge">GM</span> },
    challenger: { name: 'Challenger', badge: <span className="challenger-badge"><Swords className="h-3 w-3"/> Challenger</span> },
    'co-dev': { name: 'Co-Developer', badge: <span className="co-dev-badge"><Code className="h-3 w-3"/> Co-Dev</span> },
    'early-bird': { name: 'Early Bird', badge: <span className="early-bird-badge"><Bird className="h-3 w-3"/> EARLY BIRD</span> },
    'night-owl': { name: 'Night Owl', badge: <span className="night-owl-badge"><Moon className="h-3 w-3"/> NIGHT OWL</span> },
    'knowledge-knight': { name: 'Knowledge Knight', badge: <span className="knowledge-knight-badge"><ShieldCheck className="h-3 w-3"/> KNIGHT</span> },
    streaker: { name: 'Streaker', badge: <span className="streaker-badge"><Flame className="h-3 w-3"/> STREAKER</span> },
    isolater: { name: 'Isolater', badge: <span className="isolater-badge">ISOLATER</span> },
    'iso-warrior': { name: 'ISO-Warrior', badge: <span className="iso-warrior-badge">ISO-WARRIOR</span> },
    warrior: { name: 'Warrior', badge: <span className="warrior-badge">WARRIOR</span> },
    'iso-master': { name: 'ISO-Master', badge: <span className="iso-master-badge">ISO-MASTER</span> },
    sovereign: { name: 'Sovereign', badge: <span className="sovereign-badge">Sovereign</span> },
    champion: { name: 'Champion', badge: <span className="champion-badge"><Skull className="h-3.5 w-3.5"/> Champion</span> },
    premium: { name: 'Premium', badge: <span className="premium-badge"><Crown className="h-3 w-3"/> PREMIUM</span> }
};

function SmartText({ text }: { text?: string }) {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return (
        <div className="leading-relaxed select-text whitespace-pre-wrap">
            {parts.map((part, i) => {
                if (part.match(urlRegex)) {
                    return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-cyan-400 font-black hover:underline inline-flex items-center gap-1 group/link">{part}<ExternalLink className="h-3 w-3 opacity-50 group-hover/link:opacity-100 transition-opacity" /></a>;
                }
                return part.split(/(@\w+|@all)/).map((subPart, j) => (
                    <span key={`${i}-${j}`} className={cn(subPart.startsWith('@') ? "text-blue-500 font-bold" : "")}>{subPart}</span>
                ));
            })}
        </div>
    );
}

export function WorldChatView() {
    const { messages, sendMessage, sendPoll, claimRain, loading, pinnedMessage, unpinMessage, clearMessages, toggleLock, setSlowMode, isLocked, slowMode, typingUsers, updateTypingStatus } = useWorldChat();
    const { users: allUsers, loading: usersLoading, isAdmin, isSuperAdmin, currentUserData } = useAdmin();
    const { user: currentUser } = useUser();
    const { toast } = useToast();
    const { onlineUsers } = usePresence();
    
    const [newMessage, setNewMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [replyingTo, setReplyingTo] = useState<WorldChatMessage | null>(null);
    const [mentionSearch, setMentionSearch] = useState('');
    const [showMentions, setShowMentions] = useState(false);
    
    const [isPollDialogOpen, setIsPollDialogOpen] = useState(false);
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const onlineCount = useMemo(() => onlineUsers.filter(u => u.isOnline).length, [onlineUsers]);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior });
        }
    }, []);

    useEffect(() => {
        scrollToBottom('auto');
    }, [messages.length, loading, scrollToBottom]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        const replyContext: ReplyContext | null = replyingTo ? {
            messageId: replyingTo.id,
            senderId: replyingTo.senderId,
            senderName: allUsers.find(u => u.uid === replyingTo.senderId)?.displayName || 'Unknown',
            textSnippet: replyingTo.text?.substring(0, 50) || 'Action Message',
        } : null;
        await sendMessage(newMessage, replyContext);
        setNewMessage('');
        setReplyingTo(null);
        setShowMentions(false);
    };

    const handleTyping = (text: string) => {
        setNewMessage(text);
        const lastWord = text.split(' ').pop() || '';
        if (lastWord.startsWith('@')) {
            setMentionSearch(lastWord.slice(1).toLowerCase());
            setShowMentions(true);
        } else {
            setShowMentions(false);
        }
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        else updateTypingStatus(true);
        typingTimeoutRef.current = setTimeout(() => {
            updateTypingStatus(false);
            typingTimeoutRef.current = null;
        }, 2000); 
    };

    const insertMention = (user: User | 'all') => {
        const words = newMessage.split(' ');
        words.pop();
        const mentionText = user === 'all' ? '@all ' : `@${user.displayName.replace(/\s+/g, '')} `;
        setNewMessage(words.join(' ') + (words.length > 0 ? ' ' : '') + mentionText);
        setShowMentions(false);
    };

    const filteredMentionUsers = useMemo(() => {
        return allUsers.filter(u => u.displayName?.toLowerCase().includes(mentionSearch) && u.uid !== currentUser?.id).slice(0, 5);
    }, [allUsers, mentionSearch, currentUser?.id]);

    const handleExecutePoll = async () => {
        const validOptions = pollOptions.filter(o => o.trim() !== '');
        if (!pollQuestion.trim() || validOptions.length < 2) return;
        await sendPoll(pollQuestion, validOptions);
        setIsPollDialogOpen(false);
        setPollQuestion('');
        setPollOptions(['', '']);
    };
    
    const usersMap = useMemo(() => {
        const m = new Map();
        allUsers.forEach(u => m.set(u.uid, u));
        return m;
    }, [allUsers]);

    const onUserSelect = (u: User) => {
        setSelectedUser(u);
    };
    
    return (
        <div className="h-screen flex flex-col bg-whatsapp-style-bg relative overflow-hidden">
            <header className="flex-shrink-0 z-20 flex items-center justify-between p-4 bg-[#075e54] dark:bg-[#1f2c34] text-white shadow-md">
                <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/10 h-8 w-8">
                        <Link href="/dashboard"><ArrowLeft /></Link>
                    </Button>
                    <Globe className="h-6 w-6 text-emerald-400" />
                    <div>
                        <h2 className="font-bold text-lg leading-tight">Global Forum</h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]" />
                            <p className="text-[9px] font-black uppercase tracking-[0.15em]">{onlineCount.toLocaleString()} LEGENDS ACTIVE</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isLocked && <Lock className="h-4 w-4 text-amber-400 mr-2" />}
                    <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/10">
                        <Link href="/dashboard/social/nuggets"><Gem className="h-5 w-5 text-amber-400"/></Link>
                    </Button>
                </div>
            </header>

            <AnimatePresence>
                {pinnedMessage && (
                    <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }} className="flex-shrink-0 z-10 p-3 bg-yellow-400/10 dark:bg-yellow-400/5 border-b border-yellow-400/30 backdrop-blur-xl flex items-center gap-4 group/pin shadow-lg">
                        <div className="p-2 rounded-full bg-yellow-400 text-black shadow-lg"><Pin className="h-4 w-4" /></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-yellow-600 dark:text-yellow-400 mb-0.5">Sovereign Directive</p>
                            <p className="text-xs font-bold truncate text-foreground/90 italic">"{pinnedMessage.text || 'Action Briefing'}"</p>
                        </div>
                        {(isAdmin || isSuperAdmin) && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive" onClick={unpinMessage}><X className="h-4 w-4"/></Button>}
                    </motion.div>
                )}
            </AnimatePresence>

            <ScrollArea className="flex-1 relative" viewportRef={scrollAreaRef}>
                <div className="p-4 space-y-2 min-h-full flex flex-col justify-end">
                    {messages.map((msg, index) => {
                        const sender = usersMap.get(msg.senderId);
                        if (!sender) return null;
                        const isOwn = msg.senderId === currentUser?.id;
                        const prevMessage = messages[index - 1];
                        const showHeader = !prevMessage || prevMessage.senderId !== msg.senderId || !isSameDay(msg.timestamp, prevMessage.timestamp);
                        const showDate = !prevMessage || !isSameDay(msg.timestamp, prevMessage.timestamp);
                        return (
                            <div key={msg.id}>
                                {showDate && <div className="flex justify-center my-4"><span className="px-3 py-1 bg-black/10 dark:bg-white/10 rounded-full text-[10px] font-bold text-muted-foreground uppercase">{format(msg.timestamp, 'MMMM d, yyyy')}</span></div>}
                                <ChatMessage message={msg} sender={sender} isOwn={isOwn} showHeader={showHeader} onUserSelect={onUserSelect} onReply={setReplyingTo} onClaimRain={() => claimRain(msg.id)} />
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>

            <footer className="flex-shrink-0 z-20 p-3 bg-[#ededed] dark:bg-[#1f2c34] border-t dark:border-white/5 relative">
                <AnimatePresence>
                    {showMentions && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-full left-4 mb-2 w-64 bg-background border rounded-xl shadow-2xl overflow-hidden z-50">
                            <div className="p-2 bg-primary/10 text-[10px] font-black uppercase text-primary border-b">Suggested Legends</div>
                            {isSuperAdmin && <button onClick={() => insertMention('all')} className="w-full p-3 flex items-center gap-3 hover:bg-muted text-left transition-colors border-b"><div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white"><AtSign className="h-4 w-4"/></div><div><p className="text-sm font-bold">@all</p></div></button>}
                            {filteredMentionUsers.map(u => <button key={u.uid} onClick={() => insertMention(u)} className="w-full p-3 flex items-center gap-3 hover:bg-muted text-left transition-colors"><Avatar className="h-8 w-8"><AvatarImage src={u.photoURL}/><AvatarFallback>U</AvatarFallback></Avatar><p className="text-sm font-medium">{u.displayName}</p></button>)}
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="flex items-center gap-2">
                    {(isAdmin || isSuperAdmin) && <Button size="icon" className="h-11 w-11 rounded-full bg-primary text-white shadow-md flex-shrink-0" onClick={() => setIsPollDialogOpen(true)}><Plus className="h-5 w-5" /></Button>}
                    <Input value={newMessage} onChange={(e) => handleTyping(e.target.value)} placeholder={isLocked && !isAdmin && !isSuperAdmin ? "Chat locked" : "Type a message..."} className="h-11 rounded-full bg-white dark:bg-[#2a3942] border-none shadow-sm text-sm" disabled={isLocked && !isAdmin && !isSuperAdmin} />
                    <Button onClick={handleSendMessage} size="icon" className="h-11 w-11 rounded-full bg-[#00a884] hover:bg-[#008f6a] text-white shadow-md flex-shrink-0" disabled={!newMessage.trim() || (isLocked && !isAdmin && !isSuperAdmin)}><Send className="h-5 w-5" /></Button>
                </div>
            </footer>

            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="max-w-md p-0 overflow-hidden border-0 max-h-[90vh] overflow-y-auto">
                    {selectedUser && <UserProfileCard user={selectedUser} isOwnProfile={selectedUser.uid === currentUser?.id} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ChatMessage({ message, sender, isOwn, showHeader, onUserSelect, onReply, onClaimRain }: any) {
    const { isAdmin, isSuperAdmin, editMessage, deleteMessage, pinMessage, toggleNugget, submitPollVote } = useWorldChat();
    const { user: currentUser } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(message.text || '');
    const [isClaiming, setIsClaiming] = useState(false);

    const equippedFrameId = sender.equippedFrame || 'default';
    const isNugget = (message.nuggetMarkedBy?.length || 0) > 0;

    const renderPoll = () => {
        if (!message.pollData) return null;
        const data = message.pollData;
        const totalVotes = Object.values(data.results).flat().length;
        const hasVoted = Object.values(data.results).some(uids => uids.includes(currentUser?.id || ''));
        return (
            <div className="p-4 space-y-4 bg-muted/50 rounded-xl border-2 border-purple-500/30 min-w-[240px]">
                <p className="font-bold text-base flex items-center gap-2 text-purple-600 dark:text-purple-400"><Vote className="h-4 w-4"/> {data.question}</p>
                <div className="space-y-3">{data.options.map(opt => {
                    const votes = data.results[opt] || [];
                    const percent = totalVotes > 0 ? (votes.length / totalVotes) * 100 : 0;
                    const votedForThis = votes.includes(currentUser?.id || '');
                    return (
                        <div key={opt} className="space-y-1">
                            <button onClick={() => !hasVoted && submitPollVote(message.id, opt)} disabled={hasVoted} className={cn("w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-all border", votedForThis ? "bg-purple-500 text-white border-purple-400" : "bg-background border-muted hover:border-purple-500/50")}>
                                <span className="truncate">{opt}</span><span>{percent.toFixed(0)}%</span>
                            </button>
                            {hasVoted && <Progress value={percent} className="h-1 bg-black/10" />}
                        </div>
                    );
                })}</div>
            </div>
        );
    }

    if (message.type === 'rain') {
        const hasClaimed = message.rainData?.claimedBy.includes(currentUser?.id || '');
        const isFull = (message.rainData?.claimedBy.length || 0) >= (message.rainData?.maxClaims || 1);
        return (
            <div className={cn("flex w-full mb-4 px-2", isOwn ? "justify-end" : "justify-start")}>
                <Card className="w-full max-w-[320px] overflow-hidden rounded-3xl border-2 border-primary/20 shadow-xl bg-card">
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between"><div className="p-3 rounded-2xl bg-primary/10 text-primary"><CloudRain className="h-8 w-8" /></div></div>
                        <h3 className="text-2xl font-black tracking-tight leading-none uppercase italic text-primary">CREDIT RAIN</h3>
                        <Button size="lg" disabled={hasClaimed || isFull || isClaiming} onClick={onClaimRain} className={cn("w-full h-14 font-black rounded-2xl", hasClaimed ? "bg-muted" : "bg-emerald-500 hover:bg-emerald-600 text-white")}>
                            {isClaiming ? <Loader2 className="animate-spin" /> : hasClaimed ? 'HARVESTED' : `CLAIM ${message.rainData?.amount} CR`}
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={cn("flex flex-col group", isOwn ? "items-end" : "items-start")}>
            <div className={cn("flex gap-2 max-w-[85%]", isOwn ? "flex-row-reverse" : "flex-row")}>
                {!isOwn && (
                    <button onClick={() => onUserSelect(sender)} className="mt-1 flex-shrink-0">
                        <div className={cn("avatar-frame-base", equippedFrameId === 'premium' ? 'avatar-frame-premium' : 'avatar-frame-default')}>
                            <Avatar className="h-8 w-8 border shadow-sm"><AvatarImage src={sender.photoURL}/><AvatarFallback>{sender.displayName?.charAt(0)}</AvatarFallback></Avatar>
                        </div>
                    </button>
                )}
                <Popover>
                    <PopoverTrigger asChild>
                        <div className={cn("relative px-3 py-2 rounded-2xl shadow-sm text-sm cursor-pointer transition-all border-2 border-transparent", isOwn ? "bg-[#d9fdd3] dark:bg-[#005c4b] rounded-tr-none" : "bg-white dark:bg-[#202c33] rounded-tl-none", isNugget && "border-amber-400 shadow-md")}>
                            {showHeader && !isOwn && <p className={cn("text-[11px] font-black mb-1 truncate max-w-[100px]", getUserColor(sender.uid))}>{sender.displayName}</p>}
                            {message.replyingTo && <div className="mb-2 p-2 rounded-lg bg-black/5 dark:bg-black/20 border-l-4 border-emerald-500 text-[11px] opacity-80 italic"><p className="font-bold not-italic">{message.replyingTo.senderName}</p><p className="truncate">"{message.replyingTo.textSnippet}"</p></div>}
                            {message.type === 'poll' ? renderPoll() : <SmartText text={message.text} />}
                            <div className="flex items-center justify-end gap-1 mt-1 opacity-60 text-[9px] font-bold"><span>{format(message.timestamp, 'h:mm a')}</span></div>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-1 bg-slate-800 border-white/10 rounded-full flex gap-1 shadow-2xl">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white rounded-full" onClick={() => onReply(message)}><Reply className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white rounded-full" onClick={() => toggleNugget(message.id)}><Gem className={cn("h-4 w-4", isNugget && "text-amber-400")}/></Button>
                        {(isOwn || isAdmin || isSuperAdmin) && <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive rounded-full" onClick={() => deleteMessage(message.id)}><Trash2 className="h-4 w-4"/></Button>}
                    </PopoverContent>
                </Popover>
            </div>
        </motion.div>
    );
}
