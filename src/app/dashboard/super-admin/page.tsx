
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldX } from 'lucide-react';

// This is a client-side component that acts as a gatekeeper and redirector
// for the real Super Admin panel, which is at a secret URL.
export default function SuperAdminRedirectPage() {
  const router = useRouter();
  const { isSuperAdmin, loading } = useAdmin();

  useEffect(() => {
    // If the user data has loaded and the user is a super admin, redirect them.
    if (!loading && isSuperAdmin) {
      router.replace('/waizmarcoadmin');
    }
  }, [isSuperAdmin, loading, router]);

  // While loading, show a spinner.
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  // If the user is not a super admin, show an access denied message.
  // This prevents non-super admins from even knowing the secret URL exists.
  if (!isSuperAdmin) {
    return (
       <div className="flex flex-col items-center justify-center h-full text-center">
        <Card className="w-full max-w-md border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
                <ShieldX className="h-8 w-8"/> Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>You do not have the necessary permissions to view this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback content while redirecting
  return (
    <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin" />
            <p className="text-muted-foreground">Redirecting to Super Admin Panel...</p>
        </div>
    </div>
  );
}
