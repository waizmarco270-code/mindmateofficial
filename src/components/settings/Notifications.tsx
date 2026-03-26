'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';
import { Bell, AlertTriangle, Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useFCM } from '@/hooks/use-fcm';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const NotificationsSettings = () => {
  const { toast } = useToast();
  const { user } = useUser();
  const { notificationPermission, requestPermission, error } = useFCM();

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Effect to check subscription status on load
  useEffect(() => {
    const checkSubscription = async () => {
      setIsLoading(true);
      if (user && notificationPermission === 'granted') {
        try {
          const tokenRef = doc(db, 'fcmTokens', user.id);
          const docSnap = await getDoc(tokenRef);
          if (docSnap.exists() && docSnap.data().token) {
            setIsSubscribed(true);
          } else {
            setIsSubscribed(false);
          }
        } catch (err) {
          console.error("Error checking subscription:", err);
          setIsSubscribed(false);
        }
      }
      setIsLoading(false);
    };

    checkSubscription();
  }, [user, notificationPermission]);

  const handlePermissionRequest = async () => {
    setIsLoading(true);
    const permission = await requestPermission();
    if (permission === 'granted') {
      toast({ title: 'Permissions Granted!', description: 'You can now enable push notifications.' });
      setIsSubscribed(true);
    } else {
      toast({ variant: 'destructive', title: 'Permission Denied', description: 'You have blocked notifications. To enable them, please update your browser settings.' });
    }
    setIsLoading(false);
  };

  const handleSubscriptionToggle = async (checked: boolean) => {
    setIsLoading(true);
    if (checked) {
      if (notificationPermission !== 'granted') {
        await handlePermissionRequest();
      } else {
        await requestPermission();
        setIsSubscribed(true);
      }
    } else {
      if (user) {
        try {
          const tokenRef = doc(db, 'fcmTokens', user.id);
          await deleteDoc(tokenRef);
          setIsSubscribed(false);
          toast({ title: 'Unsubscribed', description: 'You will no longer receive push notifications.' });
        } catch (err) {
          toast({ variant: 'destructive', title: 'Error', description: 'Could not unsubscribe.' });
        }
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: (error as Error).message });
    }
  }, [error, toast]);

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
    }

    if (notificationPermission === 'denied') {
      return (
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold">Notifications Blocked</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You have blocked notifications for this site. To receive updates, you must enable them in your browser's settings.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => window.open('https://support.google.com/chrome/answer/3220216', '_blank')}>
              How to Change Settings
            </Button>
          </div>
        </CardContent>
      );
    }

    if (notificationPermission === 'granted') {
      return (
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">Enable Push Notifications</h4>
              <p className="text-sm text-muted-foreground">Receive updates about new features and announcements.</p>
            </div>
            <Switch
              checked={isSubscribed}
              onCheckedChange={handleSubscriptionToggle}
              aria-label="Toggle push notifications"
              disabled={isLoading}
            />
          </div>
        </CardContent>
      );
    }

    return (
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Bell className="h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-lg font-semibold">Stay Updated</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Enable push notifications to receive the latest announcements and updates directly on your device.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="mt-4">Enable Notifications</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Enable Push Notifications?</AlertDialogTitle>
                <AlertDialogDescription>
                  We need your permission to send you notifications. Your browser will ask you to confirm.
                  This will help you stay up-to-date with important announcements.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Not now</AlertDialogCancel>
                <AlertDialogAction onClick={handlePermissionRequest}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Push Notifications</CardTitle>
        <CardDescription>Manage how you receive notifications from MindMate.</CardDescription>
      </CardHeader>
      {renderContent()}
    </Card>
  );
};

export default NotificationsSettings;
