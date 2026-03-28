
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function SuperAdminRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/super-admin');
  }, [router]);

  return (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-primary">
        <Loader2 className="h-16 w-16 animate-spin" />
        <p className="font-black uppercase tracking-[0.3em] text-xs">Redirecting to Mainframe...</p>
      </div>
    </div>
  );
}
