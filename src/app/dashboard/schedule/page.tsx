

'use client';

import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { NexusView } from '@/components/schedule/nexus-view';
import { Calendar } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Task } from '@/components/todos/todo-list';

export default function SchedulePage() {
    const { user } = useUser();

    const handleDragEnd = async (event: DragEndEvent) => {
        const { over, active } = event;
        
        if (over && user) {
            const task = active.data.current as Task;
            const dropDate = over.id as string; // This will be the date string 'YYYY-MM-DD'
            
            // Update the task's deadline in Firestore
            const taskDocRef = doc(db, 'users', user.id, 'dailyTasks', task.id);
            await updateDoc(taskDocRef, {
                deadline: new Date(dropDate).toISOString()
            });
        }
    }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            MindMate Nexus
        </h1>
        <p className="text-muted-foreground">Your Study Command Center. Plan, execute, and conquer your goals.</p>
      </div>
      <DndContext onDragEnd={handleDragEnd}>
        <NexusView />
      </DndContext>
    </div>
  );
}
