
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFriends, FriendsProvider } from '@/hooks/use-friends';
import { useGroups } from '@/hooks/use-groups';
import { Checkbox } from '../ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CreateGroupModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

function CreateGroupContent({ isOpen, onOpenChange }: CreateGroupModalProps) {
    const { friends, loading: friendsLoading } = useFriends();
    const { createGroup, loading: groupsLoading } = useGroups();
    const { toast } = useToast();

    const [groupName, setGroupName] = useState('');
    const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
    
    const handleFriendSelect = (friendId: string) => {
        setSelectedFriendIds(prev =>
            prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
        );
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            toast({ variant: 'destructive', title: "Group name is required." });
            return;
        }
        await createGroup(groupName, selectedFriendIds);
        onOpenChange(false);
        setGroupName('');
        setSelectedFriendIds([]);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create a New Study Group</DialogTitle>
                    <DialogDescription>
                        Name your group and invite friends to join.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="group-name">Group Name</Label>
                        <Input
                            id="group-name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="e.g., The Brainiacs"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Invite Friends ({selectedFriendIds.length} selected)</Label>
                        <ScrollArea className="h-64 rounded-md border p-4">
                            {friendsLoading ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="animate-spin" />
                                </div>
                            ) : friends.length > 0 ? (
                                <div className="space-y-3">
                                    {friends.map(friend => (
                                        <div key={friend.uid} className="flex items-center gap-3">
                                            <Checkbox
                                                id={`friend-${friend.uid}`}
                                                checked={selectedFriendIds.includes(friend.uid)}
                                                onCheckedChange={() => handleFriendSelect(friend.uid)}
                                            />
                                            <Label htmlFor={`friend-${friend.uid}`} className="flex items-center gap-3 cursor-pointer">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={friend.photoURL} />
                                                    <AvatarFallback>{friend.displayName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span>{friend.displayName}</span>
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center">You have no friends to invite yet. Add some from the Social Hub!</p>
                            )}
                        </ScrollArea>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleCreateGroup} disabled={groupsLoading || !groupName.trim()}>
                        {groupsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Create Group
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function CreateGroupModal(props: CreateGroupModalProps) {
    return (
        <FriendsProvider>
            <CreateGroupContent {...props} />
        </FriendsProvider>
    )
}
