
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Users, MessageSquare, Menu } from 'lucide-react';
import { GroupChat } from '@/components/groups/group-chat';
import { GroupLeaderboard } from '@/components/groups/group-leaderboard';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Group, GroupMember } from '@/context/groups-context';
import { useUsers, User } from '@/hooks/use-admin';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function GroupDetailPage() {
    const params = useParams();
    const router = useRouter();
    const groupId = params.groupId as string;
    const { users, loading: usersLoading } = useUsers();

    const [group, setGroup] = useState<Group | null>(null);
    const [loading, setLoading] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);


    useEffect(() => {
        if (!groupId) return;
        
        setLoading(true);
        const groupDocRef = doc(db, 'groups', groupId);
        const unsubscribe = onSnapshot(groupDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const memberDetails = (data.members as GroupMember[]).map((m: GroupMember) => {
                    const userDetail = users.find(u => u.uid === m.uid);
                    return userDetail ? { ...userDetail, role: m.role } : null;
                }).filter(Boolean) as (User & { role: GroupMember['role'] })[];
                
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

    return (
       <div className="h-full relative">
            <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
                <SheetTrigger asChild>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
                        className="fixed bottom-24 left-4 z-40"
                    >
                        <Button className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-purple-600 shadow-2xl shadow-primary/30 flex flex-col gap-1">
                            <MessageSquare className="h-8 w-8"/>
                            <span className="text-xs font-bold">CHAT</span>
                        </Button>
                    </motion.div>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-full sm:max-w-md border-0">
                    <GroupChat group={group} />
                </SheetContent>
            </Sheet>

            <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/groups')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Avatar className="h-16 w-16 border-2 border-primary">
                        <AvatarImage src={group.logoUrl || undefined} />
                        <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
                        <p className="text-muted-foreground italic">"{group.motto || 'No motto set.'}"</p>
                    </div>
                </div>

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
                                        <Badge className="ml-auto capitalize" variant={member.role === 'leader' ? 'default' : 'secondary'}>
                                            {member.role}
                                        </Badge>
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
       </div>
    );
}
