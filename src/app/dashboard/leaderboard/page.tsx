
'use client';

import { useUsers, ADMIN_UIDS, DEV_UID } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Award, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import {Crown} from 'lucide-react';

const LEADERBOARD_EXCLUDED_UIDS = ['23j2N4p0ZgUnCqTBrrppkYtD2fI3'];

export default function LeaderboardPage() {
    const { user: currentUser } = useUser();
    const { users } = useUsers();

    const sortedUsers = [...users]
        .filter(u => !u.isBlocked && !LEADERBOARD_EXCLUDED_UIDS.includes(u.uid))
        .sort((a, b) => b.credits - a.credits);

    const topThree = sortedUsers.slice(0, 3);
    const restOfUsers = sortedUsers.slice(3);

    const currentUserRank = sortedUsers.findIndex(u => u.uid === currentUser?.id);

    const getTrophyColor = (rank: number) => {
        if (rank === 0) return 'text-yellow-500';
        if (rank === 1) return 'text-slate-400';
        if (rank === 2) return 'text-amber-700';
        return 'text-muted-foreground';
    };

    const renderUserBadges = (user: (typeof users)[0]) => {
        const isVip = user.isAdmin || ADMIN_UIDS.includes(user.uid);
        const isDev = user.uid === DEV_UID;

        return (
            <div className="flex items-center justify-center gap-2 mt-2">
                {isDev && (
                    <span className="dev-badge" data-text="DEV">
                        <Code className="h-3 w-3" /> DEV
                    </span>
                )}
                {isVip && !isDev && (
                    <span className="vip-badge">
                        <Crown className="h-3 w-3" /> VIP
                    </span>
                )}
            </div>
        )
    }

    const renderPodiumCard = (user: (typeof users)[0] | undefined, rank: number) => {
        if (!user) return <div />;

        const placeDetails = {
            0: {
                title: '1st Place',
                borderColor: 'border-yellow-500',
                textColor: 'text-yellow-500',
                shadow: 'shadow-2xl shadow-yellow-500/20',
                avatarSize: 'w-32 h-32',
                isTop: true,
                trophySize: 'h-10 w-10',
                creditsSize: 'text-4xl'
            },
            1: {
                title: '2nd Place',
                borderColor: 'border-slate-400',
                textColor: 'text-slate-400',
                shadow: 'shadow-lg shadow-slate-500/10',
                avatarSize: 'w-24 h-24',
                isTop: false,
                trophySize: 'h-8 w-8',
                creditsSize: 'text-3xl'
            },
            2: {
                title: '3rd Place',
                borderColor: 'border-amber-700',
                textColor: 'text-amber-700',
                shadow: 'shadow-lg shadow-amber-800/10',
                avatarSize: 'w-24 h-24',
                isTop: false,
                trophySize: 'h-8 w-8',
                creditsSize: 'text-3xl'
            }
        }[rank];

        if (!placeDetails) return null;

        return (
            <div className={cn(!placeDetails.isTop && "md:mt-8")} key={user.uid}>
                <Card className={cn("relative text-center border-2", placeDetails.borderColor, placeDetails.shadow)}>
                     {placeDetails.isTop && (
                         <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-white p-2 rounded-full">
                            <Crown className="h-6 w-6" />
                        </div>
                     )}
                    <CardHeader>
                         <Trophy className={cn("mx-auto", placeDetails.trophySize, getTrophyColor(rank))} />
                        <Avatar className={cn("mx-auto mt-2 border-4", placeDetails.avatarSize, placeDetails.borderColor)}>
                            <AvatarImage src={user.photoURL || `https://picsum.photos/150/150?u=${user.uid}`} />
                            <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <CardTitle className={cn("mt-4", placeDetails.isTop && 'text-2xl')}>{user.displayName}</CardTitle>
                        {renderUserBadges(user)}
                        <CardDescription>{placeDetails.title}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={cn("font-bold", placeDetails.creditsSize, placeDetails.textColor)}>{user.credits} Credits</div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Top Achievers</h1>
                <p className="text-muted-foreground">See who's leading the board with the most credits!</p>
            </div>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                {renderPodiumCard(topThree[1], 1)}
                {renderPodiumCard(topThree[0], 0)}
                {renderPodiumCard(topThree[2], 2)}
            </div>

            {/* Rest of the Leaderboard */}
            <Card>
                <CardHeader>
                    <CardTitle>Full Rankings</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Rank</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead className="text-right">Credits</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {restOfUsers.map((user, index) => {
                                const rank = index + 4;
                                const isVip = user.isAdmin || ADMIN_UIDS.includes(user.uid);
                                const isDev = user.uid === DEV_UID;
                                return (
                                    <TableRow key={user.uid} className={cn(currentUser?.id === user.uid && 'bg-primary/10')}>
                                        <TableCell className="font-bold text-lg text-muted-foreground">{rank}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-10 h-10 border">
                                                    <AvatarImage src={user.photoURL || `https://picsum.photos/150/150?u=${user.uid}`} />
                                                    <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{user.displayName}</span>
                                                    {isDev && (
                                                        <span className="dev-badge" data-text="DEV">
                                                            <Code className="h-3 w-3" /> DEV
                                                        </span>
                                                    )}
                                                    {isVip && !isDev && (
                                                        <span className="vip-badge">
                                                            <Crown className="h-3 w-3" /> VIP
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-lg">{user.credits}</TableCell>
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
                </CardContent>
            </Card>

             {currentUserRank !== -1 && (
                <Card className="sticky bottom-20 md:bottom-4 bg-background/80 backdrop-blur-lg border-primary shadow-lg">
                    <CardContent className="p-4 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-md p-2 w-20">
                                <span className="text-xs font-bold">YOUR RANK</span>
                                <span className="text-3xl font-bold">{currentUserRank + 1}</span>
                            </div>
                            <h3 className="text-lg font-semibold">You are on the leaderboard! Keep it up!</h3>
                         </div>
                         <div className="text-right">
                             <p className="text-sm text-muted-foreground">Your Credits</p>
                             <p className="text-2xl font-bold">{sortedUsers[currentUserRank].credits}</p>
                         </div>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}

    