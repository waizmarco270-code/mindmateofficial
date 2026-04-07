'use client';
import { useState } from 'react';
import { PlannedTaskCategory } from '@/hooks/use-challenges';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, PlusCircle, ArrowLeft, ArrowRight, CheckCircle, Palette, X } from 'lucide-react';
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
        <div className="space-y-8 max-w-full">
            <div className="text-center space-y-2">
                <h3 className="text-3xl font-black italic uppercase text-primary tracking-tighter">Strategic Planner</h3>
                <p className="text-slate-400 text-sm font-medium">Map out your objectives for all {duration} days. This record is permanent.</p>
            </div>
            
            <Card className="max-w-6xl mx-auto border-white/5 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden shadow-2xl">
                <CardHeader className="border-b border-white/5 p-6 sm:p-8">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-black uppercase italic">Day Range: {startDay} — {endDay}</CardTitle>
                        <Badge variant="outline" className="font-black text-[10px]">Page {currentPage} / {totalPages}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
                        >
                             {Array.from({ length: endDay - startDay + 1 }).map((_, i) => {
                                const day = startDay + i;
                                const dayCategories = tasksByDay[day] || [];
                                return (
                                    <div key={day} className="p-5 rounded-3xl border border-white/5 bg-white/5 space-y-4 h-fit group/day transition-colors hover:border-primary/20">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground group-hover/day:text-primary transition-colors">Day {day}</h4>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10 text-primary" onClick={() => addCategory(day)}>
                                                <PlusCircle className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            {dayCategories.map((cat, catIndex) => (
                                                <div key={cat.id} className="p-4 rounded-2xl bg-black/20 border-l-4 space-y-3" style={{borderColor: cat.color}}>
                                                    <div className="flex items-center justify-between">
                                                        <Input 
                                                            value={cat.title} 
                                                            onChange={e => updateCategory(day, catIndex, 'title', e.target.value)}
                                                            className="h-7 border-none bg-transparent font-black uppercase text-[10px] tracking-widest p-0 focus-visible:ring-0"
                                                        />
                                                        <div className="flex items-center gap-1">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <button className="h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-white"><Palette className="h-3 w-3"/></button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent className="p-2 grid grid-cols-4 gap-1 min-w-0">
                                                                    {categoryColors.map(c => <button key={c} style={{backgroundColor: c}} className="h-5 w-5 rounded-full" onClick={() => updateCategory(day, catIndex, 'color', c)} />)}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                            <button className="h-5 w-5 flex items-center justify-center text-red-500/50 hover:text-red-500" onClick={() => removeCategory(day, catIndex)}><X className="h-3 w-3"/></button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {cat.tasks.map((task, taskIndex) => (
                                                            <div key={task.id} className="flex items-center gap-2">
                                                                <Input 
                                                                    value={task.text} 
                                                                    onChange={e => handleTaskChange(day, catIndex, taskIndex, e.target.value)}
                                                                    placeholder="Mission task..."
                                                                    className="h-8 text-xs bg-black/20 border-white/5 rounded-lg"
                                                                />
                                                                <button className="h-6 w-6 flex items-center justify-center text-red-500/30 hover:text-red-500" onClick={() => removeTask(day, catIndex, taskIndex)}><Trash2 className="h-3.5 w-3.5"/></button>
                                                            </div>
                                                        ))}
                                                        <button className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity pt-1" onClick={() => addTask(day, catIndex)}>
                                                            <PlusCircle className="h-3 w-3"/> Add Task
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {dayCategories.length === 0 && (
                                                <div className="py-8 text-center opacity-20 border-2 border-dashed border-white/10 rounded-2xl">
                                                    <PlusCircle className="h-6 w-6 mx-auto mb-2" />
                                                    <p className="text-[8px] font-black uppercase">No categories</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                             })}
                        </motion.div>
                    </AnimatePresence>
                </CardContent>
                <CardFooter className="flex justify-between items-center p-6 sm:p-8 border-t border-white/5 bg-black/20">
                    <Button variant="ghost" onClick={onCancel} className="text-slate-400 font-bold uppercase text-xs">ABORT PLAN</Button>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" className="rounded-xl h-12 w-12 border-white/10 bg-black/20" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
                            <ArrowLeft className="h-5 w-5"/>
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-xl h-12 w-12 border-white/10 bg-black/20" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
                            <ArrowRight className="h-5 w-5"/>
                        </Button>
                    </div>
                    <Button onClick={() => onComplete(tasksByDay)} className="h-14 px-8 rounded-2xl font-black text-sm uppercase italic shadow-xl shadow-primary/20">
                        COMMIT PLAN <CheckCircle className="ml-2 h-5 w-5"/>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

function Badge({ children, variant, className }: any) {
    return <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", className)}>{children}</span>;
}
