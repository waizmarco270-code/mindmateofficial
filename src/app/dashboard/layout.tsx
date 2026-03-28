
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
import { BannedOverlay } from '@/components/dashboard/banned-overlay';
import { WhatsNewPopup } from '@/components/dashboard/whats-new-popup';
import MobileNav from '@/components/dashboard/mobile-nav';
import { usePathname } from 'next/navigation';
import { usePresence } from '@/hooks/use-presence';

function AppLayout({ children }: { children: React.ReactNode }) {
  const { isImmersive } = useImmersive();
  const { openMobile, setOpenMobile } = useSidebar();
  const { appSettings, currentUserData, loading, isSuperAdmin, isCoDev } = useAdmin();
  const { updateMyPresence } = usePresence(); 
  const pathname = usePathname();
  
  React.useEffect(() => {
    const triggerBackgroundTasks = async () => {
        try {
            await fetch('/api/cron/send-scheduled-notifications');
            await updateMyPresence(true);
        } catch (e) {}
    };
    
    triggerBackgroundTasks();
    const interval = setInterval(triggerBackgroundTasks, 120000);
    return () => clearInterval(interval);
  }, [updateMyPresence]);

  const now = new Date();
  const maintenanceStart = appSettings?.maintenanceStartTime ? new Date(appSettings.maintenanceStartTime) : null;
  const maintenanceEnd = appSettings?.maintenanceEndTime ? new Date(appSettings.maintenanceEndTime) : null;

  const isScheduledMaintenance = maintenanceStart && maintenanceEnd && now >= maintenanceStart && now < maintenanceEnd;
  const isManualMaintenance = appSettings?.isMaintenanceMode;

  const showMaintenance = (isScheduledMaintenance || isManualMaintenance) && !isSuperAdmin && !isCoDev;

  if (loading) return null;
  
  if (currentUserData?.isBlocked) {
      return <BannedOverlay user={currentUserData} />;
  }

  if (showMaintenance) {
    return <MaintenancePage settings={appSettings} />;
  }

  const useSuperAdminStyling = pathname.startsWith('/dashboard/super-admin');

  return (
    <>
      <WhatsNewPopup settings={appSettings} />
      {!useSuperAdminStyling && (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
          <SheetContent side="left" className="w-[18rem] bg-sidebar/80 p-0 text-sidebar-foreground backdrop-blur-lg [&>button]:hidden">
              <SidebarContent />
          </SheetContent>
        </Sheet>
      )}

      <div className={cn("flex flex-1 size-full flex-col bg-background", useSuperAdminStyling && "bg-muted")}>
        {!isImmersive && !useSuperAdminStyling && <Header />}
        <main className={cn(
            "relative flex-1 overflow-y-auto focus:outline-none flex flex-col",
            isImmersive || useSuperAdminStyling ? "p-0" : "p-4 sm:p-6 lg:p-8",
            useSuperAdminStyling && "p-4 sm:p-6 lg:p-8"
        )}>
            {children}
        </main>
        {!isImmersive && !useSuperAdminStyling && <MobileNav />}
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
