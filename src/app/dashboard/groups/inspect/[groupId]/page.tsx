
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GroupLeaderboard } from '@/components/groups/group-leaderboard';
import { useGroups } from '@/hooks/use-groups.tsx';
import type { Group } from '@/context/groups-context';
import { Loader2, ArrowLeft, Users, Shield, Crown } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export default function InspectClanPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const groupId = params.groupId as string;
    const { allPublicGroups, loading, sendJoinRequest, addMemberToAutoJoinClan, sentJoinRequests } = useGroups();
    
    const [group, setGroup] = useState<Group | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!loading) {
            const foundGroup = allPublicGroups.find(g => g.id === groupId);
            if (foundGroup) {
                setGroup(foundGroup);
            } else {
                // If group not found or not public, redirect
                router.replace('/dashboard/groups');
            }
        }
    }, [allPublicGroups, loading, groupId, router]);

    const handleJoin = async () => {
        if (!group) return;
        setIsSubmitting(true);
        try {
            if (group.joinMode === 'auto') {
                await addMemberToAutoJoinClan(group);
                 router.push(`/dashboard/groups/${group.id}`); // Redirect to chat after auto-joining
            } else {
                await sendJoinRequest(group);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || !group) {
        return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin"/></div>
    }

    const isMember = group.members.includes(user?.id || '');
    const hasRequested = sentJoinRequests.some(r => r.groupId === group.id);
    const clanAdmin = group.memberDetails?.find(m => m.uid === group.createdBy);

    return (
        <div className="space-y-6">
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4"/> Back
            </Button>
            
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start gap-4">
                    <Avatar className="h-24 w-24 border-4 border-primary">
                        <AvatarImage src={group.logoUrl || undefined} />
                        <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle className="text-3xl">{group.name}</CardTitle>
                        <CardDescription className="italic text-base">"{group.motto || 'No motto set.'}"</CardDescription>
                         {!isMember && (
                            <div className="mt-4">
                                <Button onClick={handleJoin} disabled={isSubmitting || hasRequested}>
                                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin"/> :
                                     hasRequested ? "Request Sent" :
                                     group.joinMode === 'auto' ? "Join Now" : "Send Join Request"}
                                </Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
            </Card>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users /> Members ({group.members.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-96 overflow-y-auto">
                        <div className="space-y-2">
                             {group.memberDetails?.map(member => (
                                <div key={member.uid} className="flex items-center gap-3 p-2 rounded-lg bg-muted">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={member.photoURL} />
                                        <AvatarFallback>{member.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{member.displayName}</span>
                                    {member.uid === group.createdBy && (
                                         <div className="ml-auto flex items-center gap-1.5 text-xs font-bold text-yellow-500 rounded-full bg-yellow-500/10 px-2 py-1">
                                            <Crown className="h-3 w-3"/> Admin
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                 <div className="h-full">
                    <GroupLeaderboard group={group} />
                </div>
            </div>
        </div>
    );
}
