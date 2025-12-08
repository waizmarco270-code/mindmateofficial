
'use client';

import { AppDataProvider } from "@/hooks/use-admin";
import { RoadmapsProvider } from "@/hooks/use-roadmaps";
import { UnreadMessagesProvider } from "@/hooks/use-unread";
import { WorldChatProvider } from "@/hooks/use-world-chat.tsx";
import { FriendsProvider } from "@/hooks/use-friends";
import { GroupsProvider } from "@/hooks/use-groups.tsx";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppDataProvider>
      <FriendsProvider>
        <GroupsProvider>
          <UnreadMessagesProvider>
              <WorldChatProvider>
                  <RoadmapsProvider>
                      {children}
                  </RoadmapsProvider>
              </WorldChatProvider>
          </UnreadMessagesProvider>
        </GroupsProvider>
      </FriendsProvider>
    </AppDataProvider>
  );
}
