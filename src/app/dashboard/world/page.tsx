
'use client';

import { WorldChatView } from '@/components/world-chat/world-chat-view';
import { WorldChatProvider } from '@/hooks/use-world-chat.tsx';
import { FriendsProvider } from '@/hooks/use-friends';

export default function WorldChatPage() {
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
