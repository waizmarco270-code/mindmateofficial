
'use client';

import { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFriends } from '@/hooks/use-friends';
import { useGroups } from '@/hooks/use-groups.tsx';
import { Checkbox } from '../ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Loader2, PlusCircle, ImagePlus, Edit, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';
import { groupBanners } from '@/lib/group-assets';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useUsers } from '@/hooks/use-admin';

interface CreateGroupModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

const CLAN_CREATION_COST = 200;

export function CreateGroupModal({ isOpen, onOpenChange }: CreateGroupModalProps) {
    const { user } = useUser();
    const { currentUserData } = useUsers();
    const { friends, loading: friendsLoading } = useFriends();
    const { createGroup } = useGroups();
    const { toast } = useToast();

    const [groupName, setGroupName] = useState('');
    const [groupMotto, setGroupMotto] = useState('');
    const [groupLogo, setGroupLogo] = useState<string | null>(null);
    const [selectedBanner, setSelectedBanner] = useState(groupBanners[0].id);
    const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    
    const logoInputRef = useRef<HTMLInputElement>(null);

    const hasEnoughCredits = (currentUserData?.credits ?? 0) >= CLAN_CREATION_COST;

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 1024 * 512) { // 512KB limit
            toast({ variant: 'destructive', title: "Image too large", description: "Please select an image smaller than 512KB." });
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setGroupLogo(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };


    const handleFriendSelect = (friendId: string) => {
        setSelectedFriendIds(prev =>
            prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
        );
    };

    const resetForm = useCallback(() => {
        setGroupName('');
        setGroupMotto('');
        setGroupLogo(null);
        setSelectedBanner(groupBanners[0].id);
        setSelectedFriendIds([]);
    }, []);

    const handleCreateGroup = useCallback(async () => {
        if (!user) return;
        if (!groupName.trim()) {
            toast({ variant: 'destructive', title: "Clan name is required." });
            return;
        }
        if (!hasEnoughCredits) {
            toast({ variant: 'destructive', title: "Insufficient Credits", description: `You need ${CLAN_CREATION_COST} credits to create a clan.` });
            return;
        }

        setIsCreating(true);
        try {
            await createGroup(groupName, selectedFriendIds, groupMotto, groupLogo, selectedBanner);
            onOpenChange(false);
            resetForm();
        } catch (error) {
            console.error("Error creating group:", error);
        } finally {
            setIsCreating(false);
        }
    }, [user, groupName, groupMotto, groupLogo, selectedBanner, selectedFriendIds, toast, onOpenChange, createGroup, resetForm, hasEnoughCredits]);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { onOpenChange(open); if(!open) resetForm(); }}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Create a New Study Clan</DialogTitle>
                    <DialogDescription>
                        Forge your own legendary clan. Give it a name, a logo, and invite your allies.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-24 w-24 border-4 border-muted">
                                {groupLogo ? (
                                    <AvatarImage src={groupLogo} alt="Group logo preview" />
                                ) : (
                                     <AvatarFallback className="bg-muted">
                                        <ImagePlus className="h-10 w-10 text-muted-foreground"/>
                                    </AvatarFallback>
                                )}
                            </Avatar>
                             <input type="file" ref={logoInputRef} onChange={handleLogoSelect} accept="image/*" className="hidden"/>
                             <Button size="icon" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full" onClick={() => logoInputRef.current?.click()}>
                                <Edit className="h-4 w-4"/>
                             </Button>
                        </div>
                        <div className="space-y-2 flex-1">
                            <Label htmlFor="group-name">Clan Name</Label>
                            <Input id="group-name" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g., The Brainiacs" />
                            <Label htmlFor="group-motto">Clan Motto</Label>
                            <Input id="group-motto" value={groupMotto} onChange={e => setGroupMotto(e.target.value)} placeholder="e.g., Victory loves preparation." />
                        </div>
                    </div>

                     <div className="space-y-2">
                        <Label>Clan Banner</Label>
                         <div className="grid grid-cols-4 gap-2">
                            {groupBanners.map(banner => (
                                <button key={banner.id} onClick={() => setSelectedBanner(banner.id)} className={cn("h-16 rounded-lg border-2 transition-all", selectedBanner === banner.id ? 'border-primary ring-2 ring-primary/50' : 'border-transparent hover:border-primary/50')}>
                                    <div className={cn("w-full h-full rounded-md", banner.class)}></div>
                                </button>
                            ))}
                        </div>
                    </div>


                    <div className="space-y-2">
                        <Label>Invite Friends ({selectedFriendIds.length} selected)</Label>
                        <ScrollArea className="h-48 rounded-md border p-4">
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
                    
                    <div className="flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                        <p className="text-xs font-semibold">
                            Clan creation costs {CLAN_CREATION_COST} credits. Your balance: {currentUserData?.credits ?? 0}
                        </p>
                    </div>

                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleCreateGroup} disabled={isCreating || !groupName.trim() || !hasEnoughCredits}>
                        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Create Clan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
