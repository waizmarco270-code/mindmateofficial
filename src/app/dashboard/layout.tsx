
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
import { usePathname } from 'next/navigation';

function AppLayout({ children }: { children: React.ReactNode }) {
  const { isImmersive } = useImmersive();
  const { openMobile, setOpenMobile } = useSidebar();
  const { appSettings, loading, isSuperAdmin, isCoDev } = useAdmin();
  const pathname = usePathname();
  
  // Background Cron Trigger: Every time any user visits the dashboard, 
  // try to trigger the scheduled notification dispatch.
  React.useEffect(() => {
    const triggerScheduledSync = async () => {
        try {
            await fetch('/api/cron/send-scheduled-notifications');
        } catch (e) {
            // Silently fail as this is a background pulse
        }
    };
    
    // Trigger on mount and then every 2 minutes while the user is active
    triggerScheduledSync();
    const interval = setInterval(triggerScheduledSync, 120000);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  const maintenanceStart = appSettings?.maintenanceStartTime ? new Date(appSettings.maintenanceStartTime) : null;
  const maintenanceEnd = appSettings?.maintenanceEndTime ? new Date(appSettings.maintenanceEndTime) : null;

  const isScheduledMaintenance = maintenanceStart && maintenanceEnd && now >= maintenanceStart && now < maintenanceEnd;
  const isManualMaintenance = appSettings?.isMaintenanceMode;

  const showMaintenance = (isScheduledMaintenance || isManualMaintenance) && !isSuperAdmin && !isCoDev;

  if (loading) {
    return null;
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

      <div className={cn("flex flex-1 size-full flex-col bg-transparent", useSuperAdminStyling && "bg-muted")}>
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
