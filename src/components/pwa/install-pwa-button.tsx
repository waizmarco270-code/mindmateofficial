
'use client';
import { Download, Smartphone, MoreVertical, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';
import { useState } from 'react';
import { Logo } from '../ui/logo';
import { cn } from '@/lib/utils';

export function InstallPWAButton() {
  const { canInstall, triggerInstallPrompt, dismissPrompt } = usePWAInstall();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const openInstructionsModal = () => {
      setIsModalOpen(true);
  }

  const handleInstallClick = () => {
    if (canInstall) {
      triggerInstallPrompt();
    } else if (isMobile) {
      // If the browser doesn't support the prompt event (like on iOS Safari), show instructions
      openInstructionsModal();
    }
  }

  if (!isMobile && !canInstall) return null;

  return (
    <>
      <Button
        variant="ghost"
        className="text-white"
        onClick={handleInstallClick}
      >
        <Download className="mr-2 h-4 w-4" />
        Install App
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
             <div className="flex items-center gap-3 mb-4">
                <Logo className="h-10 w-10"/>
                <DialogTitle className="text-2xl font-bold">Install MindMate</DialogTitle>
             </div>
            <DialogDescription>
              For the best mobile experience, add MindMate to your Home Screen.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">1</div>
                <div>
                    <p className="font-semibold">Open Browser Menu</p>
                    <p className="text-sm text-muted-foreground">Tap the menu icon in your browser (usually <MoreVertical className="inline-block h-4 w-4"/> or <span className="font-bold">Share</span> icon).</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">2</div>
                <div>
                    <p className="font-semibold">Add to Home Screen</p>
                    <p className="text-sm text-muted-foreground">Tap on 'Add to Home Screen' or 'Install app'.</p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">3</div>
                <div>
                    <p className="font-semibold">Launch from Home Screen</p>
                    <p className="text-sm text-muted-foreground">Open MindMate from your phone's home screen for faster access.</p>
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
                setIsModalOpen(false);
                dismissPrompt();
            }} className="w-full">
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
