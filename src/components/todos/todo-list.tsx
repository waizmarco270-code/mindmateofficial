
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

const initialTasks: Task[] = [
  { id: 1, text: 'Read Chapter 3 of History book', completed: false },
  { id: 2, text: 'Complete Math assignment on Algebra', completed: true },
  { id: 3, text: 'Prepare for Physics quiz', completed: false },
];

export function TodoList() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', initialTasks);
  const [newTaskText, setNewTaskText] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddTask = () => {
    if (newTaskText.trim() === '') return;
    const newTask: Task = {
      id: Date.now(),
      text: newTaskText,
      completed: false,
    };
    setTasks([newTask, ...tasks]);
    setNewTaskText('');
    setIsDialogOpen(false);
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)));
  };

  const deleteTask = (id: number) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };
  
  return (
    <div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button className="mb-4">
                    <Plus className="mr-2 h-4 w-4" /> Add Task
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New To-Do</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Input 
                            id="task-name" 
                            value={newTaskText} 
                            onChange={(e) => setNewTaskText(e.target.value)} 
                            className="col-span-4"
                            placeholder="New to-do"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddTask}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-all hover:bg-muted/50"
          >
            <Checkbox
              id={`task-${task.id}`}
              checked={task.completed}
              onCheckedChange={() => toggleTask(task.id)}
              aria-label={`Mark task "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`}
              className="h-6 w-6 rounded-full"
            />
            <label
              htmlFor={`task-${task.id}`}
              className={cn('flex-1 cursor-pointer', task.completed && 'text-muted-foreground line-through')}
            >
              {task.text}
            </label>
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
        ))}
      </div>
    </div>
  );
}

    