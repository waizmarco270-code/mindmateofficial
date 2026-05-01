'use client';

import { AppDataProvider } from "@/hooks/use-admin";
import { RoadmapsProvider } from "@/hooks/use-roadmaps";
import { UnreadMessagesProvider } from "@/hooks/use-unread";
import { WorldChatProvider } from "@/hooks/use-world-chat.tsx";
import { FriendsProvider } from "@/hooks/use-friends";
import { GroupsProvider } from "@/hooks/use-groups.tsx";
import { IsolationProvider } from "@/hooks/use-isolation";
import { MentorProvider } from "@/hooks/use-mentor";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppDataProvider>
        <IsolationProvider>
            <GroupsProvider>
              <FriendsProvider>
                <UnreadMessagesProvider>
                    <WorldChatProvider>
                        <RoadmapsProvider>
                            <MentorProvider>
                                {children}
                            </MentorProvider>
                        </RoadmapsProvider>
                    </WorldChatProvider>
                </UnreadMessagesProvider>
              </FriendsProvider>
            </GroupsProvider>
        </IsolationProvider>
    </AppDataProvider>
  );
}
