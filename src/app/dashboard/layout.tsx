
'use client';

import * as React from 'react';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from '@/components/dashboard/header';
import SidebarContent from '@/components/dashboard/sidebar-content';
import MobileNav from '@/components/dashboard/mobile-nav';
import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { cn } from '@/lib/utils';
import { FOCUS_PENALTY_SESSION_KEY } from './tracker/page';
import { useToast } from '@/hooks/use-toast';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LogIn, Sparkles } from 'lucide-react';


function GuestWelcomeDialog({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) {
  const { setOpen: openAuthModal } = useAuthModal();

  const handleLoginClick = () => {
    onOpenChange(false);
    openAuthModal(true);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-bold">Welcome to MindMate!</DialogTitle>
          <DialogDescription className="text-center">
            You're currently exploring as a guest. Sign in to unlock your personal dashboard, track your progress, and access all features.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center pt-4 gap-2 sm:gap-4">
          <DialogClose asChild>
            <Button variant="outline">Continue as Guest</Button>
          </DialogClose>
          <Button onClick={handleLoginClick}>
            <LogIn className="mr-2 h-4 w-4" /> Login / Sign Up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const pathname = usePathname();
  const isGuest = !user && !loading;

  const [isGuestDialogOpen, setIsGuestDialogOpen] = React.useState(false);

  React.useEffect(() => {
    // Show the guest welcome dialog only once per session
    if (isGuest && !sessionStorage.getItem('guestWelcomeDismissed')) {
      // Small delay to allow the page to render first
      const timer = setTimeout(() => setIsGuestDialogOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isGuest]);


  const handleGuestDialogChange = (open: boolean) => {
    setIsGuestDialogOpen(open);
    if (!open) {
      sessionStorage.setItem('guestWelcomeDismissed', 'true');
    }
  }


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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background flex-col gap-8 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-background via-background/80 to-primary/10 z-0"></div>
         <div className="absolute h-48 w-48 rounded-full bg-primary/20 blur-3xl animate-pulse -top-10 -left-10"></div>
         <div className="absolute h-48 w-48 rounded-full bg-primary/20 blur-3xl animate-pulse -bottom-10 -right-10"></div>
        <div className="z-10 flex flex-col items-center gap-6">
          <Logo className="h-28 w-28 text-primary" />
          <div className="flex flex-col items-center gap-2">
            <p className="text-xl font-medium text-foreground">Loading your dashboard</p>
            <p className="text-sm text-muted-foreground">Please wait a moment...</p>
          </div>
          <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <GuestWelcomeDialog isOpen={isGuestDialogOpen} onOpenChange={handleGuestDialogChange} />
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
  );
}
