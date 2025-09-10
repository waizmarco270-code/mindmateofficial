
'use client';
import { GoalsProvider } from '@/hooks/use-goals';
import { ScheduleView } from '@/components/schedule/schedule-view';

export default function SchedulePage() {
  return (
    <GoalsProvider>
       <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Goals & Schedule</h1>
          <p className="text-muted-foreground">Set high-level goals and plan your daily tasks.</p>
        </div>
        <ScheduleView />
      </div>
    </GoalsProvider>
  );
}
