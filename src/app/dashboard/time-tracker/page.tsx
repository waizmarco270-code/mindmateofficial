
'use client';

import { TimeTracker } from '@/components/tracker/time-tracker';
import { SignedOut } from '@clerk/nextjs';
import { LoginWall } from '@/components/ui/login-wall';

export default function TimeTrackerPage() {
  return (
    <div className="space-y-8 relative">
       <SignedOut>
            <LoginWall 
                title="Unlock the Time Tracker"
                description="Sign up for free to track your study time for each subject, view detailed insights, and see your progress."
            />
        </SignedOut>
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
