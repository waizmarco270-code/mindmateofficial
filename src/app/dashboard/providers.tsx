'use client';

import { AppDataProvider } from "@/hooks/use-admin";
import { FriendProvider } from "@/hooks/use-friends";
import { UnreadMessagesProvider } from "@/hooks/use-unread";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppDataProvider>
      <FriendProvider>
        <UnreadMessagesProvider>
          {children}
        </UnreadMessagesProvider>
      </FriendProvider>
    </AppDataProvider>
  );
}
