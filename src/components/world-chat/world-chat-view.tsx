
'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Globe, Loader2, Code, Crown, ShieldCheck, Gamepad2, Swords, Trash2, Smile, Pin, X, PinOff, ArrowLeft, Reply, Edit, Copy, Palette, Gem, CloudRain, Zap, Plus, AtSign, Vote, Megaphone, BellRing, Lock, Unlock, Trash, Clock, ShieldAlert } from 'lucide-react';
import { useWorldChat, WorldChatMessage, ReplyContext } from '@/hooks/use-world-chat';
import { useAdmin, User, SUPER_ADMIN_UID } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isSameDay } from 'date-fns';
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
    const { messages, sendMessage, sendRain, sendPoll, claimRain, loading, pinnedMessage, unpinMessage, clearMessages, toggleLock, setSlowMode, isLocked, slowMode, typingUsers, updateTypingStatus } = useWorldChat();
    const { users: allUsers, loading: usersLoading, isAdmin, isSuperAdmin } = useAdmin();
    const { user: currentUser } = useUser();
    const { toast } = useToast();
    
    const [newMessage, setNewMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [replyingTo, setReplyingTo] = useState<WorldChatMessage | null>(null);
    const [mentionSearch, setMentionSearch] = useState('');
    const [showMentions, setShowMentions] = useState(false);
    
    // Admin Tool Modals
    const [isRainDialogOpen, setIsRainDialogOpen] = useState(false);
    const [rainAmount, setRainAmount] = useState(10);
    const [rainLimit, setRainLimit] = useState(10);

    const [isPollDialogOpen, setIsPollDialogOpen] = useState(false);
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        
        // Mention logic
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
        return allUsers.filter(u => 
            u.displayName?.toLowerCase().includes(mentionSearch) && 
            u.uid !== currentUser?.id
        ).slice(0, 5);
    }, [allUsers, mentionSearch, currentUser?.id]);

    const handleExecuteRain = async () => {
        if (rainAmount > 100) {
            toast({ variant: 'destructive', title: "Limit Exceeded", description: "Credit rain cannot exceed 100 credits per claim." });
            return;
        }
        await sendRain(rainAmount, rainLimit);
        setIsRainDialogOpen(false);
        toast({ title: "Let it rain!", description: "Credit rain has been dispatched." });
    };

    const handleExecutePoll = async () => {
        const validOptions = pollOptions.filter(o => o.trim() !== '');
        if (!pollQuestion.trim() || validOptions.length < 2) {
            toast({ variant: 'destructive', title: "Invalid Poll", description: "Question and at least 2 options required." });
            return;
        }
        await sendPoll(pollQuestion, validOptions);
        setIsPollDialogOpen(false);
        setPollQuestion('');
        setPollOptions(['', '']);
    };
    
    const usersMap = new Map(allUsers.map(u => [u.uid, u]));
    const getTypingText = () => {
        if (typingUsers.length === 0) return null;
        if (typingUsers.length === 1) return `${typingUsers[0].displayName} is typing...`;
        return `${typingUsers.length} users are typing...`;
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
                        <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Public Community</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {isLocked && <Lock className="h-4 w-4 text-amber-400 mr-2" title="Chat Locked" />}
                    <Button asChild variant="ghost" size="icon" className="text-white hover:bg-white/10">
                        <Link href="/dashboard/social/nuggets"><Gem className="h-5 w-5 text-amber-400"/></Link>
                    </Button>
                </div>
            </header>

            {pinnedMessage && (
                <div className="flex-shrink-0 z-10 p-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800/30 flex items-center gap-3 text-xs">
                    <Pin className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <p className="flex-1 truncate italic">"{pinnedMessage.text || 'Action Message'}"</p>
                    {(isAdmin || isSuperAdmin) && <Button variant="ghost" size="icon" className="h-6 w-6 text-yellow-600" onClick={unpinMessage}><PinOff className="h-3 w-3"/></Button>}
                </div>
            )}

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

            <footer className="flex-shrink-0 z-20 p-3 bg-[#ededed] dark:bg-[#1f2c34] border-t dark:border-white/5 relative">
                {/* Mention List */}
                <AnimatePresence>
                    {showMentions && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full left-4 mb-2 w-64 bg-background border rounded-xl shadow-2xl overflow-hidden z-50"
                        >
                            <div className="p-2 bg-primary/10 text-[10px] font-black uppercase text-primary border-b">Suggested Legends</div>
                            {isSuperAdmin && (
                                <button onClick={() => insertMention('all')} className="w-full p-3 flex items-center gap-3 hover:bg-muted text-left transition-colors border-b">
                                    <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white"><AtSign className="h-4 w-4"/></div>
                                    <div><p className="text-sm font-bold">@all</p><p className="text-[10px] text-muted-foreground">Notify everyone</p></div>
                                </button>
                            )}
                            {filteredMentionUsers.map(u => (
                                <button key={u.uid} onClick={() => insertMention(u)} className="w-full p-3 flex items-center gap-3 hover:bg-muted text-left transition-colors">
                                    <Avatar className="h-8 w-8"><AvatarImage src={u.photoURL}/><AvatarFallback>U</AvatarFallback></Avatar>
                                    <p className="text-sm font-medium">{u.displayName}</p>
                                </button>
                            ))}
                            {filteredMentionUsers.length === 0 && !isSuperAdmin && <p className="p-4 text-xs text-muted-foreground text-center">No legends found...</p>}
                        </motion.div>
                    )}
                </AnimatePresence>

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
                    {/* Admin/Dev Tools Menu */}
                    {(isAdmin || isSuperAdmin) && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button size="icon" className="h-11 w-11 rounded-full bg-primary text-white shadow-md flex-shrink-0">
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent side="top" className="w-64 p-2 rounded-2xl shadow-2xl mb-2">
                                <div className="space-y-1">
                                    <Button variant="ghost" onClick={() => setIsRainDialogOpen(true)} className="w-full justify-start text-blue-500 font-bold hover:bg-blue-50">
                                        <CloudRain className="mr-2 h-4 w-4"/> Credit Rain
                                    </Button>
                                    <Button variant="ghost" onClick={() => setIsPollDialogOpen(true)} className="w-full justify-start text-purple-500 font-bold hover:bg-purple-50">
                                        <Vote className="mr-2 h-4 w-4"/> Create Poll
                                    </Button>
                                    <div className="my-1 border-t border-muted" />
                                    <Button variant="ghost" onClick={toggleLock} className={cn("w-full justify-start font-bold", isLocked ? "text-green-500" : "text-amber-500")}>
                                        {isLocked ? <Unlock className="mr-2 h-4 w-4"/> : <Lock className="mr-2 h-4 w-4"/>}
                                        {isLocked ? "Unlock Chat" : "Lock Chat"}
                                    </Button>
                                    <Button variant="ghost" onClick={clearMessages} className="w-full justify-start text-destructive font-bold">
                                        <Trash className="mr-2 h-4 w-4"/> Clear Chat
                                    </Button>
                                    <div className="p-2 space-y-2">
                                        <Label className="text-[10px] uppercase font-black text-muted-foreground">Slow Mode Cooldown</Label>
                                        <div className="flex gap-1">
                                            {[0, 5, 30].map(s => (
                                                <Button key={s} size="sm" variant={slowMode === s ? "default" : "outline"} onClick={() => setSlowMode(s)} className="h-7 flex-1 text-[10px]">{s}s</Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}

                    <div className="relative flex-1">
                        <Input
                            value={newMessage}
                            onChange={(e) => handleTyping(e.target.value)}
                            onFocus={() => updateTypingStatus(true)}
                            onBlur={() => updateTypingStatus(false)}
                            placeholder={isLocked && !isAdmin && !isSuperAdmin ? "Chat is locked by admin" : "Type a message..."}
                            className="h-11 rounded-full pl-4 bg-white dark:bg-[#2a3942] border-none shadow-sm text-sm"
                            disabled={isLocked && !isAdmin && !isSuperAdmin}
                        />
                        <div className="absolute -top-5 left-4 text-[10px] text-muted-foreground font-medium italic animate-pulse">
                            {getTypingText()}
                        </div>
                    </div>
                    <Button 
                        type="submit" 
                        onClick={handleSendMessage}
                        size="icon" 
                        className="h-11 w-11 rounded-full bg-[#00a884] hover:bg-[#008f6a] text-white shadow-md flex-shrink-0" 
                        disabled={!newMessage.trim() || (isLocked && !isAdmin && !isSuperAdmin)}
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </footer>

            {/* Admin Tool Dialogs */}
            <Dialog open={isRainDialogOpen} onOpenChange={setIsRainDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-blue-500 flex items-center gap-2">
                            <CloudRain/> Trigger Credit Rain
                        </DialogTitle>
                        <DialogDescription>Shower the community with credits (Max 100 per claim).</DialogDescription>
                    </DialogHeader>
                    <div className="py-6 space-y-6">
                        <div className="space-y-2">
                            <Label>Amount per Claim (Max 100)</Label>
                            <Input type="number" value={rainAmount} onChange={e => setRainAmount(Number(e.target.value))} max={100} />
                        </div>
                        <div className="space-y-2">
                            <Label>Max Claims (Users)</Label>
                            <Input type="number" value={rainLimit} onChange={e => setRainLimit(Number(e.target.value))} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleExecuteRain} className="w-full h-12 text-lg font-bold bg-blue-500 hover:bg-blue-600">
                            GENERATE RAIN ⛈️
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isPollDialogOpen} onOpenChange={setIsPollDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-purple-500 flex items-center gap-2">
                            <Vote/> Create Forum Poll
                        </DialogTitle>
                        <DialogDescription>Ask the community a question.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Question</Label>
                            <Input value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder="e.g. Next feature?" />
                        </div>
                        <div className="space-y-2">
                            <Label>Options</Label>
                            {pollOptions.map((opt, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input value={opt} onChange={e => {
                                        const newOpts = [...pollOptions];
                                        newOpts[i] = e.target.value;
                                        setPollOptions(newOpts);
                                    }} placeholder={`Option ${i+1}`} />
                                    {pollOptions.length > 2 && <Button variant="ghost" size="icon" onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}><X className="h-4 w-4"/></Button>}
                                </div>
                            ))}
                            {pollOptions.length < 5 && <Button variant="outline" size="sm" onClick={() => setPollOptions([...pollOptions, ''])} className="w-full"><Plus className="h-4 w-4 mr-2"/> Add Option</Button>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleExecutePoll} className="w-full h-12 text-lg font-bold bg-purple-500 hover:bg-purple-600">
                            POST POLL 📊
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
    const { isAdmin, isSuperAdmin, editMessage, deleteMessage, toggleReaction, pinMessage, toggleNugget, submitPollVote } = useWorldChat();
    const { user: currentUser } = useUser();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(message.text || '');

    const handleEditSave = () => {
        if(editText.trim() !== message.text) editMessage(message.id, editText);
        setIsEditing(false);
    };

    const hasGlow = sender.inventory?.alphaGlowExpires && new Date(sender.inventory.alphaGlowExpires) > new Date();
    const isNugget = (message.nuggetMarkedBy?.length || 0) > 0;

    const renderPoll = () => {
        if (!message.pollData) return null;
        const data = message.pollData;
        const totalVotes = Object.values(data.results).flat().length;
        const hasVoted = Object.values(data.results).some(uids => uids.includes(currentUser?.id || ''));

        return (
            <div className="p-4 space-y-4 bg-muted/50 rounded-xl border-2 border-purple-500/30 min-w-[240px]">
                <p className="font-bold text-base flex items-center gap-2 text-purple-600 dark:text-purple-400">
                    <Vote className="h-4 w-4"/> {data.question}
                </p>
                <div className="space-y-3">
                    {data.options.map(opt => {
                        const votes = data.results[opt] || [];
                        const percent = totalVotes > 0 ? (votes.length / totalVotes) * 100 : 0;
                        const votedForThis = votes.includes(currentUser?.id || '');

                        return (
                            <div key={opt} className="space-y-1">
                                <button 
                                    onClick={() => !hasVoted && submitPollVote(message.id, opt)}
                                    disabled={hasVoted}
                                    className={cn(
                                        "w-full flex items-center justify-between p-2 rounded-lg text-xs font-bold transition-all border",
                                        votedForThis ? "bg-purple-500 text-white border-purple-400" : "bg-background border-muted hover:border-purple-500/50"
                                    )}
                                >
                                    <span className="truncate">{opt}</span>
                                    <span className="shrink-0">{percent.toFixed(0)}%</span>
                                </button>
                                {hasVoted && <Progress value={percent} className="h-1 bg-black/10" />}
                            </div>
                        );
                    })}
                </div>
                <p className="text-[10px] text-center opacity-60 font-black uppercase">{totalVotes} VOTES TOTAL</p>
            </div>
        );
    }

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
                            hasGlow ? "alpha-rainbow-border" : "",
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
                            ) : message.type === 'poll' ? renderPoll() : isEditing ? (
                                <div className="space-y-2">
                                    <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full bg-transparent border-0 focus:ring-0 resize-none p-0 outline-none" rows={2}/>
                                    <div className="flex justify-end gap-2 text-[10px] font-bold"><button onClick={() => setIsEditing(false)}>CANCEL</button><button onClick={handleEditSave} className="text-emerald-500">SAVE</button></div>
                                </div>
                            ) : (
                                <p className="leading-relaxed select-text whitespace-pre-wrap">
                                    {message.text?.split(/(@\w+|@all)/).map((part, i) => (
                                        <span key={i} className={cn(part.startsWith('@') ? "text-blue-500 font-bold" : "")}>{part}</span>
                                    ))}
                                </p>
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
                        {(isOwn || isAdmin || isSuperAdmin) && !message.pollData && !message.rainData && <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={() => setIsEditing(true)}><Edit className="h-4 w-4"/></Button>}
                        {(isAdmin || isSuperAdmin) && <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={() => pinMessage(message.id)}><Pin className="h-4 w-4"/></Button>}
                        {(isOwn || isAdmin || isSuperAdmin) && <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMessage(message.id)}><Trash2 className="h-4 w-4"/></Button>}
                    </PopoverContent>
                </Popover>
            </div>
        </motion.div>
    );
}
