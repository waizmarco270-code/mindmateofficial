
'use client';

import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { NexusView } from '@/components/schedule/nexus-view';
import { Calendar } from 'lucide-react';

export default function SchedulePage() {

    const handleDragEnd = (event: DragEndEvent) => {
        const { over, active } = event;
        
        if (over) {
            console.log(`Task '${active.data.current?.text}' was dropped over ${over.id}`);
            // In the next step, we'll use this to schedule the task,
            // for example, by opening a modal to set the time.
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
