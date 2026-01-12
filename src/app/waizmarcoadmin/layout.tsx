

'use client';

// This layout now uses the main dashboard layout to ensure a single provider context.
// This resolves the issue where multiple AppDataProviders were conflicting.
export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
        {children}
    </>
  );
}
