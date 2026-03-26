
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
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received.', payload);
        
        // Prevent duplicate processing of the same message within a short window
        const msgId = payload.messageId || JSON.stringify(payload.data);
        if (lastHandledMsgId.current === msgId) return;
        lastHandledMsgId.current = msgId;

        // Only show toast if the tab is actually active/focused
        if (document.visibilityState === 'visible') {
            const title = payload.data?.title || payload.notification?.title || 'New Notification';
            const body = payload.data?.body || payload.notification?.body || 'You have a new message.';

            toast({
              title: title,
              description: body,
            });
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [toast]);

  return null;
};

export default NotificationHandler;
