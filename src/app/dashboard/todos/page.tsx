
'use client';

// This page's content has been merged into the MindMate Nexus page at /dashboard/schedule.
// This file can be removed in the future if no longer needed for routing.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function TodosRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/schedule?tab=todos');
  }, [router]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Redirecting to MindMate Nexus...</p>
      </div>
    </div>
  );
}
