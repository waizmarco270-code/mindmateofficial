
'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Clock, ListChecks, Medal } from 'lucide-react';
import type { Group } from '@/context/groups-context';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTimeTracker } from '@/hooks/use-time-tracker';
import { useUser } from '@clerk/nextjs';
import { format, isToday, isThisWeek, startOfWeek } from 'date-fns';

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
        if (!group.memberDetails) return { daily: [], weekly: [], allTime: [] };
        
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
            allTime: group.memberDetails
                .map(member => {
                    const studyScore = (member.totalStudyTime || 0) + ((member.dailyTasksCompleted || 0) * 600);
                    return { ...member, score: studyScore };
                })
                .sort((a, b) => b.score - a.score),
        };
    }, [group.memberDetails, sessions]);
    
    const LeaderboardTable = ({ data, timeBased = false }: { data: (typeof leaderboardData.allTime), timeBased?: boolean }) => (
         <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((member, index) => (
                     <TableRow key={member.uid}>
                        <TableCell className="font-bold text-lg text-center">{index + 1}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={member.photoURL} />
                                    <AvatarFallback>{member.displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{member.displayName}</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell className="text-right font-bold font-mono text-primary">
                            {timeBased ? formatTime(member.score) : Math.round(member.score / 60)}
                        </TableCell>
                    </TableRow>
                ))}
                {data.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground h-24">No activity yet.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="text-amber-500" />
                    Group Leaderboard
                </CardTitle>
            </CardHeader>
            <Tabs defaultValue="all-time" className="flex-1 flex flex-col">
                <div className="p-2">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="daily">Daily</TabsTrigger>
                        <TabsTrigger value="weekly">Weekly</TabsTrigger>
                        <TabsTrigger value="all-time">All-Time</TabsTrigger>
                    </TabsList>
                </div>
                 <CardContent className="flex-1 p-0 overflow-y-auto">
                    <TabsContent value="daily" className="m-0">
                        <LeaderboardTable data={leaderboardData.daily} timeBased />
                    </TabsContent>
                    <TabsContent value="weekly" className="m-0">
                         <LeaderboardTable data={leaderboardData.weekly} timeBased />
                    </TabsContent>
                     <TabsContent value="all-time" className="m-0">
                         <LeaderboardTable data={leaderboardData.allTime} />
                    </TabsContent>
                 </CardContent>
            </Tabs>
        </Card>
    );
}
