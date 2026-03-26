import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/react';
import { PWAInstallPrompt } from '@/components/pwa/pwa-install-prompt';
import NotificationHandler from '@/components/NotificationHandler';
import NotificationPermissionPrompt from '@/components/NotificationPermissionPrompt';

export const metadata: Metadata = {
  title: 'MindMate',
  description: 'Your all-in-one study companion to learn smarter, stay focused, and connect with a community of learners.',
  manifest: '/manifest.json',
  icons: {
    icon: '/logo.jpg?v=2',
    apple: '/logo.jpg?v=2',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
          <meta name="theme-color" content="#000000" />
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4020763286633958" crossOrigin="anonymous"></script>
        </head>
        <body className={cn('antialiased min-h-screen bg-background font-sans select-none')}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <NotificationHandler />
            <NotificationPermissionPrompt />
            {children}
            <Toaster />
            <Analytics />
            <PWAInstallPrompt />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
