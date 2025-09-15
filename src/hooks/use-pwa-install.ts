
'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const usePWAInstall = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [hasDismissed, setHasDismissed] = useLocalStorage<boolean>('pwaInstallDismissed', false);

  useEffect(() => {
    // Check if the app is running in standalone mode
    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const triggerInstallPrompt = async () => {
    if (!installPromptEvent) return;
    
    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the A2HS prompt');
    } else {
      console.log('User dismissed the A2HS prompt');
    }
    setInstallPromptEvent(null);
  };
  
  const dismissPrompt = () => {
      setHasDismissed(true);
  }

  const canInstall = !!installPromptEvent && !isStandalone && !hasDismissed;

  return { canInstall, triggerInstallPrompt, dismissPrompt, isStandalone };
};
