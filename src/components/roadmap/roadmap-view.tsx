
'use client';
import { Roadmap, useRoadmaps } from '@/hooks/use-roadmaps';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, CheckCircle, CalendarDays, Milestone as MilestoneIcon } from 'lucide-react';
import { addDays, format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { useMemo } from 'react';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';

interface RoadmapViewProps {
    roadmap: Roadmap;
    onBack: () => void;
    onPlan: () => void;
}

export function RoadmapView({ roadmap, onBack, onPlan }: RoadmapViewProps) {
    const { toggleTaskCompletion } = useRoadmaps();

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
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
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
                 <Button variant="outline" onClick={onPlan}>
                    <Edit className="mr-2 h-4 w-4" /> Plan / Edit Tasks
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <Progress value={progress} className="h-4" />
                    <p className="text-sm text-muted-foreground mt-2 text-center">
                        {completedTasks} of {totalTasks} tasks completed ({progress.toFixed(0)}%)
                    </p>
                </CardContent>
            </Card>


            <div className="space-y-8">
                {Array.from({ length: roadmap.duration }).map((_, i) => {
                    const dayNumber = i + 1;
                    const dayMilestone = roadmap.milestones.find(m => m.day === dayNumber);
                    const dayDate = addDays(startDate, i);
                    
                    if (!dayMilestone || dayMilestone.categories.length === 0) {
                        return null; // Don't render days with no tasks planned
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
                                <p className="font-semibold text-muted-foreground">{format(dayDate, 'EEEE, d MMMM')}</p>
                                <div className="space-y-4 mt-2">
                                     {dayMilestone.categories.map(category => (
                                        <Card key={category.id} className="overflow-hidden">
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
        </div>
    );
}
