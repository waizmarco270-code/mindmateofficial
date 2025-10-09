

'use client';

import * as React from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from '@/components/dashboard/header';
import SidebarContent from '@/components/dashboard/sidebar-content';
import MobileNav from '@/components/dashboard/mobile-nav';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FOCUS_PENALTY_SESSION_KEY, FOCUS_SESSION_ACTIVE_KEY } from './tracker/page';
import { useToast } from '@/hooks/use-toast';
import { MotionConfig } from 'framer-motion';
import { ImmersiveProvider, useImmersive } from '@/hooks/use-immersive';
import { Providers } from './providers';

function AppLayout({ children }: { children: React.ReactNode }) {
  const { isImmersive } = useImmersive();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [isMobileNavCollapsed, setIsMobileNavCollapsed] = React.useState(false);
  const { toast } = useToast();
  const pathname = usePathname();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSidebarOpen(!isMobile);
    }
  }, [isMobile]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // This is now the primary mechanism for showing the penalty toast.
      const penaltyMessage = sessionStorage.getItem(FOCUS_PENALTY_SESSION_KEY);
      if (penaltyMessage) {
        toast({
          variant: 'destructive',
          title: 'Session Stopped Early',
          description: penaltyMessage,
          duration: 10000,
        });
        sessionStorage.removeItem(FOCUS_PENALTY_SESSION_KEY);
        // Also clean up the active session flag in case it was left behind
        sessionStorage.removeItem(FOCUS_SESSION_ACTIVE_KEY);
      }
    }
  }, [pathname, toast]);


  return (
     <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        {!isImmersive && (
            <Sidebar className="hidden md:flex md:flex-shrink-0">
                <SidebarContent />
            </Sidebar>
        )}
        <div className="flex flex-1 size-full flex-col bg-transparent">
            {!isImmersive && <Header />}
            <main className="relative flex-1 overflow-y-auto focus:outline-none flex flex-col">
            <SidebarInset className={cn(
                "p-4 sm:p-6 lg:p-8 flex flex-1 flex-col",
                isImmersive ? "!p-0 flex-1" : 'pb-24'
            )}>
                {children}
            </SidebarInset>
            </main>
        </div>
        {!isImmersive && isMobile && <MobileNav isCollapsed={isMobileNavCollapsed} onToggleCollapse={setIsMobileNavCollapsed} />}
    </SidebarProvider>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ImmersiveProvider>
        <MotionConfig transition={{ duration: 0.15, type: 'tween', ease: 'easeOut' }}>
            <Providers>
                <AppLayout>
                    {children}
                </AppLayout>
            </Providers>
        </MotionConfig>
    </ImmersiveProvider>
  );
}
