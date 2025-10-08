
'use client';

import { useEffect } from 'react';
import { WorldChatView } from '@/components/world-chat/world-chat-view';
import { WorldChatProvider } from '@/hooks/use-world-chat.tsx';
import { FriendsProvider } from '@/hooks/use-friends';
import { useImmersive } from '@/hooks/use-immersive';

export default function WorldChatPage() {
  const { setIsImmersive } = useImmersive();

  useEffect(() => {
    setIsImmersive(true);
    // Cleanup function to exit immersive mode when the component unmounts
    return () => setIsImmersive(false);
  }, [setIsImmersive]);

  return (
    <WorldChatProvider>
      <FriendsProvider>
        <div className="h-full">
          <WorldChatView />
        </div>
      </FriendsProvider>
    </WorldChatProvider>
  );
}
