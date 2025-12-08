
'use client';

import { useMemo } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Clock, ListChecks, Medal } from 'lucide-react';
import { Group } from '@/hooks/use-groups';
import { Table, TableBody, TableCell, TableHeader, TableHead, TableRow } from '../ui/table';

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
    
    const leaderboardData = useMemo(() => {
        if (!group.memberDetails) return [];
        
        return group.memberDetails
            .map(member => {
                const studyScore = (member.totalStudyTime || 0) + ((member.dailyTasksCompleted || 0) * 600); // 1 task = 10 mins study
                return {
                    ...member,
                    studyScore,
                };
            })
            .sort((a, b) => b.studyScore - a.studyScore);

    }, [group.memberDetails]);

    return (
        <Card className="h-full flex flex-col border-0 rounded-none">
            <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="text-amber-500" />
                    Group Leaderboard
                </CardTitle>
                <CardDescription>Based on total study time and tasks completed.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">Rank</TableHead>
                            <TableHead>Member</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leaderboardData.map((member, index) => (
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
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3"/>{formatTime(member.totalStudyTime || 0)}</span>
                                                <span className="flex items-center gap-1"><ListChecks className="h-3 w-3"/>{member.dailyTasksCompleted || 0}</span>
                                                <span className="flex items-center gap-1"><Medal className="h-3 w-3"/>{member.credits || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-bold font-mono text-primary">{Math.round(member.studyScore / 60)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
