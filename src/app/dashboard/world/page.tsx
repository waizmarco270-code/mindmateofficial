
'use client';

import { WorldChatView } from '@/components/world-chat/world-chat-view';
import { WorldChatProvider } from '@/hooks/use-world-chat.tsx';

export default function WorldChatPage() {
  return (
    <WorldChatProvider>
      <div className="h-full">
        <WorldChatView />
      </div>
    </WorldChatProvider>
  );
}
