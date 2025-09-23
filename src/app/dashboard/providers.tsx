
'use client';

import { AppDataProvider } from "@/hooks/use-admin";
import { UnreadMessagesProvider } from "@/hooks/use-unread";
import { ChallengesProvider } from "@/hooks/use-challenges";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppDataProvider>
        <UnreadMessagesProvider>
            <ChallengesProvider>
                {children}
            </ChallengesProvider>
        </UnreadMessagesProvider>
    </AppDataProvider>
  );
}
