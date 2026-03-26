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
    // We only prompt if permission is `default` (not yet granted or denied)
    // and if we haven't already prompted them in this session.
    const alreadyPrompted = sessionStorage.getItem('notificationPrompted');
    if (notificationPermission === 'default' && !alreadyPrompted) {
      // Wait a bit before showing the prompt to not be too intrusive.
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('notificationPrompted', 'true');
      }, 5000); // 5-second delay

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
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
            <div className="flex justify-center mb-4">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/50 p-3">
                    <Bell className="h-8 w-8 text-blue-500" />
                </div>
            </div>
          <AlertDialogTitle className="text-center">Stay in the Loop!</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Enable push notifications to get the latest updates on new features, announcements, and community events directly on your device.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogCancel onClick={handleDeny}>Maybe Later</AlertDialogCancel>
          <AlertDialogAction onClick={handleAllow}>Enable Notifications</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NotificationPermissionPrompt;
