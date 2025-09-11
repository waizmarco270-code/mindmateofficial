
'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, BrainCircuit, Users, Zap, Youtube, Twitter, Send, FileText } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '../ui/logo';
import { SignedIn, SignedOut, SignUpButton, useUser } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const features = [
  {
    name: 'AI Tutor',
    description: 'Get instant, personalized help from Marco, your AI study partner.',
    icon: Bot,
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/20',
  },
  {
    name: 'Quiz Zone',
    description: 'Test your knowledge with dynamic quizzes and earn credits for top performance.',
    icon: BrainCircuit,
    color: 'text-green-400',
    bgColor: 'bg-green-900/20',
  },
  {
    name: 'Focus Mode',
    description: 'Eliminate distractions and get rewarded for deep, productive study sessions.',
    icon: Zap,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/20',
  },
  {
    name: 'Social Hub',
    description: 'Connect with peers, share knowledge, and study together in a vibrant community.',
    icon: Users,
    color: 'text-sky-400',
    bgColor: 'bg-sky-900/20',
  },
];

const socialLinks = [
    { name: 'Instagram', href: 'https://www.instagram.com/mindmate100?igsh=MWd6dXJjbjVva2dlYg==', icon: null },
    { name: 'WhatsApp', href: 'https://whatsapp.com/channel/0029Vb6qoFb7YSd13q71Hc1H', icon: null },
    { name: 'YouTube', href: '#', icon: Youtube },
    { name: 'Twitter', href: '#', icon: Twitter },
    { name: 'Telegram', href: '#', icon: Send },
];


const InstagramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
)

const WhatsAppIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
)

const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25C22.56 11.45 22.49 10.65 22.36 9.88H12V14.5H18.04C17.72 16.21 16.83 17.66 15.39 18.61V21.1H19.03C21.2 19.23 22.56 16.03 22.56 12.25Z" fill="#4285F4"/>
        <path d="M12 23C15.24 23 17.95 21.92 19.92 20.19L15.39 18.61C14.33 19.33 13.06 19.79 12 19.79C9.07 19.79 6.64 17.9 5.72 15.22H2V17.8C3.96 21.13 7.7 23 12 23Z" fill="#34A853"/>
        <path d="M5.72 15.22C5.48 14.51 5.34 13.76 5.34 13C5.34 12.24 5.48 11.49 5.72 10.78V8.2H2C1.22 9.77 0.75 11.34 0.75 13C0.75 14.66 1.22 16.23 2 17.8L5.72 15.22Z" fill="#FBBC05"/>
        <path d="M12 6.21C13.56 6.21 14.87 6.78 15.82 7.7L19.96 3.54C17.95 1.83 15.24 0.75 12 0.75C7.7 0.75 3.96 2.87 2 6.2L5.72 8.79C6.64 6.1 9.07 4.21 12 4.21L12 6.21Z" fill="#EA4335"/>
    </svg>
)

export function LandingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      router.push('/dashboard');
    }
  }, [isLoaded, user, router]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Logo className="h-8 w-8" />
            <span>MindMate</span>
          </Link>
          <div className="flex items-center gap-2">
             <SignedOut>
                <SignUpButton mode="modal" afterSignUpUrl="/dashboard" afterSignInUrl="/dashboard">
                    <div>
                        <Button variant="default" className="bg-white text-slate-900 hover:bg-slate-200">
                            <GoogleIcon />
                            Continue with Google
                        </Button>
                    </div>
                </SignUpButton>
             </SignedOut>
             <SignedIn>
                <Link href="/dashboard">
                  <Button>Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
             </SignedIn>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 sm:py-32">
             <div className="absolute inset-0 -z-10 bg-slate-950">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(120,113,198,0.3),rgba(255,255,255,0))]"></div>
              <div className="absolute inset-0 animate-stars-slow [background-image:radial-gradient(circle_at_center,theme(colors.white),transparent_2px),radial-gradient(circle_at_center,theme(colors.white),transparent_2px)] [background-position:0_0,150px_150px] [background-size:2px_2px]"></div>
            </div>
            <div className="container mx-auto px-4 text-center relative">
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                    Unlock Your <span className="bg-gradient-to-r from-purple-400 to-sky-400 bg-clip-text text-transparent">Full Potential</span>
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
                    MindMate is your all-in-one AI-powered study companion, designed to help you learn smarter, stay focused, and achieve your academic goals.
                </p>
                <div className="mt-12 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
                    <div className="mx-auto max-w-2xl rounded-2xl border border-destructive/30 bg-red-950/20 p-6 text-left shadow-2xl shadow-red-950/50">
                        <h2 className="flex items-center gap-3 text-xl font-bold text-red-300">
                            <FileText />
                            How to Sign In
                        </h2>
                        <p className="mt-2 text-sm font-semibold text-red-300/80">
                            Important: Read this before signing in!
                        </p>
                         <ol className="mt-4 list-decimal list-inside space-y-2 text-slate-300/90 text-sm">
                           <li>Click "Continue with Google" in the top-right corner.</li>
                           <li>Wait for the pop-up to load and select your email.</li>
                           <li>The "I'm not a robot" checkbox may take 10-20 seconds to appear. Please wait patiently.</li>
                           <li>Tick the checkbox and click "Continue".</li>
                           <li>You'll be signed in and redirected to the dashboard.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-24 sm:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Your Ultimate Study Toolkit</h2>
              <p className="mt-4 text-lg text-slate-400">Everything you need to succeed, all in one place.</p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => (
                <div 
                  key={feature.name} 
                  className="flex flex-col rounded-2xl border border-white/10 bg-slate-900/50 p-8 shadow-2xl shadow-slate-950/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/20 animate-fade-in-up"
                  style={{animationDelay: `${0.8 + i * 0.2}s`}}
                >
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", feature.bgColor)}>
                    <feature.icon className={cn("h-6 w-6", feature.color)} aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-white">{feature.name}</h3>
                  <p className="mt-2 text-base text-slate-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm text-slate-400">&copy; {new Date().getFullYear()} MindMate. All rights reserved.</p>
                <div className="flex items-center gap-4">
                    {socialLinks.map(link => {
                        let Icon = link.icon;
                        if(link.name === 'Instagram') Icon = InstagramIcon;
                        if(link.name === 'WhatsApp') Icon = WhatsAppIcon;
                        return (
                             <a key={link.name} href={link.href} className="text-slate-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                                {Icon ? <Icon /> : link.name}
                                <span className="sr-only">{link.name}</span>
                            </a>
                        )
                    })}
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
