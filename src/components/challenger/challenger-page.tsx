
'use client';
import { useState, useEffect } from 'react';
import { useChallenges, type ActiveChallenge, type PlannedTask } from '@/hooks/use-challenges';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowLeft, CheckCircle, XCircle, Zap, Clock, ListTodo, CalendarCheck, ShieldQuestion, Loader2, Trophy, AlertTriangle, Sparkles, Check, Swords } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useUsers } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { differenceInMilliseconds } from 'date-fns';
import { Checkbox } from '../ui/checkbox';
import { TimeTracker } from '../tracker/time-tracker';
import { AnimatePresence, motion } from 'framer-motion';


interface ChallengerPageProps {
    config: ActiveChallenge;
    isLocked?: boolean; // Keep for potential future use
}

const GoalIcon = ({ id }: { id: string }) => {
    switch(id) {
        case 'studyTime': return <Clock className="h-4 w-4" />;
        case 'focusSession': return <Zap className="h-4 w-4" />;
        case 'tasks': return <ListTodo className="h-4 w-4" />;
        case 'checkIn': return <CalendarCheck className="h-4 w-4" />;
        default: return <ShieldQuestion className="h-4 w-4" />;
    }
}

function BannedView({ challenge, onLiftBan }: { challenge: ActiveChallenge, onLiftBan: () => void }) {
    const { currentUserData } = useUsers();
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        if (!challenge.banUntil) return;
        const interval = setInterval(() => {
            const diff = differenceInMilliseconds(new Date(challenge.banUntil!), new Date());
            if (diff <= 0) {
                setTimeLeft('Ban expired');
                clearInterval(interval);
                return;
            }
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
            const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
            const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
            setTimeLeft(`${h}:${m}:${s}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [challenge.banUntil]);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <Card className="w-full max-w-md border-destructive/50">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2 text-destructive">
                        <XCircle className="h-8 w-8"/> Challenge Failed
                    </CardTitle>
                    <CardDescription>
                        You have been banned from starting a new challenge for 3 days.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>Time remaining:</p>
                    <p className="text-4xl font-bold font-mono">{timeLeft}</p>
                    <div className="pt-4">
                        <p className="text-sm text-muted-foreground">
                            Don't want to wait? You can lift the ban immediately.
                        </p>
                         <Button onClick={onLiftBan} disabled={(currentUserData?.credits ?? 0) < 100} className="mt-2">
                            Lift Ban for 100 Credits
                        </Button>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/dashboard/challenger">&larr; Back to Challenger Zone</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

function GoalAchievedPopup() {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-8 right-0 flex items-center gap-2 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white shadow-lg"
        >
            <Check className="h-4 w-4" />
            Goal Achieved!
        </motion.div>
    )
}

export default function ChallengerPage({ config, isLocked = false }: ChallengerPageProps) {
    const { user } = useUser();
    const { activeChallenge, checkIn, loading, dailyProgress, failChallenge, liftChallengeBan, toggleTaskCompletion } = useChallenges();
    const [showStudyGoalPopup, setShowStudyGoalPopup] = useState(false);
    const [viewingDay, setViewingDay] = useState(config.currentDay);

    useEffect(() => {
        const studyGoal = dailyProgress?.['studyTime'];
        if (studyGoal?.completed) {
            setShowStudyGoalPopup(true);
            const timer = setTimeout(() => setShowStudyGoalPopup(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [dailyProgress]);
    
    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }
    
    if (config.status === 'failed') {
        return <BannedView challenge={config} onLiftBan={liftChallengeBan}/>
    }

    if (config.status === 'completed') {
        return (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <Card className="w-full max-w-md border-green-500/50">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 text-green-500">
                            <Trophy className="h-8 w-8"/> Challenge Completed!
                        </CardTitle>
                        <CardDescription>
                            Congratulations! You have successfully completed the "{config.title}". Your reward has been added.
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

    const currentDayProgress = config.progress[config.currentDay] || {};
    const allGoalsMet = config.dailyGoals.every(g => currentDayProgress[g.id]?.completed);
    
    let isCheckInDisabled = true;
    if(config.checkInTime) {
        const now = new Date();
        const [hours, minutes] = config.checkInTime.split(':').map(Number);
        const checkInDeadline = new Date();
        checkInDeadline.setHours(hours, minutes, 0, 0);
        if (now >= checkInDeadline) {
            isCheckInDisabled = false;
        }
    }
    
    const plannedTasksForDay = config.plannedTasks?.[viewingDay] || [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
                <p className="text-muted-foreground">Day {config.currentDay} of {config.duration}</p>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {config.dailyGoals.map(goal => {
                    const progress = currentDayProgress[goal.id] || { current: 0, completed: false };
                    const progressPercentage = Math.min((progress.current / goal.target) * 100, 100);
                    const isStudyGoal = goal.id === 'studyTime';
                    return (
                        <Card key={goal.id} className={cn("flex flex-col relative", progress.completed && "bg-green-500/10 border-green-500/50")}>
                             <AnimatePresence>
                                {isStudyGoal && showStudyGoalPopup && <GoalAchievedPopup />}
                            </AnimatePresence>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium">{goal.description}</CardTitle>
                                <GoalIcon id={goal.id} />
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-end">
                                <Progress value={progressPercentage} className="h-2" indicatorClassName={cn(isStudyGoal && "animated-rainbow-progress")} />
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
            
            {plannedTasksForDay.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Day {viewingDay}'s Tasks</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {plannedTasksForDay.map(task => (
                             <div 
                                key={task.id}
                                className={cn(
                                    "flex items-center gap-4 rounded-lg border p-3 pl-4 transition-colors",
                                    task.completed ? "bg-muted/50" : ""
                                )}
                            >
                                <Checkbox
                                    id={task.id}
                                    checked={task.completed}
                                    onCheckedChange={() => toggleTaskCompletion(config.currentDay, task.id)}
                                    disabled={viewingDay !== config.currentDay}
                                />
                                <label
                                    htmlFor={task.id}
                                    className={cn("flex-1 text-sm font-medium", task.completed && "text-muted-foreground line-through", viewingDay === config.currentDay && 'cursor-pointer')}
                                >
                                    {task.text}
                                </label>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Live Study Tracker</CardTitle>
                        <CardDescription>Use this tracker to log time towards your study goal.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TimeTracker />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Challenge Roadmap</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-7 gap-2">
                         {Array.from({ length: config.duration }).map((_, i) => {
                            const day = i + 1;
                            const isCompleted = !!config.progress[day] && config.dailyGoals.every(g => config.progress[day]?.[g.id]?.completed);
                            const isCurrent = day === config.currentDay;
                            const isViewing = day === viewingDay;

                            return (
                                <button
                                    key={day}
                                    onClick={() => day <= config.currentDay && setViewingDay(day)}
                                    disabled={day > config.currentDay}
                                    className={cn(
                                        "h-12 w-12 flex flex-col items-center justify-center rounded-lg border-2 text-xs font-bold transition-all",
                                        isCurrent && "border-primary",
                                        isViewing && "ring-2 ring-primary/80 scale-110",
                                        isCompleted && "bg-green-500/20 border-green-500 text-green-500",
                                        day < config.currentDay && !isCompleted && "bg-destructive/20 border-destructive text-destructive",
                                        day > config.currentDay && "bg-muted/50 opacity-60 cursor-not-allowed"
                                    )}
                                >
                                   <span> DAY</span><span>{day}</span>
                                </button>
                            )
                         })}
                    </CardContent>
                </Card>
            </div>
             <div className="space-y-6">
                <div className="flex justify-center items-center flex-col gap-2">
                    <Button size="lg" onClick={checkIn} disabled={isCheckInDisabled || allGoalsMet}>
                        {allGoalsMet ? <CheckCircle className="mr-2"/> : <CalendarCheck className="mr-2"/>}
                        {allGoalsMet ? 'All Goals Met for Today!' : "Daily Check-in"}
                    </Button>
                    {config.checkInTime && <p className="text-sm text-muted-foreground">Required check-in time: {config.checkInTime}</p>}
                </div>
                 <Card>
                    <CardHeader><CardTitle>Rules & Info</CardTitle></CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <ul className="space-y-2 text-muted-foreground list-disc pl-5">
                            {config.rules.map((rule, i) => <li key={i}>{rule}</li>)}
                        </ul>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full"><XCircle className="mr-2"/> Forfeit Challenge</Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle/>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>Forfeiting will end the challenge, penalize you 50 credits, and ban you from starting new challenges for 3 days.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => failChallenge(false)}>Yes, Forfeit</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
