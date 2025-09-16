
'use client';

import * as React from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from '@/components/dashboard/header';
import SidebarContent from '@/components/dashboard/sidebar-content';
import MobileNav from '@/components/dashboard/mobile-nav';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FOCUS_SESSION_ACTIVE_KEY, FOCUS_PENALTY_SESSION_KEY } from './tracker/page';
import { useToast } from '@/hooks/use-toast';
import { AppDataProvider } from '@/hooks/use-admin';
import { UnreadMessagesProvider } from '@/hooks/use-unread';
import { MotionConfig } from 'framer-motion';
import { ChallengesProvider } from '@/hooks/use-challenges';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const { toast } = useToast();
  const pathname = usePathname();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSidebarOpen(!isMobile);
    }
  }, [isMobile]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // Logic to check for penalty on navigation
      const isSessionMarkedActive = sessionStorage.getItem(FOCUS_SESSION_ACTIVE_KEY) === 'true';
      if (isSessionMarkedActive && pathname !== '/dashboard/tracker') {
        // User navigated away from focus mode page while a session was active
        const penaltyMessage = `You have been penalized 20 credits for leaving an active focus session.`;
        sessionStorage.setItem(FOCUS_PENALTY_SESSION_KEY, penaltyMessage);
        // We can't call the credit deduction hook here, so we'll rely on the penalty being applied
        // within the tracker page itself before unload. The main purpose here is to ensure the toast appears.
      }

      // Logic to show penalty toast after navigation
      const penaltyMessage = sessionStorage.getItem(FOCUS_PENALTY_SESSION_KEY);
      if (penaltyMessage) {
        toast({
          variant: 'destructive',
          title: 'Session Stopped Early',
          description: penaltyMessage,
          duration: 10000,
        });
        sessionStorage.removeItem(FOCUS_PENALTY_SESSION_KEY);
        // Also ensure the active key is removed to prevent repeated toasts
        sessionStorage.removeItem(FOCUS_SESSION_ACTIVE_KEY);
      }
    }
  }, [pathname, toast]);

  return (
    <AppDataProvider>
      <UnreadMessagesProvider>
        <ChallengesProvider>
          <MotionConfig transition={{ duration: 0.5, type: 'spring' }}>
            <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <Sidebar className="hidden md:flex md:flex-shrink-0">
                <SidebarContent />
              </Sidebar>
              <div className="flex flex-1 w-full flex-col bg-transparent overflow-x-hidden">
                <Header />
                <main className="relative flex-1 overflow-y-auto focus:outline-none">
                  <SidebarInset className={cn(
                    "p-4 sm:p-6 lg:p-8",
                    "pb-28 md:pb-8" // Add more padding-bottom for mobile nav
                    )}>
                      {children}
                    </SidebarInset>
                </main>
              </div>
              {isMobile && <MobileNav />}
            </SidebarProvider>
          </MotionConfig>
        </ChallengesProvider>
      </UnreadMessagesProvider>
    </AppDataProvider>
  );
}
