

'use client';

import { AppDataProvider } from "@/hooks/use-admin";
import { RoadmapsProvider } from "@/hooks/use-roadmaps";
import { UnreadMessagesProvider } from "@/hooks/use-unread";
import { FriendsProvider } from "@/hooks/use-friends";
import { WorldChatProvider } from "@/hooks/use-world-chat";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppDataProvider>
      <FriendsProvider>
        <UnreadMessagesProvider>
            <WorldChatProvider>
                <RoadmapsProvider>
                    {children}
                </RoadmapsProvider>
            </WorldChatProvider>
        </UnreadMessagesProvider>
      </FriendsProvider>
    </AppDataProvider>
  );
}

    