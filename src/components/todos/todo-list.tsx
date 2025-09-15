
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Edit, Flag, Calendar as CalendarIcon, Award, Loader2, Clock, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, isPast, parse } from 'date-fns';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy, where, addDoc, updateDoc } from 'firebase/firestore';
import { useUsers } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { useDraggable } from '@dnd-kit/core';

export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: TaskPriority;
  deadline?: string; // ISO string
  startTime?: string; // HH:mm format
  endTime?: string;   // HH:mm format
  createdAt: string; // ISO string date
}

function DraggableTask({ task, isOverdue, priorityClasses, onToggle, onEdit, onDelete }: {
    task: Task,
    isOverdue: boolean,
    priorityClasses: Record<TaskPriority, { bg: string, text: string, ring: string }>,
    onToggle: (task: Task) => void,
    onEdit: (task: Task) => void,
    onDelete: (id: string) => void
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: task, // Pass the whole task object
    });
    
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div ref={setNodeRef} style={style} {...attributes} className={cn("relative", isDragging && "z-50 opacity-50")}>
            <div
                className={cn(
                    "flex items-center gap-3 rounded-lg border bg-background p-3 transition-all hover:bg-muted/50 overflow-hidden",
                    task.completed && 'bg-muted/30'
                )}
            >
                <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", priorityClasses[task.priority].bg)}></div>
                <button {...listeners} className="cursor-grab active:cursor-grabbing px-1 text-muted-foreground">
                    <GripVertical className="h-5 w-5" />
                </button>
                <div>
                    <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => onToggle(task)}
                    aria-label={`Mark task "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`}
                    className={cn("h-5 w-5 rounded-full", priorityClasses[task.priority].ring)}
                    />
                </div>
                <div className="flex-1">
                    <label
                        htmlFor={`task-${task.id}`}
                        className={cn('cursor-pointer text-sm font-medium', task.completed && 'text-muted-foreground line-through')}
                    >
                    {task.text}
                    </label>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                        {task.startTime && task.endTime && (
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3"/>
                                <span>{formatTime12h(task.startTime)} - {formatTime12h(task.endTime)}</span>
                            </div>
                        )}
                        {task.deadline && (
                            <div className={cn("flex items-center gap-1.5", isOverdue && "text-destructive")}>
                                <CalendarIcon className="h-3 w-3"/>
                                <span>{format(new Date(task.deadline), 'MMM d')}</span>
                                {isOverdue && <span className="font-semibold">(Overdue)</span>}
                            </div>
                        )}
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => onEdit(task)}
                    aria-label={`Edit task "${task.text}"`}
                    >
                    <Edit className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(task.id)}
                    aria-label={`Delete task "${task.text}"`}
                    >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

const formatTime12h = (time24: string) => {
    if (!time24) return '';
    try {
        const date = parse(time24, 'HH:mm', new Date());
        return format(date, 'h:mm a');
    } catch (e) {
        return '';
    }
};

export function TodoList() {
  const { user } = useUser();
  const { currentUserData, claimDailyTaskReward } = useUsers();
  const { toast } = useToast();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);

  // Form state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('low');
  const [newTaskDeadline, setNewTaskDeadline] = useState<Date | undefined>(undefined);
  const [newTaskStartTime, setNewTaskStartTime] = useState('');
  const [newTaskEndTime, setNewTaskEndTime] = useState('');
  
  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTaskText, setEditTaskText] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState<TaskPriority>('low');
  const [editTaskDeadline, setEditTaskDeadline] = useState<Date | undefined>(undefined);
  const [editTaskStartTime, setEditTaskStartTime] = useState('');
  const [editTaskEndTime, setEditTaskEndTime] = useState('');


  // Daily Tasks from Firestore
  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }
    setLoading(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasksColRef = collection(db, 'users', user.id, 'dailyTasks');
    const q = query(tasksColRef, where('createdAt', '>=', today.toISOString()), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedTasks = snapshot.docs.map(doc => doc.data() as Task);
        setTasks(fetchedTasks);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching tasks: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const resetAddForm = () => {
    setNewTaskText('');
    setNewTaskPriority('low');
    setNewTaskDeadline(undefined);
    setNewTaskStartTime('');
    setNewTaskEndTime('');
    setIsAddDialogOpen(false);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim() === '' || !user) return;
    
    const newTaskPayload: Omit<Task, 'id' | 'createdAt'> & {createdAt: string} = {
      text: newTaskText,
      completed: false,
      priority: newTaskPriority,
      startTime: newTaskStartTime || undefined,
      endTime: newTaskEndTime || undefined,
      deadline: newTaskDeadline?.toISOString(),
      createdAt: new Date().toISOString(),
    };

    const tasksColRef = collection(db, 'users', user.id, 'dailyTasks');
    const newDocRef = doc(tasksColRef); // Auto-generate ID
    await setDoc(newDocRef, { ...newTaskPayload, id: newDocRef.id });

    resetAddForm();
  };

  const toggleTask = async (task: Task) => {
    if (!user) return;
    const taskDocRef = doc(db, 'users', user.id, 'dailyTasks', task.id);
    await setDoc(taskDocRef, { ...task, completed: !task.completed }, { merge: true });
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    const taskDocRef = doc(db, 'users', user.id, 'dailyTasks', id);
    await deleteDoc(taskDocRef);
  };
  
  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setEditTaskText(task.text);
    setEditTaskPriority(task.priority);
    setEditTaskDeadline(task.deadline ? new Date(task.deadline) : undefined);
    setEditTaskStartTime(task.startTime || '');
    setEditTaskEndTime(task.endTime || '');
    setIsEditDialogOpen(true);
  }

  const handleSaveEditedTask = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingTask || !user) return;

      const taskDocRef = doc(db, 'users', user.id, 'dailyTasks', editingTask.id);
      
      const updatedTaskData: Partial<Task> = { 
        text: editTaskText, 
        priority: editTaskPriority,
        startTime: editTaskStartTime || undefined,
        endTime: editTaskEndTime || undefined,
        deadline: editTaskDeadline?.toISOString(),
      };
      
      await updateDoc(taskDocRef, updatedTaskData);
      
      setEditingTask(null);
      setIsEditDialogOpen(false);
  }

  const sortedTasks = useMemo(() => {
      return [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const priorityOrder: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        if(a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
        if(a.startTime) return -1;
        if(b.startTime) return 1;

        const aDeadline = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const bDeadline = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return aDeadline - bDeadline;
      })
  }, [tasks]);

    const { completedCount, reward, canClaim, hasClaimedToday } = useMemo(() => {
        const completed = tasks.filter(t => t.completed).length;
        let calculatedReward = 0;
        if (completed >= 5) calculatedReward = 3;
        else if (completed >= 3) calculatedReward = 1;
        
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const claimed = currentUserData?.lastDailyTasksClaim === todayStr;

        return {
            completedCount: completed,
            reward: calculatedReward,
            canClaim: completed >= 3 && !claimed,
            hasClaimedToday: claimed
        };
    }, [tasks, currentUserData]);
    
    const handleClaimReward = async () => {
        if (!user || !canClaim || reward <= 0) return;
        setIsClaiming(true);
        try {
            await claimDailyTaskReward(user.id, reward);
            toast({
                title: "Reward Claimed!",
                description: `You've earned ${reward} credits for your hard work today!`,
                className: "bg-green-500/10 border-green-500/50"
            });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Claim Failed", description: error.message });
        } finally {
            setIsClaiming(false);
        }
    };


  const priorityClasses: Record<TaskPriority, { bg: string, text: string, ring: string }> = {
    high: { bg: 'bg-red-500', text: 'text-red-500', ring: 'ring-red-500/50' },
    medium: { bg: 'bg-yellow-500', text: 'text-yellow-500', ring: 'ring-yellow-500/50' },
    low: { bg: 'bg-green-500', text: 'text-green-500', ring: 'ring-green-500/50' },
  }
  
  return (
    <div>
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4" disabled={!user}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a New Task</DialogTitle>
          </DialogHeader>
          <form id="add-task-form" onSubmit={handleAddTask} className="space-y-4 py-4">
              <div className="space-y-2">
                  <Label htmlFor="add-task-text">Task</Label>
                  <Input id="add-task-text" value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="e.g. Finish chemistry homework"/>
              </div>
               <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                        <Label htmlFor="add-task-priority">Priority</Label>
                        <Select name="priority" value={newTaskPriority} onValueChange={(v: TaskPriority) => setNewTaskPriority(v)}>
                            <SelectTrigger id="add-task-priority"><SelectValue placeholder="Set priority" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="high"><Flag className="mr-2 h-4 w-4 text-red-500"/> Compulsory</SelectItem>
                                <SelectItem value="medium"><Flag className="mr-2 h-4 w-4 text-yellow-500"/> Important</SelectItem>
                                <SelectItem value="low"><Flag className="mr-2 h-4 w-4 text-green-500"/> General</SelectItem>
                            </SelectContent>
                        </Select>
                   </div>
                   <div className="space-y-2">
                      <Label>Deadline</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !newTaskDeadline && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {newTaskDeadline ? format(newTaskDeadline, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newTaskDeadline} onSelect={setNewTaskDeadline} initialFocus /></PopoverContent>
                        </Popover>
                   </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="add-task-start-time">Start Time</Label>
                      <Input id="add-task-start-time" type="time" value={newTaskStartTime} onChange={e => setNewTaskStartTime(e.target.value)}/>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="add-task-end-time">End Time</Label>
                      <Input id="add-task-end-time" type="time" value={newTaskEndTime} onChange={e => setNewTaskEndTime(e.target.value)}/>
                  </div>
              </div>
          </form>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button type="submit" form="add-task-form">Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        {loading ? (
            <div className="text-muted-foreground text-center py-4"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></div>
        ) : tasks.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No tasks for today. Add one to get started!</p>
        ) : (
            sortedTasks.map((task) => {
                const isOverdue = task.deadline ? isPast(new Date(task.deadline)) && !task.completed : false;
                return (
                    <DraggableTask
                        key={task.id}
                        task={task}
                        isOverdue={isOverdue}
                        priorityClasses={priorityClasses}
                        onToggle={toggleTask}
                        onEdit={openEditDialog}
                        onDelete={deleteTask}
                    />
                )
            })
        )}
      </div>

       {completedCount >= 3 && (
            <div className="mt-8 border-t pt-6 text-center space-y-4">
                <h3 className="font-semibold">Daily Task Bonus</h3>
                <p className="text-sm text-muted-foreground">You have completed {completedCount} task{completedCount !== 1 && 's'} today.</p>
                <Button onClick={handleClaimReward} disabled={!canClaim || isClaiming} className="w-full max-w-xs mx-auto" size="lg">
                    {isClaiming ? <Loader2 className="animate-spin mr-2"/> : <Award className="mr-2 h-5 w-5"/>}
                    {hasClaimedToday ? "Reward Claimed for Today" : `Claim +${reward} Credits`}
                </Button>
            </div>
       )}


        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>
                {editingTask && (
                    <form id="edit-task-form" onSubmit={handleSaveEditedTask} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-task-text">Task</Label>
                            <Input id="edit-task-text" name="text" value={editTaskText} onChange={e => setEditTaskText(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-task-priority">Priority</Label>
                                <Select name="priority" value={editTaskPriority} onValueChange={(v: TaskPriority) => setEditTaskPriority(v)}>
                                    <SelectTrigger id="edit-task-priority"><SelectValue placeholder="Set priority" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="high"><Flag className="mr-2 h-4 w-4 text-red-500"/> Compulsory</SelectItem>
                                        <SelectItem value="medium"><Flag className="mr-2 h-4 w-4 text-yellow-500"/> Important</SelectItem>
                                        <SelectItem value="low"><Flag className="mr-2 h-4 w-4 text-green-500"/> General</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Deadline</Label>
                                 <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !editTaskDeadline && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {editTaskDeadline ? format(editTaskDeadline, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={editTaskDeadline} onSelect={setEditTaskDeadline} initialFocus /></PopoverContent>
                                </Popover>
                            </div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-task-start-time">Start Time</Label>
                                <Input id="edit-task-start-time" type="time" value={editTaskStartTime} onChange={e => setEditTaskStartTime(e.target.value)}/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-task-end-time">End Time</Label>
                                <Input id="edit-task-end-time" type="time" value={editTaskEndTime} onChange={e => setEditTaskEndTime(e.target.value)}/>
                            </div>
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
