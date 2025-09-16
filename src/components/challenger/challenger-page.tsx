
'use client';
import { useState } from 'react';
import { useChallenges, type ChallengeConfig } from '@/hooks/use-challenges';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft, CheckCircle, XCircle, Zap, Clock, ListTodo, CalendarCheck, ShieldQuestion, Loader2, Trophy, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { differenceInCalendarDays, startOfDay, format } from 'date-fns';
import { useUsers } from '@/hooks/use-admin';
import { useTimeTracker } from '@/hooks/use-time-tracker';

interface ChallengerPageProps {
    config: ChallengeConfig;
    isLocked?: boolean;
}

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
};

export default function ChallengerPage({ config, isLocked = false }: ChallengerPageProps) {
    const { user } = useUser();
    const { activeChallenge, startChallenge, checkIn, loading, dailyProgress } = useChallenges();
    const { currentUserData } = useUsers();
    
    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (isLocked) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <Card className="w-full max-w-md border-amber-500/50">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 text-amber-500">
                            <Lock className="h-8 w-8"/> Coming Soon
                        </CardTitle>
                        <CardDescription>
                            The "{config.title}" challenge is currently under development. Stay tuned!
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/dashboard/challenger">&larr; Back to Challenger Zone</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const isInThisChallenge = activeChallenge && activeChallenge.challengeId === config.id;
    const canStartChallenge = !activeChallenge && (currentUserData?.credits ?? 0) >= config.entryFee;
    
    const GoalIcon = ({ id }: { id: string }) => {
        switch(id) {
            case 'studyTime': return <Clock className="h-4 w-4" />;
            case 'focusSession': return <Zap className="h-4 w-4" />;
            case 'tasks': return <ListTodo className="h-4 w-4" />;
            case 'checkIn': return <CalendarCheck className="h-4 w-4" />;
            default: return <ShieldQuestion className="h-4 w-4" />;
        }
    }

    if (isInThisChallenge && activeChallenge) {
        const currentDayProgress = activeChallenge.progress[activeChallenge.currentDay] || {};
        const allGoalsMet = config.dailyGoals.every(g => currentDayProgress[g.id]?.completed);

        return (
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{activeChallenge.challengeId}</h1>
                    <p className="text-muted-foreground">Day {activeChallenge.currentDay} of {config.duration}</p>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {config.dailyGoals.map(goal => {
                        const progress = currentDayProgress[goal.id] || { current: 0, completed: false };
                        const progressPercentage = Math.min((progress.current / goal.target) * 100, 100);
                        return (
                            <Card key={goal.id} className={cn("flex flex-col", progress.completed && "bg-green-500/10 border-green-500/50")}>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium">{goal.description}</CardTitle>
                                    <GoalIcon id={goal.id} />
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-end">
                                    <Progress value={progressPercentage} className="h-2" />
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
                <div className="flex justify-center">
                    <Button size="lg" onClick={checkIn} disabled={allGoalsMet}>
                        {allGoalsMet ? <CheckCircle className="mr-2"/> : <CalendarCheck className="mr-2"/>}
                        {allGoalsMet ? 'All Goals Met for Today!' : "Daily Check-in"}
                    </Button>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader><CardTitle>Challenge Roadmap</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-7 gap-2">
                             {Array.from({ length: config.duration }).map((_, i) => {
                                const day = i + 1;
                                const isCompleted = !!activeChallenge.progress[day] && config.dailyGoals.every(g => activeChallenge.progress[day]?.[g.id]?.completed);
                                const isCurrent = day === activeChallenge.currentDay;
                                return (
                                    <div key={day} className={cn(
                                        "h-12 w-12 flex flex-col items-center justify-center rounded-lg border-2 text-xs font-bold",
                                        isCurrent && "border-primary ring-2 ring-primary/50 animate-pulse",
                                        isCompleted && "bg-green-500/20 border-green-500 text-green-500",
                                        day < activeChallenge.currentDay && !isCompleted && "bg-destructive/20 border-destructive text-destructive",
                                    )}>
                                       <span> DAY</span><span>{day}</span>
                                    </div>
                                )
                             })}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><CardTitle>Rules & Info</CardTitle></CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <ul className="space-y-2 text-muted-foreground list-disc pl-5">
                                {config.rules.map((rule, i) => <li key={i}>{rule}</li>)}
                            </ul>
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <p className="text-xs">Any attempt to cheat the system will result in a credit penalty and a ban from challenges.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                 <Link href="/dashboard/challenger" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Challenger Zone</Link>
                <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
                <p className="text-muted-foreground">{config.description}</p>
            </div>

            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">Challenge Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-around items-center text-center">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Duration</p>
                            <p className="text-2xl font-bold">{config.duration} Days</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Entry Fee</p>
                            <p className="text-2xl font-bold">{config.entryFee} Credits</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Reward</p>
                            <p className="text-2xl font-bold text-green-500">+{config.reward} Credits</p>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">Daily Goals:</h4>
                        <ul className="space-y-2">
                             {config.dailyGoals.map(goal => (
                                <li key={goal.id} className="flex items-center gap-3 p-3 rounded-md bg-muted">
                                    <GoalIcon id={goal.id} />
                                    <span>{goal.description}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Rules:</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                            {config.rules.map((rule, i) => <li key={i}>{rule}</li>)}
                        </ul>
                    </div>
                     <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">
                        <Trophy className="h-5 w-5" />
                        <p className="text-sm font-semibold">Completing this challenge earns you the Elite Badge for {config.eliteBadgeDays} days!</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className="w-full" size="lg" disabled={!canStartChallenge || !!activeChallenge}>
                                {activeChallenge ? 'A Challenge is Already Active' : 'Start Challenge'}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Challenge Start</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to start the "{config.title}"? An entry fee of <span className="font-bold">{config.entryFee} credits</span> will be deducted. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => startChallenge(config)}>Yes, Start Challenge</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
        </div>
    );
}
