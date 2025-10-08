
'use client';
import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Globe, Loader2 } from 'lucide-react';
import { useWorldChat, WorldChatMessage } from '@/hooks/use-world-chat';
import { useUsers, User } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserProfileCard } from '@/components/profile/user-profile-card';

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
    const { messages, sendMessage, loading } = useWorldChat();
    const { users: allUsers, loading: usersLoading } = useUsers();
    const { user: currentUser } = useUser();
    const [newMessage, setNewMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight });
        }
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            sendMessage(newMessage);
            setNewMessage('');
        }
    };
    
    const usersMap = new Map(allUsers.map(u => [u.uid, u]));

    return (
        <>
            <Card className="h-full flex flex-col blue-nebula-bg border-0">
                 <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-white/10 bg-black/20">
                    <div className="flex items-center gap-3">
                        <Globe className="h-6 w-6 text-cyan-300" />
                        <h2 className="text-xl font-bold text-white">World Chat</h2>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-y-auto">
                    <ScrollArea className="h-full" ref={scrollAreaRef}>
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
                                    return <ChatMessage key={msg.id} message={msg} sender={sender} isOwn={msg.senderId === currentUser?.id} onUserSelect={setSelectedUser} />;
                                })}
                            </AnimatePresence>
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="p-4 border-t border-white/10 bg-black/20">
                    <form onSubmit={handleSendMessage} className="flex items-center w-full gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
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

function ChatMessage({ message, sender, isOwn, onUserSelect }: { message: WorldChatMessage, sender: User, isOwn: boolean, onUserSelect: (user: User) => void }) {
    const { user: clerkUser } = useUser();
    const { users } = useUsers();
    
    // Determine which user's data to display
    const userToShow = isOwn ? users.find(u => u.uid === clerkUser?.id) : sender;
    const userColor = getUserColor(sender.uid);

    if (!userToShow) return null; // Or a loading/error state

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

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn("flex items-start gap-3", isOwn && "justify-end")}
        >
             {!isOwn && (
                 <button onClick={() => onUserSelect(sender)}>
                    <Avatar className="h-10 w-10 border-2 border-white/20">
                        <AvatarImage src={sender.photoURL} />
                        <AvatarFallback>{sender.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                 </button>
            )}
            <div className={cn("max-w-xs md:max-w-md", isOwn && "text-right")}>
                 {!isOwn && (
                    <div className="flex items-center gap-2 mb-1">
                        <button onClick={() => onUserSelect(sender)} className="text-sm font-semibold text-slate-300 hover:underline">{sender.displayName}</button>
                         {badgeToShow && badgeToShow.badge}
                    </div>
                )}
                <div className={cn("relative p-3 rounded-2xl bg-black/30 border-2", userColor, isOwn ? "rounded-br-none" : "rounded-bl-none")}>
                    <p className="whitespace-pre-wrap text-white text-left">{message.text}</p>
                    <p className="text-xs text-slate-400 mt-2 pt-1 border-t border-white/10">{formatDistanceToNow(message.timestamp, { addSuffix: true })}</p>
                </div>
            </div>
             {isOwn && (
                 <button onClick={() => onUserSelect(sender)}>
                    <Avatar className="h-10 w-10 border-2 border-white/20">
                        <AvatarImage src={sender.photoURL} />
                        <AvatarFallback>{sender.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                </button>
            )}
        </motion.div>
    );
}
