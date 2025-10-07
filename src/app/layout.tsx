
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/react';
import { PWAInstallPrompt } from '@/components/pwa/pwa-install-prompt';
import { GoogleAnalytics } from 'next/third-party/google';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>MindMate</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="description" content="Your all-in-one study companion to learn smarter, stay focused, and connect with a community of learners." />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@400;700&display=swap"
            rel="stylesheet"
          />
           <style
            dangerouslySetInnerHTML={{
              __html: `
                @font-face {
                  font-family: 'DSEG7-Classic';
                  src: url('/fonts/DSEG7-Classic-Bold.woff2') format('woff2');
                  font-weight: bold;
                  font-style: normal;
                  font-display: swap;
                }
              `,
            }}
          />
           <meta name="theme-color" content="#000000" />
           <link rel="manifest" href="/manifest.json" />
           <link rel="icon" href="/logo.jpg?v=2" type="image/jpeg" sizes="any" />
        </head>
        <body className={cn('font-body antialiased', 'min-h-screen bg-background font-sans')}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <Analytics />
            <PWAInstallPrompt />
          </ThemeProvider>
        </body>
        <GoogleAnalytics gaId="G-Q3BB77S3M6" />
      </html>
    </ClerkProvider>
  );
}
