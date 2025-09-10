
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
import { Providers } from './providers';

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
          const penaltyMessage = sessionStorage.getItem(FOCUS_PENALTY_SESSION_KEY);
          if (penaltyMessage) {
              toast({
                  variant: 'destructive',
                  title: 'Session Stopped Early',
                  description: penaltyMessage,
              });
              sessionStorage.removeItem(FOCUS_PENALTY_SESSION_KEY);
          }
      }
  }, [pathname, toast]);

  return (
    <Providers>
      <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <Sidebar className="hidden md:flex md:flex-shrink-0">
          <SidebarContent />
        </Sidebar>
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="relative flex-1 overflow-y-auto focus:outline-none">
            <SidebarInset className={cn(
              "p-4 sm:p-6 lg:p-8",
              "pb-24 md:pb-8" // Add more padding-bottom for mobile nav
              )}>
                {children}
              </SidebarInset>
          </main>
        </div>
        {isMobile && <MobileNav />}
      </SidebarProvider>
    </Providers>
  );
}
