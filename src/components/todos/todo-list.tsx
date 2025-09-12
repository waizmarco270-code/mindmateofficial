
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Edit, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
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

export function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('low');
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    try {
        const storedTasks = localStorage.getItem('dailyTasks');
        if (storedTasks) {
            const parsedTasks = JSON.parse(storedTasks);
            // Add priority to old tasks if it doesn't exist
            const tasksWithPriority = parsedTasks.map((t: any) => ({...t, id: t.id.toString(), priority: t.priority || 'low'}));
            setTasks(tasksWithPriority);
        }
    } catch (error) {
        console.error("Failed to parse tasks from localStorage", error);
    }
  }, []);

  useEffect(() => {
      localStorage.setItem('dailyTasks', JSON.stringify(tasks));
  }, [tasks]);


  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim() === '') return;
    const newTask: Task = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
      priority: newTaskPriority,
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText('');
    setNewTaskPriority('low');
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };
  
  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setIsEditDialogOpen(true);
  }

  const handleSaveEditedTask = (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingTask) return;
      const formData = new FormData(e.target as HTMLFormElement);
      const text = formData.get('text') as string;
      const priority = formData.get('priority') as TaskPriority;

      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, text, priority } : t));
      
      setEditingTask(null);
      setIsEditDialogOpen(false);
  }

  const sortedTasks = useMemo(() => {
      return [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
  }, [tasks]);

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
                <Button type="submit" disabled={!newTaskText.trim()}>
                    <Plus className="mr-2 h-4 w-4" /> Add
                </Button>
            </div>
        </form>

      <div className="space-y-3">
        {tasks.length === 0 ? (
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
