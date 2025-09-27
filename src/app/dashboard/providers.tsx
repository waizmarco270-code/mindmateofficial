
'use client';

import { AppDataProvider } from "@/hooks/use-admin";
import { RoadmapsProvider } from "@/hooks/use-roadmaps";
import { UnreadMessagesProvider } from "@/hooks/use-unread";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppDataProvider>
      <RoadmapsProvider>
        <UnreadMessagesProvider>
            {children}
        </UnreadMessagesProvider>
      </RoadmapsProvider>
    </AppDataProvider>
  );
}
