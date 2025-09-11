
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Crown, X, UserPlus, UserCheck, Clock, Mail } from 'lucide-react';
import { useFriends } from '@/hooks/use-friends';
import { useUser as useClerkUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import type { User as UserType } from '@/hooks/use-admin';

interface UserProfileCardProps {
    user: UserType;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function UserProfileCard({ user, isOpen, onOpenChange }: UserProfileCardProps) {
    const { user: currentUser } = useClerkUser();
    const { 
        friends, 
        sentRequests, 
        friendRequests, 
        sendFriendRequest, 
        acceptFriendRequest, 
        rejectFriendRequest, 
        removeFriend,
        cancelFriendRequest 
    } = useFriends();

    const isFriend = friends.some(f => f.uid === user.uid);
    const hasSentRequest = sentRequests.some(r => r.uid === user.uid);
    const hasReceivedRequest = friendRequests.some(r => r.uid === user.uid);
    const isCurrentUser = currentUser?.id === user.uid;

    const renderActionButtons = () => {
        if (isCurrentUser) return null;

        if (isFriend) {
            return <Button variant="destructive" onClick={() => removeFriend(user.uid)}><X className="mr-2 h-4 w-4"/>Remove Friend</Button>;
        }
        if (hasSentRequest) {
            return <Button variant="secondary" onClick={() => cancelFriendRequest(user.uid)}><Clock className="mr-2 h-4 w-4"/>Request Sent</Button>;
        }
        if (hasReceivedRequest) {
            return (
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => rejectFriendRequest(user.uid)}>Decline</Button>
                    <Button onClick={() => acceptFriendRequest(user.uid)}><UserCheck className="mr-2 h-4 w-4"/>Accept</Button>
                </div>
            );
        }
        return <Button onClick={() => sendFriendRequest(user.uid)}><UserPlus className="mr-2 h-4 w-4"/>Add Friend</Button>;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader className="items-center text-center">
                    <Avatar className="h-24 w-24 mb-4 border-4 border-primary/20">
                        <AvatarImage src={user.photoURL || `https://picsum.photos/150/150?u=${user.uid}`} alt={user.displayName} />
                        <AvatarFallback>{user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        {user.displayName}
                        {user.isAdmin && <span className="vip-badge"><Crown className="h-3 w-3" /> VIP</span>}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-2">
                     <div className="flex items-center gap-3 text-sm text-muted-foreground p-2 rounded-md">
                        <Mail className="h-4 w-4"/>
                        <span>{user.email}</span>
                     </div>
                     <div className="flex items-center gap-3 text-sm text-muted-foreground p-2 rounded-md">
                        <User className="h-4 w-4"/>
                        <span>{isFriend ? 'Friend' : 'Not a friend'}</span>
                     </div>
                </div>

                <DialogFooter className="mt-4">
                    {renderActionButtons()}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
