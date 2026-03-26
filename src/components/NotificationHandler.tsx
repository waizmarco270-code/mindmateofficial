'use client';

import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { messaging } from '@/lib/firebase';
import { onMessage } from 'firebase/messaging';

const NotificationHandler = () => {
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received.', payload);
        
        // The data is now in the `data` property
        const title = payload.data?.title || 'New Notification';
        const body = payload.data?.body || 'You have a new message.';

        toast({
          title: title,
          description: body,
        });
      });

      // Cleanup subscription on component unmount
      return () => {
        unsubscribe();
      };
    }
  }, [toast]);

  return null; // This component does not render anything
};

export default NotificationHandler;
