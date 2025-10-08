
      
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Globe, Loader2, Code, Crown, ShieldCheck, Gamepad2, Swords, Trash2, Smile, Pin, X, PinOff, ArrowLeft, Reply } from 'lucide-react';
import { useWorldChat, WorldChatMessage } from '@/hooks/use-world-chat.tsx';
import { useUsers, User, SUPER_ADMIN_UID } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserProfileCard } from '@/components/profile/user-profile-card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useLocalStorage } from '@/hooks/use-local-storage';

const userColors = [
    'border-red-500/50',
    'border-orange-500/50',
    'border-amber-500/50',
    'border-yellow-500/50',
    'border-lime-500/50',
    'border-green-500/50',
    'border-emerald-500/50',
    'border-teal-500/50',
    'border-cyan-500/50',
    'border-sky-500/50',
    'border-blue-500/50',
    'border-indigo-500/50',
    'border-violet-500/50',
    'border-purple-500/50',
    'border-fuchsia-500/50',
    'border-pink-500/50',
    'border-rose-500/50',
];

const getUserColor = (userId: string) => {
    // Simple hash function to get a consistent color for a user
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return userColors[Math.abs(hash) % userColors.length];
};

export function WorldChatView() {
    const { messages, sendMessage, loading, pinnedMessage, pinMessage, unpinMessage } = useWorldChat();
    const { users: allUsers, loading: usersLoading, isAdmin } = useUsers();
    const { user: currentUser } = useUser();
    const [newMessage, setNewMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [dismissedPinId, setDismissedPinId] = useLocalStorage<string | null>('dismissedPinId', null);
    const [replyingTo, setReplyingTo] = useState<WorldChatMessage | null>(null);
    
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, []);

    useEffect(() => {
        // Auto-scroll only if we are already near the bottom
        if (scrollAreaRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
            if (scrollHeight - scrollTop - clientHeight < 200) {
                 scrollToBottom();
            }
        }
    }, [messages, scrollToBottom]);


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const replyContext = replyingTo ? {
            messageId: replyingTo.id,
            senderName: allUsers.find(u => u.uid === replyingTo.senderId)?.displayName || 'Unknown User',
            textSnippet: replyingTo.text?.substring(0, 50) || '',
        } : undefined;

        await sendMessage(newMessage, replyContext);
        setNewMessage('');
        setReplyingTo(null);
    };
    
    const usersMap = new Map(allUsers.map(u => [u.uid, u]));
    
    const showPinnedMessage = pinnedMessage && pinnedMessage.id !== dismissedPinId;
    const pinnedMessageSender = pinnedMessage ? allUsers.find(u => u.uid === pinnedMessage.senderId) : null;
    
    const handleReplyClick = (message: WorldChatMessage) => {
        setReplyingTo(message);
    }


    return (
        <>
            <Card className="h-full flex flex-col blue-nebula-bg border-0">
                 <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-white/10 bg-black/20">
                    <div className="flex items-center gap-3">
                        <Globe className="h-6 w-6 text-cyan-300" />
                        <h2 className="text-xl font-bold text-white">World Chat</h2>
                    </div>
                </CardHeader>
                {showPinnedMessage && pinnedMessageSender && (
                    <div className="p-3 bg-primary/10 border-b border-primary/20 flex items-center gap-3 text-sm">
                        <Pin className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="flex-1 truncate">
                            <span className="font-bold">{pinnedMessageSender.displayName}:</span>{' '}
                            <span className="text-muted-foreground">{pinnedMessage.text}</span>
                        </div>
                        {isAdmin && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => unpinMessage()}>
                                <PinOff className="h-4 w-4" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDismissedPinId(pinnedMessage.id)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                <CardContent className="flex-1 p-0 overflow-y-auto relative">
                    <ScrollArea className="h-full" viewportRef={scrollAreaRef}>
                        <div className="p-4 space-y-6">
                            {(loading || usersLoading) && (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                                </div>
                            )}
                            <AnimatePresence>
                                {messages.map((msg) => {
                                    const sender = usersMap.get(msg.senderId);
                                    if (!sender) return null;
                                    return <ChatMessage key={msg.id} message={msg} sender={sender} isOwn={msg.senderId === currentUser?.id} onUserSelect={setSelectedUser} onReply={handleReplyClick} />;
                                })}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="p-4 border-t border-white/10 bg-black/20 flex-col items-start gap-2">
                     <AnimatePresence>
                        {replyingTo && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="w-full bg-slate-800/60 rounded-t-lg p-2 border-b border-slate-700 overflow-hidden"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-slate-400">
                                        <p>Replying to <span className="font-bold text-slate-300">{allUsers.find(u => u.uid === replyingTo.senderId)?.displayName}</span></p>
                                        <p className="truncate italic">"{replyingTo.text}"</p>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-white" onClick={() => setReplyingTo(null)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <form onSubmit={handleSendMessage} className="flex items-center w-full gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => { setNewMessage(e.target.value); }}
                            placeholder="Message the world..."
                            className="flex-1 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:ring-primary"
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                            <Send />
                        </Button>
                    </form>
                </CardFooter>
            </Card>

             <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="max-w-md">
                    {selectedUser && (
                         <>
                         <DialogHeader>
                            <DialogTitle>{selectedUser.displayName}'s Profile</DialogTitle>
                         </DialogHeader>
                         <div className="max-h-[70vh] overflow-y-auto p-1">
                            <UserProfileCard user={selectedUser} />
                         </div>
                        </>
                    )}
                </DialogContent>
             </Dialog>
        </>
    );
}

const REACTIONS = ['👍', '❤️', '😂', '🔥', '🎉', '🤔'];

const ClickableMessage = ({ text }: { text: string }) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return (
        <p className="whitespace-pre-wrap text-white text-left">
            {parts.map((part, index) => {
                if (part.match(urlRegex)) {
                    return (
                        <a
                            key={index}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                            onClick={(e) => e.stopPropagation()} // Prevents opening user profile
                        >
                            {part}
                        </a>
                    );
                }
                return part;
            })}
        </p>
    );
};

function ChatMessage({ message, sender, isOwn, onUserSelect, onReply }: { message: WorldChatMessage, sender: User, isOwn: boolean, onUserSelect: (user: User) => void, onReply: (message: WorldChatMessage) => void }) {
    const { user: clerkUser } = useUser();
    const { users, isAdmin } = useUsers();
    const { deleteMessage, toggleReaction, pinMessage } = useWorldChat();
    
    const userToShow = isOwn ? users.find(u => u.uid === clerkUser?.id) : sender;
    const userColor = getUserColor(sender.uid);

    if (!userToShow) return null;

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
    const canDelete = isOwn || isAdmin;

    const reactions = message.reactions || {};
    const hasReactions = Object.keys(reactions).some(emoji => reactions[emoji]?.length > 0);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="group flex flex-col"
        >
            <div className={cn("flex items-start gap-3 w-full", isOwn ? "justify-end" : "justify-start")}>
                {/* Message Actions */}
                <div className={cn("flex items-center opacity-0 group-hover:opacity-100 transition-opacity", isOwn ? "order-first" : "order-last")}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => onReply(message)}>
                        <Reply className="h-4 w-4"/>
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                                <Smile className="h-4 w-4"/>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-1">
                            <div className="flex gap-1">
                                {REACTIONS.map(emoji => (
                                    <Button key={emoji} variant="ghost" size="icon" className="text-xl" onClick={() => toggleReaction(message.id, emoji)}>
                                        {emoji}
                                    </Button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>
                    {isAdmin && (
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white" onClick={() => pinMessage(message.id)}>
                            <Pin className="h-4 w-4"/>
                        </Button>
                    )}
                    {canDelete && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/50 hover:text-destructive">
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Message?</AlertDialogTitle>
                                    <AlertDialogDescription>This action cannot be undone. The message will be permanently deleted for everyone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => deleteMessage(message.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>

                {!isOwn && (
                    <button onClick={() => onUserSelect(sender)}>
                        <Avatar className="h-10 w-10 border-2 border-white/20">
                            <AvatarImage src={sender.photoURL} />
                            <AvatarFallback>{sender.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </button>
                )}
                <div className={cn("max-w-xs md:max-w-md", isOwn ? "text-right" : "text-left")}>
                    {!isOwn && (
                        <div className="flex items-center gap-2 mb-1">
                            <button onClick={() => onUserSelect(sender)} className="text-sm font-semibold text-slate-300 hover:underline">{sender.displayName}</button>
                            {badgeToShow && badgeToShow.badge}
                        </div>
                    )}
                    <div className={cn("relative p-3 rounded-2xl bg-black/30 border-2", userColor, isOwn ? "rounded-br-none" : "rounded-bl-none")}>
                        {message.replyingTo && (
                            <div className="mb-2 p-2 rounded-md bg-black/20 border-l-2 border-slate-500 text-xs">
                                <p className="font-bold text-slate-400">Replying to {message.replyingTo.senderName}</p>
                                <p className="italic text-slate-500 truncate">"{message.replyingTo.textSnippet}"</p>
                            </div>
                        )}
                        {message.text && <ClickableMessage text={message.text} />}
                        <p className="text-xs text-slate-400 mt-2 pt-1 border-t border-white/10">{formatDistanceToNow(message.timestamp, { addSuffix: true })}</p>
                    </div>
                </div>
                {isOwn && (
                    <button onClick={() => onUserSelect(userToShow)}>
                        <Avatar className="h-10 w-10 border-2 border-white/20">
                            <AvatarImage src={userToShow.photoURL} />
                            <AvatarFallback>{userToShow.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </button>
                )}
            </div>

            {hasReactions && (
                <div className={cn("flex flex-wrap gap-1.5 mt-1.5", isOwn ? "justify-end mr-14" : "justify-start ml-14")}>
                    {Object.entries(reactions).map(([emoji, userIds]) => {
                        if (userIds.length === 0) return null;
                        const hasReacted = clerkUser && userIds.includes(clerkUser.id);
                        return (
                             <button
                                key={emoji}
                                onClick={() => toggleReaction(message.id, emoji)}
                                className={cn(
                                    "px-2 py-0.5 rounded-full text-xs flex items-center gap-1.5 transition-colors",
                                    hasReacted ? "bg-primary/80 text-primary-foreground border border-primary-foreground/50" : "bg-black/20 border border-white/10 text-white/80 hover:bg-black/40"
                                )}
                            >
                                <span>{emoji}</span>
                                <span className="font-semibold">{userIds.length}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}
