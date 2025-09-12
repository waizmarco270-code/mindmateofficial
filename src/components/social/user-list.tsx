
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFriends, FriendRequest } from '@/hooks/use-friends';
import { useUsers, User } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { UserPlus, UserCheck, UserX, Check, X, Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { usePresence } from '@/hooks/use-presence';

interface UserListProps {
    onSelectFriend: (friend: User) => void;
    selectedFriendId?: string | null;
}

export function UserList({ onSelectFriend, selectedFriendId }: UserListProps) {
    const { user: currentUser } = useUser();
    const { users: allUsers } = useUsers();
    const { friends, friendRequests, sentRequests, sendFriendRequest, acceptFriendRequest, declineFriendRequest, removeFriend, loading } = useFriends();
    const { onlineUsers, loading: presenceLoading } = usePresence();

    const [searchTerm, setSearchTerm] = useState('');

    const getOnlineStatus = (uid: string) => onlineUsers.some(u => u.uid === uid);

    const filteredUsers = allUsers.filter(u =>
        u.uid !== currentUser?.id && u.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const finalLoading = loading || presenceLoading;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Social Hub</CardTitle>
                <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </CardHeader>
            <Tabs defaultValue="all" className="flex-1 flex flex-col min-h-0">
                <div className="px-6">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="all">All Users</TabsTrigger>
                        <TabsTrigger value="friends">Friends</TabsTrigger>
                        <TabsTrigger value="requests">
                            Requests
                            {friendRequests.length > 0 && <span className="ml-2 h-2 w-2 rounded-full bg-destructive animate-pulse" />}
                        </TabsTrigger>
                    </TabsList>
                </div>
                <div className="flex-1 min-h-0">
                    <TabsContent value="all" className="h-full">
                        <UserListView
                            users={filteredUsers}
                            friends={friends}
                            sentRequests={sentRequests}
                            onAddFriend={sendFriendRequest}
                            onSelectFriend={onSelectFriend}
                            isOnline={getOnlineStatus}
                            loading={finalLoading}
                        />
                    </TabsContent>
                    <TabsContent value="friends" className="h-full">
                         <UserListView
                            users={friends}
                            friends={friends}
                            onSelectFriend={onSelectFriend}
                            isOnline={getOnlineStatus}
                            loading={finalLoading}
                            selectedFriendId={selectedFriendId}
                        />
                    </TabsContent>
                    <TabsContent value="requests" className="h-full">
                        <FriendRequestList
                            requests={friendRequests}
                            onAccept={acceptFriendRequest}
                            onDecline={declineFriendRequest}
                            isOnline={getOnlineStatus}
                            loading={finalLoading}
                        />
                    </TabsContent>
                </div>
            </Tabs>
        </Card>
    );
}

function UserListView({ users, friends, sentRequests, onAddFriend, onSelectFriend, isOnline, loading, selectedFriendId }: { users: User[], friends?: User[], sentRequests?: FriendRequest[], onAddFriend?: (uid: string) => void, onSelectFriend: (user: User) => void, isOnline: (uid: string) => boolean, loading: boolean, selectedFriendId?: string | null }) {
    const { user: currentUser } = useUser();
    if (loading) return <div className="p-4 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin"/></div>;
    if (users.length === 0) return <div className="p-4 text-center text-muted-foreground">No users found.</div>;

    const isFriend = (uid: string) => friends?.some(f => f.uid === uid);
    const requestSent = (uid: string) => sentRequests?.some(r => r.receiverId === uid);

    return (
        <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
                {users.map(user => (
                    <div
                        key={user.uid}
                        className={cn(
                            "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                             selectedFriendId === user.uid ? "bg-primary/10" : "hover:bg-muted"
                        )}
                        onClick={() => onSelectFriend(user)}
                    >
                        <div className="relative">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={user.photoURL} alt={user.displayName} />
                                <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {isOnline(user.uid) && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />}
                        </div>
                        <p className="flex-1 font-medium truncate">{user.displayName}</p>
                        {onAddFriend && (
                            <>
                                {isFriend(user.uid) ? (
                                    <Button size="icon" variant="ghost" className="text-green-500 cursor-default">
                                        <UserCheck />
                                    </Button>
                                ) : requestSent(user.uid) ? (
                                    <Button size="icon" variant="ghost" className="text-muted-foreground cursor-default">
                                        <UserCheck />
                                    </Button>
                                ) : (
                                    <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onAddFriend(user.uid); }}>
                                        <UserPlus />
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}

function FriendRequestList({ requests, onAccept, onDecline, isOnline, loading }: { requests: FriendRequest[], onAccept: (req: FriendRequest) => void, onDecline: (req: FriendRequest) => void, isOnline: (uid: string) => boolean, loading: boolean }) {
    if (loading) return <div className="p-4 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin"/></div>;
    if (requests.length === 0) return <div className="p-4 text-center text-muted-foreground">No pending friend requests.</div>;

    return (
         <ScrollArea className="h-full">
            <div className="p-4 space-y-2">
                {requests.map(req => (
                    <div key={req.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                         <div className="relative">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={req.sender.photoURL} alt={req.sender.displayName} />
                                <AvatarFallback>{req.sender.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                             {isOnline(req.sender.uid) && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />}
                        </div>
                        <p className="flex-1 font-medium truncate">{req.sender.displayName}</p>
                        <Button size="icon" variant="ghost" className="text-green-500 hover:text-green-600" onClick={() => onAccept(req)}>
                            <Check />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive/80" onClick={() => onDecline(req)}>
                            <X />
                        </Button>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}
