

'use client';

import * as React from 'react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from '@/components/dashboard/header';
import SidebarContent from '@/components/dashboard/sidebar-content';
import MobileNav from '@/components/dashboard/mobile-nav';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { MotionConfig } from 'framer-motion';
import { ImmersiveProvider, useImmersive } from '@/hooks/use-immersive';
import { Providers } from './providers';
import { useUser } from '@clerk/nextjs';
import { useLocalStorage } from '@/hooks/use-local-storage';

function AppLayout({ children }: { children: React.ReactNode }) {
  const { isImmersive } = useImmersive();
  const isMobile = useIsMobile();
  const [open, setOpen] = useLocalStorage<boolean>('sidebar-open', !isMobile);

  React.useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [isMobile, setOpen]);
  
  return (
     <SidebarProvider open={open} onOpenChange={setOpen}>
        {!isImmersive && (
            <Sidebar collapsible="icon" className="hidden md:flex md:flex-shrink-0">
                <SidebarContent />
            </Sidebar>
        )}
        <div className="flex flex-1 size-full flex-col bg-transparent">
            {!isImmersive && <Header />}
            <main className="relative flex-1 overflow-y-auto focus:outline-none flex flex-col">
            <SidebarInset className={cn(
                "flex-1 flex flex-col",
                isImmersive ? "!p-0" : "p-4 sm:p-6 lg:p-8"
            )}>
                {children}
            </SidebarInset>
            </main>
        </div>
        {!isImmersive && isMobile && <MobileNav />}
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
