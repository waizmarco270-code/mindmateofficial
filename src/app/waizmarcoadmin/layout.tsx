

'use client';

import { AppDataProvider } from "@/hooks/use-admin";

// This is the root layout for the secret admin page.
// It's separate from the main dashboard layout.
export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <AppDataProvider>
        <main className="bg-muted min-h-screen p-4 sm:p-6 lg:p-8">
            {children}
        </main>
      </AppDataProvider>
  );
}
