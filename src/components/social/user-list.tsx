
'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFriends, FriendRequest } from '@/hooks/use-friends';
import { useUsers, User } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, UserX, Check, X, Loader2, Search, MessageSquarePlus, MessageSquare, Clock, ShieldCheck, Crown } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { usePresence } from '@/hooks/use-presence';
import { useUnreadMessages } from '@/hooks/use-unread';
import { formatDistanceToNow, isToday } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '../ui/badge';

interface UserListProps {
    onSelectFriend: (friend: User) => void;
    selectedFriendId?: string | null;
}

export function UserList({ onSelectFriend, selectedFriendId }: UserListProps) {
    const { user: currentUser } = useUser();
    const { users: allUsers } = useUsers();
    const { friends, friendRequests, sentRequests, sendFriendRequest, acceptFriendRequest, declineFriendRequest, loading: friendsLoading } = useFriends();
    const { chatsMetadata, unreadChats, markAsRead } = useUnreadMessages();
    const { onlineUsers, loading: presenceLoading } = usePresence();

    const [discoverSearch, setDiscoverSearch] = useState('');
    const [isDiscoverOpen, setIsDiscoverOpen] = useState(false);

    // Filter discovery results: Not self, not already friend
    const discoverResults = useMemo(() => {
        if (!discoverSearch.trim()) return [];
        return allUsers.filter(u =>
            u.uid !== currentUser?.id && 
            !friends.some(f => f.uid === u.uid) &&
            (u.displayName.toLowerCase().includes(discoverSearch.toLowerCase()) || u.uid === discoverSearch)
        ).slice(0, 5);
    }, [discoverSearch, allUsers, currentUser?.id, friends]);

    // Construct Inbox List: Sort by activity (Last Message Time)
    const inboxList = useMemo(() => {
        const friendMap = new Map(friends.map(f => [f.uid, f]));
        const chatIds = new Set(chatsMetadata.map(c => c.friendId));
        
        // Add friends who haven't messaged yet
        friends.forEach(f => chatIds.add(f.uid));

        return Array.from(chatIds).map(uid => {
            const friend = friendMap.get(uid);
            const meta = chatsMetadata.find(c => c.friendId === uid);
            return {
                user: friend,
                meta: meta || null,
                isUnread: meta ? unreadChats.has(meta.id) : false
            }
        }).filter(item => item.user !== undefined).sort((a, b) => {
            const timeA = a.meta?.lastMessage?.timestamp.getTime() || 0;
            const timeB = b.meta?.lastMessage?.timestamp.getTime() || 0;
            return timeB - timeA;
        });
    }, [friends, chatsMetadata, unreadChats]);

    const handleSelectChat = (friend: User) => {
        markAsRead(friend.uid);
        onSelectFriend(friend);
    };

    const finalLoading = friendsLoading || presenceLoading;

    return (
        <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
            <CardHeader className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black tracking-tight text-foreground">ALLIANCE</h2>
                    <Dialog open={isDiscoverOpen} onOpenChange={setIsDiscoverOpen}>
                        <DialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="rounded-full bg-primary/10 text-primary">
                                <MessageSquarePlus className="h-5 w-5" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Discover Scholars</DialogTitle>
                                <DialogDescription>Find new allies by name or MindMate ID.</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search name or UID..." 
                                        className="pl-9 h-12"
                                        value={discoverSearch}
                                        onChange={(e) => setDiscoverSearch(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    {discoverResults.map(user => (
                                        <div key={user.uid} className="flex items-center justify-between p-3 rounded-xl border bg-muted/30">
                                            <div className="flex items-center gap-3">
                                                <Avatar><AvatarImage src={user.photoURL}/><AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback></Avatar>
                                                <div>
                                                    <p className="font-bold text-sm">{user.displayName}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-mono">{user.uid.slice(-8)}</p>
                                                </div>
                                            </div>
                                            {sentRequests.some(r => r.receiverId === user.uid) ? (
                                                <Badge variant="secondary">Sent</Badge>
                                            ) : (
                                                <Button size="sm" onClick={() => sendFriendRequest(user.uid)}>
                                                    <UserPlus className="h-4 w-4 mr-2"/> Ally
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    {discoverSearch && discoverResults.length === 0 && (
                                        <p className="text-center text-xs text-muted-foreground py-4">No scholars found matching "{discoverSearch}"</p>
                                    )}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>

            <Tabs defaultValue="inbox" className="flex-1 flex flex-col min-h-0">
                <div className="px-4 mb-2">
                    <TabsList className="grid w-full grid-cols-2 rounded-full h-10 p-1 bg-muted/50 border">
                        <TabsTrigger value="inbox" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-sm">Inbox</TabsTrigger>
                        <TabsTrigger value="requests" className="rounded-full relative data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            Requests
                            {friendRequests.length > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background animate-in zoom-in">{friendRequests.length}</span>}
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 min-h-0">
                    <TabsContent value="inbox" className="h-full m-0">
                        <ScrollArea className="h-full">
                            <div className="p-2 space-y-1">
                                {inboxList.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
                                        <MessageSquare className="h-12 w-12 mb-2" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-center">Your Inbox is Empty</p>
                                        <p className="text-[10px] text-center mt-1">Start by discovering new allies</p>
                                    </div>
                                ) : inboxList.map(({ user, meta, isUnread }) => {
                                    if (!user) return null;
                                    const isOnline = onlineUsers.some(u => u.uid === user.uid);
                                    const isActive = selectedFriendId === user.uid;
                                    
                                    return (
                                        <div
                                            key={user.uid}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border border-transparent",
                                                isActive ? "bg-primary/10 border-primary/10" : "hover:bg-muted/50"
                                            )}
                                            onClick={() => handleSelectChat(user)}
                                        >
                                            <div className="relative flex-shrink-0">
                                                <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                                                    <AvatarImage src={user.photoURL} alt={user.displayName} />
                                                    <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                {isOnline && (
                                                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-background ring-1 ring-green-500/20" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-0.5">
                                                    <p className={cn("font-bold text-sm truncate", isUnread && "text-primary")}>{user.displayName}</p>
                                                    {meta?.lastMessage && (
                                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                                            {formatDistanceToNow(meta.lastMessage.timestamp, { addSuffix: false }).replace('about ', '')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-center gap-2">
                                                    <p className={cn(
                                                        "text-xs truncate",
                                                        isUnread ? "text-foreground font-bold" : "text-muted-foreground"
                                                    )}>
                                                        {meta?.lastMessage ? meta.lastMessage.text : 'No messages yet'}
                                                    </p>
                                                    {isUnread && (
                                                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse flex-shrink-0" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="requests" className="h-full m-0">
                        <ScrollArea className="h-full">
                            <div className="p-4 space-y-3">
                                {friendRequests.length === 0 ? (
                                    <div className="text-center py-20 opacity-50">
                                        <Clock className="h-10 w-10 mx-auto mb-2" />
                                        <p className="text-xs font-bold uppercase tracking-widest">No Incoming Requests</p>
                                    </div>
                                ) : friendRequests.map(req => (
                                    <div key={req.id} className="p-4 rounded-2xl bg-muted/30 border space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10"><AvatarImage src={req.sender.photoURL}/><AvatarFallback>U</AvatarFallback></Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate">{req.sender.displayName}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-black">Incoming Protocol</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => declineFriendRequest(req)}>
                                                <X className="h-4 w-4 mr-2"/> Decline
                                            </Button>
                                            <Button size="sm" className="bg-primary hover:bg-primary/90" onClick={() => acceptFriendRequest(req)}>
                                                <Check className="h-4 w-4 mr-2"/> Accept
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </div>
            </Tabs>
        </Card>
    );
}
