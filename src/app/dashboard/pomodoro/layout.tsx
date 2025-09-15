
'use client';

import Header from '@/components/dashboard/header';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import SidebarContent from '@/components/dashboard/sidebar-content';
import { useIsMobile } from '@/hooks/use-mobile';
import * as React from 'react';
import MobileNav from '@/components/dashboard/mobile-nav';
import { AppDataProvider } from '@/hooks/use-admin';
import { UnreadMessagesProvider } from '@/hooks/use-unread';
import { MotionConfig } from 'framer-motion';

// This is a special layout for the Pomodoro page to achieve a full-screen effect
// without inheriting the main dashboard's padding.
export default function PomodoroLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSidebarOpen(!isMobile);
    }
  }, [isMobile]);

  return (
    <AppDataProvider>
      <UnreadMessagesProvider>
        <MotionConfig transition={{ duration: 0.5, type: 'spring' }}>
            <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <Sidebar className="hidden md:flex md:flex-shrink-0">
                    <SidebarContent />
                </Sidebar>
                <div className="flex flex-1 flex-col bg-transparent">
                    {/* The main content is rendered directly without the usual main/SidebarInset wrapper */}
                    {children}
                </div>
                {isMobile && <MobileNav />}
            </SidebarProvider>
        </MotionConfig>
      </UnreadMessagesProvider>
    </AppDataProvider>
  );
}
