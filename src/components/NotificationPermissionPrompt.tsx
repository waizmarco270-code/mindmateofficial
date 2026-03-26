'use client';

import { useEffect, useState } from 'react';
import { useFCM } from '@/hooks/use-fcm';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Bell } from 'lucide-react';

const NotificationPermissionPrompt = () => {
  const { toast } = useToast();
  const { notificationPermission, requestPermission } = useFCM();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if we should prompt the user.
    // MODIFIED: Removed sessionStorage check to force prompt on every load until permission is granted or denied.
    if (notificationPermission === 'default') {
      // Wait a bit before showing the prompt to not be too intrusive.
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000); // 3-second delay

      return () => clearTimeout(timer);
    }
  }, [notificationPermission]);

  const handleAllow = async () => {
    setIsOpen(false);
    const permission = await requestPermission();
    if (permission === 'granted') {
      toast({ title: 'Notifications Enabled!', description: 'You will now receive updates from MindMate.' });
    } else {
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: 'You can enable notifications later in your browser settings.',
      });
    }
  };

  const handleDeny = () => {
    setIsOpen(false);
    // Even if denied, the browser will remember the choice.
    // If permission remains 'default', it will show again next time.
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="border-primary/20">
        <AlertDialogHeader>
            <div className="flex justify-center mb-4">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-4 animate-pulse">
                    <Bell className="h-10 w-10 text-blue-500" />
                </div>
            </div>
          <AlertDialogTitle className="text-center text-2xl font-bold">Stay Connected, Legend!</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-base">
            Enable push notifications to receive real-time alerts for <b>Announcements, Global Gifts,</b> and <b>Community Missions</b> directly on your device.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center flex-col gap-2">
          <AlertDialogAction onClick={handleAllow} className="w-full h-12 font-bold text-lg">
            Enable Notifications
          </AlertDialogAction>
          <AlertDialogCancel onClick={handleDeny} className="w-full border-none text-muted-foreground hover:text-foreground">
            Maybe Later
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NotificationPermissionPrompt;
