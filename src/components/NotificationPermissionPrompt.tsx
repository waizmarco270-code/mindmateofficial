
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
    // FORCE MODE: Always show if permission is not granted or denied
    // This will persist across refreshes and logins until the user takes action.
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 2000); 
        return () => clearTimeout(timer);
      }
    }
  }, [notificationPermission]);

  const handleAllow = async () => {
    setIsOpen(false);
    const permission = await requestPermission();
    if (permission === 'granted') {
      toast({ title: 'Notifications Enabled!', description: 'You will now receive real-time updates.' });
    } else if (permission === 'denied') {
      toast({
        variant: 'destructive',
        title: 'Permission Blocked',
        description: 'You have disabled notifications in your browser settings.',
      });
    }
  };

  const handleDeny = () => {
    setIsOpen(false);
    // Note: Since we removed the session check, it will reappear on next reload
    // to encourage the user to enable it for the best experience.
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="border-primary/20 bg-background/95 backdrop-blur-xl">
        <AlertDialogHeader>
            <div className="flex justify-center mb-4">
                <div className="rounded-full bg-primary/10 p-6 animate-pulse border-2 border-primary/20">
                    <Bell className="h-12 w-12 text-primary" />
                </div>
            </div>
          <AlertDialogTitle className="text-center text-3xl font-black tracking-tight">STAY IN THE LOOP, LEGEND!</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-base text-muted-foreground">
            Don't miss out on <b>Exclusive Gifts, Important Announcements,</b> and <b>Community Missions</b>. Enable push notifications to stay ahead of the curve.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center flex-col gap-3 mt-4">
          <AlertDialogAction onClick={handleAllow} className="w-full h-14 font-black text-xl shadow-lg shadow-primary/20">
            ENABLE ALERTS
          </AlertDialogAction>
          <AlertDialogCancel onClick={handleDeny} className="w-full border-none text-muted-foreground hover:text-foreground font-bold">
            MAYBE LATER
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NotificationPermissionPrompt;
