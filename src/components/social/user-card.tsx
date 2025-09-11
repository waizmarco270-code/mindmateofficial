
'use client';

import { User, SUPER_ADMIN_UID } from '@/hooks/use-admin';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUnreadMessages } from '@/hooks/use-unread';

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
    const isSuperAdmin = user.uid === SUPER_ADMIN_UID;
    const { hasUnreadFrom } = useUnreadMessages();
    const hasUnread = hasUnreadFrom(user.uid);

    const handleCardClick = (e: React.MouseEvent) => {
        if (onSelectChat) {
            onSelectChat(user);
        }
    }

    return (
        <div
            className={cn(
                "w-full h-auto justify-start p-2 relative flex items-center gap-3 rounded-lg transition-colors cursor-pointer",
                isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted"
            )}
            onClick={handleCardClick}
        >
            <Avatar className="h-10 w-10 border-2 border-muted flex-shrink-0">
                <AvatarImage src={user.photoURL || `https://picsum.photos/150/150?u=${user.uid}`} alt={user.displayName} />
                <AvatarFallback>{user.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="truncate flex-1">
                <h3 className="font-semibold text-sm flex items-center gap-2 truncate">
                    <span className="truncate">{user.displayName}</span>
                    {isSuperAdmin ? (
                        <span className="dev-badge flex-shrink-0">
                            <Code className="h-3 w-3" /> DEV
                        </span>
                    ) : isVip && (
                        <span className="vip-badge flex-shrink-0">
                            <Crown className="h-3 w-3" /> VIP
                        </span>
                    )}
                </h3>
            </div>
            {hasUnread && <div className="absolute right-3 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-destructive" />}
        </div>
    )
}
