

'use client';

import { NexusView } from '@/components/schedule/nexus-view';
import { Calendar } from 'lucide-react';

export default function SchedulePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            MindMate Nexus
        </h1>
        <p className="text-muted-foreground">Your Study Command Center. Plan, execute, and conquer your goals.</p>
      </div>
      <NexusView />
    </div>
  );
}
