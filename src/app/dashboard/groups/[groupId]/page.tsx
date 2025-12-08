
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Users } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { GroupChat } from '@/components/groups/group-chat';
import { GroupLeaderboard } from '@/components/groups/group-leaderboard';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Group, GroupMember } from '@/context/groups-context';
import { useUsers, User } from '@/hooks/use-admin';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';

export default function GroupDetailPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.groupId as string;
    const { users, loading: usersLoading } = useUsers();
    const isMobile = useIsMobile();

    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [leaderboardVisible, setLeaderboardVisible] = useState(!isMobile);


    useEffect(() => {
        if (!groupId) return;
        
        setLoading(true);
        const groupDocRef = doc(db, 'groups', groupId);
        const unsubscribe = onSnapshot(groupDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const memberUids = data.members.map((m: GroupMember) => m.uid);
                const memberDetails = memberUids.map((uid: string) => users.find(u => u.uid === uid)).filter(Boolean) as User[];
                setGroup({ id: docSnap.id, ...data, memberDetails } as Group);
            } else {
                setGroup(null);
                router.push('/dashboard/groups');
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching group:", error);
            setLoading(false);
            router.push('/dashboard/groups');
        });

        return () => unsubscribe();
    }, [groupId, users, router]);

    if (loading || usersLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-10 w-10 animate-spin"/></div>
    }

    if (!group) {
        return (
            <div className="text-center p-8">
                 <h2 className="text-xl font-bold">Group not found</h2>
                <p className="text-muted-foreground">The group may have been deleted or you might not be a member.</p>
                <Button onClick={() => router.push('/dashboard/groups')} className="mt-4">
                    <ArrowLeft className="mr-2"/> Back to My Clans
                </Button>
            </div>
        )
    }
    
    if(isMobile) {
        return (
            <div className="h-full">
                <GroupChat group={group} onToggleLeaderboard={() => setLeaderboardVisible(!leaderboardVisible)} />
            </div>
        )
    }

    return (
       <ResizablePanelGroup direction="horizontal" className="h-full max-h-[calc(100vh-8rem)] w-full rounded-lg border">
          <ResizablePanel defaultSize={65} minSize={40}>
            <GroupChat group={group} onToggleLeaderboard={() => setLeaderboardVisible(!leaderboardVisible)} />
          </ResizablePanel>
           {leaderboardVisible && (
               <>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={35} minSize={30} maxSize={50}>
                     <GroupLeaderboard group={group} />
                  </ResizablePanel>
               </>
           )}
       </ResizablePanelGroup>
    );
}
