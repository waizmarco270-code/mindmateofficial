
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Play, Pause, MoreVertical, Trash2, Edit, Plus, Palette } from 'lucide-react';
import { format, formatISO } from 'date-fns';
import { cn } from '@/lib/utils';


const subjectColors = [
    '#ef4444', // red-500
    '#f97316', // orange-500
    '#eab308', // yellow-500
    '#84cc16', // lime-500
    '#22c55e', // green-500
    '#14b8a6', // teal-500
    '#06b6d4', // cyan-500
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#d946ef', // fuchsia-500
    '#ec4899', // pink-500
];

interface Subject {
    id: string;
    name: string;
    color: string;
    timeTracked: number; // in seconds
}

interface TimeTrackerState {
    subjects: Subject[];
    activeSubjectId: string | null;
    lastTick: number | null; // timestamp
}

export function TimeTracker() {
    const [state, setState] = useLocalStorage<TimeTrackerState>('timeTrackerState', {
        subjects: [
            { id: '1', name: 'English', color: subjectColors[0], timeTracked: 0 },
            { id: '2', name: 'Mathematics', color: subjectColors[1], timeTracked: 0 },
            { id: '3', name: 'Physics', color: subjectColors[2], timeTracked: 0 },
        ],
        activeSubjectId: null,
        lastTick: null,
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
    const [editText, setEditText] = useState('');
    const [editColor, setEditColor] = useState(subjectColors[0]);

    const activeTime = useMemo(() => {
        if (!state.activeSubjectId) return 0;
        const subject = state.subjects.find(s => s.id === state.activeSubjectId);
        return subject?.timeTracked ?? 0;
    }, [state.activeSubjectId, state.subjects]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (state.activeSubjectId && state.lastTick) {
            interval = setInterval(() => {
                const now = Date.now();
                const delta = (now - state.lastTick) / 1000; // seconds elapsed
                setState(prevState => {
                    const newSubjects = prevState.subjects.map(s => {
                        if (s.id === prevState.activeSubjectId) {
                            return { ...s, timeTracked: s.timeTracked + delta };
                        }
                        return s;
                    });
                    return { ...prevState, subjects: newSubjects, lastTick: now };
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [state.activeSubjectId, state.lastTick, setState]);

    const handlePlayPause = (subjectId: string) => {
        setState(prevState => {
            if (prevState.activeSubjectId === subjectId) {
                // Pausing the current subject
                return { ...prevState, activeSubjectId: null, lastTick: null };
            } else {
                // Starting a new subject (or switching)
                return { ...prevState, activeSubjectId: subjectId, lastTick: Date.now() };
            }
        });
    };
    
    const handleEditClick = (subject: Subject) => {
        setSubjectToEdit(subject);
        setEditText(subject.name);
        setEditColor(subject.color);
        setIsEditModalOpen(true);
    };
    
    const handleAddNewClick = () => {
        setSubjectToEdit(null);
        setEditText('');
        setEditColor(subjectColors[Math.floor(Math.random() * subjectColors.length)]);
        setIsEditModalOpen(true);
    };

    const handleSaveSubject = () => {
        if (!editText.trim()) return;
        setState(prevState => {
            if (subjectToEdit) { // Editing existing
                const newSubjects = prevState.subjects.map(s => s.id === subjectToEdit.id ? { ...s, name: editText, color: editColor } : s);
                return { ...prevState, subjects: newSubjects };
            } else { // Adding new
                const newSubject: Subject = {
                    id: Date.now().toString(),
                    name: editText,
                    color: editColor,
                    timeTracked: 0
                };
                return { ...prevState, subjects: [ ...prevState.subjects, newSubject ] };
            }
        });
        setIsEditModalOpen(false);
    };

    const handleDeleteSubject = (subjectId: string) => {
        setState(prevState => {
            // If deleting the active subject, stop the timer
            const nextActiveId = prevState.activeSubjectId === subjectId ? null : prevState.activeSubjectId;
            const nextLastTick = nextActiveId ? prevState.lastTick : null;

            return {
                ...prevState,
                subjects: prevState.subjects.filter(s => s.id !== subjectId),
                activeSubjectId: nextActiveId,
                lastTick: nextLastTick
            }
        });
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <>
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-2xl shadow-primary/20">
                <CardContent className="p-6 text-center">
                    <div className="flex justify-between items-center text-primary-foreground/80 mb-4">
                        <p className="font-semibold">{format(new Date(), 'eeee, MM/dd')}</p>
                        <p className="font-semibold">D-Day</p>
                    </div>
                    <p className="font-mono text-7xl font-bold tracking-tighter">
                        {formatTime(activeTime)}
                    </p>
                    <p className="text-sm text-primary-foreground/80 mt-2">
                        Break 00m 00s
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <h3 className="font-bold text-lg">Subjects</h3>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {state.subjects.map(subject => (
                            <div key={subject.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted">
                                <button onClick={() => handlePlayPause(subject.id)} style={{ color: subject.color }}>
                                    {state.activeSubjectId === subject.id ? (
                                        <Pause className="h-8 w-8" fill="currentColor" />
                                    ) : (
                                        <Play className="h-8 w-8" fill="currentColor" />
                                    )}
                                </button>
                                <span className="flex-1 font-medium">{subject.name}</span>
                                <span className="font-mono text-muted-foreground">{formatTime(subject.timeTracked)}</span>
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleEditClick(subject)}><Edit className="mr-2 h-4 w-4"/> Edit</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDeleteSubject(subject.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/> Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter>
                     <Button variant="outline" onClick={handleAddNewClick}><Plus className="mr-2 h-4 w-4"/> Add Subject</Button>
                </CardFooter>
            </Card>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{subjectToEdit ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="subject-name">Subject Name</Label>
                            <Input id="subject-name" value={editText} onChange={e => setEditText(e.target.value)} placeholder="e.g. Organic Chemistry"/>
                        </div>
                        <div className="space-y-2">
                            <Label>Color</Label>
                             <div className="grid grid-cols-6 gap-2">
                                {subjectColors.map(color => (
                                    <button 
                                        key={color}
                                        style={{ backgroundColor: color }}
                                        className={cn("h-10 w-10 rounded-full border-2", editColor === color ? 'border-foreground' : 'border-transparent')}
                                        onClick={() => setEditColor(color)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                         <Button onClick={handleSaveSubject}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
