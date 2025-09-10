
'use client';

import { TimeTracker } from '@/components/tracker/time-tracker';

export default function TimeTrackerPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Time Tracker</h1>
        <p className="text-muted-foreground">
          Track the time you spend on each of your subjects.
        </p>
      </div>
      <TimeTracker />
    </div>
  );
}
