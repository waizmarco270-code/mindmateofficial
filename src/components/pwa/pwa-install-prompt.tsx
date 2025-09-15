
'use client';

import { useState, useEffect } from 'react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Logo } from '../ui/logo';
import { Download, MoreVertical } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export function PWAInstallPrompt() {
  const { canInstall, isStandalone, hasDismissed, dismissPrompt, triggerInstallPrompt } = usePWAInstall();
  const { isLoaded, isSignedIn } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const isIos = isMobile && typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  // Logic to auto-show the prompt
  useEffect(() => {
    // Only proceed if Clerk is loaded and user is not signed in
    if (!isLoaded || isSignedIn) {
        return;
    }

    // Don't show if already standalone or dismissed
    if (isStandalone || hasDismissed) {
        return;
    }
    
    // Auto-show prompt after a delay for a better user experience
    const timer = setTimeout(() => {
        if(canInstall || (isMobile && !canInstall)) { // Show for Android with prompt or iOS/other mobile without
            setIsOpen(true);
        }
    }, 3000); // 3-second delay

    return () => clearTimeout(timer);
  }, [canInstall, isStandalone, hasDismissed, isMobile, isLoaded, isSignedIn]);


  const handleInstallClick = () => {
    if (canInstall) {
      triggerInstallPrompt();
    }
    // For iOS, the modal is informational, and the user must manually add to home screen.
    // The modal is already open, so clicking install does nothing extra.
    // The "Got it" button will handle dismissal.
  };

  const handleClose = () => {
    setIsOpen(false);
    dismissPrompt();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent onEscapeKeyDown={handleClose} onPointerDownOutside={handleClose}>
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
             <Logo className="h-16 w-16" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">Install MindMate</DialogTitle>
          <DialogDescription className="text-center">
            For the best experience, add MindMate to your Home Screen. It's free and takes seconds!
          </DialogDescription>
        </DialogHeader>

        {isIos ? (
             <div className="space-y-4 py-4 text-sm">
                <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">1</div>
                    <div>
                        <p className="font-semibold">Tap the Share Icon</p>
                        <p className="text-xs text-muted-foreground">Tap the 'Share' button in your browser's toolbar.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">2</div>
                    <div>
                        <p className="font-semibold">Add to Home Screen</p>
                        <p className="text-xs text-muted-foreground">Scroll down and tap on 'Add to Home Screen'.</p>
                    </div>
                </div>
            </div>
        ) : canInstall ? (
            <div className="py-6 text-center">
                 <p className="text-muted-foreground">Click the button below to install the app on your device.</p>
            </div>
        ) : (
             <div className="py-6 text-center">
                 <p className="text-muted-foreground">Open your browser menu and look for the "Install app" or "Add to Home Screen" option.</p>
            </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={handleClose} className="w-full">
                Not Now
            </Button>
            {canInstall && (
                 <Button onClick={handleInstallClick} className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Install App
                </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
