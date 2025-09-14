
'use client';
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ClerkProvider } from '@clerk/nextjs';
import { useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  useEffect(() => {
    const fetchAndApplyTheme = async () => {
      const themeDocRef = doc(db, 'appConfig', 'theme');
      const themeDoc = await getDoc(themeDocRef);
      if (themeDoc.exists()) {
        const theme = themeDoc.data();
        const root = document.documentElement;
        root.style.setProperty('--primary', `hsl(${theme.primary})`);
        root.style.setProperty('--background', `hsl(${theme.background})`);
        root.style.setProperty('--accent', `hsl(${theme.accent})`);
        root.style.setProperty('--radius', `${theme.radius}rem`);
      }
    };
    fetchAndApplyTheme();
  }, []);

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <title>MindMate</title>
          <meta name="description" content="Your all-in-one study companion to learn smarter, stay focused, and connect with a community of learners." />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
           <meta name="theme-color" content="#000000" />
           <link rel="manifest" href="/manifest.json" />
        </head>
        <body className={cn('font-body antialiased', 'min-h-screen bg-background font-sans')}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
