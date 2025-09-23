
'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Sparkles, AlertTriangle, ShieldCheck, Trophy, CalendarCheck, Clock, ListTodo } from 'lucide-react';
import { useChallenges, type DailyGoal, type PlannedTaskCategory } from '@/hooks/use-challenges';
import { motion, AnimatePresence } from 'framer-motion';
import { useUsers } from '@/hooks/use-admin';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { TaskPlanner } from '@/components/challenger/task-planner';


export default function CreateChallengePage() {
    const router = useRouter();
    const { toast } = useToast();
    const { startChallenge, loading, activeChallenge } = useChallenges();
    const { currentUserData } = useUsers();

    const [step, setStep] = useState(1);
    const [challengeName, setChallengeName] = useState('');
    const [duration, setDuration] = useState(7);
    const [checkInTime, setCheckInTime] = useState('06:00');
    const [studyHours, setStudyHours] = useState(2);
    const [focusSessions, setFocusSessions] = useState(1);
    const [prePlanTasks, setPrePlanTasks] = useState(false);
    const [isPlanning, setIsPlanning] = useState(false);


    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const { entryFee, reward } = useMemo(() => {
        let difficulty = 0;
        difficulty += duration * 1.5; 
        difficulty += studyHours * 3; 
        difficulty += focusSessions * 5; 
        
        const baseFee = 25;
        const baseReward = 60;

        const calculatedFee = Math.round(baseFee + (difficulty * 0.75));
        const calculatedReward = Math.round(baseReward + (difficulty * 2));
        
        return { entryFee: calculatedFee, reward: calculatedReward };
    }, [duration, studyHours, focusSessions]);

    const startChallengeFlow = async (finalTasks?: Record<number, PlannedTaskCategory[]>) => {
         if (!challengeName.trim()) {
            toast({ variant: 'destructive', title: "Challenge needs a name!" });
            return;
        }

        const dailyGoals: DailyGoal[] = [];
        if (studyHours > 0) dailyGoals.push({ id: 'studyTime', description: `Study for ${studyHours}+ hours`, target: studyHours * 3600 });
        if (focusSessions > 0) dailyGoals.push({ id: 'focusSession', description: `Complete ${focusSessions}+ Focus Session(s)`, target: focusSessions });
        dailyGoals.push({ id: 'tasks', description: 'Complete all daily tasks', target: 1 });
        dailyGoals.push({ id: 'checkIn', description: `Check-in after ${checkInTime}`, target: 1 });

        await startChallenge({
            id: `custom-${Date.now()}`,
            title: challengeName,
            isCustom: true,
            duration,
            entryFee,
            reward,
            checkInTime,
            description: `A custom ${duration}-day challenge.`,
            dailyGoals,
            rules: ["You must complete all your custom daily goals before midnight each day.", "Check-in time is strict. Missing it fails the day.", "Failure to complete any goal means the challenge is failed.", "The entry fee is refunded along with the reward upon successful completion."],
            eliteBadgeDays: 0,
            plannedTasks: finalTasks,
        });
        
        router.push('/dashboard/challenger/custom');
    }
    
    const handleConfirmation = () => {
        if (prePlanTasks) {
            setIsPlanning(true);
        } else {
            startChallengeFlow();
        }
    };
    
    if (isPlanning) {
        return <TaskPlanner duration={duration} onComplete={startChallengeFlow} onCancel={() => setIsPlanning(false)} />
    }

    if (activeChallenge) {
        let redirectPath = '/dashboard/challenger';
        if (activeChallenge.isCustom) {
            redirectPath = '/dashboard/challenger/custom';
        }
        return (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <Card className="w-full max-w-md border-amber-500/50">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2 text-amber-500">
                            <ShieldCheck className="h-8 w-8"/> Challenge in Progress
                        </CardTitle>
                        <CardDescription>
                            You already have an active challenge. You can only create a new one after your current challenge ends.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href={redirectPath}>&larr; Back to Your Challenge</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                 <Link href="/dashboard/challenger" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Challenger Zone</Link>
                <h1 className="text-3xl font-bold tracking-tight">Create Your Own Challenge</h1>
                <p className="text-muted-foreground">Forge your own path to discipline. Set your goals and conquer them.</p>
            </div>
            
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                     <p className="font-bold text-lg text-primary text-center">Step {step} of 3</p>
                </CardHeader>
                <CardContent className="min-h-[350px]">
                    <AnimatePresence mode="wait">
                         <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                        >
                            {step === 1 && (
                                <div className="space-y-8">
                                    <h3 className="text-2xl font-bold text-center">Challenge Basics</h3>
                                    <div className="space-y-2">
                                        <Label htmlFor="challenge-name">Challenge Name</Label>
                                        <Input id="challenge-name" value={challengeName} onChange={e => setChallengeName(e.target.value)} placeholder="e.g., 'JEE Final Push'"/>
                                    </div>
                                    <div className="space-y-3">
                                        <Label>Duration ({duration} days)</Label>
                                        <Slider value={[duration]} onValueChange={(v) => setDuration(v[0])} min={3} max={180} step={1} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="check-in-time">Daily Check-in Time</Label>
                                        <Input id="check-in-time" type="time" value={checkInTime} onChange={e => setCheckInTime(e.target.value)}/>
                                    </div>
                                </div>
                            )}
                             {step === 2 && (
                                <div className="space-y-8">
                                    <h3 className="text-2xl font-bold text-center">Daily Goals</h3>
                                    <div className="space-y-3">
                                        <Label>Minimum Daily Study Time ({studyHours} hours)</Label>
                                        <Slider value={[studyHours]} onValueChange={(v) => setStudyHours(v[0])} min={1} max={12} step={1} />
                                    </div>
                                     <div className="space-y-3">
                                        <Label>Minimum Daily Focus Sessions ({focusSessions})</Label>
                                        <Slider value={[focusSessions]} onValueChange={(v) => setFocusSessions(v[0])} min={0} max={5} step={1} />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox id="pre-plan-tasks" checked={prePlanTasks} onCheckedChange={(checked) => setPrePlanTasks(Boolean(checked))} />
                                        <Label htmlFor="pre-plan-tasks">Plan all daily tasks before starting the challenge?</Label>
                                    </div>
                                </div>
                            )}
                             {step === 3 && (
                                <div className="space-y-6 text-center">
                                    <h3 className="text-2xl font-bold">Review & Start</h3>
                                    <p className="text-muted-foreground">This is your custom challenge. Good luck!</p>
                                     <Card className="text-left">
                                        <CardHeader><CardTitle>{challengeName || "Your Custom Challenge"}</CardTitle><CardDescription>{duration} days</CardDescription></CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <h4 className="font-semibold flex items-center gap-2"><CalendarCheck className="h-5 w-5"/> Main Goals</h4>
                                                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground mt-2">
                                                    <li>Check-in daily after <span className="font-bold text-primary">{checkInTime}</span>.</li>
                                                    {studyHours > 0 && <li>Study for at least {studyHours} hours.</li>}
                                                    {focusSessions > 0 && <li>Complete {focusSessions} focus session(s).</li>}
                                                    <li>Complete all planned daily tasks.</li>
                                                </ul>
                                            </div>
                                            {prePlanTasks && (
                                                <div>
                                                    <h4 className="font-semibold flex items-center gap-2"><ListTodo className="h-5 w-5"/> Task Planning</h4>
                                                    <p className="text-sm text-muted-foreground mt-2">You will be prompted to plan your tasks for all {duration} days before the challenge begins.</p>
                                                </div>
                                            )}
                                        </CardContent>
                                     </Card>
                                    <div className="flex justify-around items-center text-center">
                                        <div className="space-y-1"><p className="text-sm text-muted-foreground">Entry Fee</p><p className="text-2xl font-bold">{entryFee} Credits</p></div>
                                        <div className="space-y-1"><p className="text-sm text-muted-foreground">Reward</p><p className="text-2xl font-bold text-green-500">+{reward} Credits</p></div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </CardContent>
                 <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={prevStep} disabled={step === 1}>
                        <ArrowLeft className="mr-2"/> Previous
                    </Button>
                     {step < 3 ? (
                        <Button onClick={nextStep}>
                            Next <ArrowRight className="mr-2"/>
                        </Button>
                    ) : (
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button disabled={loading || (currentUserData?.credits ?? 0) < entryFee}>
                                    <Sparkles className="mr-2"/> Start Challenge
                                </Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Ready to Begin?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        An entry fee of <span className="font-bold">{entryFee} credits</span> will be deducted. You will get it back, plus the reward, if you complete the challenge. This cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleConfirmation}>Yes, Start My Challenge</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
