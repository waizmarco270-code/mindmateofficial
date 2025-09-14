

'use client';

import { useUsers, User, SUPER_ADMIN_UID } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Award, Crown, Zap, Clock, Shield, Code, Flame, ShieldCheck, Gamepad2, ListChecks, Info, Medal, BookOpen, Sparkles, ChevronRight, History, Puzzle, Brain, Orbit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemo, useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTimeTracker } from '@/hooks/use-time-tracker';
import { startOfWeek, endOfWeek, parseISO, isWithinInterval, subWeeks, format as formatDate } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

type UserWithStats = User & { 
    totalScore: number; 
    weeklyTime: number; 
    prevWeeklyTime?: number;
    entertainmentTotalScore: number;
    emojiQuizHighScore: number;
    memoryGameHighScore: number;
    dimensionShiftHighScore: number;
    prevWeekEmojiQuizHighScore?: number;
    weeklySubjectBreakdown: { [subjectName: string]: number };
};


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
    const [timeLeft, setTimeLeft] = useState('');
    const [selectedUserForDetails, setSelectedUserForDetails] = useState<UserWithStats | null>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
            const diff = weekEnd.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeLeft("0d 0h 0m 0s");
                return;
            }

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / 1000 / 60) % 60);
            const s = Math.floor((diff / 1000) % 60);

            setTimeLeft(`${d}d ${h}h ${m}m ${s}s`);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const weeklyStats = useMemo(() => {
        const now = new Date();
        const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
        const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        
        const stats: { [uid: string]: { thisWeek: { totalTime: number; subjects: { [name: string]: number } }, lastWeek: { totalTime: number } } } = {};

        allSessions.forEach(session => {
            const userId = session.subjectId;
            const sessionDate = parseISO(session.startTime);

             if (!stats[userId]) {
                stats[userId] = { thisWeek: { totalTime: 0, subjects: {} }, lastWeek: { totalTime: 0 } };
            }

            const duration = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000;

            if (isWithinInterval(sessionDate, { start: thisWeekStart, end: thisWeekEnd })) {
                stats[userId].thisWeek.totalTime += duration;

                if (!stats[userId].thisWeek.subjects[session.subjectName]) {
                    stats[userId].thisWeek.subjects[session.subjectName] = 0;
                }
                stats[userId].thisWeek.subjects[session.subjectName] += duration;
            } else if (isWithinInterval(sessionDate, { start: lastWeekStart, end: lastWeekEnd })) {
                 stats[userId].lastWeek.totalTime += duration;
            }
        });
        return stats;
    }, [allSessions]);
    

    const { sortedUsers, lastWeekWeeklyWinner, lastWeekEntertainmentWinner } = useMemo(() => {
        const processedUsers: UserWithStats[] = users
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
                                   
                const userWeeklyStats = weeklyStats[user.uid] || { thisWeek: { totalTime: 0, subjects: {} }, lastWeek: { totalTime: 0 } };
                const emojiQuizHighScore = user.gameHighScores?.emojiQuiz || 0;
                const memoryGameHighScore = user.gameHighScores?.memoryGame || 0;
                const dimensionShiftHighScore = user.gameHighScores?.dimensionShift || 0;
                
                const entertainmentTotalScore = emojiQuizHighScore + memoryGameHighScore + dimensionShiftHighScore;


                return { 
                    ...user, 
                    totalScore: Math.round(totalScore), 
                    weeklyTime: userWeeklyStats.thisWeek.totalTime,
                    prevWeeklyTime: userWeeklyStats.lastWeek.totalTime,
                    weeklySubjectBreakdown: userWeeklyStats.thisWeek.subjects,
                    entertainmentTotalScore,
                    emojiQuizHighScore,
                    memoryGameHighScore,
                    dimensionShiftHighScore,
                    prevWeekEmojiQuizHighScore: user.gameHighScores?.emojiQuiz,
                };
            });
        
        let sorted: UserWithStats[] = [];

        if (activeTab === 'weekly') {
            sorted = [...processedUsers].sort((a, b) => b.weeklyTime - a.weeklyTime);
        } else if (activeTab === 'entertainment') {
            sorted = [...processedUsers].sort((a, b) => b.entertainmentTotalScore - a.entertainmentTotalScore);
        } else {
            // Default to all-time score
            sorted = [...processedUsers].sort((a, b) => b.totalScore - a.totalScore);
        }
        
        const lastWeekWeeklyWinner = [...processedUsers].sort((a,b) => (b.prevWeeklyTime || 0) - (a.prevWeeklyTime || 0))[0];
        const lastWeekEntertainmentWinner = [...processedUsers].sort((a,b) => (b.prevWeekEmojiQuizHighScore || 0) - (a.prevWeekEmojiQuizHighScore || 0))[0];

        return { sortedUsers: sorted, lastWeekWeeklyWinner, lastWeekEntertainmentWinner };
        
    }, [users, activeTab, weeklyStats]);


    const topThree = sortedUsers.slice(0, 3);
    const restOfUsers = sortedUsers.slice(3, 20); // Show only top 20 users

    const currentUserRank = sortedUsers.findIndex(u => u.uid === currentUser?.id);
    
    const renderUserStats = (user: UserWithStats) => {
        if (activeTab === 'entertainment') {
             return (
                 <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground mt-4">
                     <div className="flex items-center gap-1.5 col-span-2">
                        <Gamepad2 className="h-4 w-4 text-green-500" />
                        <span className="font-semibold">{user.entertainmentTotalScore || 0}</span>
                        <span>Total Score</span>
                    </div>
                     <div className="flex items-center gap-1.5">
                        <Puzzle className="h-3 w-3 text-blue-500" />
                        <span className="font-semibold">{user.emojiQuizHighScore || 0}</span>
                    </div>
                     <div className="flex items-center gap-1.5">
                        <Brain className="h-3 w-3 text-purple-500" />
                        <span className="font-semibold">{user.memoryGameHighScore || 0}</span>
                    </div>
                     <div className="flex items-center gap-1.5">
                        <Orbit className="h-3 w-3 text-rose-500" />
                        <span className="font-semibold">{user.dimensionShiftHighScore || 0}</span>
                    </div>
                </div>
            )
        }
        return (
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
                <div className="flex items-center gap-1.5">
                    <ListChecks className="h-3 w-3 text-purple-500" />
                    <span className="font-semibold">{user.dailyTasksCompleted || 0}</span>
                    <span>Tasks Done</span>
                </div>
            </div>
        );
    }
    
    const getTrophyColor = (rank: number) => {
        if (rank === 0) return 'text-yellow-400';
        if (rank === 1) return 'text-slate-400';
        if (rank === 2) return 'text-amber-700';
        return 'text-muted-foreground';
    };
    
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const renderPodiumCard = (user: UserWithStats, rank: number) => {
        if (!user) return null;
        
        const isSuperAdmin = user.uid === SUPER_ADMIN_UID;
        
        const scoreToDisplay = {
            'all-time': user.totalScore,
            'weekly': formatTime(user.weeklyTime),
            'entertainment': user.entertainmentTotalScore
        }[activeTab];

        const scoreLabel = {
            'all-time': 'Total Score',
            'weekly': 'This Week',
            'entertainment': 'Total Score'
        }[activeTab];
        
        const CardWrapper = activeTab === 'weekly' ? 'button' : 'div';

        if (rank === 0) { // First Place
            return (
                 <CardWrapper onClick={activeTab === 'weekly' ? () => setSelectedUserForDetails(user) : undefined} className={cn(activeTab === 'weekly' && 'cursor-pointer hover:shadow-yellow-500/40 transition-shadow', "w-full text-left rounded-lg")}>
                    <Card className="w-full border-2 border-yellow-400 bg-yellow-500/5 shadow-2xl shadow-yellow-500/20">
                         <CardHeader className="text-center p-6">
                            <div className="relative w-24 h-24 mx-auto">
                                <Trophy className="absolute -top-2 -left-2 h-8 w-8 text-yellow-400 -rotate-12" />
                                <Avatar className="w-24 h-24 border-4 border-yellow-400">
                                    <AvatarImage src={user.photoURL || `https://picsum.photos/150/150?u=${user.uid}`} />
                                    <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <CardTitle className="text-2xl">{user.displayName}</CardTitle>
                                 {isSuperAdmin ? (
                                    <span className="dev-badge flex-shrink-0">
                                        <Code className="h-3 w-3" /> DEV
                                    </span>
                                ) : user.isAdmin ? (
                                    <span className="admin-badge"><ShieldCheck className="h-3 w-3"/> ADMIN</span>
                                ) : user.isVip ? (
                                    <span className="elite-badge flex-shrink-0">
                                        <Crown className="h-3 w-3" /> ELITE
                                    </span>
                                ) : user.isGM && (
                                    <span className="gm-badge">GM</span>
                                )}
                            </div>
                            <CardDescription className="font-semibold text-yellow-400 text-lg">1st Place</CardDescription>
                         </CardHeader>
                         <CardContent className="text-center p-6 pt-0">
                            <p className="text-5xl font-bold text-yellow-400">{scoreToDisplay}</p>
                            <p className="text-xs text-muted-foreground">{scoreLabel}</p>
                            {renderUserStats(user)}
                         </CardContent>
                    </Card>
                </CardWrapper>
            )
        }
        
        // Second and Third Place
        const placeDetails = {
            1: { title: '2nd Place', color: 'slate-400', trophyColor: 'text-slate-400'},
            2: { title: '3rd Place', color: 'amber-700', trophyColor: 'text-amber-700' }
        }[rank];

        if (!placeDetails) return null;

        return (
             <CardWrapper onClick={activeTab === 'weekly' ? () => setSelectedUserForDetails(user) : undefined} className={cn(activeTab === 'weekly' && 'cursor-pointer hover:bg-muted transition-colors', "w-full text-left rounded-lg")}>
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
                                    ) : user.isAdmin ? (
                                        <span className="admin-badge"><ShieldCheck className="h-3 w-3"/> ADMIN</span>
                                    ) : user.isVip ? (
                                        <span className="elite-badge flex-shrink-0">
                                            <Crown className="h-3 w-3" /> ELITE
                                        </span>
                                     ) : user.isGM && (
                                        <span className="gm-badge">GM</span>
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
            </CardWrapper>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Top Achievers</h1>
                <p className="text-muted-foreground">See who's leading the board with the highest scores and longest streaks!</p>
            </div>
            
            {activeTab !== 'entertainment' && (
                <Card className="relative overflow-hidden border-yellow-400/30 bg-yellow-950/40">
                    <div className="absolute -inset-2 bg-grid-slate-800 animate-pulse duration-1000 [mask-image:linear-gradient(to_bottom,white_50%,transparent_100%)]"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 via-transparent to-transparent"></div>
                    <Popover>
                        <PopoverTrigger asChild>
                        <button className="relative w-full p-6 text-left group">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="p-3 rounded-full bg-yellow-400/20 text-yellow-400 animate-pulse w-fit">
                                    <Crown className="h-10 w-10"/>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-yellow-400 [text-shadow:0_0_8px_hsl(var(--primary)/50%)]">Become an Elite Member</h3>
                                    <p className="text-yellow-400/80 mt-1">Discover the benefits of being a top performer in the MindMate community.</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-semibold text-yellow-400/90 group-hover:text-yellow-300 transition-colors">
                                    Learn More
                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 md:w-96">
                            <div className="space-y-4">
                                <h4 className="font-bold text-base flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Elite Member Status</h4>
                                <div>
                                    <p className="text-sm text-muted-foreground font-semibold mb-2">How to achieve:</p>
                                    <p className="text-xs text-muted-foreground">The <span className="elite-badge inline-flex items-center gap-1"><Crown className="h-3 w-3"/>ELITE</span> badge is awarded manually by admins to users who show exceptional dedication. This includes:</p>
                                    <ul className="list-disc list-inside text-xs text-muted-foreground mt-2 space-y-1">
                                        <li>Consistently placing in the top 3 of the Weekly Leaderboard.</li>
                                        <li>High daily activity (focus sessions, tasks, quizzes).</li>
                                        <li>Maintaining long streaks.</li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-semibold mb-2">Exclusive Perks:</p>
                                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                                        <li><span className="font-semibold text-foreground">Daily Rewards:</span> 20+ Free Credits, 5 Free Scratch Cards, and 5 Free Card Flip plays.</li>
                                        <li><span className="font-semibold text-foreground">Special Recognition:</span> The prestigious animated Elite badge next to your name.</li>
                                        <li><span className="font-semibold text-foreground">Early Access:</span> Be the first to try out new "Elite Features" as they are released.</li>
                                    </ul>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </Card>
            )}

            {activeTab === 'entertainment' && (
                 <Card className="relative overflow-hidden border-blue-400/30 bg-blue-950/40">
                    <div className="absolute -inset-2 bg-grid-slate-800 animate-pulse duration-1000 [mask-image:linear-gradient(to_bottom,white_50%,transparent_100%)]"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-transparent to-transparent"></div>
                    <Popover>
                        <PopoverTrigger asChild>
                        <button className="relative w-full p-6 text-left group">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="p-3 rounded-full bg-blue-400/20 text-blue-400 animate-pulse w-fit">
                                    <Gamepad2 className="h-10 w-10"/>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-blue-400 [text-shadow:0_0_8px_hsl(var(--primary)/50%)]">Become a Game Master</h3>
                                    <p className="text-blue-400/80 mt-1">Dominate the games to earn the legendary GM title and its rewards.</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-semibold text-blue-400/90 group-hover:text-blue-300 transition-colors">
                                    Learn More
                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 md:w-96">
                            <div className="space-y-4">
                                <h4 className="font-bold text-base flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Game Master (GM) Status</h4>
                                <div>
                                    <p className="text-sm text-muted-foreground font-semibold mb-2">How to achieve:</p>
                                     <p className="text-xs text-muted-foreground">The <span className="gm-badge inline-flex items-center gap-1">GM</span> badge is for the best players.</p>
                                    <ul className="list-disc list-inside text-xs text-muted-foreground mt-2 space-y-1">
                                        <li>Finish at the #1 spot on the weekly Entertainment leaderboard.</li>
                                        <li>You must stay in the Top 3 in subsequent weeks to keep the badge.</li>
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground font-semibold mb-2">GM Perks:</p>
                                    <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                                        <li><span className="font-semibold text-foreground">Daily Rewards:</span> 20+ Free Credits.</li>
                                        <li><span className="font-semibold text-foreground">Free Plays:</span> 5 free plays for all Reward Zone games, every day.</li>
                                        <li><span className="font-semibold text-foreground">Special Recognition:</span> The legendary animated GM badge.</li>
                                         <li><span className="font-semibold text-foreground">ULTIMATE PRIZE:</span> Hold the #1 spot for 4 consecutive weeks to win a ₹100 Google Play Redeem Code!</li>
                                    </ul>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </Card>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:w-1/2 mx-auto">
                    <TabsTrigger value="all-time">All-Time</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="entertainment">Entertainment</TabsTrigger>
                </TabsList>
                <TabsContent value="all-time" className="mt-6">
                    <LeaderboardContent topThree={topThree} restOfUsers={restOfUsers} currentUser={currentUser} sortedUsers={sortedUsers} renderPodiumCard={renderPodiumCard} renderUserStats={renderUserStats} activeTab="all-time" onUserClick={setSelectedUserForDetails} />
                </TabsContent>
                <TabsContent value="weekly" className="mt-6 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="p-4 flex items-center justify-between gap-4 text-center">
                                <div className='flex items-center gap-3'>
                                    <Clock className="h-8 w-8 text-primary" />
                                    <div>
                                        <h4 className="font-semibold text-lg text-left">Weekly Reset</h4>
                                        <p className="text-muted-foreground text-sm text-left">Leaderboard resets every Monday.</p>
                                    </div>
                                </div>
                                <div className="font-mono text-base font-bold bg-muted px-3 py-1.5 rounded-lg animate-pulse">
                                    {timeLeft}
                                </div>
                            </CardContent>
                        </Card>
                        {lastWeekWeeklyWinner && lastWeekWeeklyWinner.prevWeeklyTime > 0 && (
                            <LastWeekWinnerCard winner={lastWeekWeeklyWinner} score={formatTime(lastWeekWeeklyWinner.prevWeeklyTime)} />
                        )}
                    </div>
                    <LeaderboardContent topThree={topThree} restOfUsers={restOfUsers} currentUser={currentUser} sortedUsers={sortedUsers} renderPodiumCard={renderPodiumCard} renderUserStats={renderUserStats} activeTab="weekly" onUserClick={setSelectedUserForDetails} />
                </TabsContent>
                 <TabsContent value="entertainment" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <Card>
                            <CardContent className="p-4 flex items-center justify-between gap-4 text-center">
                                <div className='flex items-center gap-3'>
                                    <Gamepad2 className="h-8 w-8 text-primary" />
                                    <div>
                                        <h4 className="font-semibold text-lg text-left">GM Title Race</h4>
                                        <p className="text-muted-foreground text-sm text-left">GM title is decided weekly.</p>
                                    </div>
                                </div>
                                <div className="font-mono text-base font-bold bg-muted px-3 py-1.5 rounded-lg animate-pulse">
                                    {timeLeft}
                                </div>
                            </CardContent>
                        </Card>
                         {lastWeekEntertainmentWinner && lastWeekEntertainmentWinner.prevWeekEmojiQuizHighScore > 0 && (
                             <LastWeekWinnerCard winner={lastWeekEntertainmentWinner} score={lastWeekEntertainmentWinner.prevWeekEmojiQuizHighScore} scoreLabel="High Score" />
                        )}
                    </div>
                    <LeaderboardContent topThree={topThree} restOfUsers={restOfUsers} currentUser={currentUser} sortedUsers={sortedUsers} renderPodiumCard={renderPodiumCard} renderUserStats={renderUserStats} activeTab="entertainment" onUserClick={setSelectedUserForDetails}/>
                </TabsContent>
            </Tabs>
             <Dialog open={!!selectedUserForDetails} onOpenChange={(open) => !open && setSelectedUserForDetails(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Weekly Study Breakdown</DialogTitle>
                        <DialogDescription>Time spent on each subject by {selectedUserForDetails?.displayName} this week.</DialogDescription>
                    </DialogHeader>
                    {selectedUserForDetails && (
                        <div className="py-4 space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={selectedUserForDetails.photoURL ?? undefined} />
                                    <AvatarFallback>{selectedUserForDetails.displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-lg font-bold">{selectedUserForDetails.displayName}</h3>
                                    <p className="text-sm text-muted-foreground">Total This Week: <span className="font-bold text-primary">{formatTime(selectedUserForDetails.weeklyTime)}</span></p>
                                </div>
                            </div>
                             <ul className="space-y-2 rounded-md border p-4 max-h-64 overflow-y-auto">
                                {Object.entries(selectedUserForDetails.weeklySubjectBreakdown).length > 0 ? (
                                    Object.entries(selectedUserForDetails.weeklySubjectBreakdown)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([subject, time]) => (
                                         <li key={subject} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted">
                                            <span className="font-medium">{subject}</span>
                                            <span className="font-mono text-muted-foreground">{formatTime(time)}</span>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-center text-muted-foreground py-4">No specific subjects tracked this week.</p>
                                )}
                            </ul>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

const LeaderboardContent = ({ topThree, restOfUsers, currentUser, sortedUsers, renderPodiumCard, renderUserStats, activeTab, onUserClick }: any) => {
    const currentUserRank = sortedUsers.findIndex((u: any) => u.uid === currentUser?.id);

    const getScoreLabel = () => ({
        'all-time': 'Total Score',
        'weekly': 'Weekly Time',
        'entertainment': 'Total Score',
    }[activeTab]);
    
    const formatWeeklyTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const getScoreToDisplay = (user: any) => ({
        'all-time': user.totalScore,
        'weekly': formatWeeklyTime(user.weeklyTime),
        'entertainment': user.entertainmentTotalScore
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
                        {restOfUsers.map((user: UserWithStats, index: number) => {
                            const rank = index + 4;
                            const isSuperAdmin = user.uid === SUPER_ADMIN_UID;
                            const CardWrapper = activeTab === 'weekly' ? 'button' : 'div';
                            return (
                                <CardWrapper key={user.uid} onClick={activeTab === 'weekly' ? () => onUserClick(user) : undefined} className={cn("overflow-hidden text-left rounded-lg", currentUser?.id === user.uid && 'border border-primary', activeTab === 'weekly' && 'cursor-pointer hover:bg-muted/50 w-full')}>
                                    <Card>
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
                                                        ) : user.isAdmin ? (
                                                            <span className="admin-badge"><ShieldCheck className="h-3 w-3"/> ADMIN</span>
                                                        ) : user.isVip ? (
                                                            <span className="elite-badge flex-shrink-0">
                                                                <Crown className="h-3 w-3" /> ELITE
                                                            </span>
                                                        ) : user.isGM && (
                                                            <span className="gm-badge">GM</span>
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
                                </CardWrapper>
                            )
                        })}
                        {sortedUsers.length === 0 && (
                             <p className="text-center text-muted-foreground py-10">No users to rank yet.</p>
                        )}
                        {restOfUsers.length === 0 && sortedUsers.length > 3 && (
                            <p className="text-center text-muted-foreground py-10">Only the top 20 users are shown.</p>
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


function LastWeekWinnerCard({ winner, score, scoreLabel = "Time" }: { winner: UserWithStats, score: string | number, scoreLabel?: string}) {
    const lastWeekStart = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            <Card className="h-full">
                <CardContent className="p-4 flex items-center gap-4">
                     <div className="p-2.5 bg-amber-500/10 rounded-lg">
                        <History className="h-8 w-8 text-amber-500" />
                     </div>
                     <div className="flex-1">
                        <h4 className="font-semibold text-lg">Last Week's Champion</h4>
                        <p className="text-sm text-muted-foreground">
                            {formatDate(lastWeekStart, 'd MMM')} - {formatDate(lastWeekEnd, 'd MMM')}
                        </p>
                    </div>
                     <div className="text-right">
                        <p className="font-bold text-lg">{winner.displayName}</p>
                        <p className="text-sm font-mono text-primary">{scoreLabel}: {score}</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

    