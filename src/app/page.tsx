
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/ui/logo';
import { Progress } from '@/components/ui/progress';

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    // This page just redirects. If loading, we wait. If not loading, go to dashboard.
    if (!loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);
  
  // Show a loading screen while we determine the auth state and redirect.
  return (
      <div className="flex min-h-screen items-center justify-center bg-background flex-col gap-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/80 to-primary/10 z-0"></div>
        <div className="absolute h-48 w-48 rounded-full bg-primary/20 blur-3xl animate-pulse -top-10 -left-10"></div>
        <div className="absolute h-48 w-48 rounded-full bg-primary/20 blur-3xl animate-pulse -bottom-10 -right-10"></div>
      <div className="z-10 flex flex-col items-center gap-6">
        <Logo className="h-28 w-28" />
        <div className="flex flex-col items-center gap-2">
          <p className="text-xl font-medium text-foreground">Welcome to MindMate</p>
          <p className="text-sm text-muted-foreground">Loading your experience...</p>
        </div>
        <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-pulse w-1/2"></div>
        </div>
      </div>
    </div>
  );
}
