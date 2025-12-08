
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Group } from '@/context/groups-context';
import { Loader2, Play, Users, Zap, CheckCircle, Plus, Trash2, Clock, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';


interface GroupFocusProps {
    group: Group;
}

const DURATION_OPTIONS = [
    { label: "25 min", seconds: 1500 },
    { label: "50 min", seconds: 3000 },
    { label: "90 min", seconds: 5400 },
];

export function GroupFocus({ group }: GroupFocusProps) {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [sessionDuration, setSessionDuration] = useState(1500);
    const [tasks, setTasks] = useState<{ id: number, text: string, completed: boolean }[]>([]);
    const [newTask, setNewTask] = useState('');

    const handleAddTask = () => {
        if (newTask.trim()) {
            setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
            setNewTask('');
        }
    };

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const removeTask = (id: number) => {
        setTasks(tasks.filter(t => t.id !== id));
    };
    
    if (isSessionActive) {
        return (
            <Card className="bg-gradient-to-br from-green-900/50 to-slate-900 border-green-700/50 shadow-lg shadow-green-500/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-400">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                            <Zap />
                        </motion.div>
                        Group Focus Session
                    </CardTitle>
                    <CardDescription>Locked in for {sessionDuration / 60} minutes.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2"><Clock/> Timer</h4>
                        <div className="text-6xl font-bold font-mono text-center py-8 bg-black/20 rounded-lg">
                           {(sessionDuration / 60).toString().padStart(2, '0')}:00
                        </div>
                    </div>
                     <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2"><Users/> Active Members</h4>
                        <div className="space-y-2 p-3 bg-black/20 rounded-lg max-h-48 overflow-y-auto">
                            {/* Placeholder for now */}
                            <p className="text-sm text-muted-foreground p-4 text-center">Live member list coming soon!</p>
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <h4 className="font-semibold">Session To-Do List</h4>
                         <div className="space-y-2">
                             {tasks.map(task => (
                                <div key={task.id} className="flex items-center gap-3 p-2 bg-black/20 rounded-md">
                                    <button onClick={() => toggleTask(task.id)}>
                                        <div className="h-5 w-5 rounded-sm border-2 border-primary flex items-center justify-center">
                                            {task.completed && <Check className="h-4 w-4 text-primary"/>}
                                        </div>
                                    </button>
                                    <span className={task.completed ? 'line-through text-muted-foreground' : ''}>{task.text}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-auto" onClick={() => removeTask(task.id)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                             ))}
                             <div className="flex gap-2">
                                <Input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Add a session goal..."/>
                                <Button onClick={handleAddTask}><Plus className="mr-2"/> Add</Button>
                             </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="destructive" onClick={() => setIsSessionActive(false)}>
                        <X className="mr-2 h-4 w-4" />
                        End Session
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="relative group overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950">
             <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(to_bottom,white_10%,transparent_70%)] group-hover:opacity-100 transition-opacity duration-300"></div>
            <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-3">
                    <Zap className="h-6 w-6 text-yellow-400"/>
                    Clan Study Hub
                </CardTitle>
                <CardDescription>Start a group focus session to study with your clan and earn massive XP.</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4 text-center">
                <p className="font-semibold">Choose a session duration:</p>
                <div className="flex justify-center gap-4">
                    {DURATION_OPTIONS.map(opt => (
                         <Button key={opt.seconds} variant={sessionDuration === opt.seconds ? 'default' : 'secondary'} onClick={() => setSessionDuration(opt.seconds)}>{opt.label}</Button>
                    ))}
                </div>
                 <Button size="lg" className="w-full sm:w-auto" onClick={() => setIsSessionActive(true)}>
                    <Play className="mr-2"/> Start Group Focus
                </Button>
            </CardContent>
        </Card>
    );
}
