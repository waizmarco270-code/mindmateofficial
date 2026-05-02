
'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Clock, Target, Medal, Star } from 'lucide-react';
import type { Group, GroupMember, GroupRole } from '@/context/groups-context';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTimeTracker } from '@/hooks/use-time-tracker';
import { useUser } from '@clerk/nextjs';
import { format, isToday, isThisWeek } from 'date-fns';
import { cn } from '@/lib/utils';

interface GroupLeaderboardProps {
    group: Group;
}

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

export function GroupLeaderboard({ group }: GroupLeaderboardProps) {
    const { sessions } = useTimeTracker();
    const { user: currentUser } = useUser();

    const leaderboardData = useMemo(() => {
        if (!group.memberDetails) return { daily: [], weekly: [], contribution: [] };
        
        const now = new Date();

        return {
            daily: group.memberDetails
                .map(member => {
                    const todayStudyTime = sessions
                        .filter(s => s.userId === member.uid && isToday(new Date(s.startTime)))
                        .reduce((acc, s) => acc + ((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 1000), 0);
                    return { ...member, score: todayStudyTime };
                })
                .sort((a, b) => b.score - a.score),
            weekly: group.memberDetails
                .map(member => {
                    const weeklyStudyTime = sessions
                        .filter(s => s.userId === member.uid && isThisWeek(new Date(s.startTime), { weekStartsOn: 1 }))
                        .reduce((acc, s) => acc + ((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 1000), 0);
                    return { ...member, score: weeklyStudyTime };
                })
                .sort((a, b) => b.score - a.score),
            contribution: group.memberDetails
                .map(member => {
                    return { ...member, score: member.studyContribution || 0 };
                })
                .sort((a, b) => b.score - a.score),
        };
    }, [group.memberDetails, sessions]);
    
    const LeaderboardTable = ({ data, timeBased = true }: { data: any[], timeBased?: boolean }) => (
         <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead className="text-right">Effort</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((member, index) => (
                     <TableRow key={member.uid} className={cn(member.uid === currentUser?.id && "bg-primary/5")}>
                        <TableCell className="font-black italic text-lg text-center text-muted-foreground/40">
                            {index === 0 ? <Trophy className="h-5 w-5 text-yellow-500 mx-auto"/> : index + 1}
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border">
                                    <AvatarImage src={member.photoURL} />
                                    <AvatarFallback>{member.displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="font-bold text-sm truncate">{member.displayName}</p>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{member.role}</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="text-right font-black italic text-primary">
                            {formatTime(member.score)}
                        </TableCell>
                    </TableRow>
                ))}
                {data.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground h-24 italic">No activity registry found.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );

    return (
        <Card className="h-full flex flex-col border-primary/20 overflow-hidden shadow-2xl">
            <CardHeader className="bg-primary/5 border-b">
                <CardTitle className="flex items-center gap-2 uppercase italic text-xl">
                    <Trophy className="text-amber-500" />
                    Clan Registry
                </CardTitle>
                <CardDescription className="text-xs font-black uppercase tracking-widest opacity-60">Verified Study Contributions</CardDescription>
            </CardHeader>
            <Tabs defaultValue="contribution" className="flex-1 flex flex-col">
                <div className="p-2 bg-muted/20 border-b">
                    <TabsList className="grid w-full grid-cols-3 h-10 bg-black/5 dark:bg-white/5 rounded-xl">
                        <TabsTrigger value="daily" className="rounded-lg text-[10px] font-black uppercase">Today</TabsTrigger>
                        <TabsTrigger value="weekly" className="rounded-lg text-[10px] font-black uppercase">Weekly</TabsTrigger>
                        <TabsTrigger value="contribution" className="rounded-lg text-[10px] font-black uppercase">Lifetime</TabsTrigger>
                    </TabsList>
                </div>
                 <CardContent className="flex-1 p-0 overflow-y-auto">
                    <TabsContent value="daily" className="m-0">
                        <LeaderboardTable data={leaderboardData.daily} />
                    </TabsContent>
                    <TabsContent value="weekly" className="m-0">
                         <LeaderboardTable data={leaderboardData.weekly} />
                    </TabsContent>
                     <TabsContent value="contribution" className="m-0">
                         <LeaderboardTable data={leaderboardData.contribution} />
                    </TabsContent>
                 </CardContent>
            </Tabs>
        </Card>
    );
}
