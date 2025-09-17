
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Crown, Construction, Loader2, ShieldX } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/hooks/use-admin';

export default function EliteLoungePage() {
  const { currentUserData, isAdmin, isSuperAdmin, loading } = useAdmin();

  const isVip = currentUserData?.isVip ?? false;
  const isGM = currentUserData?.isGM ?? false;
  const hasAccess = isVip || isGM || isAdmin || isSuperAdmin;

  if (loading) {
      return (
        <div className="flex h-full items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
  }

  if (!hasAccess) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Card className="w-full max-w-md border-destructive/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-destructive">
                    <ShieldX className="h-8 w-8"/> Access Denied
                </CardTitle>
                <CardDescription>
                    You do not have the necessary permissions to view this page. This is an exclusive area for Elite members, GMs, and Admins.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                    <Link href="/dashboard">
                       &larr; Back to Dashboard
                    </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
      );
  }


  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Card className="w-full max-w-lg border-yellow-400/50 bg-gradient-to-br from-yellow-950/30 to-background">
        <CardHeader>
           <div className="flex justify-center mb-4">
              <div className="p-4 bg-yellow-400/10 rounded-full border-2 border-yellow-400/30 animate-pulse">
                  <Crown className="h-12 w-12 text-yellow-400 [text-shadow:0_0_8px_currentColor]" />
              </div>
          </div>
          <CardTitle className="text-3xl font-bold text-yellow-400">
            Welcome to the Elite Lounge
          </CardTitle>
          <CardDescription className="text-yellow-400/80">
            This is an exclusive area for Elite Members, GMs, and Admins.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-4 text-amber-300">
                <Construction className="h-6 w-6"/>
                <p className="text-lg font-semibold animate-pulse">More Legendary Features Coming Soon!</p>
            </div>
            <p className="text-slate-400">
                This space is currently under construction. We're building amazing new tools and rewards just for you.
            </p>
            <div className="pt-4">
                <Button asChild variant="outline">
                    <Link href="/dashboard">
                       &larr; Back to Dashboard
                    </Link>
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
