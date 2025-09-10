
'use client';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/hooks/use-auth';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { ArrowRight, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const { setOpen: openAuthModal } = useAuthModal();
  const router = useRouter();

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      openAuthModal(true);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-lg sm:px-6">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="text-xl font-bold">MindMate</span>
        </div>
        <Button onClick={handleGetStarted} disabled={loading}>
          {user ? 'Enter Dashboard' : 'Login / Sign Up'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </header>

      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-40">
           <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-background/80 to-primary/10"></div>
            <div className="absolute h-48 w-48 rounded-full bg-primary/20 blur-3xl animate-pulse -top-10 -left-10"></div>
            <div className="absolute h-48 w-48 rounded-full bg-primary/20 blur-3xl animate-pulse -bottom-10 -right-10"></div>

          <div className="container relative z-10 mx-auto max-w-5xl px-4 text-center">
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Your Personal AI-Powered Study Assistant
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground md:text-xl">
              From acing quizzes to managing your schedule, MindMate is the all-in-one platform designed to help you achieve your academic goals.
            </p>
            <div className="mt-10 flex justify-center">
              <Button
                size="lg"
                className="h-14 text-lg font-bold group relative inline-flex items-center justify-center overflow-hidden rounded-md px-8 transition-all"
                onClick={handleGetStarted}
                disabled={loading}
              >
                 <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:[transform:skew(-12deg)_translateX(100%)]">
                    <div className="relative h-full w-8 bg-white/20"></div>
                </div>
                <span className="relative flex items-center gap-2"> 
                    {loading ? 'Loading...' : 'Get Started for Free'}
                    <ArrowRight className="h-5 w-5" />
                </span>
              </Button>
            </div>
          </div>
        </section>

        <section className="bg-muted py-20 lg:py-32">
            <div className="container mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-3">
                <div className="flex flex-col items-center text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                        <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    </div>
                    <h3 className="text-2xl font-bold">AI-Powered Learning</h3>
                    <p className="mt-2 text-muted-foreground">Ask our AI tutor "Marco" anything, from complex scientific concepts to historical summaries.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                     <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                        <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    </div>
                    <h3 className="text-2xl font-bold">Track Your Progress</h3>
                    <p className="mt-2 text-muted-foreground">Utilize the Focus Mode, Time Tracker, and Insights to monitor and optimize your study habits.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary">
                        <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <h3 className="text-2xl font-bold">Community & Rewards</h3>
                    <p className="mt-2 text-muted-foreground">Engage with friends, climb the leaderboard, and earn credits to unlock premium resources.</p>
                </div>
            </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} MindMate. All rights reserved.</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Link href="#" className="hover:text-foreground">Terms</Link>
                <Link href="#" className="hover:text-foreground">Privacy</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}