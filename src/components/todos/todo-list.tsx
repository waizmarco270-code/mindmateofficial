
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Award, Flag, Edit, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useUsers } from '@/hooks/use-admin';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: TaskPriority;
}

interface DailyTasks {
  date: string; // YYYY-MM-DD
  tasks: Task[];
  creditClaimed: boolean;
}

export function TodoList() {
  const { toast } = useToast();
  const { user } = useUser();
  const { addCreditsToUser, incrementDailyTasksCompleted } = useUsers();
  const todayString = format(new Date(), 'yyyy-MM-dd');
  
  const [todaysData, setTodaysData] = useState<DailyTasks>({ date: todayString, tasks: [], creditClaimed: false });
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('low');
  const [loading, setLoading] = useState(true);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const dailyDocRef = useMemo(() => {
    if (!user) return null;
    return doc(db, 'users', user.id, 'dailyTasks', todayString);
  }, [user, todayString]);

  useEffect(() => {
    if (!dailyDocRef) return;
    setLoading(true);
    const unsubscribe = onSnapshot(dailyDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data() as DailyTasks;
        // Add priority to old tasks if it doesn't exist
        const tasksWithPriority = data.tasks.map(t => ({...t, priority: t.priority || 'low'}));
        setTodaysData({ ...data, tasks: tasksWithPriority });
      } else {
        setTodaysData({ date: todayString, tasks: [], creditClaimed: false });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [dailyDocRef, todayString]);

  const updateFirestore = useCallback(async (newData: DailyTasks) => {
    if (dailyDocRef) {
      await setDoc(dailyDocRef, newData, { merge: true });
    }
  }, [dailyDocRef]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim() === '' || !user) return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
      priority: newTaskPriority,
    };
    const newTasks = [newTask, ...todaysData.tasks];
    await updateFirestore({ ...todaysData, tasks: newTasks });
    setNewTaskText('');
    setNewTaskPriority('low');
  };

  const toggleTask = async (id: string) => {
    const updatedTasks = todaysData.tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    await updateFirestore({ ...todaysData, tasks: updatedTasks });
  };

  const deleteTask = async (id: string) => {
    const updatedTasks = todaysData.tasks.filter((task) => task.id !== id);
    await updateFirestore({ ...todaysData, tasks: updatedTasks });
  };
  
  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  }

  const handleSaveEditedTask = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingTask) return;
      const formData = new FormData(e.target as HTMLFormElement);
      const text = formData.get('text') as string;
      const priority = formData.get('priority') as TaskPriority;

      const updatedTasks = todaysData.tasks.map(t => t.id === editingTask.id ? { ...t, text, priority } : t);
      await updateFirestore({ ...todaysData, tasks: updatedTasks });
      
      setEditingTask(null);
      setIsEditDialogOpen(false);
  }

  const handleClaimCredit = async () => {
    if (user && !todaysData.creditClaimed) {
      await addCreditsToUser(user.id, 1);
      await incrementDailyTasksCompleted(user.id);
      await updateFirestore({ ...todaysData, creditClaimed: true });
      toast({
          title: "Credit Claimed!",
          description: "Great job! You've earned 1 credit for your hard work.",
      });
    }
  };
  
  const allTasksCompleted = useMemo(() => {
      if(todaysData.tasks.length === 0) return false;
      return todaysData.tasks.every(task => task.completed);
  }, [todaysData.tasks]);

  const sortedTasks = useMemo(() => {
      return [...todaysData.tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
  }, [todaysData.tasks]);

  const priorityClasses: Record<TaskPriority, { bg: string, text: string, ring: string }> = {
    high: { bg: 'bg-red-500', text: 'text-red-500', ring: 'ring-red-500/50' },
    medium: { bg: 'bg-yellow-500', text: 'text-yellow-500', ring: 'ring-yellow-500/50' },
    low: { bg: 'bg-green-500', text: 'text-green-500', ring: 'ring-green-500/50' },
  }

  return (
    <div>
        <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row items-center gap-2 mb-4">
            <Input
                placeholder="What's your main focus today?"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="flex-1"
                disabled={loading}
            />
            <div className="flex w-full sm:w-auto gap-2">
                <Select value={newTaskPriority} onValueChange={(v: TaskPriority) => setNewTaskPriority(v)}>
                    <SelectTrigger className="w-full sm:w-[130px]">
                        <SelectValue placeholder="Set priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="high"><Flag className="mr-2 h-4 w-4 text-red-500"/> Compulsory</SelectItem>
                        <SelectItem value="medium"><Flag className="mr-2 h-4 w-4 text-yellow-500"/> Important</SelectItem>
                        <SelectItem value="low"><Flag className="mr-2 h-4 w-4 text-green-500"/> General</SelectItem>
                    </SelectContent>
                </Select>
                <Button type="submit" disabled={loading || !newTaskText.trim()}>
                    <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
            </div>
        </form>

      <div className="space-y-3">
        {loading ? (
            <p className="text-muted-foreground text-center py-4">Loading today's tasks...</p>
        ) : sortedTasks.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No tasks for today. Add one to get started!</p>
        ) : (
            sortedTasks.map((task) => (
            <div
                key={task.id}
                className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 transition-all hover:bg-muted/50 overflow-hidden relative",
                    task.completed && 'bg-muted/30'
                )}
            >
                <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", priorityClasses[task.priority].bg)}></div>
                <div className="pl-4">
                    <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    aria-label={`Mark task "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`}
                    className={cn("h-5 w-5 rounded-full", priorityClasses[task.priority].ring)}
                    />
                </div>
                <label
                    htmlFor={`task-${task.id}`}
                    className={cn('flex-1 cursor-pointer text-sm', task.completed && 'text-muted-foreground line-through')}
                >
                {task.text}
                </label>
                 <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => openEditDialog(task)}
                    aria-label={`Edit task "${task.text}"`}
                    >
                    <Edit className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteTask(task.id)}
                    aria-label={`Delete task "${task.text}"`}
                    >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
            ))
        )}
      </div>

      {allTasksCompleted && (
        <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/50 bg-primary/10 p-6 text-center">
            <h3 className="text-lg font-semibold text-primary">All Tasks Completed!</h3>
            {todaysData.creditClaimed ? (
                 <p className="text-muted-foreground">You've already claimed your credit for today. See you tomorrow!</p>
            ) : (
                <>
                    <p className="text-muted-foreground">You've crushed your to-do list. Claim your reward!</p>
                    <Button onClick={handleClaimCredit}>
                        <Award className="mr-2 h-4 w-4" /> Claim 1 Credit
                    </Button>
                </>
            )}
        </div>
      )}

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogDescription>
                        Make changes to your task here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                {editingTask && (
                    <form id="edit-task-form" onSubmit={handleSaveEditedTask} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-task-text">Task</Label>
                            <Input id="edit-task-text" name="text" defaultValue={editingTask.text} />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="edit-task-priority">Priority</Label>
                            <Select name="priority" defaultValue={editingTask.priority}>
                                <SelectTrigger id="edit-task-priority">
                                    <SelectValue placeholder="Set priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="high"><Flag className="mr-2 h-4 w-4 text-red-500"/> Compulsory</SelectItem>
                                    <SelectItem value="medium"><Flag className="mr-2 h-4 w-4 text-yellow-500"/> Important</SelectItem>
                                    <SelectItem value="low"><Flag className="mr-2 h-4 w-4 text-green-500"/> General</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </form>
                )}
                 <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button type="submit" form="edit-task-form">Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}

    