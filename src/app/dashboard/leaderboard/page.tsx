'use client';

import { useUsers, User, SUPER_ADMIN_UID } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Award, Crown, Zap, Clock, Shield, Code, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTimeTracker } from '@/hooks/use-time-tracker';
import { startOfWeek, endOfWeek, parseISO, isWithinInterval } from 'date-fns';


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
    const { sessions: allSessions } = useTimeTracker();
    const [activeTab, setActiveTab] = useState('all-time');

    const weeklyStudyTime = useMemo(() => {
        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        
        const weeklyTimes: { [uid: string]: number } = {};

        allSessions.forEach(session => {
            const sessionDate = parseISO(session.startTime);
            if (isWithinInterval(sessionDate, { start: weekStart, end: weekEnd })) {
                const duration = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000;
                if (!weeklyTimes[session.subjectId]) {
                    weeklyTimes[session.subjectId] = 0;
                }
                weeklyTimes[session.subjectId] += duration;
            }
        });
        return weeklyTimes;
    }, [allSessions]);
    

    const sortedUsers = useMemo(() => {
        const processedUsers = users
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
                                   
                const userWeeklyTime = weeklyStudyTime[user.uid] || 0;

                return { ...user, totalScore: Math.round(totalScore), weeklyTime: userWeeklyTime };
            });

        if (activeTab === 'streaks') {
            return processedUsers.sort((a, b) => (b.streak || 0) - (a.streak || 0));
        }
        
        if (activeTab === 'weekly') {
            return processedUsers.sort((a, b) => b.weeklyTime - a.weeklyTime);
        }
        
        // Default to all-time score
        return processedUsers.sort((a, b) => b.totalScore - a.totalScore);
        
    }, [users, activeTab, weeklyStudyTime]);


    const topThree = sortedUsers.slice(0, 3);
    const restOfUsers = sortedUsers.slice(3);

    const currentUserRank = sortedUsers.findIndex(u => u.uid === currentUser?.id);
    
    const renderUserStats = (user: User & { totalScore: number, weeklyTime: number }) => (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground mt-4">
             <div className="flex items-center gap-1.5">
                <Flame className="h-3 w-3 text-orange-500" />
                <span className="font-semibold">{user.streak || 0}</span>
                <span>Day Streak</span>
            </div>
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
        </div>
    );
    
    const getTrophyColor = (rank: number) => {
        if (rank === 0) return 'text-yellow-400';
        if (rank === 1) return 'text-slate-400';
        if (rank === 2) return 'text-amber-700';
        return 'text-muted-foreground';
    };
    
    const formatWeeklyTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const renderPodiumCard = (user: (User & { totalScore: number, weeklyTime: number }), rank: number) => {
        if (!user) return null;
        
        const isSuperAdmin = user.uid === SUPER_ADMIN_UID;
        
        const scoreToDisplay = {
            'all-time': user.totalScore,
            'streaks': user.streak || 0,
            'weekly': formatWeeklyTime(user.weeklyTime),
        }[activeTab];

        const scoreLabel = {
            'all-time': 'Total Score',
            'streaks': 'Day Streak',
            'weekly': 'This Week',
        }[activeTab];
        
        if (rank === 0) { // First Place
            return (
                <Card className="w-full border-2 border-yellow-400 bg-yellow-500/5 shadow-2xl shadow-yellow-500/20">
                     <CardHeader className="text-center p-6">
                        <div className="relative w-24 h-24 mx-auto">
                            <Trophy className="absolute -top-2 -left-2 h-8 w-8 text-yellow-400 -rotate-12" />
                            <Avatar className="w-24 h-24 border-4 border-yellow-400">
                                <AvatarImage src={user.photoURL || `https://picsum.photos/150/150?u=${user.uid}`} />
                                <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                        </div>
                        <CardTitle className="mt-4 text-2xl">{user.displayName}</CardTitle>
                        <CardDescription className="font-semibold text-yellow-400 text-lg">1st Place</CardDescription>
                     </CardHeader>
                     <CardContent className="text-center p-6 pt-0">
                        <p className="text-5xl font-bold text-yellow-400">{scoreToDisplay}</p>
                        <p className="text-xs text-muted-foreground">{scoreLabel}</p>
                        {renderUserStats(user)}
                     </CardContent>
                </Card>
            )
        }
        
        // Second and Third Place
        const placeDetails = {
            1: { title: '2nd Place', color: 'slate-400', trophyColor: 'text-slate-400'},
            2: { title: '3rd Place', color: 'amber-700', trophyColor: 'text-amber-700' }
        }[rank];

        if (!placeDetails) return null;

        return (
            <Card className="w-full">
                 <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-4">
                        <Trophy className={cn("h-6 w-6 flex-shrink-0", placeDetails.trophyColor)} />
                        <Avatar className="w-12 h-12 border-2">
                            <AvatarImage src={user.photoURL || `https://picsum.photos/150/150?u=${user.uid}`} />
                            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                             <div className="flex items-center gap-2">
                                <p className="font-semibold">{user.displayName}</p>
                                {isSuperAdmin ? (
                                    <span className="dev-badge flex-shrink-0">
                                        <Code className="h-3 w-3" /> DEV
                                    </span>
                                ) : user.isAdmin && (
                                    <span className="vip-badge flex-shrink-0">
                                        <Crown className="h-3 w-3" /> VIP
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">{placeDetails.title}</p>
                        </div>
                        <p className={cn("text-2xl font-bold", placeDetails.trophyColor)}>{scoreToDisplay}</p>
                    </div>
                    <Separator />
                    {renderUserStats(user)}
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Top Achievers</h1>
                <p className="text-muted-foreground">See who's leading the board with the highest scores and longest streaks!</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:w-1/2 mx-auto">
                    <TabsTrigger value="all-time">All-Time</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="streaks">Streaks</TabsTrigger>
                </TabsList>
                <TabsContent value="all-time" className="mt-6">
                    <LeaderboardContent topThree={topThree} restOfUsers={restOfUsers} currentUser={currentUser} sortedUsers={sortedUsers} renderPodiumCard={renderPodiumCard} renderUserStats={renderUserStats} activeTab="all-time"/>
                </TabsContent>
                <TabsContent value="weekly" className="mt-6">
                    <LeaderboardContent topThree={topThree} restOfUsers={restOfUsers} currentUser={currentUser} sortedUsers={sortedUsers} renderPodiumCard={renderPodiumCard} renderUserStats={renderUserStats} activeTab="weekly"/>
                </TabsContent>
                <TabsContent value="streaks" className="mt-6">
                    <LeaderboardContent topThree={topThree} restOfUsers={restOfUsers} currentUser={currentUser} sortedUsers={sortedUsers} renderPodiumCard={renderPodiumCard} renderUserStats={renderUserStats} activeTab="streaks"/>
                </TabsContent>
            </Tabs>
        </div>
    );
}

const LeaderboardContent = ({ topThree, restOfUsers, currentUser, sortedUsers, renderPodiumCard, renderUserStats, activeTab }: any) => {
    const currentUserRank = sortedUsers.findIndex((u: any) => u.uid === currentUser?.id);

    const getScoreLabel = () => ({
        'all-time': 'Total Score',
        'streaks': 'Streak',
        'weekly': 'Weekly Time',
    }[activeTab]);
    
    const formatWeeklyTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const getScoreToDisplay = (user: any) => ({
        'all-time': user.totalScore,
        'streaks': user.streak || 0,
        'weekly': formatWeeklyTime(user.weeklyTime)
    }[activeTab]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 items-center">
                {topThree[0] && renderPodiumCard(topThree[0], 0)}
                 <div className="space-y-4">
                    {topThree[1] && renderPodiumCard(topThree[1], 1)}
                    {topThree[2] && renderPodiumCard(topThree[2], 2)}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Full Rankings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {restOfUsers.map((user: User & { totalScore: number }, index: number) => {
                            const rank = index + 4;
                            const isSuperAdmin = user.uid === SUPER_ADMIN_UID;
                            return (
                                <Card key={user.uid} className={cn("overflow-hidden", currentUser?.id === user.uid && 'border-primary')}>
                                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                                        <div className="flex items-center gap-4 flex-1">
                                            <p className="font-bold text-lg text-muted-foreground w-8 text-center">{rank}</p>
                                            <Avatar className="w-12 h-12 border">
                                                <AvatarImage src={user.photoURL || `https://picsum.photos/150/150?u=${user.uid}`} />
                                                <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium truncate">{user.displayName}</span>
                                                    {isSuperAdmin ? (
                                                        <span className="dev-badge flex-shrink-0">
                                                            <Code className="h-3 w-3" /> DEV
                                                        </span>
                                                    ) : user.isAdmin && (
                                                        <span className="vip-badge flex-shrink-0">
                                                            <Crown className="h-3 w-3" /> VIP
                                                        </span>
                                                    )}
                                                </div>
                                                 <p className="text-muted-foreground text-sm">
                                                    {getScoreLabel()}: 
                                                    <span className="font-bold text-primary ml-1">{getScoreToDisplay(user)}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="sm:border-l sm:pl-4 mt-4 sm:mt-0">
                                            {renderUserStats(user)}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                        {sortedUsers.length === 0 && (
                             <p className="text-center text-muted-foreground py-10">No users to rank yet.</p>
                        )}
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
                                 <p className="text-sm text-muted-foreground">
                                    Your {getScoreLabel()?.toLowerCase()} is
                                    <span className="font-bold text-primary ml-1">
                                       {getScoreToDisplay(sortedUsers[currentUserRank])}
                                    </span>.
                                 </p>
                            </div>
                         </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
