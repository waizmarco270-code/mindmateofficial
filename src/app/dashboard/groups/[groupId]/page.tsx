
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { GroupChat } from '@/components/groups/group-chat';
import { GroupLeaderboard } from '@/components/groups/group-leaderboard';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Group } from '@/hooks/use-groups';
import { useUsers } from '@/hooks/use-admin';

export default function GroupDetailPage() {
    const params = useParams();
    const groupId = params.groupId as string;
    const { users, loading: usersLoading } = useUsers();

    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!groupId || usersLoading) return;
        setLoading(true);
        const groupDocRef = doc(db, 'groups', groupId);
        const unsubscribe = onSnapshot(groupDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const memberDetails = (data.members as string[]).map(uid => users.find(u => u.uid === uid)).filter(Boolean) as User[];
                setGroup({ id: docSnap.id, ...data, memberDetails } as Group);
            } else {
                setGroup(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [groupId, users, usersLoading]);

    if (loading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-10 w-10 animate-spin"/></div>
    }

    if (!group) {
        return <div className="text-center text-muted-foreground">Group not found or you are not a member.</div>
    }

    return (
       <ResizablePanelGroup direction="horizontal" className="h-full max-h-[calc(100vh-8rem)] w-full rounded-lg border">
            <ResizablePanel defaultSize={65} minSize={30}>
                <GroupChat group={group} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={35} minSize={25}>
                <GroupLeaderboard group={group} />
            </ResizablePanel>
       </ResizablePanelGroup>
    );
}
