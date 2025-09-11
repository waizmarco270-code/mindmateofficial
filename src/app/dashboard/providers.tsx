'use client';

import { AppDataProvider } from "@/hooks/use-admin";
import { UnreadMessagesProvider } from "@/hooks/use-unread";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppDataProvider>
        <UnreadMessagesProvider>
          {children}
        </UnreadMessagesProvider>
    </AppDataProvider>
  );
}
