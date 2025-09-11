
'use client';

import { Providers } from "../dashboard/providers";

// This is the root layout for the secret admin page.
// It's separate from the main dashboard layout.
export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <Providers>
        <main className="bg-muted min-h-screen p-4 sm:p-6 lg:p-8">
            {children}
        </main>
      </Providers>
  );
}
