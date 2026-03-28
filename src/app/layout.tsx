
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import Toaster from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ClerkProvider } from '@clerk/nextjs';
import { Analytics } from '@vercel/analytics/react';
import { PWAInstallPrompt } from '@/components/pwa/pwa-install-prompt';
import NotificationHandler from '@/components/NotificationHandler';
import NotificationPermissionPrompt from '@/components/NotificationPermissionPrompt';

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

const SITE_URL = 'https://mindmate.emitygate.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'MindMate | The Ultimate AI Study Ecosystem',
    template: '%s | MindMate'
  },
  description: 'Empowering students with AI tutoring, deep focus tools, and collaborative study clans. Join MindMate by EmityGate to master your subjects and claim your legend.',
  keywords: ['MindMate', 'EmityGate', 'AI Study Partner', 'JEE NEET Prep', 'Study Timer', 'Educational Gamification', 'Online Study Groups'],
  authors: [{ name: 'EmityGate Solutions' }],
  creator: 'EmityGate',
  publisher: 'EmityGate',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: `${SITE_URL}/logo.jpg?v=3` },
      { url: `${SITE_URL}/logo.jpg?v=3`, sizes: '32x32', type: 'image/jpeg' },
    ],
    apple: `${SITE_URL}/logo.jpg?v=3`,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    title: 'MindMate | Your AI-Powered Study Command Center',
    description: 'Structure your study, track your progress, and connect with a global community of scholars.',
    siteName: 'MindMate',
    images: [{
      url: `${SITE_URL}/logo.jpg?v=3`,
      width: 1200,
      height: 630,
      alt: 'MindMate Sovereign Interface',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MindMate | AI Study Partner',
    description: 'Transform your academic journey with the EmityGate study ecosystem.',
    images: [`${SITE_URL}/logo.jpg?v=3`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
