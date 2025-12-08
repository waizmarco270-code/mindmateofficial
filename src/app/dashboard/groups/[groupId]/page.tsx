
'use client';

import { useParams } from 'next/navigation';
import { GroupsProvider, useGroups } from '@/hooks/use-groups';
import { Loader2 } from 'lucide-react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { GroupChat } from '@/components/groups/group-chat';
import { GroupLeaderboard } from '@/components/groups/group-leaderboard';


function GroupDetailPageContent() {
    const params = useParams();
    const groupId = params.groupId as string;
    const { groups, loading } = useGroups();
    
    const group = groups.find(g => g.id === groupId);

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

export default function GroupDetailPage() {
    return (
        <GroupsProvider>
            <GroupDetailPageContent />
        </GroupsProvider>
    );
}

