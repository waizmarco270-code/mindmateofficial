
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Users } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { GroupChat } from '@/components/groups/group-chat';
import { GroupLeaderboard } from '@/components/groups/group-leaderboard';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Group } from '@/context/groups-context';
import { useUsers, User } from '@/hooks/use-admin';
import { Button } from '@/components/ui/button';

export default function GroupDetailPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.groupId as string;
    const { users, loading: usersLoading } = useUsers();

    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!groupId) return;
        
        setLoading(true);
        const groupDocRef = doc(db, 'groups', groupId);
        const unsubscribe = onSnapshot(groupDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                // Member details are now added inside the useGroups hook, 
                // but we can re-map here to ensure freshness if needed.
                const memberDetails = (data.members as string[]).map(uid => users.find(u => u.uid === uid)).filter(Boolean) as User[];
                setGroup({ id: docSnap.id, ...data, memberDetails } as Group);
            } else {
                setGroup(null);
                 // Group doesn't exist, maybe redirect
                router.push('/dashboard/groups');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [groupId, users, router]);

    if (loading) {
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

    return (
       <div className="h-full max-h-[calc(100vh-8rem)] w-full">
         <GroupChat group={group} />
       </div>
    );
}


    