
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Play, Pause, MoreVertical, Trash2, Edit, Plus, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTimeTracker, type Subject } from '@/hooks/use-time-tracker';
import { useUser } from '@clerk/nextjs';

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

export function TimeTracker() {
    const { isSignedIn } = useUser();
    const {
        subjects,
        activeSubjectId,
        activeSubjectTime,
        totalTimeToday,
        handlePlayPause,
        addSubject,
        updateSubject,
        deleteSubject,
    } = useTimeTracker();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
    const [editText, setEditText] = useState('');
    const [editColor, setEditColor] = useState(subjectColors[0]);

    const activeSubject = useMemo(() => subjects.find(s => s.id === activeSubjectId), [subjects, activeSubjectId]);

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
        if (subjectToEdit) { // Editing existing
            updateSubject(subjectToEdit.id, { name: editText, color: editColor });
        } else { // Adding new
            addSubject({ name: editText, color: editColor });
        }
        setIsEditModalOpen(false);
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
                        <p className="font-semibold text-lg">{activeSubject?.name || 'Paused'}</p>
                    </div>
                    <p className="font-mono text-7xl font-bold tracking-tighter">
                        {formatTime(activeSubjectTime)}
                    </p>
                    <p className="text-sm text-primary-foreground/80 mt-2">
                        Total Today: {formatTime(totalTimeToday)}
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <h3 className="font-bold text-lg">Subjects</h3>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {subjects.map(subject => (
                            <div key={subject.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted">
                                <button onClick={() => handlePlayPause(subject.id)} style={{ color: subject.color }} disabled={!isSignedIn}>
                                    {activeSubjectId === subject.id ? (
                                        <Pause className="h-8 w-8" fill="currentColor" />
                                    ) : (
                                        <Play className="h-8 w-8" fill="currentColor" />
                                    )}
                                </button>
                                <span className="flex-1 font-medium">{subject.name}</span>
                                <span className="font-mono text-muted-foreground">{formatTime(subject.timeTracked)}</span>
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!isSignedIn}>
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handleEditClick(subject)}><Edit className="mr-2 h-4 w-4"/> Edit</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => deleteSubject(subject.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/> Delete</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                         {subjects.length === 0 && <p className="text-muted-foreground text-center py-4">No subjects added. Add one to start tracking!</p>}
                    </div>
                </CardContent>
                <CardFooter>
                     <Button variant="outline" onClick={handleAddNewClick} disabled={!isSignedIn}><Plus className="mr-2 h-4 w-4"/> Add Subject</Button>
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
