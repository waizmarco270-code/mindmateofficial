
'use client';
import { Roadmap, useRoadmaps } from '@/hooks/use-roadmaps';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, CheckCircle, CalendarDays, Milestone as MilestoneIcon, Clock } from 'lucide-react';
import { addDays, format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { useMemo } from 'react';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { TimeTracker } from '../tracker/time-tracker';

interface RoadmapViewProps {
    roadmap: Roadmap;
    onBack: () => void;
    onPlan: () => void;
}

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

export function RoadmapView({ roadmap, onBack, onPlan }: RoadmapViewProps) {
    const { toggleTaskCompletion, logStudyTime } = useRoadmaps();

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
                            {roadmap.targetExam.replace(/-/g, ' ')} - {roadmap.duration} Day Plan
                        </p>
                    </div>
                </div>
                 <Button variant="outline" onClick={onPlan} className="w-full">
                    <Edit className="mr-2 h-4 w-4" /> Plan / Edit Tasks
                </Button>
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
                 <Card>
                    <CardHeader>
                        <CardTitle>Mini Time Tracker</CardTitle>
                        <CardDescription>Track study time for this roadmap.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <TimeTracker />
                    </CardContent>
                </Card>
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
                                
                                if (!dayMilestone || dayMilestone.categories.length === 0) {
                                    return null;
                                }
                                
                                const isDayPast = isPast(dayDate) && !isToday(dayDate);
                                const isDayToday = isToday(dayDate);

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
                                                {dayMilestone.categories.map(category => (
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
                                                ))}
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
