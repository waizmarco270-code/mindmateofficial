
'use client';

import { useUsers, User, SUPER_ADMIN_UID } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Award, Crown, Zap, CheckCircle, Clock, Shield, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

const LEADERBOARD_EXCLUDED_UIDS: string[] = [];

// Weights for calculating the total score
const SCORE_WEIGHTS = {
  credits: 1,
  focusSessionsCompleted: 20, // Each completed focus session is worth 20 points
  dailyTasksCompleted: 10,   // Each day of completed todos is worth 10 points
  totalStudyTime: 0.01,       // Each second of study time is worth 0.01 points
};

export default function LeaderboardPage() {
    const { user: currentUser } = useUser();
    const { users } = useUsers();

    const sortedUsers = useMemo(() => {
        return [...users]
            .filter(u => !u.isBlocked && !LEADERBOARD_EXCLUDED_UIDS.includes(u.uid))
            .map(user => {
                const credits = user.credits || 0;
                const focusSessions = user.focusSessionsCompleted || 0;
                const dailyTasks = user.dailyTasksCompleted || 0;
                const studyTime = user.totalStudyTime || 0;
                
                const totalScore = (credits * SCORE_WEIGHTS.credits) + 
                                   (focusSessions * SCORE_WEIGHTS.focusSessionsCompleted) + 
                                   (dailyTasks * SCORE_WEIGHTS.dailyTasksCompleted) +
                                   (studyTime * SCORE_WEIGHTS.totalStudyTime);

                return { ...user, totalScore: Math.round(totalScore) };
            })
            .sort((a, b) => b.totalScore - a.totalScore);
    }, [users]);


    const topThree = sortedUsers.slice(0, 3);
    const restOfUsers = sortedUsers.slice(3);

    const currentUserRank = sortedUsers.findIndex(u => u.uid === currentUser?.id);
    
    const renderUserStats = (user: User & { totalScore: number }) => (
        <div className="hidden md:grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground mt-4">
            <div className="flex items-center gap-1.5">
                <Award className="h-3 w-3 text-amber-500" />
                <span className="font-semibold">{user.credits || 0}</span>
                <span>Credits</span>
            </div>
             <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-blue-500" />
                <span className="font-semibold">{Math.round((user.totalStudyTime || 0) / 60)}</span>
                <span>Mins Studied</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-green-500" />
                <span className="font-semibold">{user.focusSessionsCompleted || 0}</span>
                <span>Focus Sessions</span>
            </div>
            <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3 text-rose-500" />
                <span className="font-semibold">{user.dailyTasksCompleted || 0}</span>
                <span>Tasks Done</span>
            </div>
        </div>
    );

    const renderPodiumCard = (user: (User & { totalScore: number }) | undefined, rank: number) => {
        if (!user) return <div className={cn(rank === 0 ? 'order-1 md:order-2' : (rank === 1 ? 'order-2 md:order-1' : 'order-3'))} />;

        const placeDetails = {
            0: { title: '1st Place', borderColor: 'border-yellow-400', textColor: 'text-yellow-400', shadow: 'shadow-2xl shadow-yellow-500/20', avatarSize: 'w-24 h-24 md:w-32 md:h-32', isTop: true, trophySize: 'h-10 w-10', order: 'order-1 md:order-2', marginTop: '' },
            1: { title: '2nd Place', borderColor: 'border-slate-400', textColor: 'text-slate-400', shadow: 'shadow-lg shadow-slate-500/10', avatarSize: 'w-20 h-20 md:w-24 md:h-24', isTop: false, trophySize: 'h-8 w-8', order: 'order-2 md:order-1', marginTop: 'md:mt-8' },
            2: { title: '3rd Place', borderColor: 'border-amber-700', textColor: 'text-amber-700', shadow: 'shadow-lg shadow-amber-800/10', avatarSize: 'w-20 h-20 md:w-24 md:h-24', isTop: false, trophySize: 'h-8 w-8', order: 'order-3 md:order-3', marginTop: 'md:mt-8' }
        }[rank];

        if (!placeDetails) return null;
        
        const isSuperAdmin = user.uid === SUPER_ADMIN_UID;

        return (
            <div className={cn("w-full", placeDetails.order, placeDetails.isTop ? 'md:-translate-y-8' : '', placeDetails.marginTop)}>
                <Card className={cn("relative text-center border-2 w-full", placeDetails.borderColor, placeDetails.shadow)}>
                    <CardHeader className="p-4 md:p-6">
                         <Trophy className={cn("mx-auto mb-2", placeDetails.trophySize, getTrophyColor(rank))} />
                        <Avatar className={cn("mx-auto border-4", placeDetails.avatarSize, placeDetails.borderColor)}>
                            <AvatarImage src={user.photoURL || `https://picsum.photos/150/150?u=${user.uid}`} />
                            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <CardTitle className={cn("mt-4 text-xl md:text-2xl", placeDetails.isTop && 'text-2xl')}>{user.displayName}</CardTitle>
                        
                        {isSuperAdmin ? (
                             <span className="dev-badge mx-auto mt-1">
                                <Code className="h-3 w-3" /> DEV
                            </span>
                        ) : user.isAdmin && (
                            <span className="vip-badge mx-auto mt-1">
                                <Crown className="h-3 w-3" /> VIP
                            </span>
                        )}

                        <CardDescription>{placeDetails.title}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
                        <div className={cn("font-bold text-3xl md:text-4xl", placeDetails.textColor)}>{user.totalScore}</div>
                        <p className="text-xs text-muted-foreground">Total Score</p>
                        {renderUserStats(user)}
                    </CardContent>
                </Card>
            </div>
        )
    }
    
    const getTrophyColor = (rank: number) => {
        if (rank === 0) return 'text-yellow-400';
        if (rank === 1) return 'text-slate-400';
        if (rank === 2) return 'text-amber-700';
        return 'text-muted-foreground';
    };


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Top Achievers</h1>
                <p className="text-muted-foreground">See who's leading the board with the highest total score!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 md:items-end">
                {renderPodiumCard(topThree[0], 0)}
                {renderPodiumCard(topThree[1], 1)}
                {renderPodiumCard(topThree[2], 2)}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Full Rankings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60px]">Rank</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead className="text-right">Score</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {restOfUsers.map((user, index) => {
                                    const rank = index + 4;
                                    const isSuperAdmin = user.uid === SUPER_ADMIN_UID;
                                    return (
                                        <TableRow key={user.uid} className={cn(currentUser?.id === user.uid && 'bg-primary/10')}>
                                            <TableCell className="font-bold text-lg text-muted-foreground">{rank}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-10 h-10 border">
                                                        <AvatarImage src={user.photoURL || `https://picsum.photos/150/150?u=${user.uid}`} />
                                                        <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium">{user.displayName}</span>
                                                            {isSuperAdmin ? (
                                                                <span className="dev-badge">
                                                                    <Code className="h-3 w-3" /> DEV
                                                                </span>
                                                            ) : user.isAdmin && (
                                                                <span className="vip-badge">
                                                                    <Crown className="h-3 w-3" /> VIP
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-lg">{user.totalScore}</TableCell>
                                        </TableRow>
                                    )
                                })}
                                {sortedUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            No users to rank yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

             {currentUserRank !== -1 && (
                <Card className="sticky bottom-20 md:bottom-4 bg-background/90 backdrop-blur-lg border-primary shadow-lg z-10">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                         <div className="flex items-center gap-4 flex-1">
                            <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-md p-2 w-16 md:w-20">
                                <span className="text-xs font-bold">RANK</span>
                                <span className="text-2xl md:text-3xl font-bold">{currentUserRank + 1}</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base md:text-lg font-semibold">You are on the leaderboard! Keep it up!</h3>
                                 <p className="text-sm text-muted-foreground">Your total score is <span className="font-bold text-primary">{sortedUsers[currentUserRank].totalScore}</span>.</p>
                            </div>
                         </div>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}
