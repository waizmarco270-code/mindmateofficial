
'use client';
import { useState } from 'react';
import { PlannedTask } from '@/hooks/use-challenges';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, PlusCircle, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface TaskPlannerProps {
    duration: number;
    onComplete: (tasks: Record<number, PlannedTask[]>) => void;
    onCancel: () => void;
}

export function TaskPlanner({ duration, onComplete, onCancel }: TaskPlannerProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [tasksByDay, setTasksByDay] = useState<Record<number, PlannedTask[]>>({});
    const totalPages = Math.ceil(duration / 7);

    const startDay = (currentPage - 1) * 7 + 1;
    const endDay = Math.min(currentPage * 7, duration);

    const handleTaskChange = (day: number, taskIndex: number, text: string) => {
        const newTasks = { ...tasksByDay };
        if (!newTasks[day]) newTasks[day] = [];
        newTasks[day][taskIndex].text = text;
        setTasksByDay(newTasks);
    };

    const addTask = (day: number) => {
        const newTasks = { ...tasksByDay };
        if (!newTasks[day]) newTasks[day] = [];
        newTasks[day].push({ id: `task-${Date.now()}-${Math.random()}`, text: '', completed: false });
        setTasksByDay(newTasks);
    };

    const removeTask = (day: number, taskIndex: number) => {
        const newTasks = { ...tasksByDay };
        if (!newTasks[day]) return;
        newTasks[day].splice(taskIndex, 1);
        setTasksByDay(newTasks);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Plan Your Challenge Tasks</h1>
            <p className="text-muted-foreground">Map out your to-do list for the upcoming challenge. A good plan is half the battle won.</p>
            
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Challenge Planner: Days {startDay} - {endDay}</CardTitle>
                    <CardDescription>Page {currentPage} of {totalPages}</CardDescription>
                </CardHeader>
                <CardContent className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.from({ length: endDay - startDay + 1 }).map((_, i) => {
                                    const day = startDay + i;
                                    const dayTasks = tasksByDay[day] || [];
                                    return (
                                        <div key={day} className="p-4 border rounded-lg space-y-3 bg-muted/20">
                                            <h4 className="font-bold">Day {day}</h4>
                                            <div className="space-y-2">
                                                {dayTasks.map((task, taskIndex) => (
                                                    <div key={taskIndex} className="flex items-center gap-2">
                                                        <Input 
                                                            value={task.text}
                                                            onChange={(e) => handleTaskChange(day, taskIndex, e.target.value)}
                                                            placeholder={`Task ${taskIndex + 1}`}
                                                        />
                                                        <Button variant="ghost" size="icon" onClick={() => removeTask(day, taskIndex)}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => addTask(day)}>
                                                <PlusCircle className="mr-2 h-4 w-4"/> Add Task
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div>
                         <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
                            <ArrowLeft className="mr-2"/> Previous
                        </Button>
                        <Button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
                            Next <ArrowRight className="ml-2"/>
                        </Button>
                    </div>
                    <div>
                        <Button onClick={() => onComplete(tasksByDay)}>
                            <CheckCircle className="mr-2"/> Finish Planning & Start
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
