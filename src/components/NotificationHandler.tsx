
'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { messaging } from '@/lib/firebase';
import { onMessage } from 'firebase/messaging';

const NotificationHandler = () => {
  const { toast } = useToast();
  const lastHandledMsgId = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && messaging) {
      // Listener for messages when the app is in the foreground
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        
        const msgId = payload.messageId || JSON.stringify(payload.data);
        if (lastHandledMsgId.current === msgId) return;
        lastHandledMsgId.current = msgId;

        // Extracting data robustly
        const title = payload.notification?.title || payload.data?.title || 'MindMate Alert';
        const body = payload.notification?.body || payload.data?.body || 'New update available.';
        
        // Show the toast even if the tab is visible
        toast({
          title: title,
          description: body,
          duration: 5000,
        });
      });

      return () => unsubscribe();
    }
  }, [toast]);

  return null;
};

export default NotificationHandler;
