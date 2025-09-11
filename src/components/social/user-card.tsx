
'use client';

import { useState } from 'react';
import { User } from '@/hooks/use-admin';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useUnreadMessages } from '@/hooks/use-unread';
import { UserProfileCard } from './user-profile-card';
import { useFriends } from '@/hooks/use-friends';

interface UserCardProps {
    user: User;
    onSelectChat?: (user: User) => void;
    isSelected?: boolean;
}

export function UserCard({ 
    user,
    onSelectChat, 
    isSelected 
}: UserCardProps) {
    const isVip = user.isAdmin;
    const { hasUnreadFrom } = useUnreadMessages();
    const { friends } = useFriends();
    const hasUnread = hasUnreadFrom(user.uid);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    
    const isFriend = friends.some(f => f.uid === user.uid);

    const handleCardClick = (e: React.MouseEvent) => {
        // Prevent chat selection when clicking on the avatar
        if ((e.target as HTMLElement).closest('.avatar-trigger')) {
            return;
        }
        // Only select chat if they are a friend
        if (onSelectChat && isFriend) {
            onSelectChat(user);
        } else if (!isFriend) {
             // If not a friend, open profile instead
             setIsProfileOpen(true);
        }
    }

    return (
        <>
            <div
                className={cn(
                    "w-full h-auto justify-start p-2 relative flex items-center gap-3 rounded-lg transition-colors",
                    isFriend ? "cursor-pointer" : "cursor-default",
                    isSelected ? "bg-primary/10 text-primary" : (isFriend ? "hover:bg-muted" : "")
                )}
                onClick={handleCardClick}
            >
                <div className="avatar-trigger cursor-pointer" onClick={() => setIsProfileOpen(true)}>
                    <Avatar className="h-10 w-10 border-2 border-muted flex-shrink-0">
                        <AvatarImage src={user.photoURL || `https://picsum.photos/150/150?u=${user.uid}`} alt={user.displayName} />
                        <AvatarFallback>{user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </div>
                <div className="truncate flex-1">
                    <h3 className="font-semibold text-sm flex items-center gap-2 truncate">
                        <span className="truncate">{user.displayName}</span>
                        {isVip && (
                            <span className="vip-badge flex-shrink-0">
                                <Crown className="h-3 w-3" /> VIP
                            </span>
                        )}
                    </h3>
                </div>
                {hasUnread && <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-destructive" />}
            </div>

            <UserProfileCard
                user={user}
                isOpen={isProfileOpen}
                onOpenChange={setIsProfileOpen}
            />
        </>
    )
}
