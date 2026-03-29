
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ListTodo, Plus, Lock, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useIsolation, IsolationTask } from '@/hooks/use-isolation';
import { format, differenceInMinutes, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface TaskTerminalProps {
    dateKey: string;
    isCurrentDay: boolean;
}

export function TaskTerminal({ dateKey, isCurrentDay }: TaskTerminalProps) {
    const { activeSession, addIsolationTask, toggleIsolationTask } = useIsolation();
    const { toast } = useToast();
    const [newTask, setNewTask] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const tasks = activeSession?.dailyTasks?.[dateKey] || [];

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await addIsolationTask(dateKey, newTask.trim());
            setNewTask('');
            toast({ title: "Objective Etched", description: "This task is now part of your permanent record." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggle = (task: IsolationTask) => {
        if (!isCurrentDay) return;
        
        // Anti-Cheat: 1 hour cooldown check
        const minutesSinceCreation = differenceInMinutes(new Date(), parseISO(task.createdAt));
        if (minutesSinceCreation < 60 && !task.completed) {
            toast({ 
                variant: 'destructive', 
                title: "Protocol Delay", 
                description: `Cheating detected! You can only complete this objective ${60 - minutesSinceCreation} minutes from now.` 
            });
            return;
        }

        toggleIsolationTask(dateKey, task.id);
    };

    return (
        <Card className="bg-white/5 border-white/10 rounded-3xl overflow-hidden">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <ListTodo className="h-4 w-4 text-primary" />
                        Mission Objectives
                    </CardTitle>
                    {isCurrentDay && <Badge variant="outline" className="text-[8px] border-primary/20 text-primary">STRICT MODE</Badge>}
                </div>
                <CardDescription className="text-[10px]">Objectives are permanent. No deletions allowed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isCurrentDay && (
                    <form onSubmit={handleAddTask} className="flex gap-2">
                        <Input 
                            value={newTask} 
                            onChange={e => setNewTask(e.target.value)} 
                            placeholder="Add objective..." 
                            className="bg-black/40 border-white/10 h-10 text-xs"
                        />
                        <Button type="submit" size="icon" className="h-10 w-10 shrink-0" disabled={!newTask.trim()}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </form>
                )}

                <div className="space-y-2">
                    {tasks.map((task) => {
                        const canCheck = differenceInMinutes(new Date(), parseISO(task.createdAt)) >= 60;
                        return (
                            <div key={task.id} className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border transition-all",
                                task.completed ? "bg-green-500/10 border-green-500/20" : "bg-black/20 border-white/5"
                            )}>
                                <Checkbox 
                                    checked={task.completed} 
                                    onCheckedChange={() => handleToggle(task)}
                                    disabled={!isCurrentDay}
                                    className="border-white/20 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "text-xs font-bold truncate",
                                        task.completed ? "text-green-500/70 line-through" : "text-white"
                                    )}>
                                        {task.text}
                                    </p>
                                    {!task.completed && isCurrentDay && !canCheck && (
                                        <p className="text-[8px] text-amber-500 font-black uppercase flex items-center gap-1 mt-0.5">
                                            <Clock className="h-2 w-2" /> Cooldown Active
                                        </p>
                                    )}
                                </div>
                                {task.completed && <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />}
                            </div>
                        );
                    })}
                    {tasks.length === 0 && (
                        <div className="py-8 text-center opacity-20">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No Objectives Set</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function Badge({ children, variant, className }: any) {
    return <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border", className)}>{children}</span>;
}
