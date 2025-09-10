
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { AppDataProvider } from '@/hooks/use-admin';
import { FriendProvider } from '@/hooks/use-friends';
import { UnreadMessagesProvider } from '@/hooks/use-unread';
import { ClerkProvider } from '@clerk/nextjs';

export const metadata: Metadata = {
  title: 'MindMate',
  description: 'Your personal AI-powered study assistant.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className={cn('font-body antialiased', 'min-h-screen bg-background font-sans')}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            <AppDataProvider>
              <FriendProvider>
                <UnreadMessagesProvider>
                  {children}
                  <Toaster />
                </UnreadMessagesProvider>
              </FriendProvider>
            </AppDataProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
