
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SuperAdminRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/waizmarcoadmin');
  }, [router]);

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p>Redirecting to Super Admin Panel...</p>
      </div>
    </div>
  );
}

    