'use client';
import { useState } from 'react';
import { Roadmap, RoadmapCategory, RoadmapTask } from '@/hooks/use-roadmaps';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, PlusCircle, ArrowLeft, ArrowRight, CheckCircle, Palette } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface TaskPlannerProps {
    roadmap: Roadmap;
    onComplete: (milestones: Roadmap['milestones']) => void;
    onCancel: () => void;
}

const categoryColors = [
    '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899'
];

export function TaskPlanner({ roadmap, onComplete, onCancel }: TaskPlannerProps) {
    const [currentPage, setCurrentPage] = useState(1);
    // Initialize state from existing roadmap milestones
    const [milestones, setMilestones] = useState<Roadmap['milestones']>(roadmap.milestones || []);
    const totalPages = Math.ceil(roadmap.duration / 7);

    const startDay = (currentPage - 1) * 7 + 1;
    const endDay = Math.min(currentPage * 7, roadmap.duration);
    
    const getMilestoneForDay = (day: number) => milestones.find(m => m.day === day);
    
    const updateMilestone = (day: number, newCategories: RoadmapCategory[]) => {
        const existingMilestoneIndex = milestones.findIndex(m => m.day === day);
        if (existingMilestoneIndex > -1) {
            const newMilestones = [...milestones];
            newMilestones[existingMilestoneIndex].categories = newCategories;
            setMilestones(newMilestones);
        } else {
            setMilestones([...milestones, { id: `day-${day}`, day, categories: newCategories }]);
        }
    };


    const addCategory = (day: number) => {
        const dayMilestone = getMilestoneForDay(day);
        const newCategories = [...(dayMilestone?.categories || [])];
        newCategories.push({
            id: `cat-${Date.now()}`,
            title: 'New Category',
            color: categoryColors[Math.floor(Math.random() * categoryColors.length)],
            tasks: [{ id: `task-${Date.now()}`, text: '', completed: false }]
        });
        updateMilestone(day, newCategories);
    };

    const removeCategory = (day: number, catIndex: number) => {
        const dayMilestone = getMilestoneForDay(day);
        if(!dayMilestone) return;
        const newCategories = dayMilestone.categories.filter((_, i) => i !== catIndex);
        updateMilestone(day, newCategories);
    };

    const updateCategoryField = (day: number, catIndex: number, field: 'title' | 'color', value: string) => {
        const dayMilestone = getMilestoneForDay(day);
        if(!dayMilestone) return;
        const newCategories = [...dayMilestone.categories];
        (newCategories[catIndex] as any)[field] = value;
        updateMilestone(day, newCategories);
    };

    const addTask = (day: number, catIndex: number) => {
        const dayMilestone = getMilestoneForDay(day);
        if(!dayMilestone) return;
        const newCategories = [...dayMilestone.categories];
        newCategories[catIndex].tasks.push({ id: `task-${Date.now()}-${Math.random()}`, text: '', completed: false });
        updateMilestone(day, newCategories);
    };
    
    const removeTask = (day: number, catIndex: number, taskIndex: number) => {
        const dayMilestone = getMilestoneForDay(day);
        if(!dayMilestone) return;
        const newCategories = [...dayMilestone.categories];
        newCategories[catIndex].tasks.splice(taskIndex, 1);
        updateMilestone(day, newCategories);
    };

     const handleTaskChange = (day: number, catIndex: number, taskIndex: number, text: string) => {
        const dayMilestone = getMilestoneForDay(day);
        if(!dayMilestone) return;
        const newCategories = [...dayMilestone.categories];
        newCategories[catIndex].tasks[taskIndex].text = text;
        updateMilestone(day, newCategories);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Plan Your Roadmap Tasks</h1>
            <p className="text-muted-foreground">Map out your to-do list for each day of your roadmap. A good plan is half the battle won.</p>
            
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
                                const dayCategories = getMilestoneForDay(day)?.categories || [];
                                return (
                                    <div key={day} className="p-4 border rounded-lg space-y-4 bg-muted/20 h-fit">
                                        <h4 className="font-bold text-center">Day {day}</h4>
                                        {dayCategories.map((cat, catIndex) => (
                                            <div key={cat.id} className="p-3 rounded-lg border-l-4" style={{borderColor: cat.color}}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <Input 
                                                        value={cat.title} 
                                                        onChange={e => updateCategoryField(day, catIndex, 'title', e.target.value)}
                                                        className="h-8 border-0 font-semibold focus-visible:ring-1 focus-visible:ring-offset-0 bg-transparent"
                                                    />
                                                    <div className="flex items-center">
                                                         <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8"><Palette/></Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                <div className="grid grid-cols-6 gap-1 p-1">
                                                                     {categoryColors.map(color => (
                                                                        <DropdownMenuItem key={color} onSelect={() => updateCategoryField(day, catIndex, 'color', color)} className="p-0 cursor-pointer">
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
                <CardFooter className="flex justify-between items-center">
                    <div>
                         <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
                            <ArrowLeft className="mr-2"/> Previous
                        </Button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <Button variant="outline" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
                            Next <ArrowRight className="ml-2"/>
                        </Button>
                    </div>
                    <div>
                        <Button onClick={() => onComplete(milestones)}>
                            <CheckCircle className="mr-2"/> Save Plan
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
