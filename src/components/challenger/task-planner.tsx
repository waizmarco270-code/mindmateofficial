
'use client';
import { useState } from 'react';
import { PlannedTaskCategory } from '@/hooks/use-challenges';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, PlusCircle, ArrowLeft, ArrowRight, CheckCircle, Palette } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface TaskPlannerProps {
    duration: number;
    onComplete: (tasks: Record<number, PlannedTaskCategory[]>) => void;
    onCancel: () => void;
}

const categoryColors = [
    '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899'
];

export function TaskPlanner({ duration, onComplete, onCancel }: TaskPlannerProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [tasksByDay, setTasksByDay] = useState<Record<number, PlannedTaskCategory[]>>({});
    const totalPages = Math.ceil(duration / 7);

    const startDay = (currentPage - 1) * 7 + 1;
    const endDay = Math.min(currentPage * 7, duration);

    const addCategory = (day: number) => {
        const newTasks = { ...tasksByDay };
        if (!newTasks[day]) newTasks[day] = [];
        newTasks[day].push({
            id: `cat-${Date.now()}`,
            title: 'New Category',
            color: categoryColors[Math.floor(Math.random() * categoryColors.length)],
            tasks: [{ id: `task-${Date.now()}`, text: '', completed: false }]
        });
        setTasksByDay(newTasks);
    };

    const removeCategory = (day: number, catIndex: number) => {
        const newTasks = { ...tasksByDay };
        newTasks[day].splice(catIndex, 1);
        setTasksByDay(newTasks);
    };

    const updateCategory = (day: number, catIndex: number, field: 'title' | 'color', value: string) => {
        const newTasks = { ...tasksByDay };
        (newTasks[day][catIndex] as any)[field] = value;
        setTasksByDay(newTasks);
    };

    const addTask = (day: number, catIndex: number) => {
        const newTasks = { ...tasksByDay };
        newTasks[day][catIndex].tasks.push({ id: `task-${Date.now()}-${Math.random()}`, text: '', completed: false });
        setTasksByDay(newTasks);
    };
    
    const removeTask = (day: number, catIndex: number, taskIndex: number) => {
        const newTasks = { ...tasksByDay };
        newTasks[day][catIndex].tasks.splice(taskIndex, 1);
        setTasksByDay(newTasks);
    };

     const handleTaskChange = (day: number, catIndex: number, taskIndex: number, text: string) => {
        const newTasks = { ...tasksByDay };
        newTasks[day][catIndex].tasks[taskIndex].text = text;
        setTasksByDay(newTasks);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Plan Your Challenge Tasks</h1>
            <p className="text-muted-foreground">Map out your to-do list for the upcoming challenge. A good plan is half the battle won.</p>
            
            <Card className="max-w-6xl mx-auto">
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
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                        >
                             {Array.from({ length: endDay - startDay + 1 }).map((_, i) => {
                                const day = startDay + i;
                                const dayCategories = tasksByDay[day] || [];
                                return (
                                    <div key={day} className="p-4 border rounded-lg space-y-4 bg-muted/20 h-fit">
                                        <h4 className="font-bold text-center">Day {day}</h4>
                                        {dayCategories.map((cat, catIndex) => (
                                            <div key={cat.id} className="p-3 rounded-lg border-l-4" style={{borderColor: cat.color}}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <Input 
                                                        value={cat.title} 
                                                        onChange={e => updateCategory(day, catIndex, 'title', e.target.value)}
                                                        className="h-8 border-0 font-semibold focus-visible:ring-1 focus-visible:ring-offset-0"
                                                    />
                                                    <div className="flex items-center">
                                                         <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8"><Palette/></Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                <div className="grid grid-cols-6 gap-1 p-1">
                                                                     {categoryColors.map(color => (
                                                                        <DropdownMenuItem key={color} onSelect={() => updateCategory(day, catIndex, 'color', color)} className="p-0">
                                                                            <div className="h-6 w-6 rounded-full" style={{backgroundColor: color}}></div>
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                </div>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeCategory(day, catIndex)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    {cat.tasks.map((task, taskIndex) => (
                                                        <div key={task.id} className="flex items-center gap-1">
                                                            <Input 
                                                                value={task.text} 
                                                                onChange={e => handleTaskChange(day, catIndex, taskIndex, e.target.value)}
                                                                placeholder={`Task ${taskIndex + 1}`}
                                                                className="h-8"
                                                            />
                                                             <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeTask(day, catIndex, taskIndex)}><Trash2 className="h-3 w-3 text-destructive"/></Button>
                                                        </div>
                                                    ))}
                                                     <Button variant="outline" size="sm" className="w-full" onClick={() => addTask(day, catIndex)}>
                                                        <PlusCircle className="mr-2 h-3 w-3"/> Task
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        <Button variant="outline" className="w-full" onClick={() => addCategory(day)}>
                                            <PlusCircle className="mr-2 h-4 w-4"/> Add Category
                                        </Button>
                                    </div>
                                )
                             })}
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
