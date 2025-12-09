

'use client';

import * as React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Header from '@/components/dashboard/header';
import SidebarContent from '@/components/dashboard/sidebar-content';
import { cn } from '@/lib/utils';
import { MotionConfig } from 'framer-motion';
import { ImmersiveProvider, useImmersive } from '@/hooks/use-immersive';
import { Providers } from './providers';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useSidebar } from '@/components/ui/sidebar';
import { useAdmin } from '@/hooks/use-admin';
import { MaintenancePage } from '@/components/dashboard/maintenance-page';
import { WhatsNewPopup } from '@/components/dashboard/whats-new-popup';
import MobileNav from '@/components/dashboard/mobile-nav';


function AppLayout({ children }: { children: React.ReactNode }) {
  const { isImmersive } = useImmersive();
  const { openMobile, setOpenMobile } = useSidebar();
  const { appSettings, loading, isSuperAdmin, isCoDev } = useAdmin();
  
  const showMaintenance = appSettings?.isMaintenanceMode && !isSuperAdmin && !isCoDev;

  if (loading) {
    // You can return a loading spinner here if you want
    return null;
  }
  
  if (showMaintenance) {
    return <MaintenancePage settings={appSettings} />;
  }

  return (
    <>
      <WhatsNewPopup settings={appSettings} />
      {/* Universal Sheet-based Sidebar for all screen sizes */}
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className="w-[18rem] bg-sidebar/80 p-0 text-sidebar-foreground backdrop-blur-lg [&>button]:hidden">
            <SidebarContent />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 size-full flex-col bg-transparent">
        {!isImmersive && <Header />}
        <main className={cn(
            "relative flex-1 overflow-y-auto focus:outline-none flex flex-col",
            isImmersive ? "p-0" : "p-4 sm:p-6 lg:p-8"
        )}>
            {children}
        </main>
        {!isImmersive && <MobileNav />}
      </div>
    </>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ImmersiveProvider>
      <SidebarProvider>
        <MotionConfig transition={{ duration: 0.15, type: 'tween', ease: 'easeOut' }}>
            <Providers>
                <AppLayout>
                    {children}
                </AppLayout>
            </Providers>
        </MotionConfig>
      </SidebarProvider>
    </ImmersiveProvider>
  );
}

