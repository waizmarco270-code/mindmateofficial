
'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGroups } from '@/hooks/use-groups.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Loader2, Edit, AlertTriangle, Trash2, LogOut, DollarSign, Users, CheckCircle, Shield, Globe, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { groupBanners } from '@/lib/group-assets';
import { Group, GroupJoinRequest } from '@/context/groups-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { useUsers, User } from '@/hooks/use-admin';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import { Switch } from '../ui/switch';


interface ClanSettingsDialogProps {
    group: Group;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

const RENAME_COST = 500;

function MemberManagement({ group, onRemoveMember }: { group: Group, onRemoveMember: (memberId: string) => void }) {
    return (
        <ScrollArea className="max-h-80">
            <div className="space-y-2">
                {group.memberDetails?.map(member => (
                    <div key={member.uid} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={member.photoURL}/>
                                <AvatarFallback>{member.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{member.displayName}</span>
                        </div>
                        {member.uid !== group.createdBy && (
                            <Button size="sm" variant="destructive" onClick={() => onRemoveMember(member.uid)}>Kick</Button>
                        )}
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}

function RequestManagement({ requests, onApprove, onDecline }: { requests: GroupJoinRequest[], onApprove: (req: GroupJoinRequest) => void, onDecline: (reqId: string) => void }) {
    if (requests.length === 0) {
        return <p className="text-center text-muted-foreground py-10">No pending join requests.</p>
    }
    return (
         <ScrollArea className="max-h-80">
            <div className="space-y-2">
                {requests.map(req => (
                    <div key={req.id} className="flex items-center justify-between p-2 rounded-lg bg-muted">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={req.sender.photoURL}/>
                                <AvatarFallback>{req.sender.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{req.sender.displayName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onApprove(req)}>Approve</Button>
                            <Button size="sm" variant="destructive" onClick={() => onDecline(req.id)}>Decline</Button>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}


export function ClanSettingsDialog({ group, isOpen, onOpenChange }: ClanSettingsDialogProps) {
    const { updateGroup, removeMember, deleteGroup, joinRequests, approveJoinRequest, declineJoinRequest } = useGroups();
    const { currentUserData } = useUsers();
    const { toast } = useToast();
    const router = useRouter();

    const [groupName, setGroupName] = useState(group.name);
    const [groupMotto, setGroupMotto] = useState(group.motto || '');
    const [groupLogo, setGroupLogo] = useState<string | null>(group.logoUrl || null);
    const [selectedBanner, setSelectedBanner] = useState(group.banner || 'default');
    const [isPublic, setIsPublic] = useState(group.isPublic);
    const [joinMode, setJoinMode] = useState<'auto' | 'approval'>(group.joinMode);
    
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        if(isOpen) {
            setGroupName(group.name);
            setGroupMotto(group.motto || '');
            setGroupLogo(group.logoUrl || null);
            setSelectedBanner(group.banner || 'default');
            setIsPublic(group.isPublic);
            setJoinMode(group.joinMode);
        }
    }, [isOpen, group]);


    const logoInputRef = useRef<HTMLInputElement>(null);
    
    const hasEnoughForRename = (currentUserData?.credits ?? 0) >= RENAME_COST;
    const groupJoinRequests = joinRequests.filter(r => r.groupId === group.id);


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

    const handleSaveChanges = async () => {
        if (!groupName.trim()) {
            toast({ variant: 'destructive', title: "Clan name cannot be empty." });
            return;
        }

        const isRenaming = groupName.trim() !== group.name;

        if (isRenaming && !hasEnoughForRename) {
            toast({ variant: 'destructive', title: 'Insufficient Credits', description: `You need ${RENAME_COST} credits to rename your clan.` });
            return;
        }

        setIsSaving(true);
        try {
            await updateGroup(group.id, {
                name: groupName.trim(),
                motto: groupMotto,
                logoUrl: groupLogo,
                banner: selectedBanner,
                isPublic,
                joinMode
            }, isRenaming, RENAME_COST);

            toast({ title: "Clan details updated!" });
            onOpenChange(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleLeaveGroup = async () => {
        try {
            await removeMember(group.id, group.createdBy); // Pass your own ID
            toast({ title: "You have left the clan." });
            onOpenChange(false);
            router.push('/dashboard/groups');
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Could not leave the clan." });
        }
    };
    
     const handleDeleteGroup = async () => {
        try {
            await deleteGroup(group.id);
            toast({ title: "Clan Disbanded", description: `"${group.name}" has been permanently deleted.` });
            onOpenChange(false);
            router.push('/dashboard/groups');
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Could not disband the clan." });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Clan Settings</DialogTitle>
                </DialogHeader>
                 <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="members">Members</TabsTrigger>
                        <TabsTrigger value="requests">
                            Requests {groupJoinRequests.length > 0 && <span className="ml-2 h-2 w-2 rounded-full bg-destructive animate-pulse"/>}
                        </TabsTrigger>
                        <TabsTrigger value="danger">Danger Zone</TabsTrigger>
                    </TabsList>
                    <TabsContent value="general" className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-4">
                         <div className="flex items-center gap-4">
                            <div className="relative">
                                <Avatar className="h-24 w-24 border-4 border-muted">
                                    <AvatarImage src={groupLogo || undefined} alt="Group logo preview" />
                                    <AvatarFallback>{groupName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <input type="file" ref={logoInputRef} onChange={handleLogoSelect} accept="image/*" className="hidden"/>
                                <Button size="icon" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full" onClick={() => logoInputRef.current?.click()}>
                                    <Edit className="h-4 w-4"/>
                                </Button>
                            </div>
                            <div className="space-y-2 flex-1">
                                <Label htmlFor="group-name">Clan Name</Label>
                                <Input id="group-name" value={groupName} onChange={e => setGroupName(e.target.value)} />
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <DollarSign className="h-3 w-3 text-amber-500"/>
                                    Renaming costs {RENAME_COST} credits.
                                </p>
                                <Label htmlFor="group-motto">Clan Motto</Label>
                                <Input id="group-motto" value={groupMotto} onChange={e => setGroupMotto(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Clan Banner</Label>
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                                {groupBanners.map(banner => (
                                    <button key={banner.id} onClick={() => setSelectedBanner(banner.id)} className={cn("h-16 rounded-lg border-2 transition-all", selectedBanner === banner.id ? 'border-primary ring-2 ring-primary/50' : 'border-transparent hover:border-primary/50')}>
                                        <div className={cn("w-full h-full rounded-md", banner.class)}></div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4 pt-4 border-t">
                            <h4 className="font-semibold">Privacy Settings</h4>
                             <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <Label htmlFor="public-switch" className="flex items-center gap-3"><Globe className="h-5 w-5"/> Publicly Discoverable</Label>
                                    <p className="text-xs text-muted-foreground mt-1">Allow other users to find and request to join your clan.</p>
                                </div>
                                <Switch id="public-switch" checked={isPublic} onCheckedChange={setIsPublic} />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <Label htmlFor="join-mode" className="flex items-center gap-3"><Lock className="h-5 w-5"/> Approval Required to Join</Label>
                                    <p className="text-xs text-muted-foreground mt-1">If on, you must approve new members. If off, anyone can join freely.</p>
                                </div>
                                <Switch id="join-mode" checked={joinMode === 'approval'} onCheckedChange={(checked) => setJoinMode(checked ? 'approval' : 'auto')} />
                            </div>
                        </div>
                         <Button onClick={handleSaveChanges} disabled={isSaving} className="w-full">
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>} Save General Settings
                        </Button>
                    </TabsContent>
                     <TabsContent value="members" className="py-4">
                        <MemberManagement group={group} onRemoveMember={removeMember}/>
                     </TabsContent>
                     <TabsContent value="requests" className="py-4">
                        <RequestManagement requests={groupJoinRequests} onApprove={approveJoinRequest} onDecline={declineJoinRequest}/>
                     </TabsContent>
                     <TabsContent value="danger" className="py-4">
                        <div className="p-4 border border-destructive/50 rounded-lg space-y-4">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="w-full justify-between">
                                        <span>Disband Clan</span>
                                        <Trash2/>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the clan and all its data for everyone. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteGroup}>Yes, Disband Clan</AlertDialogAction></AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                     </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
