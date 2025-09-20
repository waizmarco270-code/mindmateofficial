
'use client';

import * as React from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from '@/components/dashboard/header';
import SidebarContent from '@/components/dashboard/sidebar-content';
import MobileNav from '@/components/dashboard/mobile-nav';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { FOCUS_PENALTY_SESSION_KEY } from './tracker/page';
import { useToast } from '@/hooks/use-toast';
import { AppDataProvider } from '@/hooks/use-admin';
import { UnreadMessagesProvider } from '@/hooks/use-unread';
import { MotionConfig } from 'framer-motion';
import { ChallengesProvider } from '@/hooks/use-challenges';
import { ImmersiveProvider, useImmersive } from '@/hooks/use-immersive';

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
        <div className="flex flex-1 w-full flex-col bg-transparent overflow-x-hidden">
            {!isImmersive && <Header />}
            <main className="relative flex-1 overflow-y-auto focus:outline-none">
            <SidebarInset className={cn(
                "p-4 sm:p-6 lg:p-8",
                isImmersive ? "!p-0 h-full" : (isMobile && !isMobileNavCollapsed ? 'pb-28' : 'pb-8')
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
    <AppDataProvider>
      <UnreadMessagesProvider>
        <ChallengesProvider>
          <ImmersiveProvider>
            <MotionConfig transition={{ duration: 0.5, type: 'spring' }}>
              <AppLayout>{children}</AppLayout>
            </MotionConfig>
          </ImmersiveProvider>
        </ChallengesProvider>
      </UnreadMessagesProvider>
    </AppDataProvider>
  );
}
