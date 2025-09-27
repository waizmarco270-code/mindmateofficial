
'use client';
import { Roadmap, useRoadmaps } from '@/hooks/use-roadmaps';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, CheckCircle, CalendarDays, Milestone as MilestoneIcon, Clock, Star, MessageSquare, Target, Play } from 'lucide-react';
import { addDays, format, isPast, isToday, endOfWeek, startOfWeek, differenceInSeconds } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { useState, useMemo, useEffect } from 'react';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { TimeTracker } from '../tracker/time-tracker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';


const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

interface WeeklyReflectionFormProps {
    weekStartDate: Date;
    roadmapId: string;
    onSave: () => void;
}

function WeeklyReflectionForm({ weekStartDate, roadmapId, onSave }: WeeklyReflectionFormProps) {
    const [rating, setRating] = useState(0);
    const [note, setNote] = useState('');
    const { addWeeklyReflection } = useRoadmaps();
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (rating === 0) {
            toast({ variant: 'destructive', title: 'Please provide a rating.' });
            return;
        }
        await addWeeklyReflection(roadmapId, format(weekStartDate, 'yyyy-MM-dd'), { rating, note });
        toast({ title: 'Reflection Saved!', description: 'Great job on completing another week.' });
        onSave();
    };

    return (
        <div className="space-y-4">
            <p className="text-center text-muted-foreground">Rate your progress and productivity for the week.</p>
            <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setRating(star)}>
                        <Star className={cn("h-8 w-8 transition-colors", rating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                    </button>
                ))}
            </div>
            <Textarea 
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="What went well? What could be improved? (Optional)"
                rows={4}
            />
            <Button onClick={handleSubmit} className="w-full">Save Reflection</Button>
        </div>
    );
}

function ExamCountdown({ examDate }: { examDate: Date }) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const interval = setInterval(() => {
            const totalSeconds = differenceInSeconds(examDate, new Date());
            if (totalSeconds <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                clearInterval(interval);
                return;
            }
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            setTimeLeft({ days, hours, minutes, seconds });
        }, 1000);
        return () => clearInterval(interval);
    }, [examDate]);

    if (!isClient) return null;

    return (
        <div className="grid grid-cols-4 gap-2 text-center font-mono">
            <div><p className="text-3xl font-bold">{String(timeLeft.days).padStart(2, '0')}</p><p className="text-xs text-muted-foreground">Days</p></div>
            <div><p className="text-3xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</p><p className="text-xs text-muted-foreground">Hours</p></div>
            <div><p className="text-3xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</p><p className="text-xs text-muted-foreground">Mins</p></div>
            <div><p className="text-3xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</p><p className="text-xs text-muted-foreground">Secs</p></div>
        </div>
    );
}

export function RoadmapView({ roadmap, onBack, onPlan }: { roadmap: Roadmap; onBack: () => void; onPlan: () => void; }) {
    const { toggleTaskCompletion } = useRoadmaps();
    const [isCountdownActive, setIsCountdownActive] = useState(false);

    const { totalTasks, completedTasks, progress } = useMemo(() => {
        const allTasks = roadmap.milestones.flatMap(m => m.categories.flatMap(c => c.tasks));
        const completed = allTasks.filter(t => t.completed).length;
        return {
            totalTasks: allTasks.length,
            completedTasks: completed,
            progress: allTasks.length > 0 ? (completed / allTasks.length) * 100 : 0
        };
    }, [roadmap.milestones]);

    const startDate = new Date(roadmap.startDate);
    const examDate = new Date(roadmap.examDate);
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
            {/* Left Panel - Details and Actions */}
            <div className="lg:col-span-4 space-y-6">
                 <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{roadmap.name}</h1>
                        <p className="text-muted-foreground capitalize">
                            {roadmap.duration} Day Plan
                        </p>
                    </div>
                </div>
                 <Button variant="outline" onClick={onPlan} className="w-full">
                    <Edit className="mr-2 h-4 w-4" /> Plan / Edit Tasks
                </Button>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Target className="text-destructive h-5 w-5"/> Countdown to Exam
                        </CardTitle>
                        <CardDescription>Target Date: {format(examDate, 'PPP')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isCountdownActive ? (
                            <ExamCountdown examDate={examDate} />
                        ) : (
                            <div className="text-center p-4">
                                <Button onClick={() => setIsCountdownActive(true)}>
                                    <Play className="mr-2 h-4 w-4"/> Start Countdown
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                
                <Card>
                    <CardHeader>
                        <CardTitle>Overall Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Progress value={progress} className="h-2" />
                        <p className="text-sm text-muted-foreground mt-2 text-center">
                            {completedTasks} of {totalTasks} tasks completed ({progress.toFixed(0)}%)
                        </p>
                    </CardContent>
                </Card>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full"><Clock className="mr-2 h-4 w-4"/> Open Time Tracker</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Time Tracker</DialogTitle>
                            <DialogDescription>Track study time for subjects in this roadmap.</DialogDescription>
                        </DialogHeader>
                        <TimeTracker />
                    </DialogContent>
                </Dialog>
            </div>
            
            {/* Right Panel - Timeline */}
            <Card className="lg:col-span-8 h-full flex flex-col">
                <CardHeader>
                    <CardTitle>Roadmap Timeline</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full pr-6">
                        <div className="space-y-8">
                            {Array.from({ length: roadmap.duration }).map((_, i) => {
                                const dayNumber = i + 1;
                                const dayMilestone = roadmap.milestones.find(m => m.day === dayNumber);
                                const dayDate = addDays(startDate, i);
                                const dateKey = format(dayDate, 'yyyy-MM-dd');
                                const timeTrackedToday = roadmap.dailyStudyTime?.[dateKey] || 0;
                                
                                const isDayPast = isPast(dayDate) && !isToday(dayDate);
                                const isDayToday = isToday(dayDate);
                                
                                // Weekly Reflection Logic
                                const isEndOfWeek = dayDate.getDay() === 0; // Sunday
                                const weekStartDate = startOfWeek(dayDate, { weekStartsOn: 1 });
                                const weekStartDateKey = format(weekStartDate, 'yyyy-MM-dd');
                                const reflection = roadmap.weeklyReflections?.[weekStartDateKey];
                                const showReflectionPrompt = isEndOfWeek && isDayPast && !reflection;

                                return (
                                    <div key={dayNumber} className="flex gap-4 sm:gap-6">
                                        <div className="flex flex-col items-center">
                                            <div className={cn(
                                                "flex h-12 w-12 items-center justify-center rounded-full border-2 font-bold text-lg",
                                                isDayToday ? "bg-primary text-primary-foreground border-primary" :
                                                isDayPast ? "bg-muted border-dashed" : "bg-muted/50"
                                            )}>
                                                {dayNumber}
                                            </div>
                                            <div className="w-0.5 flex-1 bg-border my-2"></div>
                                        </div>
                                        <div className="flex-1 pb-8">
                                            <div className="flex justify-between items-start">
                                                 <p className="font-semibold text-muted-foreground">{format(dayDate, 'EEEE, d MMMM')}</p>
                                                 {timeTrackedToday > 0 && (
                                                     <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                                                        <Clock className="h-4 w-4"/>
                                                        <span>{formatTime(timeTrackedToday)}</span>
                                                     </div>
                                                 )}
                                            </div>
                                            <div className="space-y-4 mt-2">
                                                {dayMilestone && dayMilestone.categories.length > 0 ? (
                                                    dayMilestone.categories.map(category => (
                                                        <Card key={category.id} className="overflow-hidden bg-background">
                                                            <div className="p-3 border-b flex items-center gap-3" style={{ borderLeft: `4px solid ${category.color}` }}>
                                                                <h4 className="font-semibold">{category.title}</h4>
                                                            </div>
                                                            <div className="p-3 space-y-3">
                                                                {category.tasks.map(task => (
                                                                    <div key={task.id} className="flex items-center gap-3">
                                                                        <Checkbox
                                                                            id={task.id}
                                                                            checked={task.completed}
                                                                            onCheckedChange={() => toggleTaskCompletion(roadmap.id, dayNumber, category.id, task.id)}
                                                                        />
                                                                        <label
                                                                            htmlFor={task.id}
                                                                            className={cn("text-sm", task.completed && "line-through text-muted-foreground")}
                                                                        >
                                                                            {task.text}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </Card>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-muted-foreground italic">No tasks planned for this day.</p>
                                                )}
                                                {showReflectionPrompt && (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" className="w-full">
                                                                <MessageSquare className="mr-2 h-4 w-4" /> Add Weekly Reflection
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Reflection for Week Ending {format(dayDate, 'd MMM')}</DialogTitle>
                                                            </DialogHeader>
                                                            <WeeklyReflectionForm roadmapId={roadmap.id} weekStartDate={weekStartDate} onSave={() => {}} />
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                                 {reflection && (
                                                    <Card className="bg-amber-500/10 border-amber-500/20">
                                                        <CardHeader>
                                                            <CardTitle className="text-base flex items-center justify-between">
                                                                <span>Weekly Reflection</span>
                                                                <div className="flex">{Array.from({length: 5}).map((_, i) => <Star key={i} className={cn("h-4 w-4", i < reflection.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50")} />)}</div>
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <p className="text-sm italic text-muted-foreground">"{reflection.note}"</p>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="flex gap-4 sm:gap-6">
                                <div className="flex flex-col items-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 border-2 border-green-500 font-bold text-lg text-green-500">
                                    <CheckCircle />
                                    </div>
                                </div>
                                <div className="flex-1 pt-2">
                                    <p className="font-bold text-lg">End of Roadmap!</p>
                                    <p className="text-muted-foreground">Congratulations on completing your plan.</p>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
